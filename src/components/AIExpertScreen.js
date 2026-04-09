import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Modal,
} from 'react-native';
import AIService from '../services/AIService';
import IAPService from '../services/IAPService';
import StoreIndexService from '../services/StoreIndexService';
import AIDisclaimerModal, { hasAcceptedDisclaimer } from './AIDisclaimerModal';
import LegalCreditsView from './LegalCreditsView';

const AIExpertScreen = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showLegal, setShowLegal] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const flatListRef = useRef(null);
  // Tracks the index of the AI message currently being streamed
  const streamingIndexRef = useRef(null);

  // On mount: trigger non-blocking index rebuild + check disclaimer
  useEffect(() => {
    // Rebuild the store index and run the nightly personalization update (non-blocking)
    StoreIndexService.rebuildIndex().catch(console.warn);
    StoreIndexService.runNightlyIndex().catch(console.warn);

    (async () => {
      const accepted = await hasAcceptedDisclaimer();
      if (!accepted) {
        setShowDisclaimer(true);
        return;
      }
      await initModel();
    })();
  }, []);

  const initModel = async () => {
    const modelPath = await AIService.getModelPath();
    if (!modelPath) {
      Alert.alert(
        'Model Not Downloaded',
        'Please complete the model download before using DayBunce AI.',
      );
      return;
    }
    const ok = await AIService.loadModel(modelPath);
    setModelReady(ok);
    if (!ok) {
      Alert.alert('Load Error', 'Failed to load the AI model. Please restart the app.');
    }
  };

  const handleDisclaimerAccept = useCallback(async () => {
    setShowDisclaimer(false);
    await initModel();
  }, []);

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
      setMessages(prev => {
        const updated = [...prev];
        const idx = streamingIndexRef.current;
        if (idx !== null && updated[idx]) {
          updated[idx] = {
            ...updated[idx],
            content: 'Sorry, an error occurred. Please try again.',
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
      Alert.alert('Restored', 'Your DayBunce AI purchase has been restored.');
    } else {
      Alert.alert(
        'Not Found',
        'No previous purchase found for this Apple ID. If you believe this is an error, contact support.',
      );
    }
  }, []);

  const renderMessage = ({ item }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.bubbleRow, isUser ? styles.bubbleRowUser : styles.bubbleRowAI]}>
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAI]}>
          <Text style={[styles.bubbleText, isUser ? styles.bubbleTextUser : styles.bubbleTextAI]}>
            {item.content || (isGenerating && streamingIndexRef.current !== null ? '…' : '')}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>DayBunce Store Expert</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => setShowLegal(true)} style={styles.headerBtn}>
            <Text style={styles.headerBtnText}>About AI</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleRestorePurchase} style={styles.headerBtn}>
            <Text style={styles.headerBtnText}>Restore</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Message list */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={
          modelReady ? (
            <Text style={styles.emptyText}>
              Ask your Store Expert anything about your inventory or sales…
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
          <Text style={styles.thinkingText}>Store Expert is thinking…</Text>
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
});

export default AIExpertScreen;
