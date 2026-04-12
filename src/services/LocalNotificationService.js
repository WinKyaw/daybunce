import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

const DAILY_REMINDER_KEY = 'notif_daily_reminder_id';

const LocalNotificationService = {
  /**
   * Initialize the notification service.
   * Requests permissions, then ensures the daily reminder is scheduled.
   * Safe to call on every app launch.
   */
  async init() {
    try {
      await this.requestPermissions();

      const storedId = await AsyncStorage.getItem(DAILY_REMINDER_KEY);
      if (storedId) {
        const scheduled = await Notifications.getAllScheduledNotificationsAsync();
        const stillValid = scheduled.some(n => n.identifier === storedId);
        if (!stillValid) {
          await this.scheduleDailyReminder();
        }
      } else {
        await this.scheduleDailyReminder();
      }
    } catch (error) {
      console.warn('LocalNotificationService init error', error);
    }
  },

  /**
   * Request iOS/Android notification permissions.
   * Returns true if granted, false otherwise.
   */
  async requestPermissions() {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.warn('LocalNotificationService requestPermissions error', error);
      return false;
    }
  },

  /**
   * Returns the current permission status string.
   */
  async getPermissionStatus() {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status;
    } catch (error) {
      console.warn('LocalNotificationService getPermissionStatus error', error);
      return null;
    }
  },

  /**
   * Schedule a repeating daily local notification at the given hour/minute.
   * Cancels any previously stored daily reminder before scheduling a new one.
   * Returns the new notification ID.
   */
  async scheduleDailyReminder(hour = 20, minute = 0) {
    try {
      const existingId = await AsyncStorage.getItem(DAILY_REMINDER_KEY);
      if (existingId) {
        await Notifications.cancelScheduledNotificationAsync(existingId);
      }

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Don't forget to log today's sales 📦",
          body: 'Tap to open DayBunce and record your sales for today.',
        },
        trigger: {
          hour,
          minute,
          repeats: true,
        },
      });

      await AsyncStorage.setItem(DAILY_REMINDER_KEY, id);
      return id;
    } catch (error) {
      console.warn('LocalNotificationService scheduleDailyReminder error', error);
      return null;
    }
  },

  /**
   * Cancel the stored daily reminder and remove it from AsyncStorage.
   */
  async cancelDailyReminder() {
    try {
      const storedId = await AsyncStorage.getItem(DAILY_REMINDER_KEY);
      if (storedId) {
        await Notifications.cancelScheduledNotificationAsync(storedId);
        await AsyncStorage.removeItem(DAILY_REMINDER_KEY);
      }
    } catch (error) {
      console.warn('LocalNotificationService cancelDailyReminder error', error);
    }
  },

  /**
   * Fire an immediate low-stock alert notification.
   */
  async sendLowStockAlert(itemName, currentQty) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `Low Stock Alert: ${itemName}`,
          body: `${itemName} is running low (${currentQty} remaining). Consider restocking soon.`,
        },
        trigger: null,
      });
    } catch (error) {
      console.warn('LocalNotificationService sendLowStockAlert error', error);
    }
  },

  /**
   * Fire an immediate insight alert notification.
   * Used by InsightEngine to surface store insights.
   */
  async sendInsightAlert(title, body) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: { title, body },
        trigger: null,
      });
    } catch (error) {
      console.warn('LocalNotificationService sendInsightAlert error', error);
    }
  },
};

export default LocalNotificationService;
