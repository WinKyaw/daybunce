// OCRService stub - Camera and image picker functionality has been removed
// This service is kept as a minimal stub for backward compatibility

class OCRService {
  constructor() {
    this.supportedLanguages = ['en', 'my']; // English and Myanmar
  }

  // Disabled - Camera functionality removed
  static async requestCameraPermission() {
    console.warn('OCRService: Camera functionality has been removed');
    return false;
  }

  // Disabled - Media library functionality removed
  static async requestMediaLibraryPermission() {
    console.warn('OCRService: Media library functionality has been removed');
    return false;
  }

  // Disabled - Camera functionality removed
  static async takePhoto(options = {}) {
    console.warn('OCRService: Camera functionality has been removed');
    return null;
  }

  // Disabled - Gallery functionality removed
  static async selectFromGallery(options = {}) {
    console.warn('OCRService: Gallery functionality has been removed');
    return null;
  }

  // Disabled - OCR functionality removed
  static async processImage(imageUri, options = {}) {
    console.warn('OCRService: OCR functionality has been removed');
    return null;
  }

  // Disabled - Camera workflow removed
  static async processWithCamera(options = {}) {
    console.warn('OCRService: Camera functionality has been removed');
    return null;
  }

  // Disabled - Gallery workflow removed
  static async processWithGallery(options = {}) {
    console.warn('OCRService: Gallery functionality has been removed');
    return null;
  }

  // Validate parsed data (kept for compatibility)
  static validateParsedData(data) {
    if (!data) return false;

    const hasName = data.name && data.name.trim().length > 0;
    const hasPrice = data.price && !isNaN(parseFloat(data.price));
    const hasQuantity = data.quantity && !isNaN(parseFloat(data.quantity));

    return hasName && (hasPrice || hasQuantity);
  }

  // Format currency based on locale (kept for compatibility)
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