import AsyncStorage from '@react-native-async-storage/async-storage';
import DataService from './DataService';

const STORAGE_KEYS = {
  STORE_INDEX: 'ai_store_index',
  STORE_SUMMARY: 'ai_store_summary',
};

// Number of days included in each tier
const HOT_DAYS = 7;
const WARM_DAYS = 30;
const TOP_ITEMS_LIMIT = 10;

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
      // Build a concise narrative from the stats so it can be reused cheaply
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
      return index;
    } catch (error) {
      console.warn('StoreIndexService: error rebuilding index', error);
      return null;
    }
  },

  // Read the saved index and produce a single context string ready to inject
  // into the model prompt. Order: Tier 3 (historical) → Tier 2 (stats) → Tier 1
  // (recent, highest priority).
  async buildContext() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.STORE_INDEX);
      if (!raw) {
        // No index yet — return an empty context rather than crashing
        return 'No store data available yet.';
      }

      const index = JSON.parse(raw);
      const parts = [];

      // Tier 3 — historical narrative
      if (index.tier3) {
        parts.push(`[Historical Summary]\n${index.tier3}`);
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
