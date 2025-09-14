import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { LocalStorage } from './LocalStorage';

// Expo-compatible DataService
export const DataService = {
  async getItems(date) {
    const key = `inventory_${date}`;
    const data = await LocalStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  },

  async saveItem(date, item) {
    const items = await this.getItems(date);
    const newItem = {
      ...item,
      id: `${date}_${Date.now()}`,
      timestamp: new Date().toISOString(),
      totalAmount: parseFloat(item.price) * parseFloat(item.unitsSold)
    };
    items.push(newItem);
    await LocalStorage.setItem(`inventory_${date}`, JSON.stringify(items));
    return newItem;
  },

  async updateItem(date, itemId, updatedData) {
    const items = await this.getItems(date);
    const itemIndex = items.findIndex(item => item.id === itemId);
    if (itemIndex !== -1) {
      items[itemIndex] = {
        ...items[itemIndex],
        ...updatedData,
        totalAmount: parseFloat(updatedData.price || items[itemIndex].price) * 
                    parseFloat(updatedData.unitsSold || items[itemIndex].unitsSold)
      };
      await LocalStorage.setItem(`inventory_${date}`, JSON.stringify(items));
      return items[itemIndex];
    }
    return null;
  },

  async deleteItem(date, itemId) {
    const items = await this.getItems(date);
    const filteredItems = items.filter(item => item.id !== itemId);
    await LocalStorage.setItem(`inventory_${date}`, JSON.stringify(filteredItems));
    return filteredItems;
  },

  async cleanup() {
    const keys = await LocalStorage.getAllKeys();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);
    const cutoffStr = cutoffDate.toISOString().split('T')[0];

    let removedCount = 0;
    for (const key of keys) {
      const date = key.replace('inventory_', '');
      if (date < cutoffStr) {
        await LocalStorage.removeItem(key);
        removedCount++;
      }
    }
    return removedCount;
  },

  async exportAllData() {
    try {
      const keys = await LocalStorage.getAllKeys();
      const allData = {};
      
      for (const key of keys) {
        const data = await LocalStorage.getItem(key);
        if (data) {
          const date = key.replace('inventory_', '');
          allData[date] = JSON.parse(data);
        }
      }

      const settings = await this.getSettings();
      const exportData = {
        inventory: allData,
        settings: settings,
        exportDate: new Date().toISOString(),
        version: '1.0',
        deviceInfo: {
          platform: Platform.OS,
          appVersion: '1.0.0'
        }
      };

      // Save to device storage using Expo FileSystem
      const fileName = `inventory_backup_${new Date().toISOString().split('T')[0]}.json`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(filePath, JSON.stringify(exportData, null, 2));
      
      // Share the file using Expo Sharing
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath, {
          mimeType: 'application/json',
          dialogTitle: 'Export Inventory Data',
        });
      }
      
      return { success: true, filePath };
    } catch (error) {
      console.error('Export error:', error);
      return { success: false, error: error.message };
    }
  },

  async importFromFile(fileUri) {
    try {
      const fileExists = await FileSystem.getInfoAsync(fileUri);
      if (!fileExists.exists) {
        throw new Error('File does not exist');
      }

      const fileContent = await FileSystem.readAsStringAsync(fileUri);
      const importData = JSON.parse(fileContent);

      if (importData.version !== '1.0') {
        throw new Error('Unsupported backup version');
      }

      // Import inventory data
      if (importData.inventory) {
        for (const [date, items] of Object.entries(importData.inventory)) {
          await LocalStorage.setItem(`inventory_${date}`, JSON.stringify(items));
        }
      }

      // Import settings
      if (importData.settings) {
        await this.saveSettings(importData.settings);
      }

      return { success: true, message: 'Data imported successfully' };
    } catch (error) {
      console.error('Import error:', error);
      return { success: false, error: error.message };
    }
  },

  async getSettings() {
    const data = await LocalStorage.getItem('app_settings');
    return data ? JSON.parse(data) : {
      labels: {
        appTitle: 'Inventory Management',
        search: 'Search items...',
        category: 'Category',
        all: 'All',
        addItem: 'Add Item',
        dailyTotal: 'Daily Total',
        itemName: 'Item Name',
        price: 'Price',
        unitsSold: 'Units Sold',
        totalAmount: 'Total Amount',
        unit: 'Unit',
        save: 'Save',
        cancel: 'Cancel',
        scanOCR: 'Scan with OCR',
        noItems: 'No items for this date',
        sortBy: 'Sort by',
        exportData: 'Export Data',
        importData: 'Import Data',
        clearData: 'Clear All Data'
      },
      categories: ['electronics', 'food', 'clothing', 'books', 'other'],
      units: ['pcs', 'kg', 'lb', 'oz', 'liter', 'gallon']
    };
  },

  async saveSettings(settings) {
    await LocalStorage.setItem('app_settings', JSON.stringify(settings));
  }
};