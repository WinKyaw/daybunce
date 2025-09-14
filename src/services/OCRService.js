// src/services/OCRService.js
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { recognizeAsync } from 'expo-mlkit-ocr';

export const OCRService = {
  async captureImage() {
    try {
      // Request camera permissions
      const { status } = await Camera.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        return { success: false, error: 'Camera permission denied' };
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (result.canceled) {
        return { success: false, error: 'User canceled' };
      }

      return { 
        success: true, 
        imageUri: result.assets[0].uri,
        width: result.assets[0].width,
        height: result.assets[0].height
      };
    } catch (error) {
      console.error('Camera error:', error);
      return { success: false, error: error.message };
    }
  },

  async selectFromLibrary() {
    try {
      // Request media library permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        return { success: false, error: 'Media library permission denied' };
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (result.canceled) {
        return { success: false, error: 'User canceled' };
      }

      return { 
        success: true, 
        imageUri: result.assets[0].uri,
        width: result.assets[0].width,
        height: result.assets[0].height
      };
    } catch (error) {
      console.error('Image picker error:', error);
      return { success: false, error: error.message };
    }
  },

  async scanImage(imageUri) {
    try {
      const result = await recognizeAsync(imageUri, {
        language: 'latin', // Supports English and Myanmar (latin script covers both)
      });
      return this.extractDataFromOCR(result);
    } catch (error) {
      console.error('OCR Error:', error);
      return { success: false, error: error.message };
    }
  },

  extractDataFromOCR(ocrResult) {
    const { text, blocks } = ocrResult;
    let itemName = '';
    let prices = [];
    let quantities = [];

    // Process each text block
    blocks.forEach(block => {
      const blockText = block.text;
      
      // Extract numbers that could be prices/quantities
      const numbers = blockText.match(/\d+\.?\d*/g);
      if (numbers) {
        numbers.forEach(num => {
          const value = parseFloat(num);
          if (value > 0) {
            // Assume smaller numbers are quantities, larger are prices
            if (value < 100 && value % 1 === 0) {
              quantities.push(value);
            } else {
              prices.push(value);
            }
          }
        });
      }
      
      // Extract potential item name (text without numbers and common receipt words)
      const cleanText = blockText
        .replace(/\d+\.?\d*/g, '') // Remove numbers
        .replace(/[×x*]/gi, '') // Remove multiplication symbols
        .replace(/total|price|qty|quantity|amount/gi, '') // Remove common receipt words
        .trim();
      
      if (cleanText.length > itemName.length && cleanText.length > 2) {
        itemName = cleanText;
      }
    });

    // If no clear item name found, use first non-empty text block
    if (!itemName && blocks.length > 0) {
      itemName = blocks.find(b => b.text.trim().length > 2)?.text || 'Scanned Item';
    }

    return {
      success: true,
      extracted: {
        itemName: itemName || 'Scanned Item',
        price: prices.length > 0 ? Math.max(...prices).toString() : '',
        quantity: quantities.length > 0 ? quantities[0].toString() : '1',
        total: prices.length > 0 && quantities.length > 0 ? 
               (Math.max(...prices) * quantities[0]).toString() : ''
      },
      confidence: 0.85,
      rawText: text,
      detectedBlocks: blocks.length
    };
  }
};