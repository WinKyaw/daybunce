import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'ai_conversation_history';
const MAX_TURNS = 20;

const ConversationMemoryService = {
  // Append a turn to the stored history and trim to MAX_TURNS
  async addTurn(role, content) {
    try {
      const history = await this.getHistory();
      history.push({ role, content, timestamp: new Date().toISOString() });
      const trimmed = history.slice(-MAX_TURNS);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch (error) {
      console.warn('ConversationMemoryService: error adding turn', error);
    }
  },

  // Return the full stored history array (or [] if empty)
  async getHistory() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) { return []; }
      return JSON.parse(raw) || [];
    } catch (error) {
      console.warn('ConversationMemoryService: error reading history', error);
      return [];
    }
  },

  // Remove the history key from AsyncStorage
  async clearHistory() {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('ConversationMemoryService: error clearing history', error);
    }
  },

  // Build a formatted string of the last 10 turns to inject into the prompt
  async buildMemoryContext() {
    try {
      const history = await this.getHistory();
      if (!history.length) { return ''; }
      const recent = history.slice(-10);
      const lines = recent.map(turn => {
        const label = turn.role === 'user' ? 'User' : 'Assistant';
        return `${label}: ${turn.content}`;
      });
      return `[Conversation History]\n${lines.join('\n')}`;
    } catch (error) {
      console.warn('ConversationMemoryService: error building memory context', error);
      return '';
    }
  },
};

export default ConversationMemoryService;
