import AsyncStorage from '@react-native-async-storage/async-storage';
import { LLM } from 'react-native-executorch';
import StoreIndexService from './StoreIndexService';

const STORAGE_KEYS = {
  UNLOCKED: 'ai_pro_unlocked',
  MODEL_PATH: 'ai_model_local_uri',
};

// System prompt defining the AI persona as an Expert Inventory and Retail Growth Consultant
const SYSTEM_PROMPT = `You are the DayBunce Store Expert — a world-class inventory and retail growth consultant embedded inside DayBunce, a private daily sales tracker for small business owners.

Your core responsibilities:
1. Analyze sales data and inventory trends provided in the context.
2. Identify low-stock risks, overstock situations, and restocking windows.
3. Surface actionable pricing, bundling, and promotional insights.
4. Answer natural language questions about the store's performance.

Tone: Practical, concise, encouraging. Avoid jargon.

Hard Rules:
- You have NO internet access. Only use data from the context window.
- Never fabricate sales figures. If data is insufficient, say so.
- Always end inventory suggestions with: "Please verify against your physical stock before acting on this recommendation."
- You are NOT a financial advisor. All projections are probabilistic estimates.`;

let llmInstance = null;

const AIService = {
  // Check whether the AI feature has been unlocked (local flag)
  async isUnlocked() {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.UNLOCKED);
      return value === 'true';
    } catch (error) {
      console.error('AIService: error reading unlock state', error);
      return false;
    }
  },

  // Persist the unlock state to AsyncStorage
  async setUnlocked(unlocked) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.UNLOCKED, unlocked ? 'true' : 'false');
    } catch (error) {
      console.error('AIService: error saving unlock state', error);
    }
  },

  // Read the locally stored model file path
  async getModelPath() {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.MODEL_PATH);
    } catch (error) {
      console.error('AIService: error reading model path', error);
      return null;
    }
  },

  // Persist the path to the downloaded model file
  async setModelPath(modelPath) {
    try {
      if (modelPath == null) {
        await AsyncStorage.removeItem(STORAGE_KEYS.MODEL_PATH);
      } else {
        await AsyncStorage.setItem(STORAGE_KEYS.MODEL_PATH, modelPath);
      }
    } catch (error) {
      console.error('AIService: error saving model path', error);
    }
  },

  // Load the quantized Phi-4 Mini model using react-native-executorch
  async loadModel(modelPath) {
    try {
      llmInstance = await LLM.load(modelPath);
      return true;
    } catch (error) {
      console.error('AIService: error loading model', error);
      llmInstance = null;
      return false;
    }
  },

  // Free the model instance to reclaim memory
  unloadModel() {
    if (llmInstance) {
      try {
        llmInstance = null;
      } catch (error) {
        console.error('AIService: error unloading model', error);
      }
    }
  },

  // Send a user message with RAG-augmented context; streams tokens via onToken callback
  async query(userMessage, onToken) {
    if (!llmInstance) {
      throw new Error('Model is not loaded. Call loadModel() first.');
    }

    // Build RAG context from the store index (Tier 3 → Tier 2 → Tier 1)
    const storeContext = await StoreIndexService.buildContext();

    const fullPrompt = `${SYSTEM_PROMPT}

--- STORE CONTEXT START ---
${storeContext}
--- STORE CONTEXT END ---

User: ${userMessage}
Assistant:`;

    await llmInstance.generate(fullPrompt, token => {
      if (onToken) {
        onToken(token);
      }
    });
  },
};

export default AIService;
