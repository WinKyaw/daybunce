import(/* removed */) from './DataService';

const SUPPORTED_LANGUAGES = {
  en: 'English',
  my: 'Myanmar',
  es: 'Español',
  fr: 'Français',
  zh: '中文',
  hi: 'हिन्दी',
  ar: 'العربية'
};

const DEFAULT_TRANSLATIONS = {
  en: {
    // App Navigation
    appTitle: 'Inventory Management',
    home: 'Home',
    settings: 'Settings',
    reports: 'Reports',
    
    // Search and Filters
    searchPlaceholder: 'Search items...',
    filterByCategory: 'Filter by Category',
    sortBy: 'Sort By',
    all: 'All',
    sortByName: 'Name',
    sortByPrice: 'Price',
    sortByAmount: 'Total Amount',
    sortByDate: 'Date',
    
    // Item Management
    addItem: 'Add Item',
    editItem: 'Edit Item',
    deleteItem: 'Delete Item',
    itemName: 'Item Name',
    price: 'Price',
    unitsSold: 'Units Sold',
    totalAmount: 'Total Amount',
    category: 'Category',
    unitType: 'Unit Type',
    
    // Actions
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    confirm: 'Confirm',
    
    // OCR
    scanWithOCR: 'Scan with OCR',
    takePhoto: 'Take Photo',
    selectFromGallery: 'Select from Gallery',
    processing: 'Processing...',
    
    // Date and Time
    today: 'Today',
    yesterday: 'Yesterday',
    selectDate: 'Select Date',
    dailyTotal: 'Daily Total',
    
    // Messages
    noItems: 'No items for this date',
    noItemsFound: 'No items found',
    itemAdded: 'Item added successfully',
    itemUpdated: 'Item updated successfully',
    itemDeleted: 'Item deleted successfully',
    
    // Errors
    error: 'Error',
    warning: 'Warning',
    success: 'Success',
    fillAllFields: 'Please fill all required fields',
    invalidPrice: 'Please enter a valid price',
    invalidQuantity: 'Please enter a valid quantity',
    cameraPermissionRequired: 'Camera permission is required',
    
    // Units
    pieces: 'pieces',
    lb: 'lb',
    oz: 'oz',
    kg: 'kg',
    g: 'g',
    liters: 'liters',
    ml: 'ml',
    
    // Categories
    food: 'Food',
    beverages: 'Beverages',
    electronics: 'Electronics',
    clothing: 'Clothing',
    books: 'Books',
    health: 'Health',
    beauty: 'Beauty',
    sports: 'Sports',
    home: 'Home',
    other: 'Other'
  },
  
  my: {
    // App Navigation
    appTitle: 'ကုန်ပစ္စည်းစီမံခန့်ခွဲမှု',
    home: 'မူလစာမျက်နှာ',
    settings: 'ဆက်တင်များ',
    reports: 'အစီရင်ခံစာများ',
    
    // Search and Filters
    searchPlaceholder: 'ကုန်ပစ္စည်းများ ရှာဖွေပါ...',
    filterByCategory: 'အမျိုးအစားအလိုက် စစ်ထုတ်ပါ',
    sortBy: 'အစီအစဥ်',
    all: 'အားလုံး',
    sortByName: 'အမည်',
    sortByPrice: 'စျေးနှုန်း',
    sortByAmount: 'စုစုပေါင်းငွေ',
    sortByDate: 'ရက်စွဲ',
    
    // Item Management
    addItem: 'ကုန်ပစ္စည်း ထည့်ပါ',
    editItem: 'ကုန်ပစ္စည်း ပြင်ဆင်ပါ',
    deleteItem: 'ကုန်ပစ္စည်း ဖျက်ပါ',
    itemName: 'ကုန်ပစ္စည်းအမည်',
    price: 'စျေးနှုန်း',
    unitsSold: 'ရောင်းချခဲ့သောအရေအတွက်',
    totalAmount: 'စုစုပေါင်းငွေ',
    category: 'အမျိုးအစား',
    unitType: 'ယူနစ်အမျိုးအစား',
    
    // Actions
    save: 'သိမ်းဆည်းပါ',
    cancel: 'ပယ်ဖျက်ပါ',
    delete: 'ဖျက်ပါ',
    edit: 'ပြင်ဆင်ပါ',
    confirm: 'အတည်ပြုပါ',
    
    // OCR
    scanWithOCR: 'OCR ဖြင့် စကင်န်ပါ',
    takePhoto: 'ဓာတ်ပုံရိုက်ပါ',
    selectFromGallery: 'ပုံများမှ ရွေးပါ',
    processing: 'လုပ်ဆောင်နေသည်...',
    
    // Date and Time
    today: 'ယနေ့',
    yesterday: 'မနေ့က',
    selectDate: 'ရက်စွဲရွေးပါ',
    dailyTotal: 'နေ့စဥ်စုစုပေါင်း',
    
    // Messages
    noItems: 'ဤရက်စွဲအတွက် ကုန်ပစ္စည်းများမရှိပါ',
    noItemsFound: 'ကုန်ပစ္စည်းများ မတွေ့ရှိပါ',
    itemAdded: 'ကုန်ပစ္စည်း အောင်မြင်စွာ ထည့်ခဲ့သည်',
    itemUpdated: 'ကုန်ပစ္စည်း အောင်မြင်စွာ ပြင်ဆင်ခဲ့သည်',
    itemDeleted: 'ကုန်ပစ္စည်း အောင်မြင်စွာ ဖျက်ခဲ့သည်',
    
    // Errors
    error: 'အမှား',
    warning: 'သတိပေးချက်',
    success: 'အောင်မြင်သည်',
    fillAllFields: 'လိုအပ်သောနေရာများ အားလုံးကို ဖြည့်ပါ',
    invalidPrice: 'မှန်ကန်သောစျေးနှုန်း ထည့်ပါ',
    invalidQuantity: 'မှန်ကန်သောအရေအတွက် ထည့်ပါ',
    cameraPermissionRequired: 'ကင်မရာ ခွင့်ပြုချက် လိုအပ်သည်',
    
    // Units
    pieces: 'လုံး',
    lb: 'ပေါင်',
    oz: 'အောင်စ်',
    kg: 'ကီလိုဂရမ်',
    g: 'ဂရမ်',
    liters: 'လီတာ',
    ml: 'မီလီလီတာ',
    
    // Categories
    food: 'အစားအသောက်',
    beverages: 'ယမကာများ',
    electronics: 'အီလက်ထရွန်နစ်',
    clothing: 'အဝတ်အထည်',
    books: 'စာအုပ်များ',
    health: 'ကျန်းမာရေး',
    beauty: 'လှပမှု',
    sports: 'အားကစား',
    home: 'အိမ်',
    other: 'အခြား'
  }
};

class LanguageService {
  static currentLanguage = 'en';
  static translations = DEFAULT_TRANSLATIONS;
  
  // Initialize language service
  static async initialize() {
    try {
      const { default: DataService } = await import('./DataService');
      const savedLanguage = await DataService.getLanguageConfig();
      if (savedLanguage && savedLanguage.currentLanguage) {
        this.currentLanguage = savedLanguage.currentLanguage;
      }
      
      if (savedLanguage && savedLanguage.customTranslations) {
        this.translations = {
          ...DEFAULT_TRANSLATIONS,
          ...savedLanguage.customTranslations
        };
      }
    } catch (error) {
      console.error('Error initializing language service:', error);
    }
  }
  
  // Get current language
  static getCurrentLanguage() {
    return this.currentLanguage;
  }
  
  // Set current language
  static async setCurrentLanguage(languageCode) {
    const SUPPORTED_LANGUAGES = {
      en: 'English', my: 'Myanmar', es: 'Español', fr: 'Français', zh: '中文', hi: 'हिन्दी', ar: 'العربية'
    };
    if (!SUPPORTED_LANGUAGES[languageCode]) {
      throw new Error(`Unsupported language: ${languageCode}`);
    }
    
    this.currentLanguage = languageCode;
    await this.saveLanguageConfig();
  }
  
  // Get translated text
  static t(key, defaultValue = '') {
    const languageTranslations = this.translations[this.currentLanguage] || this.translations.en;
    return languageTranslations[key] || defaultValue || key;
  }
  
  // Get all supported languages
  static getSupportedLanguages() {
    return SUPPORTED_LANGUAGES;
  }
  
  // Get current language translations
  static getCurrentTranslations() {
    return this.translations[this.currentLanguage] || this.translations.en;
  }
  
  // Update custom translation
  static async updateTranslation(key, value, languageCode = null) {
    const targetLanguage = languageCode || this.currentLanguage;
    
    if (!this.translations[targetLanguage]) {
      this.translations[targetLanguage] = {};
    }
    
    this.translations[targetLanguage][key] = value;
    await this.saveLanguageConfig();
  }
  
  // Update multiple translations
  static async updateTranslations(translations, languageCode = null) {
    const targetLanguage = languageCode || this.currentLanguage;
    
    if (!this.translations[targetLanguage]) {
      this.translations[targetLanguage] = {};
    }
    
    this.translations[targetLanguage] = {
      ...this.translations[targetLanguage],
      ...translations
    };
    
    await this.saveLanguageConfig();
  }
  
  // Reset translations to default
  static async resetToDefault(languageCode = null) {
    const targetLanguage = languageCode || this.currentLanguage;
    
    if (DEFAULT_TRANSLATIONS[targetLanguage]) {
      this.translations[targetLanguage] = { ...DEFAULT_TRANSLATIONS[targetLanguage] };
      await this.saveLanguageConfig();
    }
  }
  
  // Export current language configuration
  static exportLanguageConfig() {
    return {
      currentLanguage: this.currentLanguage,
      translations: this.translations,
      supportedLanguages: SUPPORTED_LANGUAGES
    };
  }
  
  // Import language configuration
  static async importLanguageConfig(config) {
    try {
      if (config.currentLanguage && SUPPORTED_LANGUAGES[config.currentLanguage]) {
        this.currentLanguage = config.currentLanguage;
      }
      
      if (config.translations) {
        this.translations = {
          ...DEFAULT_TRANSLATIONS,
          ...config.translations
        };
      }
      
      await this.saveLanguageConfig();
      return true;
    } catch (error) {
      console.error('Error importing language config:', error);
      return false;
    }
  }
  
  // Save language configuration to storage
  static async saveLanguageConfig() {
    try {
      const { default: DataService } = await import('./DataService');
      const config = {
        currentLanguage: this.currentLanguage,
        customTranslations: this.translations
      };
      
      await DataService.saveLanguageConfig(config);
    } catch (error) {
      console.error('Error saving language config:', error);
    }
  }
  
  // Get language name
  static getLanguageName(languageCode) {
    return SUPPORTED_LANGUAGES[languageCode] || languageCode;
  }
  
  // Check if language is RTL (Right-to-Left)
  static isRTL(languageCode = null) {
    const targetLanguage = languageCode || this.currentLanguage;
    const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
    return rtlLanguages.includes(targetLanguage);
  }
  
  // Get number formatting based on locale
  static formatNumber(number, languageCode = null) {
    const targetLanguage = languageCode || this.currentLanguage;
    const localeMap = {
      en: 'en-US',
      my: 'my-MM',
      es: 'es-ES',
      fr: 'fr-FR',
      zh: 'zh-CN',
      hi: 'hi-IN',
      ar: 'ar-SA'
    };
    
    const locale = localeMap[targetLanguage] || 'en-US';
    
    try {
      return new Intl.NumberFormat(locale).format(number);
    } catch (error) {
      return number.toString();
    }
  }
  
  // Get currency formatting based on locale
  static formatCurrency(amount, languageCode = null) {
    const targetLanguage = languageCode || this.currentLanguage;
    const currencyMap = {
      en: { locale: 'en-US', currency: 'USD' },
      my: { locale: 'my-MM', currency: 'MMK' },
      es: { locale: 'es-ES', currency: 'EUR' },
      fr: { locale: 'fr-FR', currency: 'EUR' },
      zh: { locale: 'zh-CN', currency: 'CNY' },
      hi: { locale: 'hi-IN', currency: 'INR' },
      ar: { locale: 'ar-SA', currency: 'SAR' }
    };
    
    const config = currencyMap[targetLanguage] || currencyMap.en;
    
    try {
      return new Intl.NumberFormat(config.locale, {
        style: 'currency',
        currency: config.currency
      }).format(amount);
    } catch (error) {
      return `${amount}`;
    }
  }
  
  // Get date formatting based on locale
  static formatDate(date, languageCode = null) {
    const targetLanguage = languageCode || this.currentLanguage;
    const localeMap = {
      en: 'en-US',
      my: 'my-MM',
      es: 'es-ES',
      fr: 'fr-FR',
      zh: 'zh-CN',
      hi: 'hi-IN',
      ar: 'ar-SA'
    };
    
    const locale = localeMap[targetLanguage] || 'en-US';
    
    try {
      return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    } catch (error) {
      return date.toDateString();
    }
  }
  
  // Validate translation key
  static isValidTranslationKey(key) {
    const defaultKeys = Object.keys(DEFAULT_TRANSLATIONS.en);
    return defaultKeys.includes(key);
  }
  
  // Get missing translations for a language
  static getMissingTranslations(languageCode) {
    const defaultKeys = Object.keys(DEFAULT_TRANSLATIONS.en);
    const languageKeys = Object.keys(this.translations[languageCode] || {});
    
    return defaultKeys.filter(key => !languageKeys.includes(key));
  }
  
  // Get translation completion percentage
  static getTranslationCompletionPercentage(languageCode) {
    const defaultKeys = Object.keys(DEFAULT_TRANSLATIONS.en);
    const languageKeys = Object.keys(this.translations[languageCode] || {});
    
    if (defaultKeys.length === 0) return 100;
    
    const completedCount = languageKeys.filter(key => 
      defaultKeys.includes(key) && this.translations[languageCode][key]
    ).length;
    
    return Math.round((completedCount / defaultKeys.length) * 100);
  }
}

export default LanguageService;