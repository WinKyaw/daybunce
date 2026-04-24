import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AIService from '../services/AIService';
import IAPService from '../services/IAPService';
import ModelDownloadService from '../services/ModelDownloadService';
import StoreIndexService from '../services/StoreIndexService';
import ConversationMemoryService from '../services/ConversationMemoryService';
import FeedbackService from '../services/FeedbackService';
import AIDisclaimerModal, { hasAcceptedDisclaimer } from './AIDisclaimerModal';
import LegalCreditsView from './LegalCreditsView';
import ModelDownloadScreen from './ModelDownloadScreen';

const WHAT_IF_SCENARIOS = [
  "What if I raised prices by 10%?",
  "What if I ran a 2-for-1 promotion?",
  "What if I stopped stocking my slowest seller?",
  "What if I added a new product category?",
  "What if I gave bulk discounts?",
];

const AIExpertScreen = ({ initialQuestion, onOpenInsights }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState(initialQuestion || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showLegal, setShowLegal] = useState(false);
  const [showDownload, setShowDownload] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [feedback, setFeedback] = useState({});
  const flatListRef = useRef(null);
  // Tracks the index of the AI message currently being streamed
  const streamingIndexRef = useRef(null);

  const resetModelAndShowDownload = useCallback(async () => {
    await ModelDownloadService.clearDownloadState();
    setModelReady(false);
    setShowDownload(true);
  }, []);

  const initModel = useCallback(async () => {
    if (!AIService.isLLMAvailable()) {
      console.warn('AIExpertScreen: LLM module not available, AI features disabled.');
      setModelReady(false);
      return;
    }
    const isUnlocked = await AIService.isUnlocked();
    if (!isUnlocked) {
      setUnlocked(false);
      return; // Don't touch downloads — user hasn't paid yet
    }
    setUnlocked(true);
    const modelPath = await AIService.getModelPath();
    if (!modelPath) {
      // Show download screen instead of an alert
      setShowDownload(true);
      return;
    }
    // Also check the file actually exists on disk (guards against stale AsyncStorage paths)
    const downloaded = await ModelDownloadService.isModelDownloaded();
    if (!downloaded) {
      await AIService.setModelPath(null); // clear stale path
      setShowDownload(true);
      return;
    }
    const ok = await AIService.loadModel(modelPath);
    if (!ok) {
      // Model file is likely corrupt — delete it and prompt re-download
      await resetModelAndShowDownload();
      return;
    }
    setModelReady(ok);
  }, [resetModelAndShowDownload]);

  // On mount: trigger non-blocking index rebuild + check disclaimer + load feedback
  useEffect(() => {
    // Rebuild the store index and run the nightly personalization update (non-blocking)
    StoreIndexService.rebuildIndex().catch(console.warn);
    StoreIndexService.runNightlyIndex().catch(console.warn);

    // Load persisted feedback ratings
    FeedbackService.getAllFeedback().then(all => setFeedback(all)).catch(console.warn);

    (async () => {
      const isUnlocked = await AIService.isUnlocked();
      setUnlocked(isUnlocked);
      const accepted = await hasAcceptedDisclaimer();
      if (!accepted) {
        setShowDisclaimer(true);
        return;
      }
      await initModel();
    })();
  }, [initModel]);

  const handleDisclaimerAccept = useCallback(async () => {
    setShowDisclaimer(false);
    await initModel();
  }, [initModel]);

  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text || isGenerating || !modelReady) { return; }

    const userMsg = { id: Date.now().toString(), role: 'user', content: text };
    const aiMsg = {
      id: `${Date.now()}_ai`,
      role: 'assistant',
      content: '',
    };

    setMessages(prev => {
      const next = [...prev, userMsg, aiMsg];
      streamingIndexRef.current = next.length - 1;
      return next;
    });
    setInputText('');
    setIsGenerating(true);

    try {
      await AIService.query(text, token => {
        setMessages(prev => {
          const updated = [...prev];
          const idx = streamingIndexRef.current;
          if (idx !== null && updated[idx]) {
            updated[idx] = {
              ...updated[idx],
              content: updated[idx].content + token,
            };
          }
          return updated;
        });
        // Auto-scroll to bottom while streaming
        flatListRef.current?.scrollToEnd({ animated: false });
      });
    } catch (error) {
      console.error('AIExpertScreen: handleSend error:', error?.message, error);
      setMessages(prev => {
        const updated = [...prev];
        const idx = streamingIndexRef.current;
        if (idx !== null && updated[idx]) {
          updated[idx] = {
            ...updated[idx],
            content: `Error: ${error?.message || 'An error occurred. Please try again.'}`,
          };
        }
        return updated;
      });
    } finally {
      setIsGenerating(false);
      streamingIndexRef.current = null;
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [inputText, isGenerating, modelReady]);

  const handleRestorePurchase = useCallback(async () => {
    const restored = await IAPService.restorePurchases();
    if (restored) {
      Alert.alert('Restored', 'Your DB Bunbun purchase has been restored.');
    } else {
      Alert.alert(
        'Not Found',
        'No previous purchase found for this Apple ID. If you believe this is an error, contact support.',
      );
    }
  }, []);

  const renderMessage = ({ item, index }) => {
    const isUser = item.role === 'user';
    const isStreaming = streamingIndexRef.current === index;
    const showFeedback = !isUser && item.content && !isStreaming;
    const currentRating = feedback[item.id];

    return (
      <View style={[styles.bubbleRow, isUser ? styles.bubbleRowUser : styles.bubbleRowAI]}>
        <View>
          <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAI]}>
            <Text style={[styles.bubbleText, isUser ? styles.bubbleTextUser : styles.bubbleTextAI]}>
              {item.content || (isGenerating && streamingIndexRef.current !== null ? '…' : '')}
            </Text>
          </View>
          {showFeedback && (
            <View style={styles.feedbackRow}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  FeedbackService.recordFeedback(item.id, 'up', item.content)
                    .then(() => setFeedback(prev => ({ ...prev, [item.id]: 'up' })))
                    .catch(console.warn);
                }}
              >
                <Text style={[styles.feedbackBtn, currentRating === 'up' && styles.feedbackSelected]}>👍</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  FeedbackService.recordFeedback(item.id, 'down', item.content)
                    .then(() => setFeedback(prev => ({ ...prev, [item.id]: 'down' })))
                    .catch(console.warn);
                }}
              >
                <Text style={[styles.feedbackBtn, currentRating === 'down' && styles.feedbackSelected]}>👎</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (showDownload && unlocked) {
    return (
      <ModelDownloadScreen
        onComplete={async (uri) => {
          setShowDownload(false);
          await AIService.setModelPath(uri);
          await initModel();
        }}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>DB Bunbun 🐰</Text>
        <View style={styles.headerActions}>
          {onOpenInsights && (
            <TouchableOpacity onPress={onOpenInsights} style={styles.headerBtn}>
              <Text style={styles.headerBtnText}>📊 Insights</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => setShowLegal(true)} style={styles.headerBtn}>
            <Text style={styles.headerBtnText}>About AI</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleRestorePurchase} style={styles.headerBtn}>
            <Text style={styles.headerBtnText}>Restore</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={async () => {
              await ConversationMemoryService.clearHistory();
              setMessages([]);
            }}
            style={styles.headerBtn}
          >
            <Text style={styles.headerBtnText}>New Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                'Reset AI Model',
                 'This will delete DB Bunbun (~1.9 GB) from your device. You will need to re-download it to use AI features.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete & Reset',
                    style: 'destructive',
                    onPress: resetModelAndShowDownload,
                  },
                ],
              );
            }}
            style={styles.headerBtn}
          >
            <Text style={styles.headerBtnText}>Reset AI</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Message list */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={
          !AIService.isLLMAvailable() ? (
            <Text style={styles.emptyText}>
              AI features are not available in this build. Please contact support.
            </Text>
          ) : !unlocked ? (
            <Text style={styles.emptyText}>
              Unlock DB Bunbun 🐰 to get AI-powered insights for your store.{'\n\n'}Tap Restore if you've already purchased.
            </Text>
          ) : modelReady ? (
              <Text style={styles.emptyText}>
               Ask DB Bunbun anything about your inventory or sales…
              </Text>
          ) : (
            <Text style={styles.emptyText}>Loading AI model…</Text>
          )
        }
      />

      {/* Thinking indicator */}
      {isGenerating && (
        <View style={styles.thinkingRow}>
          <ActivityIndicator size="small" color="#4f46e5" />
          <Text style={styles.thinkingText}>DB Bunbun is thinking…</Text>
        </View>
      )}

      {/* What-If scenario chips */}
      {modelReady && !isGenerating && (
        <View style={styles.whatIfContainer}>
          <Text style={styles.whatIfLabel}>What-If:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.whatIfScroll}
          >
            {WHAT_IF_SCENARIOS.map(scenario => (
              <TouchableOpacity
                key={scenario}
                style={styles.whatIfChip}
                onPress={() => setInputText(scenario)}
                activeOpacity={0.7}
              >
                <Text style={styles.whatIfChipText}>{scenario}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Input bar */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask about your store…"
          placeholderTextColor="#aaa"
          multiline
          editable={modelReady && !isGenerating}
          returnKeyType="send"
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!modelReady || isGenerating || !inputText.trim()) && styles.sendButtonDisabled,
          ]}
          onPress={handleSend}
          disabled={!modelReady || isGenerating || !inputText.trim()}
          activeOpacity={0.8}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>

      </KeyboardAvoidingView>

      {/* First-use disclaimer gate */}
      <AIDisclaimerModal visible={showDisclaimer} onAccept={handleDisclaimerAccept} />

      {/* Legal / Credits modal */}
      <Modal
        visible={showLegal}
        animationType="slide"
        onRequestClose={() => setShowLegal(false)}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.legalHeader}>
            <TouchableOpacity onPress={() => setShowLegal(false)} style={styles.closeLegalBtn}>
              <Text style={styles.closeLegalBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
          <LegalCreditsView />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f8f8fc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#4f46e5',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  headerBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  messageList: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexGrow: 1,
  },
  bubbleRow: {
    marginVertical: 4,
    flexDirection: 'row',
  },
  bubbleRowUser: {
    justifyContent: 'flex-end',
  },
  bubbleRowAI: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleUser: {
    backgroundColor: '#4f46e5',
    borderBottomRightRadius: 4,
  },
  bubbleAI: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 21,
  },
  bubbleTextUser: {
    color: '#fff',
  },
  bubbleTextAI: {
    color: '#1a1a2e',
  },
  emptyText: {
    textAlign: 'center',
    color: '#aaa',
    fontSize: 14,
    marginTop: 60,
    paddingHorizontal: 32,
    lineHeight: 22,
  },
  thinkingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  thinkingText: {
    fontSize: 13,
    color: '#888',
    fontStyle: 'italic',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 8,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 15,
    color: '#1a1a2e',
  },
  sendButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 10,
    alignSelf: 'flex-end',
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  legalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  closeLegalBtn: {
    padding: 6,
  },
  closeLegalBtnText: {
    color: '#4f46e5',
    fontSize: 16,
    fontWeight: '600',
  },
  whatIfContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  whatIfLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4f46e5',
    marginRight: 8,
    flexShrink: 0,
  },
  whatIfScroll: {
    gap: 8,
    paddingRight: 8,
  },
  whatIfChip: {
    backgroundColor: '#ede9fe',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  whatIfChipText: {
    color: '#4f46e5',
    fontSize: 13,
    fontWeight: '500',
  },
  feedbackRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
    paddingLeft: 4,
  },
  feedbackBtn: {
    fontSize: 16,
    color: '#aaa',
  },
  feedbackSelected: {
    color: '#4f46e5',
  },
});

export default AIExpertScreen;
