import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
} from 'react-native';
import ModelDownloadService from '../services/ModelDownloadService';

// Props:
//   onComplete {function} — called when the model is fully downloaded;
//                           caller should navigate to AIExpertScreen here
const ModelDownloadScreen = ({ onComplete }) => {
  const [downloadedBytes, setDownloadedBytes] = useState(0);
  const [totalBytes, setTotalBytes] = useState(0);
  const [paused, setPaused] = useState(false);
  const [started, setStarted] = useState(false);
  const [error, setError] = useState(null);

  const percent =
    totalBytes > 0 ? Math.min(100, (downloadedBytes / totalBytes) * 100) : 0;

  const handleProgress = useCallback((written, total) => {
    setDownloadedBytes(written);
    if (total > 0) { setTotalBytes(total); }
  }, []);

  const handleComplete = useCallback(
    uri => {
      if (onComplete) { onComplete(uri); }
    },
    [onComplete],
  );

  const handleError = useCallback(err => {
    setError(err?.message || 'Download failed');
  }, []);

  // Start the download as soon as the screen mounts
  useEffect(() => {
    if (!started) {
      setStarted(true);
      ModelDownloadService.startDownload(handleProgress, handleComplete, handleError);
    }
  }, [started, handleProgress, handleComplete, handleError]);

  const handlePause = async () => {
    if (paused) {
      // Resume by restarting the download (which will pick up the snapshot)
      setPaused(false);
      await ModelDownloadService.startDownload(
        handleProgress,
        handleComplete,
        handleError,
      );
    } else {
      setPaused(true);
      await ModelDownloadService.pauseDownload();
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Download',
      'Are you sure you want to cancel the download? You will need to download the model again later.',
      [
        { text: 'Keep Downloading', style: 'cancel' },
        {
          text: 'Cancel Download',
          style: 'destructive',
          onPress: async () => {
            await ModelDownloadService.cancelDownload();
            setPaused(false);
            setStarted(false);
            setDownloadedBytes(0);
            setTotalBytes(0);
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Downloading DayBunce AI</Text>
        <Text style={styles.subtitle}>
          Microsoft Phi-4 Mini is being downloaded to your device.{'\n'}
          This is a one-time download of approximately 2.2 GB.
        </Text>

        {/* Progress bar */}
        <View style={styles.progressBackground}>
          <View style={[styles.progressFill, { width: `${percent}%` }]} />
        </View>

        {/* Labels */}
        <Text style={styles.percentLabel}>{percent.toFixed(1)}%</Text>
        <Text style={styles.sizeLabel}>
          {ModelDownloadService.formatBytes(downloadedBytes)}
          {totalBytes > 0
            ? ` / ${ModelDownloadService.formatBytes(totalBytes)}`
            : ''}
        </Text>

        {paused && (
          <Text style={styles.pausedLabel}>Download paused</Text>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={[styles.button, styles.pauseButton]}
              onPress={async () => {
                await ModelDownloadService.clearDownloadState();
                setError(null);
                setDownloadedBytes(0);
                setTotalBytes(0);
                setStarted(false);
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.pauseButtonText}>Retry Download</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Controls */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.pauseButton]}
            onPress={handlePause}
            activeOpacity={0.8}
          >
            <Text style={styles.pauseButtonText}>
              {paused ? 'Resume' : 'Pause'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={handleCancel}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.privacyNote}>
          The model is stored only on this device.{'\n'}
          No data leaves your phone during inference.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f8f8fc',
  },
  container: {
    flex: 1,
    padding: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  progressBackground: {
    width: '100%',
    height: 16,
    backgroundColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4f46e5',
    borderRadius: 8,
  },
  percentLabel: {
    fontSize: 28,
    fontWeight: '700',
    color: '#4f46e5',
    marginTop: 16,
  },
  sizeLabel: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  pausedLabel: {
    fontSize: 13,
    color: '#e07b00',
    marginTop: 8,
    fontStyle: 'italic',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 10,
  },
  pauseButton: {
    backgroundColor: '#4f46e5',
  },
  pauseButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  cancelButton: {
    backgroundColor: '#fee2e2',
  },
  cancelButtonText: {
    color: '#dc2626',
    fontWeight: '600',
    fontSize: 15,
  },
  privacyNote: {
    fontSize: 12,
    color: '#aaa',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 28,
  },
  errorContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  errorText: {
    fontSize: 13,
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 12,
  },
});

export default ModelDownloadScreen;
