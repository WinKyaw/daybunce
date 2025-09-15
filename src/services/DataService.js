import AsyncStorage from '@react-native-async-storage/async-storage';

class DataService {
  static STORAGE_KEYS = {
    INVENTORY: 'inventory_',
    LANGUAGE: 'language_config',
    CATEGORIES: 'categories',
    UNIT_TYPES: 'unit_types',
    SETTINGS: 'app_settings',
    USER_PREFERENCES: 'user_preferences'
  };

  static DEFAULT_CATEGORIES = [
    'Food', 'Beverages', 'Electronics', 'Clothing', 'Books', 
    'Health', 'Beauty', 'Sports', 'Home', 'Other'
  ];

  static DEFAULT_UNIT_TYPES = [
    'pieces', 'lb', 'oz', 'kg', 'g', 'liters', 'ml', 'dozen', 
    'boxes', 'bags', 'bottles', 'cans', 'packets'
  ];

  // Get items for a specific date
  static async getItemsByDate(date) {
    try {
      const dateKey = this.formatDate(date);
      const data = await AsyncStorage.getItem(`${this.STORAGE_KEYS.INVENTORY}${dateKey}`);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading items:', error);
      return [];
    }
  }

  // Save items for a specific date
  static async saveItemsByDate(date, items) {
    try {
      const dateKey = this.formatDate(date);
      await AsyncStorage.setItem(`${this.STORAGE_KEYS.INVENTORY}${dateKey}`, JSON.stringify(items));
      return true;
    } catch (error) {
      console.error('Error saving items:', error);
      return false;
    }
  }

  // Add a single item to a specific date
  static async addItem(date, item) {
    try {
      const items = await this.getItemsByDate(date);
      const newItem = {
        id: this.generateId(),
        ...item,
        timestamp: new Date().toISOString(),
        dateAdded: this.formatDate(date)
      };
      
      items.push(newItem);
      await this.saveItemsByDate(date, items);
      return newItem;
    } catch (error) {
      console.error('Error adding item:', error);
      return null;
    }
  }

  // Update an existing item
  static async updateItem(date, itemId, updatedData) {
    try {
      const items = await this.getItemsByDate(date);
      const itemIndex = items.findIndex(item => item.id === itemId);
      
      if (itemIndex === -1) {
        throw new Error('Item not found');
      }

      items[itemIndex] = {
        ...items[itemIndex],
        ...updatedData,
        updatedAt: new Date().toISOString()
      };

      await this.saveItemsByDate(date, items);
      return items[itemIndex];
    } catch (error) {
      console.error('Error updating item:', error);
      return null;
    }
  }

  // Delete an item
  static async deleteItem(date, itemId) {
    try {
      const items = await this.getItemsByDate(date);
      const filteredItems = items.filter(item => item.id !== itemId);
      
      if (filteredItems.length === items.length) {
        throw new Error('Item not found');
      }

      await this.saveItemsByDate(date, filteredItems);
      return true;
    } catch (error) {
      console.error('Error deleting item:', error);
      return false;
    }
  }

  // Get language configuration
  static async getLanguageConfig() {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEYS.LANGUAGE);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading language config:', error);
      return null;
    }
  }

  // Save language configuration
  static async saveLanguageConfig(languageConfig) {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEYS.LANGUAGE, JSON.stringify(languageConfig));
      return true;
    } catch (error) {
      console.error('Error saving language config:', error);
      return false;
    }
  }

  // Get categories
  static async getCategories() {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEYS.CATEGORIES);
      return data ? JSON.parse(data) : this.DEFAULT_CATEGORIES;
    } catch (error) {
      console.error('Error loading categories:', error);
      return this.DEFAULT_CATEGORIES;
    }
  }

  // Save categories
  static async saveCategories(categories) {
    try {
      const validCategories = categories.filter(cat => cat && cat.trim().length > 0);
      await AsyncStorage.setItem(this.STORAGE_KEYS.CATEGORIES, JSON.stringify(validCategories));
      return true;
    } catch (error) {
      console.error('Error saving categories:', error);
      return false;
    }
  }

  // Add a new category
  static async addCategory(categoryName) {
    try {
      const categories = await this.getCategories();
      const trimmedName = categoryName.trim();
      
      if (!trimmedName || categories.includes(trimmedName)) {
        return false;
      }

      categories.push(trimmedName);
      await this.saveCategories(categories);
      return true;
    } catch (error) {
      console.error('Error adding category:', error);
      return false;
    }
  }

  // Remove a category
  static async removeCategory(categoryName) {
    try {
      const categories = await this.getCategories();
      const filteredCategories = categories.filter(cat => cat !== categoryName);
      
      if (filteredCategories.length === categories.length) {
        return false; // Category not found
      }

      await this.saveCategories(filteredCategories);
      return true;
    } catch (error) {
      console.error('Error removing category:', error);
      return false;
    }
  }

  // Get unit types
  static async getUnitTypes() {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEYS.UNIT_TYPES);
      return data ? JSON.parse(data) : this.DEFAULT_UNIT_TYPES;
    } catch (error) {
      console.error('Error loading unit types:', error);
      return this.DEFAULT_UNIT_TYPES;
    }
  }

  // Save unit types
  static async saveUnitTypes(unitTypes) {
    try {
      const validUnitTypes = unitTypes.filter(unit => unit && unit.trim().length > 0);
      await AsyncStorage.setItem(this.STORAGE_KEYS.UNIT_TYPES, JSON.stringify(validUnitTypes));
      return true;
    } catch (error) {
      console.error('Error saving unit types:', error);
      return false;
    }
  }

  // Add a new unit type
  static async addUnitType(unitType) {
    try {
      const unitTypes = await this.getUnitTypes();
      const trimmedUnit = unitType.trim();
      
      if (!trimmedUnit || unitTypes.includes(trimmedUnit)) {
        return false;
      }

      unitTypes.push(trimmedUnit);
      await this.saveUnitTypes(unitTypes);
      return true;
    } catch (error) {
      console.error('Error adding unit type:', error);
      return false;
    }
  }

  // Remove a unit type
  static async removeUnitType(unitType) {
    try {
      const unitTypes = await this.getUnitTypes();
      const filteredUnitTypes = unitTypes.filter(unit => unit !== unitType);
      
      if (filteredUnitTypes.length === unitTypes.length) {
        return false; // Unit type not found
      }

      await this.saveUnitTypes(filteredUnitTypes);
      return true;
    } catch (error) {
      console.error('Error removing unit type:', error);
      return false;
    }
  }

  // Get user preferences
  static async getUserPreferences() {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEYS.USER_PREFERENCES);
      return data ? JSON.parse(data) : {
        theme: 'light',
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY',
        defaultCategory: 'Other',
        defaultUnitType: 'pieces',
        autoBackup: false,
        notifications: true
      };
    } catch (error) {
      console.error('Error loading user preferences:', error);
      return {};
    }
  }

  // Save user preferences
  static async saveUserPreferences(preferences) {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(preferences));
      return true;
    } catch (error) {
      console.error('Error saving user preferences:', error);
      return false;
    }
  }

  // Clean old data (older than specified days)
  static async cleanOldData(daysToKeep = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      
      const keys = await AsyncStorage.getAllKeys();
      const inventoryKeys = keys.filter(key => key.startsWith(this.STORAGE_KEYS.INVENTORY));
      
      const keysToDelete = [];
      
      for (const key of inventoryKeys) {
        const dateStr = key.replace(this.STORAGE_KEYS.INVENTORY, '');
        const itemDate = new Date(dateStr);
        if (itemDate < cutoffDate) {
          keysToDelete.push(key);
        }
      }

      if (keysToDelete.length > 0) {
        await AsyncStorage.multiRemove(keysToDelete);
        console.log(`Cleaned ${keysToDelete.length} old data entries`);
      }

      return keysToDelete.length;
    } catch (error) {
      console.error('Error cleaning old data:', error);
      return 0;
    }
  }

  // Get all dates with data
  static async getAllDataDates() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const inventoryKeys = keys.filter(key => key.startsWith(this.STORAGE_KEYS.INVENTORY));
      
      return inventoryKeys.map(key => {
        const dateStr = key.replace(this.STORAGE_KEYS.INVENTORY, '');
        return new Date(dateStr);
      }).sort((a, b) => b - a); // Sort newest first
    } catch (error) {
      console.error('Error getting data dates:', error);
      return [];
    }
  }

  // Get items count for a specific date
  static async getItemsCountByDate(date) {
    try {
      const items = await this.getItemsByDate(date);
      return items.length;
    } catch (error) {
      console.error('Error getting items count:', error);
      return 0;
    }
  }

  // Get total sales for a specific date
  static async getTotalSalesByDate(date) {
    try {
      const items = await this.getItemsByDate(date);
      return items.reduce((total, item) => {
        const price = parseFloat(item.price) || 0;
        const quantity = parseFloat(item.unitsSold) || 0;
        return total + (price * quantity);
      }, 0);
    } catch (error) {
      console.error('Error calculating total sales:', error);
      return 0;
    }
  }

  // Get total sales for a date range
  static async getTotalSalesInRange(startDate, endDate) {
    try {
      let totalSales = 0;
      const currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        const dailyTotal = await this.getTotalSalesByDate(currentDate);
        totalSales += dailyTotal;
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return totalSales;
    } catch (error) {
      console.error('Error calculating total sales in range:', error);
      return 0;
    }
  }

  // Search items across all dates
  static async searchItems(searchTerm, startDate = null, endDate = null) {
    try {
      const dates = await this.getAllDataDates();
      const results = [];
      
      for (const date of dates) {
        // Filter by date range if provided
        if (startDate && date < startDate) continue;
        if (endDate && date > endDate) continue;
        
        const items = await this.getItemsByDate(date);
        const matchingItems = items.filter(item =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        if (matchingItems.length > 0) {
          results.push({
            date: date,
            items: matchingItems
          });
        }
      }
      
      return results;
    } catch (error) {
      console.error('Error searching items:', error);
      return [];
    }
  }

  // Get sales statistics
  static async getSalesStatistics(days = 30) {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);

      const stats = {
        totalSales: 0,
        totalItems: 0,
        totalDays: 0,
        averageDaily: 0,
        bestDay: { date: null, amount: 0 },
        worstDay: { date: null, amount: Infinity },
        categoryBreakdown: {},
        unitTypeBreakdown: {},
        dailyBreakdown: [],
        topSellingItems: [],
        recentTrends: {
          salesTrend: 'stable', // 'increasing', 'decreasing', 'stable'
          averageItemsPerDay: 0,
          mostActiveDay: null
        }
      };

      const currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        const items = await this.getItemsByDate(currentDate);
        const dailyTotal = items.reduce((sum, item) => 
          sum + (parseFloat(item.price) * parseFloat(item.unitsSold)), 0
        );

        if (items.length > 0) {
          stats.totalDays++;
        }

        stats.totalSales += dailyTotal;
        stats.totalItems += items.length;

        // Track best and worst days
        if (dailyTotal > stats.bestDay.amount) {
          stats.bestDay.date = new Date(currentDate);
          stats.bestDay.amount = dailyTotal;
        }

        if (dailyTotal < stats.worstDay.amount && dailyTotal > 0) {
          stats.worstDay.date = new Date(currentDate);
          stats.worstDay.amount = dailyTotal;
        }

        // Category and unit type breakdown
        items.forEach(item => {
          const category = item.category || 'Other';
          const unitType = item.unitType || 'pieces';
          const itemTotal = parseFloat(item.price) * parseFloat(item.unitsSold);
          
          stats.categoryBreakdown[category] = (stats.categoryBreakdown[category] || 0) + itemTotal;
          stats.unitTypeBreakdown[unitType] = (stats.unitTypeBreakdown[unitType] || 0) + parseFloat(item.unitsSold);
        });

        stats.dailyBreakdown.push({
          date: new Date(currentDate),
          amount: dailyTotal,
          itemCount: items.length
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Calculate averages
      stats.averageDaily = stats.totalDays > 0 ? stats.totalSales / stats.totalDays : 0;
      stats.recentTrends.averageItemsPerDay = stats.totalDays > 0 ? stats.totalItems / stats.totalDays : 0;

      // Reset worst day if no sales found
      if (stats.worstDay.amount === Infinity) {
        stats.worstDay = { date: null, amount: 0 };
      }

      // Calculate sales trend
      if (stats.dailyBreakdown.length >= 7) {
        const recentWeek = stats.dailyBreakdown.slice(-7);
        const previousWeek = stats.dailyBreakdown.slice(-14, -7);
        
        const recentAvg = recentWeek.reduce((sum, day) => sum + day.amount, 0) / 7;
        const previousAvg = previousWeek.reduce((sum, day) => sum + day.amount, 0) / 7;
        
        if (recentAvg > previousAvg * 1.1) {
          stats.recentTrends.salesTrend = 'increasing';
        } else if (recentAvg < previousAvg * 0.9) {
          stats.recentTrends.salesTrend = 'decreasing';
        }
      }

      // Find most active day
      const dayActivity = {};
      stats.dailyBreakdown.forEach(day => {
        const dayName = day.date.toLocaleDateString('en-US', { weekday: 'long' });
        dayActivity[dayName] = (dayActivity[dayName] || 0) + day.itemCount;
      });

      stats.recentTrends.mostActiveDay = Object.keys(dayActivity).reduce((a, b) => 
        dayActivity[a] > dayActivity[b] ? a : b, null
      );

      return stats;
    } catch (error) {
      console.error('Error calculating statistics:', error);
      return null;
    }
  }

  // Export data as JSON
  static async exportData() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const inventoryKeys = keys.filter(key => key.startsWith(this.STORAGE_KEYS.INVENTORY));
      
      const exportData = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        inventory: {},
        language: await this.getLanguageConfig(),
        categories: await this.getCategories(),
        unitTypes: await this.getUnitTypes(),
        userPreferences: await this.getUserPreferences()
      };

      for (const key of inventoryKeys) {
        const data = await AsyncStorage.getItem(key);
        const dateKey = key.replace(this.STORAGE_KEYS.INVENTORY, '');
        exportData.inventory[dateKey] = JSON.parse(data);
      }

      return exportData;
    } catch (error) {
      console.error('Error exporting data:', error);
      return null;
    }
  }

  // Import data from JSON
  static async importData(importData) {
    try {
      if (!importData || typeof importData !== 'object') {
        throw new Error('Invalid import data format');
      }

      // Validate data structure
      if (!importData.version) {
        throw new Error('Missing version information');
      }

      // Import inventory data
      if (importData.inventory) {
        for (const [dateKey, items] of Object.entries(importData.inventory)) {
          // Validate date format
          if (!this.isValidDate(new Date(dateKey))) {
            console.warn(`Skipping invalid date: ${dateKey}`);
            continue;
          }

          // Validate items array
          if (!Array.isArray(items)) {
            console.warn(`Skipping invalid items for date: ${dateKey}`);
            continue;
          }

          await AsyncStorage.setItem(`${this.STORAGE_KEYS.INVENTORY}${dateKey}`, JSON.stringify(items));
        }
      }

      // Import language config
      if (importData.language) {
        await this.saveLanguageConfig(importData.language);
      }

      // Import categories
      if (importData.categories && Array.isArray(importData.categories)) {
        await this.saveCategories(importData.categories);
      }

      // Import unit types
      if (importData.unitTypes && Array.isArray(importData.unitTypes)) {
        await this.saveUnitTypes(importData.unitTypes);
      }

      // Import user preferences
      if (importData.userPreferences) {
        await this.saveUserPreferences(importData.userPreferences);
      }

      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  // Get top selling items
  static async getTopSellingItems(days = 30, limit = 10) {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);

      const itemSales = {};
      const currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        const items = await this.getItemsByDate(currentDate);
        
        items.forEach(item => {
          const key = `${item.name}_${item.category}`;
          if (!itemSales[key]) {
            itemSales[key] = {
              name: item.name,
              category: item.category,
              totalQuantity: 0,
              totalRevenue: 0,
              averagePrice: 0,
              salesCount: 0
            };
          }
          
          const quantity = parseFloat(item.unitsSold) || 0;
          const price = parseFloat(item.price) || 0;
          const revenue = quantity * price;
          
          itemSales[key].totalQuantity += quantity;
          itemSales[key].totalRevenue += revenue;
          itemSales[key].salesCount += 1;
          itemSales[key].averagePrice = itemSales[key].totalRevenue / itemSales[key].totalQuantity;
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Convert to array and sort by total revenue
      return Object.values(itemSales)
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, limit);
        
    } catch (error) {
      console.error('Error getting top selling items:', error);
      return [];
    }
  }

  // Utility methods
  static formatDate(date) {
    return date.toISOString().split('T')[0];
  }

  static parseDate(dateString) {
    return new Date(dateString);
  }

  static isValidDate(date) {
    return date instanceof Date && !isNaN(date);
  }

  static isToday(date) {
    const today = new Date();
    return this.formatDate(date) === this.formatDate(today);
  }

  static isYesterday(date) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return this.formatDate(date) === this.formatDate(yesterday);
  }

  static generateId() {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Backup and restore methods
  static async createBackup() {
    try {
      const backupData = await this.exportData();
      if (!backupData) {
        throw new Error('Failed to create backup data');
      }

      // Add backup metadata
      backupData.backupId = this.generateId();
      backupData.deviceInfo = {
        platform: 'react-native',
        timestamp: new Date().toISOString()
      };

      return backupData;
    } catch (error) {
      console.error('Error creating backup:', error);
      return null;
    }
  }

  static async restoreFromBackup(backupData) {
    try {
      if (!backupData || !backupData.backupId) {
        throw new Error('Invalid backup data');
      }

      // Clear existing data
      await this.clearAllData();

      // Import backup data
      const success = await this.importData(backupData);
      
      if (success) {
        console.log('Successfully restored from backup:', backupData.backupId);
      }
      
      return success;
    } catch (error) {
      console.error('Error restoring from backup:', error);
      return false;
    }
  }

  // Clear all application data
  static async clearAllData() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const appKeys = keys.filter(key => 
        key.startsWith(this.STORAGE_KEYS.INVENTORY) ||
        key === this.STORAGE_KEYS.LANGUAGE ||
        key === this.STORAGE_KEYS.CATEGORIES ||
        key === this.STORAGE_KEYS.UNIT_TYPES ||
        key === this.STORAGE_KEYS.USER_PREFERENCES
      );

      await AsyncStorage.multiRemove(appKeys);
      console.log(`Cleared ${appKeys.length} application data entries`);
      return true;
    } catch (error) {
      console.error('Error clearing all data:', error);
      return false;
    }
  }

  // Get storage usage information
  static async getStorageInfo() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const appKeys = keys.filter(key => 
        key.startsWith(this.STORAGE_KEYS.INVENTORY) ||
        Object.values(this.STORAGE_KEYS).includes(key)
      );

      let totalSize = 0;
      const keyInfo = {};

      for (const key of appKeys) {
        const value = await AsyncStorage.getItem(key);
        const size = value ? value.length : 0;
        totalSize += size;
        
        if (key.startsWith(this.STORAGE_KEYS.INVENTORY)) {
          const dateKey = key.replace(this.STORAGE_KEYS.INVENTORY, '');
          keyInfo[dateKey] = {
            size,
            itemCount: value ? JSON.parse(value).length : 0
          };
        }
      }

      return {
        totalKeys: appKeys.length,
        totalSize,
        inventoryDates: Object.keys(keyInfo).length,
        dateBreakdown: keyInfo
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return null;
    }
  }
}

export default DataService;