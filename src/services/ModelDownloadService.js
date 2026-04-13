import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import AIService from './AIService';

// Phi-4 Mini quantized model hosted by Software Mansion on Hugging Face.
// Swap this URL for your own CDN (e.g. NAS + Cloudflare) before production release.
export const MODEL_CDN_URL =
  'https://huggingface.co/software-mansion/react-native-executorch-phi-4-mini/resolve/v0.4.0/phi-4-mini-instruct-quantized.pte';

export const MODEL_FILENAME = 'phi4_mini_4bit.pte';

const DOWNLOAD_PROGRESS_KEY = 'ai_download_progress';

let downloadResumable = null;

const ModelDownloadService = {
  // Returns the expected on-device path for the model file
  _modelFilePath() {
    return `${FileSystem.documentDirectory}${MODEL_FILENAME}`;
  },

  // Check whether the model file already exists on-device
  async isModelDownloaded() {
    try {
      const info = await FileSystem.getInfoAsync(this._modelFilePath(), { size: true });
      // Must exist AND be at least 1 GB — guards against corrupt/partial downloads
      return info.exists && (info.size ?? 0) > 1_000_000_000;
    } catch {
      return false;
    }
  },

  // Delete the model file from the device (e.g. for storage reclamation)
  async deleteModel() {
    try {
      const path = this._modelFilePath();
      const info = await FileSystem.getInfoAsync(path);
      if (info.exists) {
        await FileSystem.deleteAsync(path, { idempotent: true });
      }
      await AsyncStorage.removeItem(DOWNLOAD_PROGRESS_KEY);
      AIService.unloadModel();
      await AIService.setModelPath(null);
      return true;
    } catch (error) {
      console.error('ModelDownloadService: error deleting model', error);
      return false;
    }
  },

  // Format raw bytes into a human-readable string (e.g. "1.2 GB")
  formatBytes(bytes) {
    if (bytes == null || bytes === 0) { return '0 B'; }
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
  },

  // Start (or resume) the model download.
  // onProgress(downloadedBytes, totalBytes) — called periodically
  // onComplete(localUri)                   — called when download finishes
  // onError(error)                         — called on failure
  async startDownload(onProgress, onComplete, onError) {
    try {
      const destPath = this._modelFilePath();

      // Re-hydrate a previously saved resumable snapshot if one exists
      const savedSnapshot = await AsyncStorage.getItem(DOWNLOAD_PROGRESS_KEY);

      if (savedSnapshot) {
        // Try to resume first
        try {
          const snapshot = JSON.parse(savedSnapshot);
          downloadResumable = new FileSystem.DownloadResumable(
            snapshot.url,
            snapshot.fileUri,
            snapshot.options,
            _buildProgressCallback(onProgress),
            snapshot.resumeData,
          );
          const result = await downloadResumable.downloadAsync();
          if (result && result.uri) {
            // Success — persist path and clear progress snapshot
            await AIService.setModelPath(result.uri);
            await AsyncStorage.removeItem(DOWNLOAD_PROGRESS_KEY);
            downloadResumable = null;
            if (onComplete) { onComplete(result.uri); }
            return;
          }
        } catch (resumeError) {
          // Resume failed — clear stale snapshot and partial file, then do fresh download
          console.warn('ModelDownloadService: resume failed, starting fresh download', resumeError.message);
          await AsyncStorage.removeItem(DOWNLOAD_PROGRESS_KEY);
          downloadResumable = null;
          // Delete partial file if it exists
          try {
            const info = await FileSystem.getInfoAsync(destPath);
            if (info.exists) {
              await FileSystem.deleteAsync(destPath, { idempotent: true });
            }
          } catch (deleteError) {
            console.warn('ModelDownloadService: could not delete partial file', deleteError.message);
          }
        }
      }

      // Fresh download
      downloadResumable = FileSystem.createDownloadResumable(
        MODEL_CDN_URL,
        destPath,
        {},
        _buildProgressCallback(onProgress),
      );

      const result = await downloadResumable.downloadAsync();

      if (result && result.uri) {
        // Success — persist path and clear progress snapshot
        await AIService.setModelPath(result.uri);
        await AsyncStorage.removeItem(DOWNLOAD_PROGRESS_KEY);
        downloadResumable = null;
        if (onComplete) { onComplete(result.uri); }
      }
    } catch (error) {
      console.error('ModelDownloadService: download error', error);
      if (onError) { onError(error); }
    }
  },

  // Pause an in-progress download and save the resumable snapshot
  async pauseDownload() {
    if (!downloadResumable) { return; }
    try {
      const snapshot = await downloadResumable.pauseAsync();
      if (snapshot) {
        await AsyncStorage.setItem(DOWNLOAD_PROGRESS_KEY, JSON.stringify(snapshot));
      }
    } catch (error) {
      console.error('ModelDownloadService: error pausing download', error);
    }
  },

  // Cancel the download and clean up any partially written file
  async cancelDownload() {
    if (!downloadResumable) { return; }
    try {
      await downloadResumable.cancelAsync();
      downloadResumable = null;
      await AsyncStorage.removeItem(DOWNLOAD_PROGRESS_KEY);
      // Remove partial file
      const path = this._modelFilePath();
      const info = await FileSystem.getInfoAsync(path);
      if (info.exists) {
        await FileSystem.deleteAsync(path, { idempotent: true });
      }
    } catch (error) {
      console.error('ModelDownloadService: error cancelling download', error);
    }
  },

  // Clear all download state (stale snapshots + partial files)
  // Call this when the user explicitly wants to restart the download from scratch
  async clearDownloadState() {
    try {
      await AsyncStorage.removeItem(DOWNLOAD_PROGRESS_KEY);
      downloadResumable = null;
      const path = this._modelFilePath();
      const info = await FileSystem.getInfoAsync(path);
      if (info.exists) {
        await FileSystem.deleteAsync(path, { idempotent: true });
      }
      await AIService.setModelPath(null);
    } catch (error) {
      console.error('ModelDownloadService: error clearing download state', error);
    }
  },
};

// Build the progress callback used by expo-file-system DownloadResumable
function _buildProgressCallback(onProgress) {
  return ({ totalBytesWritten, totalBytesExpectedToWrite }) => {
    if (onProgress) {
      onProgress(totalBytesWritten, totalBytesExpectedToWrite);
    }
  };
}

export default ModelDownloadService;
