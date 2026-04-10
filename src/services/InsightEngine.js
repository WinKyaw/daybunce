import AsyncStorage from '@react-native-async-storage/async-storage';

const INSIGHTS_KEY = 'ai_insights';

// ─── Private helpers ──────────────────────────────────────────────────────────

// Returns "YYYY-MM-DD" for a Date
function _dayKey(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Generate a simple deterministic id from rule + item + day
function _insightId(ruleId, itemName, day) {
  const raw = `${ruleId}|${itemName || ''}|${day}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) - hash + raw.charCodeAt(i)) | 0;
  }
  return `${ruleId}_${Math.abs(hash).toString(36)}`;
}

// ─── Insight rules ────────────────────────────────────────────────────────────

/**
 * LOW_STOCK_RISK — today's units sold > 80 % of the 7-day daily average
 */
function checkLowStockRisk(index) {
  const insights = [];
  try {
    const tier1 = index.tier1 || [];
    if (tier1.length === 0) { return insights; }

    const today = _dayKey(new Date());

    // Build per-item 7-day quantities
    const itemMap = {};
    for (const dayEntry of tier1) {
      for (const item of dayEntry.items || []) {
        const name = item.name;
        if (!itemMap[name]) {
          itemMap[name] = { days: [], category: item.category || null };
        }
        const qty = parseFloat(item.unitsSold);
        if (!item.unitsSold || isNaN(qty) || qty <= 0) { continue; }
        itemMap[name].days.push({ date: dayEntry.date, qty });
      }
    }

    for (const [name, data] of Object.entries(itemMap)) {
      const allDays = data.days;
      if (allDays.length < 2) { continue; } // not enough history

      const todayEntries = allDays.filter(d => d.date === today);
      if (todayEntries.length === 0) { continue; }

      const todayQty = todayEntries.reduce((s, d) => s + d.qty, 0);
      const avgQty = allDays.reduce((s, d) => s + d.qty, 0) / allDays.length;

      if (avgQty <= 0) { continue; }

      const pct = (todayQty / avgQty) * 100;
      if (pct >= 80) {
        const day = today;
        insights.push({
          id: _insightId('LOW_STOCK_RISK', name, day),
          ruleId: 'LOW_STOCK_RISK',
          title: `Low Stock Risk: ${name}`,
          body: `You sold ${todayQty.toFixed(0)} units of ${name} today, which is ${pct.toFixed(0)}% of your 7-day average. Consider restocking soon.`,
          severity: 'warning',
          category: data.category,
          itemName: name,
          suggestedQuestion: `Should I restock ${name}? Here is my recent sales data.`,
          timestamp: new Date().toISOString(),
          dismissed: false,
        });
      }
    }
  } catch (e) {
    console.warn('InsightEngine checkLowStockRisk error', e);
  }
  return insights;
}

/**
 * RESTOCK_WINDOW — a top-10 selling item has had 0 sales in the last 3 days
 */
function checkRestockWindow(index) {
  const insights = [];
  try {
    const tier2 = index.tier2 || {};
    const topItems = (tier2.topItems || []).slice(0, 10);
    if (topItems.length === 0) { return insights; }

    const tier1 = index.tier1 || [];

    // Dates present in tier1 (last 7 days)
    const tier1Dates = new Set(tier1.map(d => d.date));

    // Compute last 3 calendar days
    const last3 = new Set();
    for (let i = 0; i < 3; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last3.add(_dayKey(d));
    }

    // Items that appear in tier1 dates that are within last 3 days
    const recentItemNames = new Set();
    for (const dayEntry of tier1) {
      if (!last3.has(dayEntry.date)) { continue; }
      for (const item of dayEntry.items || []) {
        recentItemNames.add(item.name);
      }
    }

    for (const topItem of topItems) {
      const name = topItem.name;
      if (!recentItemNames.has(name)) {
        const today = _dayKey(new Date());
        insights.push({
          id: _insightId('RESTOCK_WINDOW', name, today),
          ruleId: 'RESTOCK_WINDOW',
          title: `Restock Window: ${name}`,
          body: `${name} is one of your top sellers but hasn't been recorded in 3 days. Is it out of stock?`,
          severity: 'info',
          category: topItem.category || null,
          itemName: name,
          suggestedQuestion: `My top seller ${name} hasn't sold in 3 days. What should I do?`,
          timestamp: new Date().toISOString(),
          dismissed: false,
        });
      }
    }
  } catch (e) {
    console.warn('InsightEngine checkRestockWindow error', e);
  }
  return insights;
}

/**
 * REVENUE_ANOMALY — today's total revenue is > 2× or < 0.3× the 30-day daily average
 */
function checkRevenueAnomaly(index) {
  const insights = [];
  try {
    const tier2 = index.tier2 || {};
    const stats = tier2.stats;
    if (!stats || !stats.averageDaily || stats.averageDaily <= 0) { return insights; }

    const avgDaily = stats.averageDaily;

    // Sum today's revenue from tier1
    const today = _dayKey(new Date());
    const tier1 = index.tier1 || [];
    const todayEntry = tier1.find(d => d.date === today);
    if (!todayEntry) { return insights; }

    const todayRevenue = (todayEntry.items || []).reduce(
      (sum, item) => sum + parseFloat(item.price || 0) * parseFloat(item.unitsSold || 0),
      0,
    );

    const ratio = todayRevenue / avgDaily;

    if (ratio > 2) {
      const day = today;
      insights.push({
        id: _insightId('REVENUE_ANOMALY', 'spike', day),
        ruleId: 'REVENUE_ANOMALY',
        title: `Revenue Spike: ${ratio.toFixed(1)}x avg`,
        body: `Today's revenue is $${todayRevenue.toFixed(2)}, which is ${ratio.toFixed(1)}x your 30-day daily average of $${avgDaily.toFixed(2)}. Great day!`,
        severity: 'info',
        category: null,
        itemName: null,
        suggestedQuestion: 'My revenue today is unusually high. What might be causing this?',
        timestamp: new Date().toISOString(),
        dismissed: false,
      });
    } else if (ratio < 0.3) {
      const day = today;
      insights.push({
        id: _insightId('REVENUE_ANOMALY', 'dip', day),
        ruleId: 'REVENUE_ANOMALY',
        title: `Revenue Dip: ${ratio.toFixed(1)}x avg`,
        body: `Today's revenue is $${todayRevenue.toFixed(2)}, which is only ${ratio.toFixed(1)}x your 30-day daily average of $${avgDaily.toFixed(2)}. Sales are unusually low.`,
        severity: 'warning',
        category: null,
        itemName: null,
        suggestedQuestion: 'My revenue today is unusually low. What might be causing this?',
        timestamp: new Date().toISOString(),
        dismissed: false,
      });
    }
  } catch (e) {
    console.warn('InsightEngine checkRevenueAnomaly error', e);
  }
  return insights;
}

/**
 * SLOW_MOVER — item appeared in sales 8–30 days ago but 0 sales in last 7 days
 */
function checkSlowMovers(index) {
  const insights = [];
  try {
    const tier1 = index.tier1 || [];
    const tier2 = index.tier2 || {};
    const stats = tier2.stats || {};

    // Items sold in the last 7 days (tier1 covers 7 days)
    const recentItems = new Set();
    for (const dayEntry of tier1) {
      for (const item of dayEntry.items || []) {
        recentItems.add(item.name);
      }
    }

    // Items sold in 8–30 days ago — available from 30-day stats top items
    // We use categoryBreakdown + topItems to find items present in 30-day but absent in 7-day
    const topItems = tier2.topItems || [];
    const today = _dayKey(new Date());

    for (const topItem of topItems) {
      const name = topItem.name;
      if (!recentItems.has(name)) {
        insights.push({
          id: _insightId('SLOW_MOVER', name, today),
          ruleId: 'SLOW_MOVER',
          title: `Slow Mover: ${name}`,
          body: `${name} hasn't sold in 7 days. Consider a promotion or price adjustment.`,
          severity: 'info',
          category: topItem.category || null,
          itemName: name,
          suggestedQuestion: `How can I improve sales for ${name} which hasn't sold in a week?`,
          timestamp: new Date().toISOString(),
          dismissed: false,
        });
      }
    }
  } catch (e) {
    console.warn('InsightEngine checkSlowMovers error', e);
  }
  return insights;
}

// ─── InsightEngine ────────────────────────────────────────────────────────────

const InsightEngine = {
  /**
   * Run all rules against the latest store index.
   * Merges new insights with existing dismissed state from AsyncStorage.
   * Non-blocking — safe to call with .catch(console.warn)
   */
  async analyzeAndPersist() {
    try {
      // Read the store index directly from AsyncStorage (avoids circular dependency)
      const rawIndex = await AsyncStorage.getItem('ai_store_index');
      if (!rawIndex) { return []; }

      const index = JSON.parse(rawIndex);
      const today = _dayKey(new Date());

      // Run all rules
      const allRules = [
        checkLowStockRisk,
        checkRestockWindow,
        checkRevenueAnomaly,
        checkSlowMovers,
      ];

      const freshInsights = [];
      for (const rule of allRules) {
        const results = rule(index);
        freshInsights.push(...results);
      }

      // Load existing persisted insights
      const existing = await this.loadInsights();

      // Build a map of existing dismissed states keyed by id
      const dismissedMap = {};
      for (const ins of existing) {
        if (ins.dismissed) {
          dismissedMap[ins.id] = true;
        }
      }

      // De-duplicate by ruleId + itemName within the same calendar day
      const seen = new Set();
      const deduped = [];
      for (const ins of freshInsights) {
        const key = `${ins.ruleId}|${ins.itemName || ''}|${today}`;
        if (!seen.has(key)) {
          seen.add(key);
          // Preserve dismissed state if already dismissed
          deduped.push({
            ...ins,
            dismissed: dismissedMap[ins.id] || false,
          });
        }
      }

      // Keep any older (non-today) insights that haven't been dismissed,
      // so they persist until explicitly dismissed
      const olderInsights = existing.filter(ins => {
        const insDay = ins.timestamp ? _dayKey(new Date(ins.timestamp)) : '';
        return insDay !== today;
      });

      const merged = [...deduped, ...olderInsights];

      await AsyncStorage.setItem(INSIGHTS_KEY, JSON.stringify(merged));
      return merged;
    } catch (error) {
      console.warn('InsightEngine analyzeAndPersist error', error);
      return [];
    }
  },

  /**
   * Load persisted insights from AsyncStorage.
   */
  async loadInsights() {
    try {
      const raw = await AsyncStorage.getItem(INSIGHTS_KEY);
      if (!raw) { return []; }
      return JSON.parse(raw) || [];
    } catch (error) {
      console.warn('InsightEngine loadInsights error', error);
      return [];
    }
  },

  /**
   * Dismiss a single insight by id (sets dismissed: true, persists).
   */
  async dismissInsight(id) {
    try {
      const insights = await this.loadInsights();
      const updated = insights.map(ins =>
        ins.id === id ? { ...ins, dismissed: true } : ins,
      );
      await AsyncStorage.setItem(INSIGHTS_KEY, JSON.stringify(updated));
      return updated;
    } catch (error) {
      console.warn('InsightEngine dismissInsight error', error);
      return [];
    }
  },

  /**
   * Clear all insights (e.g. on data reset).
   */
  async clearInsights() {
    try {
      await AsyncStorage.removeItem(INSIGHTS_KEY);
    } catch (error) {
      console.warn('InsightEngine clearInsights error', error);
    }
  },
};

export default InsightEngine;
