# Inventory Management App

A comprehensive React Native inventory management application with OCR support for Myanmar fonts, multi-language support, and local data storage.

## Features

### Core Features
- ✅ Daily inventory tracking with date navigation
- ✅ Add, edit, and delete inventory items
- ✅ Search and filter items by category
- ✅ Sort items by name, price, or total amount
- ✅ Expandable item details view
- ✅ Real-time daily total calculation
- ✅ Persistent bottom navigation bar

### Advanced Features
- 🔍 **OCR Support**: Scan receipts and items with Myanmar font support
- 🌍 **Multi-language**: Dynamic labels with built-in English and Myanmar translations
- 📱 **100% Local Storage**: All data stored locally using AsyncStorage
- 🗄️ **Data Management**: Automatic cleanup of data older than 30 days
- 📊 **Category Management**: Customizable item categories
- ⚡ **Unit Types**: Support for various measurement units (lb, oz, kg, g, pieces, liters, ml)

## Installation

### Prerequisites
- Node.js (v14 or later)
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development)

### Setup
1. Clone the repository
```bash
git clone <repository-url>
cd inventory-management-app
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Start the development server
```bash
npm start
# or
yarn start
```

4. Run on device/simulator
```bash
# Android
npm run android

# iOS
npm run ios

# Web
npm run web
```

## Project Structure

```
inventory-management-app/
├── src/
│   ├── components/
│   │   ├── InventoryApp.js          # Main app component
│   │   └── LoadingScreen.js         # Loading component
│   ├── services/
│   │   ├── DataService.js           # Local storage management
│   │   ├── LanguageService.js       # Multi-language support
│   │   ├── OCRService.js            # OCR processing
│   │   └── LocalStorage.js          # Storage utilities
│   └── styles/
│       └── styles.js                # Shared styles
├── assets/                          # Images, fonts, icons
├── App.js                           # App entry point
├── app.json                         # Expo configuration
├── package.json                     # Dependencies
├── babel.config.js                  # Babel configuration
├── metro.config.js                  # Metro bundler config
└── README.md                        # This file
```

## Usage Guide

### Adding Items
1. Tap the "+" button to open the add item modal
2. Fill in item details:
   - **Item Name**: Product name
   - **Price**: Unit price
   - **Units Sold**: Quantity sold
   - **Category**: Select from available categories
   - **Unit Type**: Choose measurement unit
3. Optionally use OCR by tapping "Scan with OCR"
4. Save the item

### OCR Scanning
1. Tap "Scan with OCR" in the add item modal
2. Choose between:
   - **Take Photo**: Use camera to capture receipt/item
   - **Select from Gallery**: Choose existing image
3. The app will process the image and extract:
   - Item name
   - Price information
   - Quantity details
4. Review and adjust the extracted data before saving

### Navigation
- **Date Selection**: Tap the calendar icon to view different dates
- **Search**: Use the search bar to find specific items
- **Filter**: Filter items by category
- **Sort**: Sort items by name, price, or total amount

### Data Management
- Data is automatically stored locally on your device
- Items older than 30 days are automatically cleaned up
- Each day maintains its own inventory list
- Daily totals are calculated in real-time

## Language Support

### Supported Languages
- **English** (en)
- **Myanmar** (my)
- **Spanish** (es) - Extensible
- **French** (fr) - Extensible
- **Chinese** (zh) - Extensible
- **Hindi** (hi) - Extensible
- **Arabic** (ar) - Extensible

### Adding New Languages
1. Open `src/services/LanguageService.js`
2. Add your language code to `SUPPORTED_LANGUAGES`
3. Add translations to `DEFAULT_TRANSLATIONS`
4. The app will automatically support the new language

### Customizing Labels
Use the LanguageService to update any label:
```javascript
import LanguageService from './src/services/LanguageService';

// Update a single translation
await LanguageService.updateTranslation('appTitle', 'My Inventory App');

// Update multiple translations
await LanguageService.updateTranslations({
  'addItem': 'Add New Item',
  'save': 'Save Item'
});
```

## OCR Configuration

### Myanmar Font Support
The app includes built-in support for Myanmar script OCR. To integrate with a real OCR service:

1. **Google Cloud Vision API**:
```javascript
// In OCRService.js, replace mockOCRProcessing with:
const response = await fetch('https://vision.googleapis.com/v1/images:annotate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${your_api_key}`
  },
  body: JSON.stringify({
    requests: [{
      image: { content: base64Image },
      features: [{ type: 'TEXT_DETECTION' }],
      imageContext: {
        languageHints: ['my', 'en'] // Myanmar and English
      }
    }]
  })
});
```

2. **Azure Computer Vision**:
```javascript
const response = await fetch(`${endpoint}/vision/v3.2/ocr`, {
  method: 'POST',
  headers: {
    'Ocp-Apim-Subscription-Key': your_subscription_key,
    'Content-Type': 'application/octet-stream'
  },
  body: imageBuffer
});
```

## Data Storage

### Storage Structure
```json
{
  "inventory_2024-01-15": [
    {
      "id": "1642234567890",
      "name": "Fresh Apples",
      "price": "2.50",
      "unitsSold": "10",
      "category": "Food",
      "unitType": "lb",
      "totalAmount": "25.00",
      "timestamp": "2024-01-15T10:30:00.000Z"
    }
  ],
  "language_config": {
    "currentLanguage": "en",
    "customTranslations": {...}
  },
  "categories": ["Food", "Beverages", "Electronics"],
  "unit_types": ["lb", "oz", "kg", "g", "pieces"]
}
```

### Data Management API
```javascript
import DataService from './src/services/DataService';

// Get items for a date
const items = await DataService.getItemsByDate(new Date());

// Save items for a date
await DataService.saveItemsByDate(new Date(), items);

// Export all data
const exportData = await DataService.exportData();

// Import data
await DataService.importData(importData);

// Get sales statistics
const stats = await DataService.getSalesStatistics(30); // Last 30 days
```

## Customization

### Adding New Categories
```javascript
import DataService from './src/services/DataService';

const newCategories = ['Food', 'Beverages', 'Electronics', 'Books', 'Clothing'];
await DataService.saveCategories(newCategories);
```

### Adding New Unit Types
```javascript
const newUnits = ['lb', 'oz', 'kg', 'g', 'pieces', 'liters', 'ml', 'dozen'];
await DataService.saveUnitTypes(newUnits);
```

### Styling
The app uses a consistent design system. Main colors:
- Primary: `#2196f3` (Blue)
- Success: `#4caf50` (Green)
- Warning: `#ff9800` (Orange)
- Error: `#f44336` (Red)
- Background: `#f5f5f5` (Light Gray)
- Text: `#333333` (Dark Gray)

## API Reference

### DataService
```javascript
// Get items by date
DataService.getItemsByDate(date)

// Save items by date
DataService.saveItemsByDate(date, items)

// Clean old data
DataService.cleanOldData()

// Get sales statistics
DataService.getSalesStatistics(days)

// Export/Import data
DataService.exportData()
DataService.importData(data)
```

### LanguageService
```javascript
// Get translated text
LanguageService.t(key, defaultValue)

// Set language
LanguageService.setCurrentLanguage(languageCode)

// Update translations
LanguageService.updateTranslation(key, value)
LanguageService.updateTranslations(translations)

// Format numbers/currency/dates
LanguageService.formatNumber(number)
LanguageService.formatCurrency(amount)
LanguageService.formatDate(date)
```

### OCRService
```javascript
// Process with camera
OCRService.processWithCamera(options)

// Process with gallery
OCRService.processWithGallery(options)

// Process image
OCRService.processImage(imageUri, options)
```

## Development

### Adding New Features
1. Create components in `src/components/`
2. Add services in `src/services/`
3. Update language files for new text
4. Add tests for new functionality

### Testing
```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

### Building for Production
```bash
# Build for Android
expo build:android

# Build for iOS
expo build:ios

# Create standalone app
expo build:web
```

## Troubleshooting

### Common Issues

#### Camera Permission Denied
- **Android**: Check that camera permissions are granted in Settings
- **iOS**: Ensure camera usage description is in Info.plist

#### OCR Not Working
1. Verify image quality and lighting
2. Check if text is clearly visible
3. Ensure Myanmar font rendering is correct
4. Test with English text first

#### Data Not Persisting
1. Check AsyncStorage permissions
2. Verify data format is correct JSON
3. Check device storage space
4. Clear app cache and restart

#### Language Not Switching
1. Verify language code exists in SUPPORTED_LANGUAGES
2. Check if translations are properly loaded
3. Restart the app after language change

### Debug Mode
Enable debug logging by setting:
```javascript
// In App.js
console.disableYellowBox = false; // Show warnings
```

## Performance Optimization

### Best Practices
- Use FlatList for large item lists
- Implement image caching for OCR
- Lazy load language translations
- Optimize AsyncStorage operations
- Use React.memo for expensive components

### Memory Management
- Clear unused images from memory
- Limit OCR image resolution
- Implement data pagination for large datasets
- Use compression for stored images

## Security Considerations

### Data Protection
- All data stored locally (no cloud storage)
- No personal data transmitted
- Camera permissions requested only when needed
- Images processed locally only

### Privacy Features
- No analytics or tracking
- No internet connection required
- User data never leaves device
- Optional data export only

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Update documentation
5. Submit a pull request

### Code Style
- Use ESLint configuration
- Follow React Native best practices
- Add JSDoc comments for functions
- Use TypeScript for type safety (optional)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
1. Check the troubleshooting section
2. Review the API reference
3. Create an issue in the repository
4. Contact the development team

## Roadmap

### Upcoming Features
- [ ] Data synchronization across devices
- [ ] Advanced reporting and analytics
- [ ] Barcode scanning support
- [ ] Inventory alerts and notifications
- [ ] Multi-store management
- [ ] Advanced OCR with AI improvements
- [ ] Voice input support
- [ ] Offline maps for delivery tracking

### Long-term Goals
- [ ] Web dashboard companion
- [ ] API integration capabilities
- [ ] Advanced analytics and ML insights
- [ ] Multi-user support
- [ ] Cloud backup options (optional)

---

**Made with ❤️ for inventory management efficiency**