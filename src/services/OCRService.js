import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';
import { Alert } from 'react-native';

// Note: For Myanmar OCR, you would integrate with services like:
// - Google Cloud Vision API with Myanmar language support
// - Azure Computer Vision
// - AWS Textract
// - Or a custom OCR solution for Myanmar script

class OCRService {
  constructor() {
    this.supportedLanguages = ['en', 'my']; // English and Myanmar
  }

  // Request camera permissions
  static async requestCameraPermission() {
    const { status } = await Camera.requestCameraPermissionsAsync();
    return status === 'granted';
  }

  // Request media library permissions
  static async requestMediaLibraryPermission() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
  }

  // Take photo with camera
  static async takePhoto(options = {}) {
    try {
      const hasPermission = await this.requestCameraPermission();
      if (!hasPermission) {
        Alert.alert('Permission Required', 'Camera access is needed to take photos');
        return null;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
        ...options
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        return result.assets[0];
      }

      return null;
    } catch (error) {
      console.error('Error taking photo:', error);
      return null;
    }
  }

  // Select image from gallery
  static async selectFromGallery(options = {}) {
    try {
      const hasPermission = await this.requestMediaLibraryPermission();
      if (!hasPermission) {
        Alert.alert('Permission Required', 'Media library access is needed to select photos');
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
        ...options
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        return result.assets[0];
      }

      return null;
    } catch (error) {
      console.error('Error selecting from gallery:', error);
      return null;
    }
  }

  // Process image with OCR (Mock implementation - replace with actual OCR service)
  static async processImage(imageUri, options = {}) {
    try {
      // This is a mock implementation
      // In a real app, you would send the image to an OCR service
      
      const mockOCRResponse = await this.mockOCRProcessing(imageUri, options);
      return this.parseOCRResult(mockOCRResponse);
    } catch (error) {
      console.error('Error processing image:', error);
      return null;
    }
  }

  // Mock OCR processing (replace with actual OCR service call)
  static async mockOCRProcessing(imageUri, options) {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock different responses based on language
    const language = options.language || 'en';
    
    if (language === 'my') {
      // Myanmar text mock response
      return {
        text: "စားသောက်ဆိုင် ရေခဲမုန့်\nစျေးနှုန်း - ၁၀၅၀ ကျပ်\nအရေအတွက် - ၅ ခု",
        confidence: 0.85,
        language: 'my'
      };
    } else {
      // English text mock response
      return {
        text: "Fresh Apples\nPrice: $2.50 per lb\nQuantity: 10 lbs\nTotal: $25.00",
        confidence: 0.92,
        language: 'en'
      };
    }
  }

  // Parse OCR result to extract item information
  static parseOCRResult(ocrResponse) {
    if (!ocrResponse || !ocrResponse.text) {
      return null;
    }

    const text = ocrResponse.text.toLowerCase();
    const language = ocrResponse.language || 'en';

    let parsedData = {
      name: '',
      price: '',
      quantity: '',
      total: '',
      confidence: ocrResponse.confidence || 0,
      rawText: ocrResponse.text
    };

    if (language === 'my') {
      parsedData = this.parseMyanmarText(ocrResponse.text);
    } else {
      parsedData = this.parseEnglishText(ocrResponse.text);
    }

    return parsedData;
  }

  // Parse English OCR text
  static parseEnglishText(text) {
    const lines = text.split('\n');
    let parsedData = {
      name: '',
      price: '',
      quantity: '',
      total: '',
      rawText: text
    };

    // Extract item name (usually first line)
    if (lines.length > 0) {
      parsedData.name = lines[0].trim();
    }

    // Price patterns
    const pricePatterns = [
      /price:?\s*\$?(\d+\.?\d*)/i,
      /cost:?\s*\$?(\d+\.?\d*)/i,
      /\$(\d+\.?\d*)/,
      /(\d+\.?\d*)\s*dollars?/i
    ];

    // Quantity patterns
    const quantityPatterns = [
      /quantity:?\s*(\d+\.?\d*)/i,
      /qty:?\s*(\d+\.?\d*)/i,
      /count:?\s*(\d+\.?\d*)/i,
      /(\d+\.?\d*)\s*(pcs?|pieces?|lbs?|pounds?|kgs?|grams?|oz|ounces?)/i
    ];

    // Total patterns
    const totalPatterns = [
      /total:?\s*\$?(\d+\.?\d*)/i,
      /amount:?\s*\$?(\d+\.?\d*)/i,
      /sum:?\s*\$?(\d+\.?\d*)/i
    ];

    // Extract price
    for (const pattern of pricePatterns) {
      const match = text.match(pattern);
      if (match) {
        parsedData.price = match[1];
        break;
      }
    }

    // Extract quantity
    for (const pattern of quantityPatterns) {
      const match = text.match(pattern);
      if (match) {
        parsedData.quantity = match[1];
        break;
      }
    }

    // Extract total
    for (const pattern of totalPatterns) {
      const match = text.match(pattern);
      if (match) {
        parsedData.total = match[1];
        break;
      }
    }

    return parsedData;
  }

  // Parse Myanmar OCR text
  static parseMyanmarText(text) {
    let parsedData = {
      name: '',
      price: '',
      quantity: '',
      total: '',
      rawText: text
    };

    const lines = text.split('\n');

    // Extract item name (usually first line)
    if (lines.length > 0) {
      parsedData.name = lines[0].trim();
    }

    // Myanmar price patterns
    const myanmarPricePatterns = [
      /စျေးနှုန်း.*?(\d+)\s*ကျပ်/,
      /ဈေး.*?(\d+)\s*ကျပ်/,
      /(\d+)\s*ကျပ်/,
      /price.*?(\d+)/i
    ];

    // Myanmar quantity patterns
    const myanmarQuantityPatterns = [
      /အရေအတွက်.*?(\d+)/,
      /အလုံး.*?(\d+)/,
      /(\d+)\s*ခု/,
      /(\d+)\s*လုံး/,
      /quantity.*?(\d+)/i
    ];

    // Myanmar total patterns
    const myanmarTotalPatterns = [
      /စုစုပေါင်း.*?(\d+)\s*ကျပ်/,
      /စုစု.*?(\d+)\s*ကျပ်/,
      /total.*?(\d+)/i
    ];

    // Extract price
    for (const pattern of myanmarPricePatterns) {
      const match = text.match(pattern);
      if (match) {
        parsedData.price = match[1];
        break;
      }
    }

    // Extract quantity
    for (const pattern of myanmarQuantityPatterns) {
      const match = text.match(pattern);
      if (match) {
        parsedData.quantity = match[1];
        break;
      }
    }

    // Extract total
    for (const pattern of myanmarTotalPatterns) {
      const match = text.match(pattern);
      if (match) {
        parsedData.total = match[1];
        break;
      }
    }

    return parsedData;
  }

  // Complete OCR workflow
  static async processWithCamera(options = {}) {
    try {
      const imageResult = await this.takePhoto(options);
      if (!imageResult) return null;

      const ocrResult = await this.processImage(imageResult.uri, options);
      return ocrResult;
    } catch (error) {
      console.error('Error in camera OCR workflow:', error);
      return null;
    }
  }

  static async processWithGallery(options = {}) {
    try {
      const imageResult = await this.selectFromGallery(options);
      if (!imageResult) return null;

      const ocrResult = await this.processImage(imageResult.uri, options);
      return ocrResult;
    } catch (error) {
      console.error('Error in gallery OCR workflow:', error);
      return null;
    }
  }

  // Validate parsed data
  static validateParsedData(data) {
    if (!data) return false;

    const hasName = data.name && data.name.trim().length > 0;
    const hasPrice = data.price && !isNaN(parseFloat(data.price));
    const hasQuantity = data.quantity && !isNaN(parseFloat(data.quantity));

    return hasName && (hasPrice || hasQuantity);
  }

  // Format currency based on locale
  static formatCurrency(amount, locale = 'en-US', currency = 'USD') {
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency
      }).format(parseFloat(amount) || 0);
    } catch (error) {
      return `$${parseFloat(amount) || 0}`;
    }
  }
}

export default OCRService;