import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  SafeAreaView,
  StatusBar,
  Share,
  Linking,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { PanResponder, Animated, Dimensions } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

// Language Configuration
const defaultLanguage = {
  appTitle: 'Inventory Management',
  searchPlaceholder: 'Search items...',
  filterByCategory: 'Filter by Category',
  sortBy: 'Sort By',
  addItem: 'Add Item',
  itemName: 'Item Name',
  price: 'Price',
  unitsSold: 'Units Sold',
  totalAmount: 'Total Amount',
  category: 'Category',
  unitType: 'Unit Type',
  save: 'Save',
  cancel: 'Cancel',
  dailyTotal: 'Daily Total',
  noItems: 'No items for this date',
  scanWithOCR: 'Scan with OCR',
  takePhoto: 'Take Photo',
  selectFromGallery: 'Select from Gallery',
  all: 'All',
  sortByName: 'Name',
  sortByPrice: 'Price',
  sortByAmount: 'Total Amount',
  filters: 'Filters',
  sort: 'Sort',
  selectCategory: 'Select Category',
  selectSortOption: 'Select Sort Option',
  selectUnitType: 'Select Unit Type',
  customItem: 'Create Custom Item',
  predefinedItems: 'Select Predefined Item',
  selectItemType: 'Select Item Type',
  dailySummary: 'Daily Sales Summary',
  shareViaEmail: 'Share via Email',
  shareViaText: 'Share via Text',
  close: 'Close',
};

const availableLanguages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'my', name: 'မြန်မာ', flag: '🇲🇲' },
];

// Extended language configurations
const languageConfigs = {
  en: {
    appTitle: 'Inventory Management',
    searchPlaceholder: 'Search items...',
    filterByCategory: 'Filter by Category',
    sortBy: 'Sort By',
    addItem: 'Add Item',
    itemName: 'Item Name',
    price: 'Price',
    unitsSold: 'Units Sold',
    totalAmount: 'Total Amount',
    category: 'Category',
    unitType: 'Unit Type',
    save: 'Save',
    cancel: 'Cancel',
    dailyTotal: 'Daily Total',
    noItems: 'No items for this date',
    scanWithOCR: 'Scan with OCR',
    takePhoto: 'Take Photo',
    selectFromGallery: 'Select from Gallery',
    all: 'All',
    sortByName: 'Name',
    sortByPrice: 'Price',
    sortByAmount: 'Total Amount',
    filters: 'Filters',
    sort: 'Sort',
    selectCategory: 'Select Category',
    selectSortOption: 'Select Sort Option',
    selectUnitType: 'Select Unit Type',
    customItem: 'Create Custom Item',
    predefinedItems: 'Select Predefined Item',
    selectItemType: 'Select Item Type',
    dailySummary: 'Daily Sales Summary',
    shareViaEmail: 'Share via Email',
    shareViaText: 'Share via Text',
    close: 'Close',
    settings: 'Settings',
    language: 'Language',
    appTitleSetting: 'App Title',
    profile: 'Profile',
  },
  es: {
    appTitle: 'Gestión de Inventario',
    searchPlaceholder: 'Buscar artículos...',
    filterByCategory: 'Filtrar por Categoría',
    sortBy: 'Ordenar por',
    addItem: 'Agregar Artículo',
    itemName: 'Nombre del Artículo',
    price: 'Precio',
    unitsSold: 'Unidades Vendidas',
    totalAmount: 'Cantidad Total',
    category: 'Categoría',
    unitType: 'Tipo de Unidad',
    save: 'Guardar',
    cancel: 'Cancelar',
    dailyTotal: 'Total Diario',
    noItems: 'No hay artículos para esta fecha',
    scanWithOCR: 'Escanear con OCR',
    takePhoto: 'Tomar Foto',
    selectFromGallery: 'Seleccionar de Galería',
    all: 'Todos',
    sortByName: 'Nombre',
    sortByPrice: 'Precio',
    sortByAmount: 'Cantidad Total',
    filters: 'Filtros',
    sort: 'Ordenar',
    selectCategory: 'Seleccionar Categoría',
    selectSortOption: 'Seleccionar Opción de Orden',
    selectUnitType: 'Seleccionar Tipo de Unidad',
    customItem: 'Crear Artículo Personalizado',
    predefinedItems: 'Seleccionar Artículo Predefinido',
    selectItemType: 'Seleccionar Tipo de Artículo',
    dailySummary: 'Resumen de Ventas Diarias',
    shareViaEmail: 'Compartir por Email',
    shareViaText: 'Compartir por Texto',
    close: 'Cerrar',
    settings: 'Configuración',
    language: 'Idioma',
    appTitleSetting: 'Título de la App',
    profile: 'Perfil',
  },
  fr: {
    appTitle: 'Gestion d\'Inventaire',
    searchPlaceholder: 'Rechercher des articles...',
    filterByCategory: 'Filtrer par Catégorie',
    sortBy: 'Trier par',
    addItem: 'Ajouter un Article',
    itemName: 'Nom de l\'Article',
    price: 'Prix',
    unitsSold: 'Unités Vendues',
    totalAmount: 'Montant Total',
    category: 'Catégorie',
    unitType: 'Type d\'Unité',
    save: 'Sauvegarder',
    cancel: 'Annuler',
    dailyTotal: 'Total Quotidien',
    noItems: 'Aucun article pour cette date',
    scanWithOCR: 'Scanner avec OCR',
    takePhoto: 'Prendre une Photo',
    selectFromGallery: 'Sélectionner de la Galerie',
    all: 'Tous',
    sortByName: 'Nom',
    sortByPrice: 'Prix',
    sortByAmount: 'Montant Total',
    filters: 'Filtres',
    sort: 'Trier',
    selectCategory: 'Sélectionner une Catégorie',
    selectSortOption: 'Sélectionner l\'Option de Tri',
    selectUnitType: 'Sélectionner le Type d\'Unité',
    customItem: 'Créer un Article Personnalisé',
    predefinedItems: 'Sélectionner un Article Prédéfini',
    selectItemType: 'Sélectionner le Type d\'Article',
    dailySummary: 'Résumé des Ventes Quotidiennes',
    shareViaEmail: 'Partager par Email',
    shareViaText: 'Partager par Texte',
    close: 'Fermer',
    settings: 'Paramètres',
    language: 'Langue',
    appTitleSetting: 'Titre de l\'App',
    profile: 'Profil',
  },
  de: {
    appTitle: 'Inventarverwaltung',
    searchPlaceholder: 'Artikel suchen...',
    filterByCategory: 'Nach Kategorie filtern',
    sortBy: 'Sortieren nach',
    addItem: 'Artikel hinzufügen',
    itemName: 'Artikelname',
    price: 'Preis',
    unitsSold: 'Verkaufte Einheiten',
    totalAmount: 'Gesamtbetrag',
    category: 'Kategorie',
    unitType: 'Einheitentyp',
    save: 'Speichern',
    cancel: 'Abbrechen',
    dailyTotal: 'Tagesgesamt',
    noItems: 'Keine Artikel für dieses Datum',
    scanWithOCR: 'Mit OCR scannen',
    takePhoto: 'Foto aufnehmen',
    selectFromGallery: 'Aus Galerie auswählen',
    all: 'Alle',
    sortByName: 'Name',
    sortByPrice: 'Preis',
    sortByAmount: 'Gesamtbetrag',
    filters: 'Filter',
    sort: 'Sortieren',
    selectCategory: 'Kategorie auswählen',
    selectSortOption: 'Sortieroption auswählen',
    selectUnitType: 'Einheitentyp auswählen',
    customItem: 'Benutzerdefinierten Artikel erstellen',
    predefinedItems: 'Vordefinierten Artikel auswählen',
    selectItemType: 'Artikeltyp auswählen',
    dailySummary: 'Tägliche Verkaufszusammenfassung',
    shareViaEmail: 'Per E-Mail teilen',
    shareViaText: 'Per Text teilen',
    close: 'Schließen',
    settings: 'Einstellungen',
    language: 'Sprache',
    appTitleSetting: 'App-Titel',
    profile: 'Profil',
  },
   my: {
    appTitle: 'ပစ္စည်းစာရင်းစီမံခန့်ခွဲမှု',
    searchPlaceholder: 'ပစ္စည်းများရှာပါ...',
    filterByCategory: 'အမျိုးအစားအလိုက်စစ်ထုတ်ပါ',
    sortBy: 'အစီအစဉ်',
    addItem: 'ပစ္စည်းထည့်ပါ',
    itemName: 'ပစ္စည်းအမည်',
    price: 'စျေးနှုန်း',
    unitsSold: 'ရောင်းသွားသောယူနစ်',
    totalAmount: 'စုစုပေါင်းပမာဏ',
    category: 'အမျိုးအစား',
    unitType: 'ယူနစ်အမျိုးအစား',
    save: 'သိမ်းပါ',
    cancel: 'ပယ်ဖျက်ပါ',
    dailyTotal: 'နေ့စဉ်စုစုပေါင်း',
    noItems: 'ဤနေ့ရက်အတွက်ပစ္စည်းမရှိပါ',
    scanWithOCR: 'OCR ဖြင့်စကင်န်ပါ',
    takePhoto: 'ဓာတ်ပုံရိုက်ပါ',
    selectFromGallery: 'ပုံတိုက်မှရွေးပါ',
    all: 'အားလုံး',
    sortByName: 'အမည်',
    sortByPrice: 'စျေးနှုန်း',
    sortByAmount: 'စုစုပေါင်းပမာဏ',
    filters: 'စစ်ထုတ်မှုများ',
    sort: 'အစီအစဉ်',
    selectCategory: 'အမျိုးအစားရွေးပါ',
    selectSortOption: 'အစီအစဉ်ရွေးချယ်မှုရွေးပါ',
    selectUnitType: 'ယူနစ်အမျိုးအစားရွေးပါ',
    customItem: 'စိတ်ကြိုက်ပစ္စည်းဖန်တီးပါ',
    predefinedItems: 'ကြိုတင်သတ်မှတ်ထားသောပစ္စည်းရွေးပါ',
    selectItemType: 'ပစ္စည်းအမျိုးအစားရွေးပါ',
    dailySummary: 'နေ့စဉ်ရောင်းချမှုအနှစ်ချုပ်',
    shareViaEmail: 'အီးမေးလ်ဖြင့်မျှဝေပါ',
    shareViaText: 'စာသားဖြင့်မျှဝေပါ',
    close: 'ပိတ်ပါ',
    settings: 'ဆက်တင်များ',
    language: 'ဘာသာစကား',
    appTitleSetting: 'အက်ပ်ခေါင်းစဉ်',
    profile: 'ပရိုဖိုင်',
  },
};

// Default categories and unit types
const defaultCategories = ['Food', 'Beverages', 'Electronics', 'Clothing', 'Other'];
const defaultUnitTypes = ['lb', 'oz', 'kg', 'g', 'pcs', 'liters', 'ml'];

const myanmarCategories = ['အစားအစာ', 'ရေစာ', 'လျှပ်စစ်ပစ္စည်း', 'အဝတ်အထည်', 'အခြား'];
const myanmarUnitTypes = ['ပေါင်', 'အောင်စ', 'ကီလိုဂရမ်', 'ဂရမ်', 'ခု', 'လီတာ', 'မီလီလီတာ'];

// Import predefined items from JSON file
let defaultPredefinedItems = [];
try {
  defaultPredefinedItems = require('./../constants/predefinedItems.json');
  console.log(`Loaded ${defaultPredefinedItems.length} items from predefinedItems.json`);
} catch (error) {
  console.warn('Could not load predefinedItems.json, using fallback data:', error);
  // Fallback data if JSON file is not found
  defaultPredefinedItems = [
    { id: 'apples', name: 'Apples', category: 'Food', unitType: 'lb' },
    { id: 'bananas', name: 'Bananas', category: 'Food', unitType: 'lb' },
    { id: 'milk', name: 'Milk', category: 'Beverages', unitType: 'liters' },
    { id: 'bread', name: 'Bread', category: 'Food', unitType: 'pcs' },
    { id: 'eggs', name: 'Eggs', category: 'Food', unitType: 'pcs' },
    { id: 'chicken', name: 'Chicken Breast', category: 'Food', unitType: 'lb' },
    { id: 'rice', name: 'Rice', category: 'Food', unitType: 'kg' },
    { id: 'water', name: 'Water Bottles', category: 'Beverages', unitType: 'pcs' },
    { id: 'coffee', name: 'Coffee', category: 'Beverages', unitType: 'kg' },
    { id: 'phone', name: 'Smartphone', category: 'Electronics', unitType: 'pcs' },
  ];
}

// CHANGE THIS TO YOUR SERVER'S ADDRESS
const OCR_API_URL = 'http://10.0.0.125:5001/api/ocr/scan';

const InventoryApp = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showUnitTypeModal, setShowUnitTypeModal] = useState(false);
  const [showItemTypeModal, setShowItemTypeModal] = useState(false);
  const [showPredefinedItemsModal, setShowPredefinedItemsModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [expandedItem, setExpandedItem] = useState(null);
  const [language, setLanguage] = useState(defaultLanguage);
  const [categories, setCategories] = useState(defaultCategories);
  const [unitTypes, setUnitTypes] = useState(defaultUnitTypes);
  const [isCustomItem, setIsCustomItem] = useState(true);
  const [predefinedSearchText, setPredefinedSearchText] = useState('');
  const [predefinedFilterCategory, setPredefinedFilterCategory] = useState('All');
  const [predefinedSortBy, setPredefinedSortBy] = useState('name');
  const [modalDebounce, setModalDebounce] = useState(false);
  const [showBulkAddModal, setShowBulkAddModal] = useState(false);
  const [bulkAddText, setBulkAddText] = useState('');
  const [bulkAddCategory, setBulkAddCategory] = useState('Other');
  const [bulkAddUnitType, setBulkAddUnitType] = useState('pcs');
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [swipedItemId, setSwipedItemId] = useState(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [customAppTitle, setCustomAppTitle] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showPredefinedCategoryModal, setShowPredefinedCategoryModal] = useState(false);
  const [showPredefinedUnitTypeModal, setShowPredefinedUnitTypeModal] = useState(false);
  const [showPredefinedSortModal, setShowPredefinedSortModal] = useState(false);
  const [showBulkActionsModal, setShowBulkActionsModal] = useState(false);
  
  // New state for dynamic predefined items
  const [predefinedItems, setPredefinedItems] = useState([]);

  // Add item form state
  const [newItem, setNewItem] = useState({
    name: '',
    price: '',
    unitsSold: '',
    category: defaultCategories[4], // Default to "Other"
    unitType: defaultUnitTypes[4], // Default to "pcs"
  });

  // Calculate total amount in real-time
  const calculateTotal = () => {
    const price = parseFloat(newItem.price) || 0;
    const units = parseFloat(newItem.unitsSold) || 0;
    return (price * units).toFixed(2);
  };

  useEffect(() => {
    const initializeApp = async () => {
      await loadSettings(); // Load settings first
      await loadData();
      await loadLanguageConfig(); // This might be redundant now
      await loadPredefinedItems();
    };
    
    initializeApp();
  }, [selectedDate]);

  useEffect(() => {
    filterAndSortItems();
  }, [items, searchText, filterCategory, sortBy]);

  // Load predefined items from AsyncStorage with JSON file integration
  const loadPredefinedItems = async () => {
    try {
      const savedPredefinedItems = await AsyncStorage.getItem('predefinedItems');
      if (savedPredefinedItems) {
        const saved = JSON.parse(savedPredefinedItems);
        
        // Check if we need to merge with updated JSON file data
        const jsonFileItems = defaultPredefinedItems || [];
        const savedIds = new Set(saved.map(item => item.id));
        
        // Add any new items from JSON file that aren't already saved
        const newItemsFromJson = jsonFileItems.filter(item => !savedIds.has(item.id));
        
        if (newItemsFromJson.length > 0) {
          const mergedItems = [...saved, ...newItemsFromJson];
          setPredefinedItems(mergedItems);
          await savePredefinedItems(mergedItems);
          console.log(`Loaded predefined items from storage and added ${newItemsFromJson.length} new items from JSON file`);
        } else {
          setPredefinedItems(saved);
          console.log('Loaded predefined items from storage');
        }
      } else {
        // Initialize with items from JSON file if no saved data exists
        setPredefinedItems(defaultPredefinedItems);
        await savePredefinedItems(defaultPredefinedItems);
        console.log('Initialized predefined items from JSON file');
      }
    } catch (error) {
      console.error('Error loading predefined items:', error);
      setPredefinedItems(defaultPredefinedItems);
    }
  };

  // Save predefined items to AsyncStorage and optionally export to JSON format
  const savePredefinedItems = async (items) => {
    try {
      await AsyncStorage.setItem('predefinedItems', JSON.stringify(items));
      console.log('Saved predefined items to storage');
      
      // Optional: Log the JSON format for manual file updates
      if (__DEV__) {
        console.log('Current predefined items in JSON format:');
        console.log(JSON.stringify(items, null, 2));
      }
    } catch (error) {
      console.error('Error saving predefined items:', error);
    }
  };

  // Add new item to predefined items list
  const addToPredefinedItems = async (itemData) => {
    try {
      // Check if item already exists (case insensitive)
      const existingItem = predefinedItems.find(
        item => item.name.toLowerCase() === itemData.name.toLowerCase() &&
                item.category === itemData.category &&
                item.unitType === itemData.unitType
      );

      if (!existingItem) {
        const newPredefinedItem = {
          id: `custom_${Date.now()}`,
          name: itemData.name,
          category: itemData.category,
          unitType: itemData.unitType,
        };

        const updatedPredefinedItems = [...predefinedItems, newPredefinedItem];
        setPredefinedItems(updatedPredefinedItems);
        await savePredefinedItems(updatedPredefinedItems);
        console.log('Added new item to predefined items:', newPredefinedItem.name);
      }
    } catch (error) {
      console.error('Error adding to predefined items:', error);
    }
  };

  const loadData = async () => {
    try {
      const dateKey = formatDate(selectedDate);
      const savedData = await AsyncStorage.getItem(`inventory_${dateKey}`);
      if (savedData) {
        setItems(JSON.parse(savedData));
      } else {
        setItems([]);
      }
      cleanOldData();
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadLanguageConfig = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('language_config');
      const savedCategories = await AsyncStorage.getItem('categories');
      const savedUnitTypes = await AsyncStorage.getItem('unit_types');

      if (savedLanguage) {
        setLanguage(JSON.parse(savedLanguage));
      }
      if (savedCategories) {
        setCategories(JSON.parse(savedCategories));
      }
      if (savedUnitTypes) {
        setUnitTypes(JSON.parse(savedUnitTypes));
      }
    } catch (error) {
      console.error('Error loading language config:', error);
    }
  };

  const saveData = async (data) => {
    try {
      const dateKey = formatDate(selectedDate);
      await AsyncStorage.setItem(`inventory_${dateKey}`, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const cleanOldData = async () => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const keys = await AsyncStorage.getAllKeys();
      const inventoryKeys = keys.filter(key => key.startsWith('inventory_'));

      for (const key of inventoryKeys) {
        const dateStr = key.replace('inventory_', '');
        const itemDate = new Date(dateStr);
        if (itemDate < thirtyDaysAgo) {
          await AsyncStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.error('Error cleaning old data:', error);
    }
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const filterAndSortItems = () => {
    let filtered = items.filter(item =>
      item.name.toLowerCase().includes(searchText.toLowerCase()) &&
      (filterCategory === 'All' || item.category === filterCategory)
    );

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return parseFloat(b.price) - parseFloat(a.price);
        case 'amount':
          return (parseFloat(b.price) * parseFloat(b.unitsSold)) - (parseFloat(a.price) * parseFloat(a.unitsSold));
        default:
          return 0;
      }
    });

    setFilteredItems(filtered);
  };

  const openAddModal = () => {
    setShowItemTypeModal(true);
  };

  const handleItemTypeSelection = (isCustom) => {
    setIsCustomItem(isCustom);
    setShowItemTypeModal(false);
    if (isCustom) {
      setShowAddModal(true);
    } else {
      setShowPredefinedItemsModal(true);
    }
  };

  const handlePredefinedItemSelection = (predefinedItem) => {
    setNewItem({
      name: predefinedItem.name,
      price: '',
      unitsSold: '',
      category: predefinedItem.category,
      unitType: predefinedItem.unitType,
    });
    setShowPredefinedItemsModal(false);
    setShowAddModal(true);
  };

  const addItem = async () => {
    if (!newItem.name || !newItem.price || !newItem.unitsSold) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    const item = {
      id: Date.now().toString(),
      ...newItem,
      totalAmount: calculateTotal(),
      timestamp: new Date().toISOString(),
    };

    const updatedItems = [...items, item];
    setItems(updatedItems);
    await saveData(updatedItems);

    // If this was a custom item, add it to predefined items
    if (isCustomItem) {
      await addToPredefinedItems(newItem);
    }

    setNewItem({
      name: '',
      price: '',
      unitsSold: '',
      category: defaultCategories[4],
      unitType: defaultUnitTypes[4],
    });
    setShowAddModal(false);
  };

  const deleteItem = async (itemId) => {
    const updatedItems = items.filter(item => item.id !== itemId);
    setItems(updatedItems);
    await saveData(updatedItems);
  };

  const getDailyTotal = () => {
    return filteredItems.reduce((total, item) =>
      total + (parseFloat(item.price) * parseFloat(item.unitsSold)), 0
    ).toFixed(2);
  };

  const getFilteredPredefinedItems = () => {
    let filtered = predefinedItems.filter(item =>
      item.name.toLowerCase().includes(predefinedSearchText.toLowerCase()) &&
      (predefinedFilterCategory === 'All' || item.category === predefinedFilterCategory)
    );

    filtered.sort((a, b) => {
      switch (predefinedSortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

    return filtered;
  };

  const importFromCSV = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'text/csv',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const fileUri = result.assets[0].uri;
        const csvContent = await FileSystem.readAsStringAsync(fileUri);
        parseCsvAndImport(csvContent);
      }
    } catch (error) {
      Alert.alert('Import Error', 'Could not import CSV file');
      console.error('CSV import error:', error);
    }
  };

  const parseCsvAndImport = (csvContent) => {
    try {
      const lines = csvContent.trim().split('\n');
      const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
      
      const nameIndex = headers.findIndex(h => h.includes('name') || h.includes('item'));
      const categoryIndex = headers.findIndex(h => h.includes('category') || h.includes('type'));
      const unitIndex = headers.findIndex(h => h.includes('unit') || h.includes('measurement'));
      
      if (nameIndex === -1) {
        Alert.alert('Invalid CSV', 'Could not find a "name" or "item" column');
        return;
      }

      const importedItems = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        
        if (values[nameIndex]) {
          importedItems.push({
            id: `csv_import_${Date.now()}_${i}`,
            name: values[nameIndex],
            category: values[categoryIndex] || 'Other',
            unitType: values[unitIndex] || 'pcs'
          });
        }
      }

      if (importedItems.length > 0) {
        Alert.alert(
          'CSV Import',
          `Found ${importedItems.length} items. Import them?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Import', onPress: () => mergePredefinedItems(importedItems) }
          ]
        );
      } else {
        Alert.alert('No Data', 'No valid items found in CSV file');
      }
    } catch (error) {
      Alert.alert('Parse Error', 'Could not parse CSV file. Please check the format.');
      console.error('CSV parse error:', error);
    }
  };

  const downloadCSVTemplate = async () => {
    try {
      const csvTemplate = `name,category,unitType
  Apples,Food,lb
  Bananas,Food,lb
  Milk,Beverages,liters
  Bread,Food,pcs
  Coffee,Beverages,kg`;

      const filename = 'predefined-items-template.csv';
      const fileUri = FileSystem.documentDirectory + filename;
      
      await FileSystem.writeAsStringAsync(fileUri, csvTemplate);
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('Template Ready', `Template saved: ${filename}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Could not create CSV template');
    }
  };

  // Export predefined items to JSON file
  const exportPredefinedItems = async () => {
    try {
      const jsonData = JSON.stringify(predefinedItems, null, 2);
      const filename = `predefined-items-${new Date().toISOString().split('T')[0]}.json`;
      const fileUri = FileSystem.documentDirectory + filename;
      
      await FileSystem.writeAsStringAsync(fileUri, jsonData);
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('Export Complete', `File saved to: ${filename}`);
      }
    } catch (error) {
      Alert.alert('Export Error', 'Could not export predefined items');
      console.error('Export error:', error);
    }
  };

  // Import predefined items from JSON file
  const importPredefinedItems = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const fileUri = result.assets[0].uri;
        const fileContent = await FileSystem.readAsStringAsync(fileUri);
        const importedItems = JSON.parse(fileContent);

        // Validate the imported data structure
        if (Array.isArray(importedItems) && importedItems.every(item => 
          item.name && item.category && item.unitType
        )) {
          // Show confirmation dialog
          Alert.alert(
            'Import Confirmation',
            `Found ${importedItems.length} items. How would you like to import them?`,
            [
              {
                text: 'Cancel',
                style: 'cancel'
              },
              {
                text: 'Replace All',
                onPress: () => replacePredefinedItems(importedItems)
              },
              {
                text: 'Merge (Add New)',
                onPress: () => mergePredefinedItems(importedItems)
              }
            ]
          );
        } else {
          Alert.alert('Invalid File', 'The selected file does not contain valid predefined items data.');
        }
      }
    } catch (error) {
      Alert.alert('Import Error', 'Could not import predefined items. Please check the file format.');
      console.error('Import error:', error);
    }
  };

  // Replace all predefined items
  const replacePredefinedItems = async (newItems) => {
    try {
      // Add unique IDs if missing
      const itemsWithIds = newItems.map((item, index) => ({
        ...item,
        id: item.id || `imported_${Date.now()}_${index}`
      }));
      
      setPredefinedItems(itemsWithIds);
      await savePredefinedItems(itemsWithIds);
      Alert.alert('Success', `Replaced with ${itemsWithIds.length} predefined items`);
    } catch (error) {
      Alert.alert('Error', 'Could not replace predefined items');
    }
  };

  // Merge imported items with existing ones
  const mergePredefinedItems = async (newItems) => {
    try {
      const existingNames = new Set(predefinedItems.map(item => 
        `${item.name.toLowerCase()}_${item.category}_${item.unitType}`
      ));
      
      const uniqueNewItems = newItems.filter(item => 
        !existingNames.has(`${item.name.toLowerCase()}_${item.category}_${item.unitType}`)
      ).map((item, index) => ({
        ...item,
        id: item.id || `imported_${Date.now()}_${index}`
      }));
      
      const mergedItems = [...predefinedItems, ...uniqueNewItems];
      setPredefinedItems(mergedItems);
      await savePredefinedItems(mergedItems);
      
      Alert.alert(
        'Success', 
        `Added ${uniqueNewItems.length} new items (${newItems.length - uniqueNewItems.length} duplicates skipped)`
      );
    } catch (error) {
      Alert.alert('Error', 'Could not merge predefined items');
    }
  };

  const processBulkAdd = () => {
    try {
      const lines = bulkAddText.trim().split('\n').filter(line => line.trim());
      const newItems = [];
      
      lines.forEach((line, index) => {
        const trimmedLine = line.trim();
        if (trimmedLine) {
          const parts = trimmedLine.split(',').map(p => p.trim());
          
          newItems.push({
            id: `bulk_${Date.now()}_${index}`,
            name: parts[0],
            category: parts[1] || bulkAddCategory,
            unitType: parts[2] || bulkAddUnitType
          });
        }
      });
      
      if (newItems.length > 0) {
        Alert.alert(
          'Bulk Add Confirmation',
          `Add ${newItems.length} items to predefined items?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Add Items', onPress: () => addBulkItems(newItems) }
          ]
        );
      } else {
        Alert.alert('No Items', 'Please enter at least one item name');
      }
    } catch (error) {
      Alert.alert('Error', 'Could not process bulk add');
    }
  };

  const addBulkItems = async (newItems) => {
    try {
      const existingNames = new Set(predefinedItems.map(item => item.name.toLowerCase()));
      const uniqueItems = newItems.filter(item => !existingNames.has(item.name.toLowerCase()));
      
      const updatedItems = [...predefinedItems, ...uniqueItems];
      setPredefinedItems(updatedItems);
      await savePredefinedItems(updatedItems);
      
      Alert.alert(
        'Success',
        `Added ${uniqueItems.length} items (${newItems.length - uniqueItems.length} duplicates skipped)`
      );
      
      setBulkAddText('');
      setShowBulkAddModal(false);
    } catch (error) {
      Alert.alert('Error', 'Could not add bulk items');
    }
  };

    const loadSettings = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem('selectedLanguage');
        const savedTitle = await AsyncStorage.getItem('customAppTitle');
        const savedCategories = await AsyncStorage.getItem('categories');
        const savedUnitTypes = await AsyncStorage.getItem('unit_types');
        
        let languageToUse = 'en'; // default
        if (savedLanguage && languageConfigs[savedLanguage]) {
          languageToUse = savedLanguage;
        }
        
        setSelectedLanguage(languageToUse);
        const languageConfig = { ...languageConfigs[languageToUse] };
        
        if (savedTitle && savedTitle.trim()) {
          setCustomAppTitle(savedTitle.trim());
          languageConfig.appTitle = savedTitle.trim();
        } else {
          setCustomAppTitle('');
        }
        
        // Load saved categories and unit types
        if (savedCategories) {
          setCategories(JSON.parse(savedCategories));
        } else if (languageToUse === 'my') {
          setCategories(myanmarCategories);
        } else {
          setCategories(defaultCategories);
        }
        
        if (savedUnitTypes) {
          setUnitTypes(JSON.parse(savedUnitTypes));
        } else if (languageToUse === 'my') {
          setUnitTypes(myanmarUnitTypes);
        } else {
          setUnitTypes(defaultUnitTypes);
        }
        
        setLanguage(languageConfig);
        
      } catch (error) {
        console.error('Error loading settings:', error);
        // Fallback to English
        setSelectedLanguage('en');
        setLanguage(languageConfigs.en);
        setCategories(defaultCategories);
        setUnitTypes(defaultUnitTypes);
      }
    };


  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem('selectedLanguage', selectedLanguage);
      if (customAppTitle.trim()) {
        await AsyncStorage.setItem('customAppTitle', customAppTitle.trim());
        setLanguage(prev => ({ ...prev, appTitle: customAppTitle.trim() }));
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const changeLanguage = async (languageCode) => {
    try {
      console.log('Changing language to:', languageCode);
      
      setSelectedLanguage(languageCode);
      const languageConfig = languageConfigs[languageCode] || languageConfigs.en;
      
      // Create a copy to avoid mutation
      const newLanguageConfig = { ...languageConfig };
      
      // Preserve custom title if it exists
      if (customAppTitle && customAppTitle.trim()) {
        newLanguageConfig.appTitle = customAppTitle.trim();
      }
      
      setLanguage(newLanguageConfig);
      
      // Handle Myanmar-specific categories and units
      if (languageCode === 'my') {
        setCategories(myanmarCategories);
        setUnitTypes(myanmarUnitTypes);
        // Reset form to use Myanmar defaults
        setNewItem(prev => ({
          ...prev,
          category: myanmarCategories[4], // 'အခြား' (Other)
          unitType: myanmarUnitTypes[4],  // 'ခု' (pieces)
        }));
      } else {
        setCategories(defaultCategories);
        setUnitTypes(defaultUnitTypes);
        setNewItem(prev => ({
          ...prev,
          category: defaultCategories[4],
          unitType: defaultUnitTypes[4],
        }));
      }
      
      // Save to storage
      await AsyncStorage.setItem('selectedLanguage', languageCode);
      await AsyncStorage.setItem('categories', JSON.stringify(
        languageCode === 'my' ? myanmarCategories : defaultCategories
      ));
      await AsyncStorage.setItem('unit_types', JSON.stringify(
        languageCode === 'my' ? myanmarUnitTypes : defaultUnitTypes
      ));
      
      setShowLanguageModal(false);
      
    } catch (error) {
      console.error('Error changing language:', error);
      Alert.alert('Error', 'Could not change language');
    }
  };

  const updateAppTitle = async (newTitle) => {
    try {
      const title = newTitle.trim() || languageConfigs[selectedLanguage].appTitle;
      setCustomAppTitle(title);
      setLanguage(prev => ({ ...prev, appTitle: title }));
      await AsyncStorage.setItem('customAppTitle', title);
    } catch (error) {
      console.error('Error updating app title:', error);
    }
  };

  const [activeSwipeId, setActiveSwipeId] = useState(null);

// Reset all swipes when modal closes
  useEffect(() => {
    if (!showPredefinedItemsModal) {
      setActiveSwipeId(null);
    }
  }, [showPredefinedItemsModal]);

  const SwipeableItem = ({ item, onSelect, onDelete }) => {
    const [translateX] = useState(new Animated.Value(0));
    const [isDeleteVisible, setIsDeleteVisible] = useState(false);

    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderGrant: () => {
        // Reset any existing animation
        translateX.setOffset(translateX._value);
        translateX.setValue(0);
      },
      onPanResponderMove: (evt, gestureState) => {
        // Only allow left swipe (negative values) and limit the distance
        const newValue = Math.max(Math.min(gestureState.dx, 0), -100);
        translateX.setValue(newValue);
      },
      onPanResponderRelease: (evt, gestureState) => {
        translateX.flattenOffset();
        
        if (gestureState.dx < -50) {
          // Show delete button
          setIsDeleteVisible(true);
          Animated.spring(translateX, {
            toValue: -80,
            useNativeDriver: false, // Changed to false for better compatibility
            tension: 100,
            friction: 8,
          }).start();
        } else {
          // Hide delete button and snap back
          resetSwipe();
        }
      },
    });

    const resetSwipe = () => {
      setIsDeleteVisible(false);
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: false,
        tension: 100,
        friction: 8,
      }).start();
    };

    const handleDelete = () => {
      // Animate out completely before deleting
      Animated.timing(translateX, {
        toValue: -200,
        duration: 200,
        useNativeDriver: false,
      }).start(() => {
        onDelete(item);
      });
    };

    const handleSelect = () => {
      if (isDeleteVisible) {
        resetSwipe();
      } else {
        onSelect(item);
      }
    };

    // Reset swipe when component unmounts or item changes
    useEffect(() => {
      return () => {
        resetSwipe();
      };
    }, [item.id]);

    return (
      <View style={styles.swipeableContainer}>
        {/* Delete button that appears behind the item */}
        <View style={styles.deleteButtonBackground}>
          <TouchableOpacity
            style={styles.deleteButtonTouchable}
            onPress={handleDelete}
            activeOpacity={0.8}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
        
        <Animated.View
          style={[
            styles.swipeableItemWrapper,
            { transform: [{ translateX }] }
          ]}
          {...panResponder.panHandlers}
        >
          <TouchableOpacity
            style={styles.enhancedPredefinedItemOption}
            onPress={handleSelect}
            activeOpacity={0.7}
          >
            <View style={styles.predefinedItemInfo}>
              <Text style={styles.predefinedItemName}>{item.name}</Text>
              <View style={styles.predefinedItemDetailsRow}>
                <View style={styles.predefinedCategoryBadge}>
                  <Text style={styles.predefinedCategoryText}>{item.category}</Text>
                </View>
                <Text style={styles.predefinedUnitText}>{item.unitType}</Text>
              </View>
            </View>
            <Text style={styles.selectArrow}>›</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  // Delete all predefined items
  const deleteAllPredefinedItems = async () => {
    try {
      setPredefinedItems([]);
      await savePredefinedItems([]);
      Alert.alert('Success', 'All predefined items have been deleted');
    } catch (error) {
      Alert.alert('Error', 'Could not delete predefined items');
      console.error('Error deleting all predefined items:', error);
    }
  };

  // Delete individual predefined item
  const deleteIndividualPredefinedItem = async (itemId) => {
    try {
      const updatedItems = predefinedItems.filter(item => item.id !== itemId);
      setPredefinedItems(updatedItems);
      await savePredefinedItems(updatedItems);
      setSwipedItemId(null); // Reset swipe state
      Alert.alert('Success', 'Item deleted successfully');
    } catch (error) {
      Alert.alert('Error', 'Could not delete item');
      console.error('Error deleting predefined item:', error);
    }
  };

  // Show delete confirmation for all items
  const confirmDeleteAllItems = () => {
    Alert.alert(
      'Delete All Items',
      `Are you sure you want to delete all ${predefinedItems.length} predefined items? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete All', 
          style: 'destructive',
          onPress: deleteAllPredefinedItems 
        }
      ]
    );
  };

  // Show delete confirmation for individual item
  const confirmDeleteItem = (item) => {
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete "${item.name}" from predefined items?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteIndividualPredefinedItem(item.id) 
        }
      ]
    );
  };

  // Receipt generation and sharing functions
  const generateReceiptText = () => {
    const dateStr = selectedDate.toLocaleDateString();
    const timeStr = new Date().toLocaleTimeString();
    
    let receiptText = `\n${language.dailySummary}\n`;
    receiptText += `Date: ${dateStr}\n`;
    receiptText += `Generated: ${timeStr}\n`;
    receiptText += `${'-'.repeat(40)}\n\n`;
    
    if (filteredItems.length === 0) {
      receiptText += `No items sold on this date.\n\n`;
    } else {
      filteredItems.forEach((item, index) => {
        const total = (parseFloat(item.price) * parseFloat(item.unitsSold)).toFixed(2);
        receiptText += `${index + 1}. ${item.name}\n`;
        receiptText += `   Category: ${item.category}\n`;
        receiptText += `   Price: $${item.price} per ${item.unitType}\n`;
        receiptText += `   Quantity: ${item.unitsSold} ${item.unitType}\n`;
        receiptText += `   Total: $${total}\n\n`;
      });
    }
    
    receiptText += `${'-'.repeat(40)}\n`;
    receiptText += `Daily Total: $${getDailyTotal()}\n`;
    receiptText += `Total Items: ${filteredItems.length}\n`;
    
    return receiptText;
  };

  const shareViaEmail = async () => {
    const receiptText = generateReceiptText();
    const subject = `Daily Sales Summary - ${selectedDate.toLocaleDateString()}`;
    
    try {
      const mailUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(receiptText)}`;
      const supported = await Linking.canOpenURL(mailUrl);
      
      if (supported) {
        await Linking.openURL(mailUrl);
        setShowReceiptModal(false);
      } else {
        await Share.share({
          message: receiptText,
          title: subject,
        });
        setShowReceiptModal(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Could not open email app');
    }
  };

  const shareViaText = async () => {
    const receiptText = generateReceiptText();
    
    try {
      const smsUrl = `sms:?body=${encodeURIComponent(receiptText)}`;
      const supported = await Linking.canOpenURL(smsUrl);
      
      if (supported) {
        await Linking.openURL(smsUrl);
        setShowReceiptModal(false);
      } else {
        await Share.share({
          message: receiptText,
        });
        setShowReceiptModal(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Could not open messaging app');
    }
  };

  const shareReceipt = async () => {
    const receiptText = generateReceiptText();
    
    try {
      await Share.share({
        message: receiptText,
        title: `Daily Sales Summary - ${selectedDate.toLocaleDateString()}`,
      });
      setShowReceiptModal(false);
    } catch (error) {
      console.error('Error sharing receipt:', error);
    }
  };

  // OCR Integration
  const callOCRApi = async (base64Image) => {
    try {
      const response = await fetch(OCR_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image }),
      });
      return await response.json();
    } catch (error) {
      console.error('OCR API error:', error);
      return null;
    }
  };

  const handleOCRScan = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status === 'granted') {
      Alert.alert(
        language.scanWithOCR,
        'Choose option',
        [
          { text: language.takePhoto, onPress: () => takePhoto() },
          { text: language.selectFromGallery, onPress: () => selectFromGallery() },
          { text: language.cancel, style: 'cancel' },
        ]
      );
    }
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const base64Image = result.assets[0].base64;
      const ocrResult = await callOCRApi(base64Image);
      if (ocrResult && ocrResult.success && ocrResult.extracted) {
        setNewItem(prev => ({
          ...prev,
          name: ocrResult.extracted.item_name || '',
          price: ocrResult.extracted.price || '',
          unitsSold: ocrResult.extracted.quantity || '',
        }));
      } else {
        Alert.alert('OCR failed', 'Could not extract data from image');
      }
    }
  };

  const selectFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const base64Image = result.assets[0].base64;
      const ocrResult = await callOCRApi(base64Image);
      if (ocrResult && ocrResult.success && ocrResult.extracted) {
        setNewItem(prev => ({
          ...prev,
          name: ocrResult.extracted.item_name || '',
          price: ocrResult.extracted.price || '',
          unitsSold: ocrResult.extracted.quantity || '',
        }));
      } else {
        Alert.alert('OCR failed', 'Could not extract data from image');
      }
    }
  };

  // Filter and Sort option arrays
  const sortOptions = [
    { label: language.sortByName, value: 'name' },
    { label: language.sortByPrice, value: 'price' },
    { label: language.sortByAmount, value: 'amount' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{language.appTitle}</Text>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => setShowSettingsModal(true)}
          >
            <Text style={styles.profileIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Date Selector */}
      <View style={styles.dateContainer}>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateText}>📅 {selectedDate.toDateString()}</Text>
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) setSelectedDate(date);
          }}
        />
      )}

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={language.searchPlaceholder}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Filter and Sort Buttons */}
      <View style={styles.filterSortContainer}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Text style={styles.filterButtonText}>{language.filters} ☰</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setShowSortModal(true)}
        >
          <Text style={styles.sortButtonText}>{language.sort} ↕</Text>
        </TouchableOpacity>
      </View>

      {/* Items List */}
      <ScrollView style={styles.itemsList}>
        {filteredItems.length === 0 ? (
          <View style={styles.noItemsContainer}>
            <Text style={styles.noItemsText}>{language.noItems}</Text>
          </View>
        ) : (
          filteredItems.map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.itemCard}
              onPress={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
            >
              <View style={styles.itemHeader}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemAmount}>
                  ${(parseFloat(item.price) * parseFloat(item.unitsSold)).toFixed(2)}
                </Text>
              </View>

              <View style={styles.itemSubInfo}>
                <Text style={styles.itemDetail}>
                  {language.price}: ${item.price} | {language.unitsSold}: {item.unitsSold} {item.unitType}
                </Text>
                <Text style={styles.itemCategory}>{item.category}</Text>
              </View>

              {expandedItem === item.id && (
                <View style={styles.expandedInfo}>
                  <Text style={styles.expandedText}>
                    {language.price}: ${item.price}
                  </Text>
                  <Text style={styles.expandedText}>
                    {language.unitsSold}: {item.unitsSold} {item.unitType}
                  </Text>
                  <Text style={styles.expandedText}>
                    {language.totalAmount}: ${item.totalAmount}
                  </Text>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deleteItem(item.id)}
                  >
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Add Item Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={openAddModal}
      >
        <Text style={styles.addButtonText}>+ {language.addItem}</Text>
      </TouchableOpacity>

      {/* Bottom Navigation Bar */}
      <TouchableOpacity 
        style={styles.bottomNav}
        onPress={() => setShowReceiptModal(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.totalText}>
          {language.dailyTotal}: ${getDailyTotal()}
        </Text>
        <Text style={styles.tapToViewReceipt}>
          Tap to view receipt
        </Text>
      </TouchableOpacity>

      {/* Receipt Modal */}
      <Modal
        visible={showReceiptModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowReceiptModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.receiptModalContent}>
            <Text style={styles.receiptTitle}>{language.dailySummary}</Text>
            <Text style={styles.receiptDate}>
              {selectedDate.toLocaleDateString()} • {new Date().toLocaleTimeString()}
            </Text>
            
            <View style={styles.receiptDivider} />
            
            <ScrollView style={styles.receiptItemsList}>
              {filteredItems.length === 0 ? (
                <Text style={styles.noReceiptItems}>No items sold on this date</Text>
              ) : (
                filteredItems.map((item, index) => (
                  <View key={item.id} style={styles.receiptItem}>
                    <View style={styles.receiptItemHeader}>
                      <Text style={styles.receiptItemNumber}>{index + 1}.</Text>
                      <Text style={styles.receiptItemName}>{item.name}</Text>
                      <Text style={styles.receiptItemTotal}>
                        ${(parseFloat(item.price) * parseFloat(item.unitsSold)).toFixed(2)}
                      </Text>
                    </View>
                    <View style={styles.receiptItemDetails}>
                      <Text style={styles.receiptItemDetail}>
                        ${item.price}/{item.unitType} × {item.unitsSold} {item.unitType}
                      </Text>
                      <Text style={styles.receiptItemCategory}>{item.category}</Text>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
            
            <View style={styles.receiptDivider} />
            
            <View style={styles.receiptSummary}>
              <View style={styles.receiptSummaryRow}>
                <Text style={styles.receiptSummaryLabel}>Total Items:</Text>
                <Text style={styles.receiptSummaryValue}>{filteredItems.length}</Text>
              </View>
              <View style={styles.receiptSummaryRow}>
                <Text style={styles.receiptTotalLabel}>Daily Total:</Text>
                <Text style={styles.receiptTotalValue}>${getDailyTotal()}</Text>
              </View>
            </View>
            
            <View style={styles.receiptButtonRow}>
              <TouchableOpacity
                style={styles.shareButton}
                onPress={shareViaEmail}
              >
                <Text style={styles.shareButtonText}>📧 {language.shareViaEmail}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.shareButton}
                onPress={shareViaText}
              >
                <Text style={styles.shareButtonText}>💬 {language.shareViaText}</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              style={styles.genericShareButton}
              onPress={shareReceipt}
            >
              <Text style={styles.genericShareButtonText}>📤 Share</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.closeReceiptButton}
              onPress={() => setShowReceiptModal(false)}
            >
              <Text style={styles.closeReceiptButtonText}>{language.close}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Item Type Selection Modal */}
      <Modal
        visible={showItemTypeModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowItemTypeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.selectionModalContent}>
            <Text style={styles.selectionModalTitle}>{language.selectItemType}</Text>
            
            <TouchableOpacity
              style={styles.customItemOption}
              onPress={() => handleItemTypeSelection(true)}
            >
              <Text style={styles.customItemText}>{language.customItem}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.predefinedItemOption}
              onPress={() => handleItemTypeSelection(false)}
            >
              <Text style={styles.predefinedItemText}>{language.predefinedItems}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setShowItemTypeModal(false)}
            >
              <Text style={styles.closeModalButtonText}>{language.cancel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Predefined Items Modal */}
      <Modal
        visible={showPredefinedItemsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowPredefinedItemsModal(false);
          setPredefinedSearchText('');
          setPredefinedFilterCategory('All');
          setPredefinedSortBy('name');
          setShowPredefinedCategoryModal(false);
          setShowPredefinedSortModal(false);
          setShowBulkActionsModal(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.enhancedPredefinedModalContent}>
            <Text style={styles.selectionModalTitle}>{language.predefinedItems}</Text>
            <Text style={styles.predefinedItemsCount}>
              {predefinedItems.length} items available
            </Text>
            <Text style={styles.swipeInstructions}>
              Swipe left on any item to delete
            </Text>
            
            <TextInput
              style={styles.predefinedSearchInput}
              placeholder="Search items..."
              value={predefinedSearchText}
              onChangeText={setPredefinedSearchText}
              clearButtonMode="while-editing"
            />
            
            <View style={styles.predefinedFilterRow}>
              <TouchableOpacity
                style={styles.predefinedFilterButton}
                onPress={() => setShowPredefinedCategoryModal(true)}
              >
                <Text style={styles.predefinedFilterText}>
                  📂 {predefinedFilterCategory}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.predefinedSortButton}
                onPress={() => setShowPredefinedSortModal(true)}
              >
                <Text style={styles.predefinedSortText}>
                  🔄 Sort: {predefinedSortBy === 'name' ? 'Name' : 'Category'}
                </Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.predefinedItemsList}>
              {getFilteredPredefinedItems().length === 0 ? (
                <View style={styles.noPredefinedItemsContainer}>
                  <Text style={styles.noPredefinedItemsText}>
                    No items found matching your search
                  </Text>
                </View>
              ) : (
                getFilteredPredefinedItems().map(item => (
                  <SwipeableItem
                    key={item.id}
                    item={item}
                    onSelect={handlePredefinedItemSelection}
                    onDelete={confirmDeleteItem}
                    isActive={activeSwipeId === item.id}
                    onSwipeStart={() => setActiveSwipeId(item.id)}
                    onSwipeReset={() => setActiveSwipeId(null)}
                  />
                ))
              )}
            </ScrollView>
            
            <Text style={styles.resultsCount}>
              Showing {getFilteredPredefinedItems().length} of {predefinedItems.length} items
            </Text>

            <TouchableOpacity
              style={styles.bulkActionsButton}
              onPress={() => setShowBulkActionsModal(true)}
            >
              <Text style={styles.bulkActionsButtonText}>⚙️ Bulk Actions</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => {
                setShowPredefinedItemsModal(false);
                setPredefinedSearchText('');
                setPredefinedFilterCategory('All');
                setPredefinedSortBy('name');
                setShowPredefinedCategoryModal(false);
                setShowPredefinedSortModal(false);
                setShowBulkActionsModal(false);
              }}
            >
              <Text style={styles.closeModalButtonText}>{language.cancel}</Text>
            </TouchableOpacity>
            
            {showPredefinedCategoryModal && (
              <View style={styles.overlayModalContainer}>
                <View style={styles.overlayModalContent}>
                  <Text style={styles.overlayModalTitle}>{language.selectCategory}</Text>
                  
                  <ScrollView style={styles.overlayScrollView}>
                    <TouchableOpacity
                      style={[
                        styles.overlayOption, 
                        predefinedFilterCategory === 'All' && styles.overlaySelectedOption
                      ]}
                      onPress={() => {
                        setPredefinedFilterCategory('All');
                        setShowPredefinedCategoryModal(false);
                      }}
                    >
                      <Text style={[
                        styles.overlayOptionText, 
                        predefinedFilterCategory === 'All' && styles.overlaySelectedOptionText
                      ]}>
                        {language.all}
                      </Text>
                    </TouchableOpacity>
                    
                    {categories.map(cat => (
                      <TouchableOpacity
                        key={cat}
                        style={[
                          styles.overlayOption, 
                          predefinedFilterCategory === cat && styles.overlaySelectedOption
                        ]}
                        onPress={() => {
                          setPredefinedFilterCategory(cat);
                          setShowPredefinedCategoryModal(false);
                        }}
                      >
                        <Text style={[
                          styles.overlayOptionText, 
                          predefinedFilterCategory === cat && styles.overlaySelectedOptionText
                        ]}>
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  
                  <TouchableOpacity
                    style={styles.overlayCloseButton}
                    onPress={() => setShowPredefinedCategoryModal(false)}
                  >
                    <Text style={styles.overlayCloseButtonText}>{language.cancel}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            {showPredefinedSortModal && (
              <View style={styles.overlayModalContainer}>
                <View style={styles.overlayModalContent}>
                  <Text style={styles.overlayModalTitle}>Select Sort Option</Text>
                  
                  <ScrollView style={styles.overlayScrollView}>
                    <TouchableOpacity
                      style={[
                        styles.overlayOption, 
                        predefinedSortBy === 'name' && styles.overlaySelectedOption
                      ]}
                      onPress={() => {
                        setPredefinedSortBy('name');
                        setShowPredefinedSortModal(false);
                      }}
                    >
                      <Text style={[
                        styles.overlayOptionText, 
                        predefinedSortBy === 'name' && styles.overlaySelectedOptionText
                      ]}>
                        Sort by Name
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[
                        styles.overlayOption, 
                        predefinedSortBy === 'category' && styles.overlaySelectedOption
                      ]}
                      onPress={() => {
                        setPredefinedSortBy('category');
                        setShowPredefinedSortModal(false);
                      }}
                    >
                      <Text style={[
                        styles.overlayOptionText, 
                        predefinedSortBy === 'category' && styles.overlaySelectedOptionText
                      ]}>
                        Sort by Category
                      </Text>
                    </TouchableOpacity>
                  </ScrollView>
                  
                  <TouchableOpacity
                    style={styles.overlayCloseButton}
                    onPress={() => setShowPredefinedSortModal(false)}
                  >
                    <Text style={styles.overlayCloseButtonText}>{language.cancel}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            {showBulkActionsModal && (
              <View style={styles.overlayModalContainer}>
                <View style={styles.bulkActionsModalContent}>
                  <Text style={styles.overlayModalTitle}>Bulk Actions</Text>
                  <Text style={styles.bulkActionsSubtitle}>
                    Manage your predefined items collection
                  </Text>
                  
                  <ScrollView style={styles.bulkActionsScrollView}>

                    {/* Bulk Add Items */}
                    <TouchableOpacity
                      style={styles.bulkActionOption}
                      onPress={() => {
                        setShowBulkActionsModal(false);
                        setShowPredefinedItemsModal(false);
                        setShowBulkAddModal(true);
                      }}
                    >
                      <Text style={styles.bulkActionIcon}>➕</Text>
                      <View style={styles.bulkActionContent}>
                        <Text style={styles.bulkActionTitle}>Bulk Add Items</Text>
                        <Text style={styles.bulkActionDescription}>
                          Add multiple items at once
                        </Text>
                      </View>
                    </TouchableOpacity>
                    
                    {/* Export Items */}
                    {/* <TouchableOpacity
                      style={styles.bulkActionOption}
                      onPress={() => {
                        setShowBulkActionsModal(false);
                        exportPredefinedItems();
                      }}
                    >
                      <Text style={styles.bulkActionIcon}>📤</Text>
                      <View style={styles.bulkActionContent}>
                        <Text style={styles.bulkActionTitle}>Export Items</Text>
                        <Text style={styles.bulkActionDescription}>
                          Save all items to JSON file
                        </Text>
                      </View>
                    </TouchableOpacity> */}

                    {/* Import JSON */}
                    {/* <TouchableOpacity
                      style={styles.bulkActionOption}
                      onPress={() => {
                        setShowBulkActionsModal(false);
                        importPredefinedItems();
                      }}
                    >
                      <Text style={styles.bulkActionIcon}>📥</Text>
                      <View style={styles.bulkActionContent}>
                        <Text style={styles.bulkActionTitle}>Import JSON</Text>
                        <Text style={styles.bulkActionDescription}>
                          Load items from JSON file
                        </Text>
                      </View>
                    </TouchableOpacity> */}

                    {/* Import CSV */}
                    <TouchableOpacity
                      style={styles.bulkActionOption}
                      onPress={() => {
                        setShowBulkActionsModal(false);
                        importFromCSV();
                      }}
                    >
                      <Text style={styles.bulkActionIcon}>📊</Text>
                      <View style={styles.bulkActionContent}>
                        <Text style={styles.bulkActionTitle}>Import CSV</Text>
                        <Text style={styles.bulkActionDescription}>
                          Load items from CSV file
                        </Text>
                      </View>
                    </TouchableOpacity>

                    {/* CSV Template */}
                    {/* <TouchableOpacity
                      style={styles.bulkActionOption}
                      onPress={() => {
                        setShowBulkActionsModal(false);
                        downloadCSVTemplate();
                      }}
                    >
                      <Text style={styles.bulkActionIcon}>📋</Text>
                      <View style={styles.bulkActionContent}>
                        <Text style={styles.bulkActionTitle}>CSV Template</Text>
                        <Text style={styles.bulkActionDescription}>
                          Download CSV template file
                        </Text>
                      </View>
                    </TouchableOpacity> */}

                    {/* Delete All Items */}
                    <TouchableOpacity
                      style={[styles.bulkActionOption, styles.dangerousAction]}
                      onPress={() => {
                        setShowBulkActionsModal(false);
                        confirmDeleteAllItems();
                      }}
                    >
                      <Text style={styles.bulkActionIcon}>🗑️</Text>
                      <View style={styles.bulkActionContent}>
                        <Text style={[styles.bulkActionTitle, styles.dangerousActionText]}>
                          Delete All Items
                        </Text>
                        <Text style={[styles.bulkActionDescription, styles.dangerousActionText]}>
                          Remove all predefined items
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </ScrollView>
                  
                  <TouchableOpacity
                    style={styles.overlayCloseButton}
                    onPress={() => setShowBulkActionsModal(false)}
                  >
                    <Text style={styles.overlayCloseButtonText}>{language.cancel}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Add Item Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.keyboardAvoidingView}
            >
              <View style={styles.modernModalContent}>
                <Text style={styles.modernModalTitle}>{language.addItem}</Text>

                {isCustomItem ? (
                  <TextInput
                    style={styles.modernInput}
                    placeholder={language.itemName}
                    value={newItem.name}
                    onChangeText={(text) => setNewItem(prev => ({ ...prev, name: text }))}
                  />
                ) : (
                  <View style={styles.predefinedItemDisplay}>
                    <Text style={styles.predefinedItemDisplayName}>{newItem.name}</Text>
                    <Text style={styles.predefinedItemDisplayDetails}>
                      {newItem.category} • {newItem.unitType}
                    </Text>
                  </View>
                )}

                <View style={styles.modernInputRow}>
                  <TextInput
                    style={[styles.modernInput, { flex: 1, marginRight: 8 }]}
                    placeholder={language.price}
                    value={newItem.price}
                    onChangeText={(text) => setNewItem(prev => ({ ...prev, price: text }))}
                    keyboardType="numeric"
                  />
                  <TextInput
                    style={[styles.modernInput, { flex: 1, marginLeft: 8 }]}
                    placeholder={language.unitsSold}
                    value={newItem.unitsSold}
                    onChangeText={(text) => setNewItem(prev => ({ ...prev, unitsSold: text }))}
                    keyboardType="numeric"
                  />
                </View>

                {isCustomItem && (
                  <View style={styles.modernInputRow}>
                    <TouchableOpacity
                      style={[styles.modernSelector, { flex: 1, marginRight: 8 }]}
                      onPress={() => {
                        setShowCategoryModal(true);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.modernSelectorText}>{newItem.category}</Text>
                      <Text style={styles.modernSelectorArrow}>▼</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.modernSelector, { flex: 1, marginLeft: 8 }]}
                      onPress={() => {
                        setShowUnitTypeModal(true);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.modernSelectorText}>{newItem.unitType}</Text>
                      <Text style={styles.modernSelectorArrow}>▼</Text>
                    </TouchableOpacity>
                  </View>
                )}

                <View style={styles.totalAmountContainer}>
                  <Text style={styles.totalAmountText}>
                    Total Amount: ${calculateTotal()}
                  </Text>
                </View>

                <TouchableOpacity style={styles.modernOcrButton} onPress={handleOCRScan}>
                  <Text style={styles.modernOcrButtonText}>📷 {language.scanWithOCR}</Text>
                </TouchableOpacity>

                <View style={styles.modernButtonRow}>
                  <TouchableOpacity
                    style={[styles.modernButton, styles.modernCancelButton]}
                    onPress={() => {
                      setShowAddModal(false);
                      setNewItem({
                        name: '',
                        price: '',
                        unitsSold: '',
                        category: defaultCategories[4],
                        unitType: defaultUnitTypes[4],
                      });
                    }}
                  >
                    <Text style={styles.modernCancelButtonText}>{language.cancel}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modernButton, styles.modernSaveButton]}
                    onPress={addItem}
                  >
                    <Text style={styles.modernSaveButtonText}>{language.save}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>

            {/* Category Selection Modal - INSIDE Add Item Modal */}
            {showCategoryModal && (
              <View style={styles.overlayModalContainer}>
                <View style={styles.overlayModalContent}>
                  <Text style={styles.overlayModalTitle}>{language.selectCategory}</Text>
                  
                  <ScrollView style={styles.overlayScrollView}>
                    {categories.map(cat => (
                      <TouchableOpacity
                        key={cat}
                        style={[
                          styles.overlayOption, 
                          newItem.category === cat && styles.overlaySelectedOption
                        ]}
                        onPress={() => {
                          setNewItem(prev => ({ ...prev, category: cat }));
                          setShowCategoryModal(false);
                        }}
                      >
                        <Text style={[
                          styles.overlayOptionText, 
                          newItem.category === cat && styles.overlaySelectedOptionText
                        ]}>
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  
                  <TouchableOpacity
                    style={styles.overlayCloseButton}
                    onPress={() => {
                      setShowCategoryModal(false);
                    }}
                  >
                    <Text style={styles.overlayCloseButtonText}>{language.cancel}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Unit Type Selection Modal - INSIDE Add Item Modal */}
            {showUnitTypeModal && (
              <View style={styles.overlayModalContainer}>
                <View style={styles.overlayModalContent}>
                  <Text style={styles.overlayModalTitle}>{language.selectUnitType}</Text>
                  
                  <ScrollView style={styles.overlayScrollView}>
                    {unitTypes.map(unit => (
                      <TouchableOpacity
                        key={unit}
                        style={[
                          styles.overlayOption, 
                          newItem.unitType === unit && styles.overlaySelectedOption
                        ]}
                        onPress={() => {
                          setNewItem(prev => ({ ...prev, unitType: unit }));
                          setShowUnitTypeModal(false);
                        }}
                      >
                        <Text style={[
                          styles.overlayOptionText, 
                          newItem.unitType === unit && styles.overlaySelectedOptionText
                        ]}>
                          {unit}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  
                  <TouchableOpacity
                    style={styles.overlayCloseButton}
                    onPress={() => {
                      setShowUnitTypeModal(false);
                    }}
                  >
                    <Text style={styles.overlayCloseButtonText}>{language.cancel}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.selectionModalContent}>
            <Text style={styles.selectionModalTitle}>{language.selectCategory}</Text>
            
            <ScrollView>
              <TouchableOpacity
                style={[styles.selectionOption, filterCategory === 'All' && styles.selectedOption]}
                onPress={() => {
                  setFilterCategory('All');
                  setShowFilterModal(false);
                }}
              >
                <Text style={[styles.selectionOptionText, filterCategory === 'All' && styles.selectedOptionText]}>
                  {language.all}
                </Text>
              </TouchableOpacity>
              
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.selectionOption, filterCategory === cat && styles.selectedOption]}
                  onPress={() => {
                    setFilterCategory(cat);
                    setShowFilterModal(false);
                  }}
                >
                  <Text style={[styles.selectionOptionText, filterCategory === cat && styles.selectedOptionText]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setShowFilterModal(false)}
            >
              <Text style={styles.closeModalButtonText}>{language.cancel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Sort Modal */}
      <Modal
        visible={showSortModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSortModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.selectionModalContent}>
            <Text style={styles.selectionModalTitle}>{language.selectSortOption}</Text>
            
            <ScrollView>
              {sortOptions.map(option => (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.selectionOption, sortBy === option.value && styles.selectedOption]}
                  onPress={() => {
                    setSortBy(option.value);
                    setShowSortModal(false);
                  }}
                >
                  <Text style={[styles.selectionOptionText, sortBy === option.value && styles.selectedOptionText]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setShowSortModal(false)}
            >
              <Text style={styles.closeModalButtonText}>{language.cancel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Bulk Add Modal */}
      <Modal
        visible={showBulkAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowBulkAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.bulkAddModalContent}>
            <Text style={styles.bulkAddTitle}>Bulk Add Items</Text>
            <Text style={styles.bulkAddInstructions}>
              Enter one item per line. You can use formats like:
              {'\n'}- Apple
              {'\n'}- Banana, Food, lb
              {'\n'}- Coffee, Beverages, kg
            </Text>
            
            <TextInput
              style={styles.bulkAddTextArea}
              multiline={true}
              numberOfLines={8}
              placeholder="Enter item names (one per line)..."
              value={bulkAddText}
              onChangeText={setBulkAddText}
              textAlignVertical="top"
            />
            
            <View style={styles.bulkAddDefaults}>
              <Text style={styles.bulkAddDefaultsLabel}>Default values for items without category/unit:</Text>
              <View style={styles.bulkAddDefaultsRow}>
                <TouchableOpacity
                  style={styles.bulkAddDefaultSelector}
                  onPress={() => {
                    const currentIndex = categories.indexOf(bulkAddCategory);
                    const nextIndex = (currentIndex + 1) % categories.length;
                    setBulkAddCategory(categories[nextIndex]);
                  }}
                >
                  <Text style={styles.bulkAddDefaultText}>Category: {bulkAddCategory}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.bulkAddDefaultSelector}
                  onPress={() => {
                    const currentIndex = unitTypes.indexOf(bulkAddUnitType);
                    const nextIndex = (currentIndex + 1) % unitTypes.length;
                    setBulkAddUnitType(unitTypes[nextIndex]);
                  }}
                >
                  <Text style={styles.bulkAddDefaultText}>Unit: {bulkAddUnitType}</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.bulkAddButtonRow}>
              <TouchableOpacity
                style={[styles.bulkAddButton, styles.bulkAddCancelButton]}
                onPress={() => {
                  setShowBulkAddModal(false);
                  setBulkAddText('');
                }}
              >
                <Text style={styles.bulkAddCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.bulkAddButton, styles.bulkAddSaveButton]}
                onPress={processBulkAdd}
              >
                <Text style={styles.bulkAddSaveButtonText}>Add Items</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Settings Modal */}
      <Modal
        visible={showSettingsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSettingsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.fixedSettingsModalContent}>
            <Text style={styles.settingsTitle}>{language.settings || 'Settings'}</Text>
            
            <ScrollView 
              style={styles.settingsScrollView}
              showsVerticalScrollIndicator={true}
            >
              {/* App Title Setting */}
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>{language.appTitleSetting || 'App Title'}</Text>
                <TextInput
                  style={styles.settingInput}
                  value={customAppTitle}
                  onChangeText={setCustomAppTitle}
                  placeholder={languageConfigs[selectedLanguage]?.appTitle || 'Inventory Management'}
                />
              </View>
              
              {/* Language Setting */}
              <View style={styles.settingItem}>
                <Text style={styles.settingLabel}>{language.language || 'Language'}</Text>
                <TouchableOpacity
                  style={styles.languageSelector}
                  onPress={() => setShowLanguageDropdown(!showLanguageDropdown)}
                >
                  <Text style={styles.languageSelectorText}>
                    {availableLanguages.find(lang => lang.code === selectedLanguage)?.flag || '🇺🇸'} {' '}
                    {availableLanguages.find(lang => lang.code === selectedLanguage)?.name || 'English'}
                  </Text>
                  <Text style={styles.selectorArrow}>{showLanguageDropdown ? '▲' : '▼'}</Text>
                </TouchableOpacity>
                
                {showLanguageDropdown && (
                  <View style={styles.languageDropdown}>
                    <ScrollView 
                      style={styles.languageDropdownScroll}
                      nestedScrollEnabled={true}
                    >
                      {availableLanguages.map(lang => (
                        <TouchableOpacity
                          key={lang.code}
                          style={[
                            styles.languageDropdownItem,
                            selectedLanguage === lang.code && styles.selectedLanguageDropdownItem
                          ]}
                          onPress={() => {
                            console.log('Language selected:', lang.code);
                            changeLanguage(lang.code);
                            setShowLanguageDropdown(false);
                          }}
                        >
                          <Text style={styles.languageDropdownFlag}>{lang.flag}</Text>
                          <Text style={[
                            styles.languageDropdownText,
                            selectedLanguage === lang.code && styles.selectedLanguageDropdownText
                          ]}>
                            {lang.name}
                          </Text>
                          {selectedLanguage === lang.code && (
                            <Text style={styles.languageDropdownCheck}>✓</Text>
                          )}
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            </ScrollView>
            
            <View style={styles.settingsButtonRow}>
              <TouchableOpacity
                style={[styles.settingsButton, styles.settingsCancelButton]}
                onPress={() => {
                  setShowSettingsModal(false);
                  setShowLanguageDropdown(false);
                }}
              >
                <Text style={styles.settingsCancelButtonText}>{language.cancel}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.settingsButton, styles.settingsSaveButton]}
                onPress={() => {
                  updateAppTitle(customAppTitle);
                  saveSettings();
                  setShowSettingsModal(false);
                  setShowLanguageDropdown(false);
                }}
              >
                <Text style={styles.settingsSaveButtonText}>{language.save}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.selectionModalContent}>
            <Text style={styles.selectionModalTitle}>{language.language || 'Select Language'}</Text>
            
            <ScrollView>
              {availableLanguages.map(lang => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.selectionOption,
                    selectedLanguage === lang.code && styles.selectedOption
                  ]}
                  onPress={() => {
                    console.log('Language selected:', lang.code);
                    changeLanguage(lang.code);
                  }}
                >
                  <View style={styles.languageOptionContent}>
                    <Text style={styles.languageOptionFlag}>{lang.flag}</Text>
                    <Text style={[
                      styles.selectionOptionText,
                      selectedLanguage === lang.code && styles.selectedOptionText
                    ]}>
                      {lang.name}
                    </Text>
                    {selectedLanguage === lang.code && (
                      <Text style={styles.languageCheckmark}>✓</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setShowLanguageModal(false)}
            >
              <Text style={styles.closeModalButtonText}>
                {language.cancel || 'Cancel'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  dateContainer: {
    backgroundColor: '#fff',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  dateButton: {
    alignSelf: 'center',
    padding: 8,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
  },
  dateText: {
    fontSize: 16,
    color: '#1976d2',
  },
  searchContainer: {
    backgroundColor: '#fff',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  filterSortContainer: {
    backgroundColor: '#2c3e50',
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  filterButton: {
    flex: 1,
    backgroundColor: 'transparent',
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  sortButton: {
    flex: 1,
    backgroundColor: 'transparent',
    padding: 12,
    borderRadius: 8,
    marginLeft: 8,
    alignItems: 'center',
  },
  filterButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  sortButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  itemsList: {
    flex: 1,
    padding: 12,
  },
  noItemsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  noItemsText: {
    fontSize: 16,
    color: '#666',
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  itemAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4caf50',
  },
  itemSubInfo: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemDetail: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  itemCategory: {
    fontSize: 12,
    color: '#999',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  expandedInfo: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  expandedText: {
    fontSize: 14,
    marginBottom: 4,
  },
  deleteButton: {
    backgroundColor: '#f44336',
    padding: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  addButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    backgroundColor: '#2196f3',
    borderRadius: 50,
    padding: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 1000,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  bottomNav: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'center',
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#4caf50',
  },
  tapToViewReceipt: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  modernModalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    maxHeight: '90%',
  },
  modernModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#333',
  },
  modernInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#f8f9fa',
  },
  modernInputRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  modernSelector: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#f8f9fa',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 50,
  },
  modernSelectorText: {
    fontSize: 16,
    color: '#333',
  },
  modernSelectorArrow: {
    fontSize: 12,
    color: '#666',
  },
  predefinedItemDisplay: {
    backgroundColor: '#e8f5e8',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  predefinedItemDisplayName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 4,
  },
  predefinedItemDisplayDetails: {
    fontSize: 14,
    color: '#4caf50',
  },
  totalAmountContainer: {
    backgroundColor: '#f0f8ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  totalAmountText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: '#333',
  },
  modernOcrButton: {
    backgroundColor: '#28a745',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'center',
  },
  modernOcrButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modernButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modernButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 6,
    alignItems: 'center',
  },
  modernCancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  modernSaveButton: {
    backgroundColor: '#007bff',
  },
  modernCancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  modernSaveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  receiptModalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    maxHeight: '90%',
  },
  receiptTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  receiptDate: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginBottom: 16,
  },
  receiptDivider: {
    height: 2,
    backgroundColor: '#333',
    marginVertical: 16,
  },
  receiptItemsList: {
    maxHeight: 300,
    marginBottom: 16,
  },
  noReceiptItems: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    marginVertical: 20,
  },
  receiptItem: {
    marginBottom: 16,
  },
  receiptItemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  receiptItemNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    minWidth: 20,
  },
  receiptItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginLeft: 8,
  },
  receiptItemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4caf50',
    marginLeft: 8,
  },
  receiptItemDetails: {
    marginLeft: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptItemDetail: {
    fontSize: 14,
    color: '#666',
  },
  receiptItemCategory: {
    fontSize: 12,
    color: '#999',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  receiptSummary: {
    marginBottom: 20,
  },
  receiptSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  receiptSummaryLabel: {
    fontSize: 16,
    color: '#333',
  },
  receiptSummaryValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  receiptTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  receiptTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4caf50',
  },
  receiptButtonRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  shareButton: {
    flex: 1,
    backgroundColor: '#2196f3',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  genericShareButton: {
    backgroundColor: '#28a745',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  genericShareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  closeReceiptButton: {
    backgroundColor: '#6c757d',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeReceiptButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  selectionModalContent: {
    width: '80%',
    maxWidth: 300,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    maxHeight: '70%',
  },
  selectionModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  selectionOption: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
  },
  selectedOption: {
    backgroundColor: '#007bff',
  },
  selectionOptionText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  selectedOptionText: {
    color: '#fff',
    fontWeight: '600',
  },
  closeModalButton: {
    backgroundColor: '#6c757d',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  closeModalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  customItemOption: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#e3f2fd',
    borderWidth: 1,
    borderColor: '#2196f3',
  },
  customItemText: {
    fontSize: 16,
    color: '#1976d2',
    textAlign: 'center',
    fontWeight: '600',
  },
  predefinedItemOption: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  predefinedItemText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    fontWeight: '600',
  },
  enhancedPredefinedModalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    maxHeight: '85%',
  },
  predefinedItemsCount: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  predefinedSearchInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#f8f9fa',
  },
  predefinedFilterRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 6,
  },
  predefinedFilterButton: {
    flex: 1,
    backgroundColor: '#e3f2fd',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2196f3',
  },
  predefinedSortButton: {
    flex: 1,
    backgroundColor: '#fff3e0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ff9800',
  },
  predefinedFilterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976d2',
  },
  predefinedSortText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f57c00',
  },
  predefinedItemsList: {
    maxHeight: 300,
    marginBottom: 16,
  },
  enhancedPredefinedItemOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'transparent',
  },
  predefinedItemInfo: {
    flex: 1,
  },
  predefinedItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  predefinedItemDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  predefinedCategoryBadge: {
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  predefinedCategoryText: {
    fontSize: 12,
    color: '#2e7d32',
    fontWeight: '600',
  },
  predefinedUnitText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  selectArrow: {
    fontSize: 20,
    color: '#666',
    marginLeft: 'auto',
  },
  noPredefinedItemsContainer: {
    padding: 40,
    alignItems: 'center',
  },
  noPredefinedItemsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  resultsCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  overlayModalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  overlayModalContent: {
    width: '80%',
    maxWidth: 280,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    maxHeight: '60%',
  },
  overlayModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#333',
  },
  overlayScrollView: {
    maxHeight: 200,
    marginBottom: 16,
  },
  overlayOption: {
    padding: 12,
    borderRadius: 6,
    marginBottom: 6,
    backgroundColor: '#f8f9fa',
  },
  overlaySelectedOption: {
    backgroundColor: '#007bff',
  },
  overlayOptionText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  overlaySelectedOptionText: {
    color: '#fff',
    fontWeight: '600',
  },
  overlayCloseButton: {
    backgroundColor: '#6c757d',
    padding: 10,
    borderRadius: 6,
  },
  overlayCloseButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  importExportButtonRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  exportButton: {
    flex: 1,
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  exportButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  importButton: {
    flex: 1,
    backgroundColor: '#17a2b8',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  importButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  csvImportButton: {
    flex: 1,
    backgroundColor: '#6f42c1',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  csvImportButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  templateButton: {
    flex: 1,
    backgroundColor: '#6c757d',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  templateButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  bulkAddOpenButton: {
    backgroundColor: '#fd7e14',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  bulkAddOpenButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Bulk Add Modal Styles
  bulkAddModalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    maxHeight: '85%',
  },
  bulkAddTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#333',
  },
  bulkAddInstructions: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  bulkAddTextArea: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
    backgroundColor: '#f8f9fa',
    marginBottom: 16,
  },
  bulkAddDefaults: {
    marginBottom: 20,
  },
  bulkAddDefaultsLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  bulkAddDefaultsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  bulkAddDefaultSelector: {
    flex: 1,
    backgroundColor: '#e8f4f8',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  bulkAddDefaultText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  bulkAddButtonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  bulkAddButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  bulkAddCancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  bulkAddSaveButton: {
    backgroundColor: '#007bff',
  },
  bulkAddCancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  bulkAddSaveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  enhancedPredefinedItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  deleteItemButton: {
    backgroundColor: '#dc3545',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  deleteItemButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 18,
  },
  deleteAllButton: {
    backgroundColor: '#dc3545',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  deleteAllButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  swipeableContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  swipeableItemWrapper: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    zIndex: 2,
  },
  deleteButtonBackground: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 80,
    backgroundColor: '#dc3545',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    zIndex: 1,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteAllButton: {
    backgroundColor: '#dc3545',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  deleteAllButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  swipeInstructions: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  deleteButtonTouchable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  profileIcon: {
    fontSize: 20,
  },
  settingsModalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    maxHeight: '80%',
  },
  settingsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#333',
  },
  settingItem: {
    marginBottom: 20,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  settingInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  languageSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f8f9fa',
  },
  languageSelectorText: {
    fontSize: 16,
    color: '#333',
  },
  selectorArrow: {
    fontSize: 12,
    color: '#666',
  },
  settingsButtonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  settingsButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  settingsCancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  settingsSaveButton: {
    backgroundColor: '#007bff',
  },
  settingsCancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  settingsSaveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  languageModalContent: {
    width: '85%',
    maxWidth: 350,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    maxHeight: '70%',
  },
  languageModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  languageList: {
    maxHeight: 300,
    marginBottom: 20,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 4,
    backgroundColor: '#f8f9fa',
  },
  selectedLanguageOption: {
    backgroundColor: '#e3f2fd',
    borderWidth: 1,
    borderColor: '#2196f3',
  },
  languageFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  languageName: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  selectedLanguageName: {
    color: '#1976d2',
    fontWeight: '600',
  },
  selectedCheckmark: {
    fontSize: 18,
    color: '#1976d2',
    fontWeight: 'bold',
  },
  languageCloseButton: {
    backgroundColor: '#6c757d',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  languageCloseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  languageOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  languageOptionFlag: {
    fontSize: 20,
    marginRight: 12,
  },
  languageCheckmark: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: 'bold',
    marginLeft: 'auto',
  },
  languageDropdown: {
    marginTop: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    maxHeight: 200,
  },
  languageDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  fixedSettingsModalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    maxHeight: '80%', // Prevent overflow
    minHeight: 300,
  },
  settingsScrollView: {
    maxHeight: 400, // Constrain scroll area
    marginBottom: 20,
  },
  languageDropdown: {
    marginTop: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    maxHeight: 160, // Limit dropdown height
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  languageDropdownScroll: {
    maxHeight: 150, // Ensure scrollable
  },
  languageDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedLanguageDropdownItem: {
    backgroundColor: '#e3f2fd',
  },
  languageDropdownFlag: {
    fontSize: 18,
    marginRight: 12,
    width: 24, // Fixed width for alignment
  },
  languageDropdownText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  selectedLanguageDropdownText: {
    color: '#1976d2',
    fontWeight: '600',
  },
  languageDropdownCheck: {
    fontSize: 16,
    color: '#1976d2',
    fontWeight: 'bold',
  },
  bulkActionsButton: {
    backgroundColor: '#6f42c1',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  bulkActionsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bulkActionsModalContent: {
    width: '85%',
    maxWidth: 320,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    maxHeight: '70%',
  },
  bulkActionsSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  bulkActionsScrollView: {
    maxHeight: 400,
    marginBottom: 16,
  },
  bulkActionOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  bulkActionIcon: {
    fontSize: 24,
    marginRight: 16,
    width: 32,
    textAlign: 'center',
  },
  bulkActionContent: {
    flex: 1,
  },
  bulkActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  bulkActionDescription: {
    fontSize: 13,
    color: '#666',
  },
  dangerousAction: {
    borderColor: '#dc3545',
    backgroundColor: '#fff5f5',
  },
  dangerousActionText: {
    color: '#dc3545',
  },

});

export default InventoryApp;