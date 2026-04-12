import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'ai_message_feedback';

const FeedbackService = {
  // Record a thumbs up/down rating for a message
  async recordFeedback(messageId, rating, messageContent) {
    try {
      const all = await this.getAllFeedback();
      all[messageId] = {
        messageId,
        rating,
        messageContent: messageContent.slice(0, 200),
        timestamp: new Date().toISOString(),
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    } catch (error) {
      console.warn('FeedbackService: error recording feedback', error);
    }
  },

  // Return the feedback record for a single message, or null
  async getFeedback(messageId) {
    try {
      const all = await this.getAllFeedback();
      return all[messageId] || null;
    } catch (error) {
      console.warn('FeedbackService: error getting feedback', error);
      return null;
    }
  },

  // Return the full feedback map object
  async getAllFeedback() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) { return {}; }
      return JSON.parse(raw) || {};
    } catch (error) {
      console.warn('FeedbackService: error getting all feedback', error);
      return {};
    }
  },

  // Remove all feedback from AsyncStorage
  async clearFeedback() {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('FeedbackService: error clearing feedback', error);
    }
  },
};

export default FeedbackService;
