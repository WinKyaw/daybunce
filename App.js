import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import components using relative paths
import InventoryApp from './src/components/InventoryApp';
import LoadingScreen from './src/components/LoadingScreen';

// Import services using relative paths  
import LanguageService from './src/services/LanguageService';
import DataService from './src/services/DataService';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setIsLoading(true);

      // Initialize language service
      await LanguageService.initialize();
      
      // Clean old data (older than 30 days)
      const cleanedCount = await DataService.cleanOldData();
      
      if (cleanedCount > 0) {
        console.log(`Cleaned ${cleanedCount} old data entries`);
      }

      setIsInitialized(true);
    } catch (error) {
      console.error('Error initializing app:', error);
      Alert.alert('Error', 'Failed to initialize the application');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isInitialized) {
    return (
      <SafeAreaProvider>
        <View style={styles.errorContainer}>
          <StatusBar style="auto" />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar style="auto" />
        <InventoryApp />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
});