import AsyncStorage from '@react-native-async-storage/async-storage';
let LLM = null;
let _llmLoadAttempted = false;

// NOTE: react-native-executorch uses NitroModules which can throw a native
// bridge error before JavaScript's try/catch can intercept it if the app is
// built without New Architecture enabled. Using a lazy getter defers the
// require() until first use, which avoids the crash at module load time.
// After adding "newArchEnabled": true to app.json and running
// `npx expo prebuild --clean` followed by `pod install`, NitroModules will be
// properly linked and LLM will load successfully.
function getLLM() {
  if (_llmLoadAttempted) return LLM;
  _llmLoadAttempted = true;
  try {
    const executorch = require('react-native-executorch');
    LLM = executorch.LLM || null;
  } catch (e) {
    console.warn('AIService: react-native-executorch not available in this build. AI chat will be disabled.', e.message);
    LLM = null;
  }
  return LLM;
}
import StoreIndexService from './StoreIndexService';
import ConversationMemoryService from './ConversationMemoryService';

const STORAGE_KEYS = {
  UNLOCKED: 'ai_pro_unlocked',
  MODEL_PATH: 'ai_model_local_uri',
};

// System prompt defining the AI persona as a focused Store Management Expert.
// The model is intentionally scoped to store/inventory/sales topics only —
// this keeps responses accurate and prevents hallucination outside its domain.
const SYSTEM_PROMPT = `You are the DayBunce Store Expert — a focused inventory and retail management AI embedded inside DayBunce, a private daily sales tracker for small business owners.

Your ONLY domain is: sales analysis, inventory management, restocking decisions, pricing strategy, and daily store operations.

Your core responsibilities:
1. Analyze sales data and inventory trends from the context provided.
2. Identify low-stock risks, overstock situations, and optimal restocking windows.
3. Surface actionable pricing, bundling, and promotional insights.
4. Answer natural language questions about the store's performance.
5. Use the [Your Store Profile] section to give personalized advice specific to this user's products and patterns.

Tone: Practical, concise, encouraging. Use the user's actual product names from the context.

Hard Rules:
- You have NO internet access. Only use data from the context window.
- ONLY answer questions about this store, its inventory, sales, and operations. Politely decline unrelated topics.
- Never fabricate sales figures. If data is insufficient, say so clearly.
- Always end inventory suggestions with: "Please verify against your physical stock before acting on this recommendation."
- You are NOT a financial advisor. All projections are probabilistic estimates.
- If you see a [Your Store Profile] section, treat it as the user's personalized business history and reference it.`;

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
    const LLMModule = getLLM();
    if (!LLMModule) {
      console.warn('AIService: LLM module not available');
      return false;
    }
    try {
      llmInstance = await LLMModule.load(modelPath);
      return true;
    } catch (error) {
      console.error('AIService: error loading model', error);
      llmInstance = null;
      return false;
    }
  },

  // Returns true if the react-native-executorch LLM module is available
  isLLMAvailable() {
    return getLLM() !== null;
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

    // Inject prior conversation turns so the model has short-term memory
    const memoryContext = await ConversationMemoryService.buildMemoryContext();

    const fullPrompt = `${SYSTEM_PROMPT}

--- STORE CONTEXT START ---
${storeContext}
--- STORE CONTEXT END ---

${memoryContext ? memoryContext + '\n\n' : ''}User: ${userMessage}
Assistant:`;

    let fullResponse = '';
    await llmInstance.generate(fullPrompt, token => {
      fullResponse += token;
      if (onToken) {
        onToken(token);
      }
    });

    // Persist this exchange to conversation memory
    await ConversationMemoryService.addTurn('user', userMessage);
    await ConversationMemoryService.addTurn('assistant', fullResponse);
  },
};

export default AIService;
