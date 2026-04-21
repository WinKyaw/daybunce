import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DISCLAIMER_ACCEPTED_KEY = 'ai_disclaimer_acknowledged';

// Helper to check whether the user has already accepted the disclaimer
export const hasAcceptedDisclaimer = async () => {
  try {
    const value = await AsyncStorage.getItem(DISCLAIMER_ACCEPTED_KEY);
    return value === 'true';
  } catch {
    return false;
  }
};

// First-use safety gate — must be acknowledged before the AI chat is accessible.
// Props:
//   visible   {boolean}  — controls Modal visibility
//   onAccept  {function} — called when the user taps the accept button
const AIDisclaimerModal = ({ visible, onAccept }) => {
  const [accepting, setAccepting] = useState(false);

  const handleAccept = async () => {
    if (accepting) { return; }
    setAccepting(true);
    try {
      await AsyncStorage.setItem(DISCLAIMER_ACCEPTED_KEY, 'true');
      if (onAccept) { onAccept(); }
    } catch (error) {
      console.error('AIDisclaimerModal: error saving accepted flag', error);
    } finally {
      setAccepting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>DB Bunbun — Important Notice</Text>
          <ScrollView contentContainerStyle={styles.bodyContainer}>
            <Text style={styles.body}>
              DB Bunbun is an automated assistant, not a financial advisor. All
              inventory and sales suggestions are probabilistic estimates. Always
              verify AI suggestions against physical stock before making major
              business decisions.
            </Text>
          </ScrollView>
          <TouchableOpacity
            style={[styles.button, accepting && styles.buttonDisabled]}
            onPress={handleAccept}
            disabled={accepting}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>I Understand — Let's Begin</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 420,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 16,
    textAlign: 'center',
  },
  bodyContainer: {
    paddingBottom: 8,
  },
  body: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
    textAlign: 'left',
  },
  button: {
    marginTop: 20,
    backgroundColor: '#4f46e5',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AIDisclaimerModal;
