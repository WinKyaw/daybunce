import AsyncStorage from '@react-native-async-storage/async-storage';

class LocalStorage {
  // Generic get method
  static async get(key) {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Error getting ${key}:`, error);
      return null;
    }
  }

  // Generic set method
  static async set(key, value) {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error setting ${key}:`, error);
      return false;
    }
  }

  // Remove specific key
  static async remove(key) {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
      return false;
    }
  }

  // Remove multiple keys
  static async removeMultiple(keys) {
    try {
      await AsyncStorage.multiRemove(keys);
      return true;
    } catch (error) {
      console.error('Error removing multiple keys:', error);
      return false;
    }
  }

  // Get all keys
  static async getAllKeys() {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('Error getting all keys:', error);
      return [];
    }
  }

  // Clear all storage
  static async clear() {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  }

  // Get multiple values
  static async getMultiple(keys) {
    try {
      const values = await AsyncStorage.multiGet(keys);
      const result = {};
      
      values.forEach(([key, value]) => {
        result[key] = value ? JSON.parse(value) : null;
      });
      
      return result;
    } catch (error) {
      console.error('Error getting multiple values:', error);
      return {};
    }
  }

  // Set multiple values
  static async setMultiple(keyValuePairs) {
    try {
      const pairs = keyValuePairs.map(([key, value]) => [
        key,
        JSON.stringify(value)
      ]);
      
      await AsyncStorage.multiSet(pairs);
      return true;
    } catch (error) {
      console.error('Error setting multiple values:', error);
      return false;
    }
  }

  // Check if key exists
  static async exists(key) {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return keys.includes(key);
    } catch (error) {
      console.error(`Error checking if ${key} exists:`, error);
      return false;
    }
  }

  // Get storage size info
  static async getStorageInfo() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const values = await AsyncStorage.multiGet(keys);
      
      let totalSize = 0;
      let itemCount = 0;
      
      values.forEach(([key, value]) => {
        if (value) {
          totalSize += value.length;
          itemCount++;
        }
      });
      
      return {
        itemCount,
        totalSize,
        keys: keys.length
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return {
        itemCount: 0,
        totalSize: 0,
        keys: 0
      };
    }
  }

  // Backup all data
  static async backup() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const values = await AsyncStorage.multiGet(keys);
      
      const backup = {};
      values.forEach(([key, value]) => {
        backup[key] = value ? JSON.parse(value) : null;
      });
      
      return {
        timestamp: new Date().toISOString(),
        data: backup
      };
    } catch (error) {
      console.error('Error creating backup:', error);
      return null;
    }
  }

  // Restore from backup
  static async restore(backup) {
    try {
      if (!backup || !backup.data) {
        throw new Error('Invalid backup data');
      }
      
      // Clear existing data first
      await AsyncStorage.clear();
      
      // Restore data
      const keyValuePairs = Object.entries(backup.data).map(([key, value]) => [
        key,
        JSON.stringify(value)
      ]);
      
      await AsyncStorage.multiSet(keyValuePairs);
      return true;
    } catch (error) {
      console.error('Error restoring backup:', error);
      return false;
    }
  }

  // Search keys by pattern
  static async findKeys(pattern) {
    try {
      const keys = await AsyncStorage.getAllKeys();
      if (typeof pattern === 'string') {
        return keys.filter(key => key.includes(pattern));
      } else if (pattern instanceof RegExp) {
        return keys.filter(key => pattern.test(key));
      }
      return [];
    } catch (error) {
      console.error('Error finding keys:', error);
      return [];
    }
  }

  // Get values by key pattern
  static async getByPattern(pattern) {
    try {
      const keys = await this.findKeys(pattern);
      if (keys.length === 0) return {};
      
      const values = await AsyncStorage.multiGet(keys);
      const result = {};
      
      values.forEach(([key, value]) => {
        result[key] = value ? JSON.parse(value) : null;
      });
      
      return result;
    } catch (error) {
      console.error('Error getting values by pattern:', error);
      return {};
    }
  }
}

export default LocalStorage;