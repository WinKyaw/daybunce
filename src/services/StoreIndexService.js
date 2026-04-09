import AsyncStorage from '@react-native-async-storage/async-storage';
import DataService from './DataService';

const STORAGE_KEYS = {
  STORE_INDEX: 'ai_store_index',
  STORE_SUMMARY: 'ai_store_summary',
  // Permanent daily journal — one entry per day, stored forever
  DAILY_JOURNAL: 'ai_daily_journal',
  // Compact monthly summaries (much smaller than raw daily data)
  MONTHLY_SUMMARIES: 'ai_monthly_summaries',
  // User profile — learned patterns and preferences
  USER_PROFILE: 'ai_user_profile',
  // Last nightly index date to prevent duplicate runs
  LAST_NIGHTLY_DATE: 'ai_last_nightly_date',
};

// Number of days included in each tier
const HOT_DAYS = 7;
const WARM_DAYS = 30;
const TOP_ITEMS_LIMIT = 10;

// How many months of daily entries to keep in the journal before compressing to monthly
const JOURNAL_RETAIN_MONTHS = 3;

// ─── Private helpers ──────────────────────────────────────────────────────────

// Returns "YYYY-MM" string for a Date
function _monthKey(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// Returns "YYYY-MM-DD" string for a Date
function _dayKey(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Summarise a list of sales items into a compact daily snapshot object
function _buildDaySummary(dateStr, items) {
  const totalRevenue = items.reduce(
    (sum, item) => sum + parseFloat(item.price || 0) * parseFloat(item.unitsSold || 1),
    0,
  );
  const totalQty = items.reduce((sum, item) => sum + parseFloat(item.unitsSold || 1), 0);
  const categories = {};
  const products = {};
  for (const item of items) {
    const cat = item.category || 'Other';
    categories[cat] = (categories[cat] || 0) + parseFloat(item.unitsSold || 1);
    const rev = parseFloat(item.price || 0) * parseFloat(item.unitsSold || 1);
    if (!products[item.name]) {
      products[item.name] = { qty: 0, revenue: 0, category: cat };
    }
    products[item.name].qty += parseFloat(item.unitsSold || 1);
    products[item.name].revenue += rev;
  }
  return { date: dateStr, totalRevenue, totalQty, categories, products };
}

// Merge an array of daySummary objects into a single monthly snapshot
function _mergeToMonthlySummary(monthKey, daySummaries) {
  const totalRevenue = daySummaries.reduce((s, d) => s + d.totalRevenue, 0);
  const totalQty = daySummaries.reduce((s, d) => s + d.totalQty, 0);
  const activeDays = daySummaries.length;
  const categories = {};
  const products = {};
  for (const day of daySummaries) {
    for (const [cat, qty] of Object.entries(day.categories || {})) {
      categories[cat] = (categories[cat] || 0) + qty;
    }
    for (const [name, info] of Object.entries(day.products || {})) {
      if (!products[name]) {
        products[name] = { qty: 0, revenue: 0, category: info.category };
      }
      products[name].qty += info.qty;
      products[name].revenue += info.revenue;
    }
  }
  // Keep only the top 15 products per month to keep size manageable
  const topProducts = Object.entries(products)
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 15)
    .reduce((acc, [name, info]) => { acc[name] = info; return acc; }, {});
  return {
    month: monthKey,
    totalRevenue,
    totalQty,
    activeDays,
    avgDailyRevenue: activeDays > 0 ? totalRevenue / activeDays : 0,
    topCategories: Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cat, qty]) => ({ cat, qty })),
    topProducts,
  };
}

// ─── StoreIndexService ────────────────────────────────────────────────────────

const StoreIndexService = {
  // Rebuild all tiers and persist them to AsyncStorage.
  // Should be called non-blockingly after data mutations (e.g. addItem).
  async rebuildIndex() {
    try {
      // --- Tier 1 (Hot): raw sales items for the last 7 days ---
      const hotItems = [];
      const today = new Date();
      for (let i = 0; i < HOT_DAYS; i++) {
        const day = new Date(today);
        day.setDate(today.getDate() - i);
        const items = await DataService.getItemsByDate(day);
        if (items.length > 0) {
          hotItems.push({ date: DataService.formatDate(day), items });
        }
      }

      // --- Tier 2 (Warm): 30-day aggregated stats + top sellers ---
      const stats = await DataService.getSalesStatistics(WARM_DAYS);
      const topItems = await DataService.getTopSellingItems(WARM_DAYS, TOP_ITEMS_LIMIT);

      // --- Tier 3 (Cold): compressed narrative stored in AsyncStorage ---
      let narrative = '';
      if (stats) {
        const bestDayAmount = stats.bestDay && stats.bestDay.amount != null
          ? stats.bestDay.amount
          : 0;
        narrative =
          `30-day snapshot: total revenue $${stats.totalSales.toFixed(2)}, ` +
          `${stats.totalItems} items sold across ${stats.totalDays} active days. ` +
          `Daily average: $${stats.averageDaily.toFixed(2)}. ` +
          `Sales trend: ${stats.recentTrends.salesTrend}. ` +
          `Best day: $${bestDayAmount.toFixed(2)}. ` +
          `Most active weekday: ${stats.recentTrends.mostActiveDay || 'N/A'}.`;
      }
      await AsyncStorage.setItem(STORAGE_KEYS.STORE_SUMMARY, narrative);

      // Persist the full index
      const index = {
        builtAt: new Date().toISOString(),
        tier1: hotItems,
        tier2: { stats, topItems },
        tier3: narrative,
      };
      await AsyncStorage.setItem(STORAGE_KEYS.STORE_INDEX, JSON.stringify(index));

      // Append today's data to the permanent daily journal (non-blocking update)
      this._updateDailyJournal(today, hotItems).catch(console.warn);

      return index;
    } catch (error) {
      console.warn('StoreIndexService: error rebuilding index', error);
      return null;
    }
  },

  // Add or update today's entry in the permanent daily journal.
  // The journal grows indefinitely — older months are compressed to monthly
  // summaries to keep total storage below ~500 KB.
  async _updateDailyJournal(today, hotItems) {
    try {
      const todayKey = _dayKey(today);
      const todayEntry = hotItems.find(e => e.date === DataService.formatDate(today));
      if (!todayEntry || todayEntry.items.length === 0) { return; }

      const summary = _buildDaySummary(todayKey, todayEntry.items);

      // Load existing journal
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_JOURNAL);
      const journal = raw ? JSON.parse(raw) : {};

      journal[todayKey] = summary;

      // Compress months older than JOURNAL_RETAIN_MONTHS to monthly summaries
      await this._compressOldJournalEntries(journal, today);

      await AsyncStorage.setItem(STORAGE_KEYS.DAILY_JOURNAL, JSON.stringify(journal));

      // Rebuild the user profile whenever the journal is updated
      await this._rebuildUserProfile(journal);
    } catch (error) {
      console.warn('StoreIndexService: error updating daily journal', error);
    }
  },

  // Move daily journal entries older than JOURNAL_RETAIN_MONTHS into the
  // compact monthly summary store and remove them from the daily journal.
  async _compressOldJournalEntries(journal, today) {
    try {
      const cutoffDate = new Date(today);
      cutoffDate.setMonth(cutoffDate.getMonth() - JOURNAL_RETAIN_MONTHS);
      const cutoffMonthKey = _monthKey(cutoffDate);

      // Group old entries by month
      const toCompress = {};
      for (const [dayKey, entry] of Object.entries(journal)) {
        const monthKey = dayKey.slice(0, 7); // "YYYY-MM"
        if (monthKey < cutoffMonthKey) {
          if (!toCompress[monthKey]) { toCompress[monthKey] = []; }
          toCompress[monthKey].push(entry);
          delete journal[dayKey];
        }
      }

      if (Object.keys(toCompress).length === 0) { return; }

      // Load existing monthly summaries and merge
      const rawMonthly = await AsyncStorage.getItem(STORAGE_KEYS.MONTHLY_SUMMARIES);
      const monthlySummaries = rawMonthly ? JSON.parse(rawMonthly) : {};

      for (const [monthKey, daySummaries] of Object.entries(toCompress)) {
        if (monthlySummaries[monthKey]) {
          // Merge into existing monthly summary
          daySummaries.push(monthlySummaries[monthKey]);
        }
        monthlySummaries[monthKey] = _mergeToMonthlySummary(monthKey, daySummaries);
      }

      await AsyncStorage.setItem(
        STORAGE_KEYS.MONTHLY_SUMMARIES,
        JSON.stringify(monthlySummaries),
      );
    } catch (error) {
      console.warn('StoreIndexService: error compressing journal entries', error);
    }
  },

  // Build a compact user profile from the full journal + monthly summaries.
  // This profile is injected into the AI prompt as "personalization context"
  // and teaches the model about the user's specific products, pricing, and patterns.
  async _rebuildUserProfile(journal) {
    try {
      const rawMonthly = await AsyncStorage.getItem(STORAGE_KEYS.MONTHLY_SUMMARIES);
      const monthlySummaries = rawMonthly ? JSON.parse(rawMonthly) : {};

      // Aggregate all-time product stats across journal + monthly summaries
      const allProducts = {};
      const allCategories = {};

      // From daily journal
      for (const entry of Object.values(journal)) {
        for (const [name, info] of Object.entries(entry.products || {})) {
          if (!allProducts[name]) {
            allProducts[name] = { qty: 0, revenue: 0, category: info.category, days: 0 };
          }
          allProducts[name].qty += info.qty;
          allProducts[name].revenue += info.revenue;
          allProducts[name].days += 1;
        }
        for (const [cat, qty] of Object.entries(entry.categories || {})) {
          allCategories[cat] = (allCategories[cat] || 0) + qty;
        }
      }

      // From monthly summaries
      for (const monthly of Object.values(monthlySummaries)) {
        for (const [name, info] of Object.entries(monthly.topProducts || {})) {
          if (!allProducts[name]) {
            allProducts[name] = { qty: 0, revenue: 0, category: info.category, days: 0 };
          }
          allProducts[name].qty += info.qty;
          allProducts[name].revenue += info.revenue;
        }
        for (const catObj of (monthly.topCategories || [])) {
          allCategories[catObj.cat] = (allCategories[catObj.cat] || 0) + catObj.qty;
        }
      }

      // Top 20 all-time products (by revenue)
      const topAllTimeProducts = Object.entries(allProducts)
        .sort((a, b) => b[1].revenue - a[1].revenue)
        .slice(0, 20)
        .map(([name, info]) => ({
          name,
          category: info.category,
          totalQty: Math.round(info.qty),
          totalRevenue: info.revenue,
          avgPrice: info.qty > 0 ? info.revenue / info.qty : 0,
        }));

      // Top categories by volume
      const topCategories = Object.entries(allCategories)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([cat, qty]) => ({ cat, qty: Math.round(qty) }));

      // Date range
      const allDayKeys = Object.keys(journal);
      const monthKeys = Object.keys(monthlySummaries);
      const allKeys = [...allDayKeys, ...monthKeys].sort();
      const firstDate = allKeys[0] || null;
      const totalMonths = monthKeys.length;
      const totalDays = allDayKeys.length;

      const profile = {
        updatedAt: new Date().toISOString(),
        dataRange: { firstDate, totalActiveDays: totalDays, totalMonths },
        topProducts: topAllTimeProducts,
        topCategories,
      };

      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
      return profile;
    } catch (error) {
      console.warn('StoreIndexService: error rebuilding user profile', error);
      return null;
    }
  },

  // Run the nightly background indexing job.
  // Designed to be called once per calendar day (e.g. when the app becomes active).
  // Safe to call multiple times — idempotent within the same calendar day.
  async runNightlyIndex() {
    try {
      const todayKey = _dayKey(new Date());
      const lastRun = await AsyncStorage.getItem(STORAGE_KEYS.LAST_NIGHTLY_DATE);
      if (lastRun === todayKey) { return; } // Already ran today

      await this.rebuildIndex();
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_NIGHTLY_DATE, todayKey);
    } catch (error) {
      console.warn('StoreIndexService: nightly index error', error);
    }
  },

  // Read the saved index and produce a single context string ready to inject
  // into the model prompt.
  // Order: User Profile (personalization) → Historical monthly snapshots →
  //        30-day stats (Tier 2) → Recent raw sales (Tier 1, highest priority)
  async buildContext() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.STORE_INDEX);
      if (!raw) {
        return 'No store data available yet.';
      }

      const index = JSON.parse(raw);
      const parts = [];

      // User Profile — personalization layer
      const rawProfile = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      if (rawProfile) {
        const profile = JSON.parse(rawProfile);
        if (profile.topProducts && profile.topProducts.length > 0) {
          const productLines = profile.topProducts
            .map(
              (p, i) =>
                `  ${i + 1}. ${p.name} (${p.category}) — ${p.totalQty} units, $${p.totalRevenue.toFixed(2)} total, avg price $${p.avgPrice.toFixed(2)}`,
            )
            .join('\n');
          const catLines = (profile.topCategories || [])
            .map(c => `  ${c.cat}: ${c.qty} units`)
            .join('\n');
          const range = profile.dataRange;
          parts.push(
            `[Your Store Profile — Personalized]\n` +
            `Data spans: ${range.firstDate || 'N/A'} · ${range.totalActiveDays} active days · ${range.totalMonths} months of history\n` +
            `Top product categories:\n${catLines || '  (none yet)'}\n` +
            `All-time best sellers:\n${productLines}`,
          );
        }
      }

      // Historical monthly summaries — gives the AI long-term pattern awareness
      const rawMonthly = await AsyncStorage.getItem(STORAGE_KEYS.MONTHLY_SUMMARIES);
      if (rawMonthly) {
        const monthlySummaries = JSON.parse(rawMonthly);
        const sortedMonths = Object.keys(monthlySummaries).sort().reverse().slice(0, 12);
        if (sortedMonths.length > 0) {
          const monthLines = sortedMonths.map(m => {
            const s = monthlySummaries[m];
            return (
              `  ${m}: $${s.totalRevenue.toFixed(2)} revenue, ${s.activeDays} active days, ` +
              `avg $${s.avgDailyRevenue.toFixed(2)}/day`
            );
          }).join('\n');
          parts.push(`[Monthly History — Last ${sortedMonths.length} Months]\n${monthLines}`);
        }
      }

      // Tier 3 — 30-day narrative
      if (index.tier3) {
        parts.push(`[30-Day Summary]\n${index.tier3}`);
      }

      // Tier 2 — aggregated statistics
      if (index.tier2) {
        const { stats, topItems } = index.tier2;
        if (stats) {
          const categoryLines = Object.entries(stats.categoryBreakdown || {})
            .map(([cat, rev]) => `  ${cat}: $${rev.toFixed(2)}`)
            .join('\n');
          parts.push(
            `[30-Day Statistics]\n` +
            `Total Revenue: $${stats.totalSales.toFixed(2)}\n` +
            `Total Items Sold: ${stats.totalItems}\n` +
            `Active Days: ${stats.totalDays}\n` +
            `Daily Average: $${stats.averageDaily.toFixed(2)}\n` +
            `Sales Trend: ${stats.recentTrends.salesTrend}\n` +
            `Category Breakdown:\n${categoryLines || '  (none)'}`,
          );
        }
        if (topItems && topItems.length > 0) {
          const topLines = topItems
            .map(
              (item, idx) =>
                `  ${idx + 1}. ${item.name} (${item.category}) — qty ${item.totalQuantity}, revenue $${item.totalRevenue.toFixed(2)}`,
            )
            .join('\n');
          parts.push(`[Top Selling Items — Last 30 Days]\n${topLines}`);
        }
      }

      // Tier 1 — recent raw sales (PRIORITIZE THIS)
      if (index.tier1 && index.tier1.length > 0) {
        const recentLines = index.tier1
          .map(dayEntry => {
            const itemLines = dayEntry.items
              .map(
                item =>
                  `    - ${item.name} | qty: ${item.unitsSold} | price: $${item.price} | category: ${item.category}`,
              )
              .join('\n');
            return `  ${dayEntry.date}:\n${itemLines}`;
          })
          .join('\n');
        parts.push(`[Recent Sales — Last 7 Days] *** PRIORITIZE THIS ***\n${recentLines}`);
      }

      return parts.join('\n\n');
    } catch (error) {
      console.warn('StoreIndexService: error building context', error);
      return 'Store data temporarily unavailable.';
    }
  },
};

export default StoreIndexService;

