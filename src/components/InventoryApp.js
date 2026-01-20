import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import * as Print from 'expo-print';
import { Calendar } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { PanResponder, Animated, Dimensions } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
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
  currency: '$',
  totalAmount: 'Total Amount',
  category: 'Category',
  unitType: 'Unit Type',
  save: 'Save',
  cancel: 'Cancel',
  dailyTotal: 'Daily Total',
  noItems: 'No items for this date',
  all: 'All',
  sharePDF: 'Share as PDF',
  confirmDay: 'confirm',
  dayConfirmed: 'Confirmed',
  sortByName: 'Name',
  sortByPrice: 'Price',
  sortByAmount: 'Total Amount',
  sortByTime: 'Time Created',
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
  bulkActions: 'Bulk Actions',
  managePredefined: 'Manage your predefined items collection',
  bulkAddItems: 'Bulk Add Items',
  bulkAddDescription: 'Add multiple items at once',
  createCustomItem: 'Create Custom Item',
  createCustomDescription: 'Create a new custom item',
  exportCSV: 'Export as CSV',
  exportCSVDescription: 'Save all items to CSV file',
  importCSV: 'Import CSV',
  importCSVDescription: 'Load items from CSV file',
  deleteAllItems: 'Delete All Items',
  deleteAllDescription: 'Remove all predefined items',
  showingItems: 'Showing {{count}} of {{total}} filtered items ({{all}} total)',
  tapToViewReceipt: 'Tap to view receipt',
  totalItems: 'Total Items',
  delete: 'Delete',
  deleteItem: 'Delete Item',
  deleteItemConfirm: 'Are you sure you want to delete this item from predefined items?',
  deleteAllConfirm: 'Are you sure you want to delete all {{count}} predefined items? This action cannot be undone.',
  bulkAddInstructions: 'Enter one item per line. You can use formats like:\n- Apple\n- Banana, Food, lb, 2.50\n- Coffee, Beverages, kg, 15.00',
  bulkAddDefaults: 'Default values for items without category/unit',
  deleteItem: 'Delete Item',
  deleteItemConfirm: 'Are you sure you want to delete this item from predefined items?',
  itemDeletedSuccess: 'Item deleted successfully',
  successTitle: 'Success',
  itemUpdated: 'Item Updated',
  itemUpdatedMessage: 'Added {{units}} {{unitType}} to existing item. New total: {{total}} {{unitType}}',
  combineItems: 'Combine Identical Items',
  combineItemsDescription: 'When enabled, items with same name and price will be combined',
  monthlySalesTracking: 'Monthly Sales Tracking',
  yearlyTotal: 'Yearly Total',
  date: 'Date',
  dailySaleAmount: 'Daily Sale Amount',
  monthlyTotal: 'Monthly Total',
  deleteMonth: 'Delete Month',
  deleteMonthConfirm: 'Are you sure you want to delete all sales data for',
  salesDataSaved: 'Sales data saved successfully',
  monthlySalesInfo: 'Monthly Sales Tracking is independent of daily inventory records. Use it to track overall monthly sales, purchases, or any other financial data.',
  longPressToRename: 'Long press store name to rename',
  storeName: 'Store',
  addNewStore: 'Add New Store',
  subtotal: 'Subtotal',
  tax: 'Tax',
  receiptCreator: 'Receipt Creator',
  receiptCreatorPlaceholder: 'Receipt Creator Name',
  receipt: 'Receipt',
  items: 'Items',
  customerName: 'Customer',
  cart: 'Shopping Cart',
  emptyCart: 'Your cart is empty',
  addItemsFromList: 'Add items from the list',
  customerInformation: 'Customer Information (Optional)',
  checkout: 'Checkout',
  addToCart: 'Add to Cart',
  receiptHistory: 'Receipt History',
  voided: 'Voided',
  markAsVoided: 'Mark as Voided',
  unmarkAsVoided: 'Unmark as Voided',
  receiptNumber: 'Receipt #',
  viewReceiptHistory: 'View receipt history',
};

const availableLanguages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'my', name: 'မြန်မာ', flag: '🇲🇲' },
  { code: 'th', name: 'ไทย', flag: '🇹🇭' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'ms', name: 'Bahasa Melayu', flag: '🇲🇾' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  
  // { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  // { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  // { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
];

const availableCurrencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'MMK', symbol: 'Ks', name: 'Myanmar Kyat' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht' },
  { code: 'VND', symbol: '₫', name: 'Vietnamese Dong' },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'MXN', symbol: 'Mex$', name: 'Mexican Peso' },
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
    currency: '$',
    totalAmount: 'Total Amount',
    category: 'Category',
    unitType: 'Unit Type',
    save: 'Save',
    cancel: 'Cancel',
    dailyTotal: 'Daily Total',
    noItems: 'No items for this date',
    all: 'All',
    sharePDF: 'Share as PDF',
    confirmDay: 'Confirm',
    dayConfirmed: 'Confirmed',
    sortByName: 'Name',
    sortByPrice: 'Price',
    sortByAmount: 'Total Amount',
    sortByTime: 'Time Created',
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
    bulkActions: 'Bulk Actions',
    managePredefined: 'Manage your predefined items collection',
    bulkAddItems: 'Bulk Add Items',
    bulkAddDescription: 'Add multiple items at once',
    createCustomItem: 'Create Custom Item',
    createCustomDescription: 'Create a new custom item',
    exportCSV: 'Export as CSV',
    exportCSVDescription: 'Save all items to CSV file',
    importCSV: 'Import CSV',
    importCSVDescription: 'Load items from CSV file',
    deleteAllItems: 'Delete All Items',
    deleteAllDescription: 'Remove all predefined items',
    showingItems: 'Showing {{count}} of {{total}} filtered items ({{all}} total)',
    tapToViewReceipt: 'Tap to view daily summary',
    totalItems: 'Total Items',
    delete: 'Delete',
    deleteItem: 'Delete Item',
    deleteItemConfirm: 'Are you sure you want to delete this item from predefined items?',
    deleteAllConfirm: 'Are you sure you want to delete all {{count}} predefined items? This action cannot be undone.',
    bulkAddInstructions: 'Enter one item per line. You can use formats like:\n- Apple\n- Banana, Food, lb, 2.50\n- Coffee, Beverages, kg, 15.00',
    bulkAddDefaults: 'Default values for items without category/unit',
    deleteItem: 'Delete Item',
    deleteItemConfirm: 'Are you sure you want to delete this item from predefined items?',
    itemDeletedSuccess: 'Item deleted successfully',
    successTitle: 'Success',
    itemUpdated: 'Item Updated',
    itemUpdatedMessage: 'Added {{units}} {{unitType}} to existing item. New total: {{total}} {{unitType}}',
    combineItems: 'Combine Identical Items',
    combineItemsDescription: 'When enabled, items with same name and price will be combined',
    monthlySalesTracking: 'Monthly Sales Tracking',
    yearlyTotal: 'Yearly Total',
    date: 'Date',
    dailySaleAmount: 'Daily Sale Amount',
    monthlyTotal: 'Monthly Total',
    deleteMonth: 'Delete Month',
    deleteMonthConfirm: 'Are you sure you want to delete all sales data for',
    salesDataSaved: 'Sales data saved successfully',
    monthlySalesInfo: 'Monthly Sales Tracking is independent of daily inventory records. Use it to track overall monthly sales, purchases, or any other financial data.',
    longPressToRename: 'Long press store name to rename',
    storeName: 'Store',
    addNewStore: 'Add New Store',
    subtotal: 'Subtotal',
    tax: 'Tax',
    receiptCreator: 'Receipt Creator',
    receiptCreatorPlaceholder: 'Receipt Creator Name',
    receipt: 'Receipt',
    items: 'Items',
    customerName: 'Customer',
    cart: 'Shopping Cart',
    emptyCart: 'Your cart is empty',
    addItemsFromList: 'Add items from the list',
    customerInformation: 'Customer Information (Optional)',
    checkout: 'Checkout',
    addToCart: 'Add to Cart',
    receiptCreated: 'Success',
    receiptSaved: 'Receipt created successfully!',
    printReceipt: 'Print',
    takeOrder: 'Take Order',
    receiptHistory: 'Receipt History',
    voided: 'Voided',
    markAsVoided: 'Mark as Voided',
    unmarkAsVoided: 'Unmark as Voided',
    receiptNumber: 'Receipt #',
    viewReceiptHistory: 'View receipt history',
    taxSettings: 'Tax Settings',
    taxType: 'Tax Type',
    taxPercentage: 'Percentage (%)',
    taxFixedAmount: 'Fixed Amount',
    taxValue: 'Tax Value',
    exportDailyReceipts: 'Export Day\'s Receipts',
    receiptsOnDate: '{{count}} receipts on {{date}}',
    noReceiptsOnDate: 'No receipts on this date',
    loadMoreReceipts: 'Load More Receipts',
    dailyReceiptsReport: 'Daily Receipts Report',
    totalReceipts: 'Total Receipts',
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
    currency: '€',
    totalAmount: 'Cantidad Total',
    category: 'Categoría',
    unitType: 'Tipo de Unidad',
    save: 'Guardar',
    cancel: 'Cancelar',
    dailyTotal: 'Total Diario',
    noItems: 'No hay artículos para esta fecha',
    all: 'Todos',
    sharePDF: 'Compartir como PDF',
    confirmDay: 'Confirmar Día',
    dayConfirmed: 'Día Confirmado',
    sortByName: 'Nombre',
    sortByPrice: 'Precio',
    sortByAmount: 'Cantidad Total',
    sortByTime: 'Tiempo de Creación',
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
    bulkActions: 'Acciones Masivas',
    managePredefined: 'Administre su colección de artículos predefinidos',
    bulkAddItems: 'Agregar Artículos Masivamente',
    bulkAddDescription: 'Agregar múltiples artículos a la vez',
    createCustomItem: 'Crear Artículo Personalizado',
    createCustomDescription: 'Crear un nuevo artículo personalizado',
    exportCSV: 'Exportar como CSV',
    exportCSVDescription: 'Guardar todos los artículos en archivo CSV',
    importCSV: 'Importar CSV',
    importCSVDescription: 'Cargar artículos desde archivo CSV',
    deleteAllItems: 'Eliminar Todos los Artículos',
    deleteAllDescription: 'Eliminar todos los artículos predefinidos',
    showingItems: 'Mostrando {{count}} de {{total}} artículos filtrados ({{all}} total)',
    tapToViewReceipt: 'Toque para ver el resumen diario',
    bulkActions: 'Acciones Masivas',
    managePredefined: 'Administre su colección de artículos predefinidos',
    bulkAddItems: 'Agregar Artículos Masivamente',
    bulkAddDescription: 'Agregar múltiples artículos a la vez',
    createCustomItem: 'Crear Artículo Personalizado',
    createCustomDescription: 'Crear un nuevo artículo personalizado',
    exportCSV: 'Exportar como CSV',
    exportCSVDescription: 'Guardar todos los artículos en archivo CSV',
    importCSV: 'Importar CSV',
    importCSVDescription: 'Cargar artículos desde archivo CSV',
    deleteAllItems: 'Eliminar Todos los Artículos',
    deleteAllDescription: 'Eliminar todos los artículos predefinidos',
    totalItems: 'Artículos Totales',
    delete: 'Eliminar',
    deleteItem: 'Eliminar Artículo',
    deleteItemConfirm: '¿Está seguro de que desea eliminar este artículo de los artículos predefinidos?',
    deleteAllConfirm: '¿Está seguro de que desea eliminar todos los {{count}} artículos predefinidos? Esta acción no se puede deshacer.',
    bulkAddInstructions: 'Ingrese un artículo por línea. Puede usar formatos como:\n- Manzana\n- Plátano, Comida, lb\n- Café, Bebidas, kg',
    bulkAddDefaults: 'Valores predeterminados para artículos sin categoría/unidad',
    deleteItem: 'Eliminar Artículo',
    deleteItemConfirm: '¿Está seguro de que desea eliminar este artículo de los artículos predefinidos?',
    itemDeletedSuccess: 'Artículo eliminado exitosamente',
    successTitle: 'Éxito',
    itemUpdated: 'Artículo Actualizado',
    itemUpdatedMessage: 'Se agregaron {{units}} {{unitType}} al artículo existente. Nuevo total: {{total}} {{unitType}}',
    combineItems: 'Combinar Artículos Idénticos',
    combineItemsDescription: 'Cuando está habilitado, los artículos con el mismo nombre y precio se combinarán',
    monthlySalesTracking: 'Seguimiento de Ventas Mensuales',
    yearlyTotal: 'Total Anual',
    date: 'Fecha',
    dailySaleAmount: 'Monto de Venta Diaria',
    monthlyTotal: 'Total Mensual',
    deleteMonth: 'Eliminar Mes',
    deleteMonthConfirm: '¿Está seguro de que desea eliminar todos los datos de ventas para',
    salesDataSaved: 'Datos de ventas guardados exitosamente',
    monthlySalesInfo: 'El seguimiento de ventas mensuales es independiente de los registros de inventario diario. Úselo para rastrear ventas mensuales generales, compras o cualquier otro dato financiero.',
    longPressToRename: 'Mantén presionado el nombre de la tienda para renombrar',
    storeName: 'Tienda',
    addNewStore: 'Agregar Nueva Tienda',
    subtotal: 'Subtotal',
    tax: 'Impuesto',
    receiptCreator: 'Creador de Recibo',
    receiptCreatorPlaceholder: 'Nombre del Creador de Recibo',
    receipt: 'Recibo',
    items: 'Artículos',
    customerName: 'Cliente',
    cart: 'Carrito de Compras',
    emptyCart: 'Tu carrito está vacío',
    addItemsFromList: 'Agregar artículos de la lista',
    customerInformation: 'Información del Cliente (Opcional)',
    checkout: 'Pagar',
    addToCart: 'Agregar al Carrito',
    receiptCreated: 'Éxito',
    receiptSaved: '¡Recibo creado exitosamente!',
    printReceipt: 'Imprimir',
    takeOrder: 'Tomar Pedido',
    receiptHistory: 'Historial de Recibos',
    voided: 'Anulado',
    markAsVoided: 'Marcar como Anulado',
    unmarkAsVoided: 'Desmarcar como Anulado',
    receiptNumber: 'Recibo #',
    viewReceiptHistory: 'Ver historial de recibos',
    taxSettings: 'Configuración de Impuestos',
    taxType: 'Tipo de Impuesto',
    taxPercentage: 'Porcentaje (%)',
    taxFixedAmount: 'Monto Fijo',
    taxValue: 'Valor del Impuesto',
    exportDailyReceipts: 'Exportar Recibos del Día',
    receiptsOnDate: '{{count}} recibos en {{date}}',
    noReceiptsOnDate: 'No hay recibos en esta fecha',
    loadMoreReceipts: 'Cargar Más Recibos',
    dailyReceiptsReport: 'Informe de Recibos Diarios',
    totalReceipts: 'Total de Recibos',
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
    currency: '€',
    totalAmount: 'Montant Total',
    category: 'Catégorie',
    unitType: 'Type d\'Unité',
    save: 'Sauvegarder',
    cancel: 'Annuler',
    dailyTotal: 'Total Quotidien',
    noItems: 'Aucun article pour cette date',
    all: 'Tous',
    sharePDF: 'Partager en PDF',
    confirmDay: 'Confirmer le Jour',
    dayConfirmed: 'Jour Confirmé',
    sortByName: 'Nom',
    sortByPrice: 'Prix',
    sortByAmount: 'Montant Total',
    sortByTime: 'Heure de Création',
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
    showingItems: 'Affichage de {{count}} sur {{total}} articles filtrés ({{all}} total)',
    bulkActions: 'Actions en Masse',
    managePredefined: 'Gérez votre collection d\'articles prédéfinis',
    bulkAddItems: 'Ajouter des Articles en Masse',
    bulkAddDescription: 'Ajouter plusieurs articles à la fois',
    createCustomItem: 'Créer un Article Personnalisé',
    createCustomDescription: 'Créer un nouvel article personnalisé',
    exportCSV: 'Exporter en CSV',
    exportCSVDescription: 'Enregistrer tous les articles dans un fichier CSV',
    importCSV: 'Importer CSV',
    importCSVDescription: 'Charger des articles depuis un fichier CSV',
    deleteAllItems: 'Supprimer Tous les Articles',
    deleteAllDescription: 'Supprimer tous les articles prédéfinis',
    totalItems: 'Total des Articles',
    delete: 'Supprimer',
    deleteItem: 'Supprimer l\'Article',
    deleteItemConfirm: 'Êtes-vous sûr de vouloir supprimer cet article des articles prédéfinis?',
    deleteAllConfirm: 'Êtes-vous sûr de vouloir supprimer tous les {{count}} articles prédéfinis? Cette action ne peut pas être annulée.',
    bulkAddInstructions: 'Entrez un article par ligne. Vous pouvez utiliser des formats comme:\n- Pomme\n- Banane, Nourriture, lb\n- Café, Boissons, kg',
    bulkAddDefaults: 'Valeurs par défaut pour les articles sans catégorie/unité',
    deleteItem: 'Supprimer l\'Article',
    deleteItemConfirm: 'Êtes-vous sûr de vouloir supprimer cet article des articles prédéfinis?',
    itemDeletedSuccess: 'Article supprimé avec succès',
    successTitle: 'Succès',
    itemUpdated: 'Article Mis à Jour',
    itemUpdatedMessage: '{{units}} {{unitType}} ajoutés à l\'article existant. Nouveau total: {{total}} {{unitType}}',
    combineItems: 'Combiner les Articles Identiques',
    combineItemsDescription: 'Lorsqu\'activé, les articles avec le même nom et prix seront combinés',
    monthlySalesTracking: 'Suivi des Ventes Mensuelles',
    yearlyTotal: 'Total Annuel',
    date: 'Date',
    dailySaleAmount: 'Montant des Ventes Quotidiennes',
    monthlyTotal: 'Total Mensuel',
    deleteMonth: 'Supprimer le Mois',
    deleteMonthConfirm: 'Êtes-vous sûr de vouloir supprimer toutes les données de ventes pour',
    salesDataSaved: 'Données de ventes enregistrées avec succès',
    monthlySalesInfo: 'Le suivi des ventes mensuelles est indépendant des enregistrements d\'inventaire quotidiens. Utilisez-le pour suivre les ventes mensuelles globales, les achats ou toute autre donnée financière.',
    longPressToRename: 'Appuyez longuement sur le nom du magasin pour renommer',
    storeName: 'Magasin',
    addNewStore: 'Ajouter un Nouveau Magasin',
    subtotal: 'Sous-total',
    tax: 'Taxe',
    receiptCreator: 'Créateur de Reçu',
    receiptCreatorPlaceholder: 'Nom du Créateur de Reçu',
    receipt: 'Reçu',
    items: 'Articles',
    customerName: 'Client',
    cart: 'Panier',
    emptyCart: 'Votre panier est vide',
    addItemsFromList: 'Ajouter des articles de la liste',
    customerInformation: 'Informations Client (Optionnel)',
    checkout: 'Payer',
    addToCart: 'Ajouter au Panier',
    receiptCreated: 'Succès',
    receiptSaved: 'Reçu créé avec succès!',
    printReceipt: 'Imprimer',
    takeOrder: 'Prendre une Commande',
    tapToViewReceipt: 'Appuyez pour voir le résumé quotidien',
    receiptHistory: 'Historique des Reçus',
    voided: 'Annulé',
    markAsVoided: 'Marquer comme Annulé',
    unmarkAsVoided: 'Démarquer comme Annulé',
    receiptNumber: 'Reçu #',
    viewReceiptHistory: 'Voir l\'historique des reçus',
    taxSettings: 'Paramètres de Taxe',
    taxType: 'Type de Taxe',
    taxPercentage: 'Pourcentage (%)',
    taxFixedAmount: 'Montant Fixe',
    taxValue: 'Valeur de la Taxe',
    exportDailyReceipts: 'Exporter les Reçus du Jour',
    receiptsOnDate: '{{count}} reçus le {{date}}',
    noReceiptsOnDate: 'Aucun reçu à cette date',
    loadMoreReceipts: 'Charger Plus de Reçus',
    dailyReceiptsReport: 'Rapport des Reçus Quotidiens',
    totalReceipts: 'Total des Reçus',
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
    currency: '€',
    totalAmount: 'Gesamtbetrag',
    category: 'Kategorie',
    unitType: 'Einheitentyp',
    save: 'Speichern',
    cancel: 'Abbrechen',
    dailyTotal: 'Tagesgesamt',
    noItems: 'Keine Artikel für dieses Datum',
    all: 'Alle',
    sharePDF: 'Als PDF teilen',
    confirmDay: 'Tag Bestätigen',
    dayConfirmed: 'Tag Bestätigt',
    sortByName: 'Name',
    sortByPrice: 'Preis',
    sortByAmount: 'Gesamtbetrag',
    sortByTime: 'Erstellungszeit',
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
    showingItems: 'Zeige {{count}} von {{total}} gefilterten Artikeln ({{all}} gesamt)',
    bulkActions: 'Massenaktionen',
    managePredefined: 'Verwalten Sie Ihre vordefinierte Artikelsammlung',
    bulkAddItems: 'Artikel in Masse Hinzufügen',
    bulkAddDescription: 'Mehrere Artikel auf einmal hinzufügen',
    createCustomItem: 'Benutzerdefinierten Artikel Erstellen',
    createCustomDescription: 'Neuen benutzerdefinierten Artikel erstellen',
    exportCSV: 'Als CSV Exportieren',
    exportCSVDescription: 'Alle Artikel in CSV-Datei speichern',
    importCSV: 'CSV Importieren',
    importCSVDescription: 'Artikel aus CSV-Datei laden',
    deleteAllItems: 'Alle Artikel Löschen',
    deleteAllDescription: 'Alle vordefinierten Artikel entfernen',
    totalItems: 'Artikel Gesamt',
    delete: 'Löschen',
    deleteItem: 'Artikel Löschen',
    deleteItemConfirm: 'Sind Sie sicher, dass Sie diesen Artikel aus den vordefinierten Artikeln löschen möchten?',
    deleteAllConfirm: 'Sind Sie sicher, dass Sie alle {{count}} vordefinierten Artikel löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.',
    bulkAddInstructions: 'Geben Sie einen Artikel pro Zeile ein. Sie können Formate verwenden wie:\n- Apfel\n- Banane, Essen, lb\n- Kaffee, Getränke, kg',
    bulkAddDefaults: 'Standardwerte für Artikel ohne Kategorie/Einheit',
    deleteItem: 'Artikel Löschen',
    deleteItemConfirm: 'Sind Sie sicher, dass Sie diesen Artikel aus den vordefinierten Artikeln löschen möchten?',
    itemDeletedSuccess: 'Artikel erfolgreich gelöscht',
    successTitle: 'Erfolg',
    itemUpdated: 'Artikel Aktualisiert',
    itemUpdatedMessage: '{{units}} {{unitType}} zum vorhandenen Artikel hinzugefügt. Neue Summe: {{total}} {{unitType}}',
    combineItems: 'Identische Artikel Kombinieren',
    combineItemsDescription: 'Wenn aktiviert, werden Artikel mit gleichem Namen und Preis kombiniert',
    monthlySalesTracking: 'Monatliche Umsatzverfolgung',
    yearlyTotal: 'Jahresgesamt',
    date: 'Datum',
    dailySaleAmount: 'Täglicher Verkaufsbetrag',
    monthlyTotal: 'Monatssumme',
    deleteMonth: 'Monat Löschen',
    deleteMonthConfirm: 'Sind Sie sicher, dass Sie alle Verkaufsdaten für löschen möchten',
    salesDataSaved: 'Verkaufsdaten erfolgreich gespeichert',
    monthlySalesInfo: 'Die monatliche Umsatzverfolgung ist unabhängig von den täglichen Bestandsaufzeichnungen.  Verwenden Sie es, um Gesamtumsätze, Einkäufe oder andere Finanzdaten zu verfolgen.',
    longPressToRename: 'Lange drücken, um den Shopnamen zu ändern',
    storeName: 'Geschäft',
    addNewStore: 'Neues Geschäft Hinzufügen',
    subtotal: 'Zwischensumme',
    tax: 'Steuer',
    receiptCreator: 'Belegersteller',
    receiptCreatorPlaceholder: 'Name des Belegerstellers',
    receipt: 'Beleg',
    items: 'Artikel',
    customerName: 'Kunde',
    cart: 'Warenkorb',
    emptyCart: 'Ihr Warenkorb ist leer',
    addItemsFromList: 'Artikel aus der Liste hinzufügen',
    customerInformation: 'Kundeninformationen (Optional)',
    checkout: 'Zur Kasse',
    addToCart: 'In den Warenkorb',
    receiptCreated: 'Erfolg',
    receiptSaved: 'Beleg erfolgreich erstellt!',
    printReceipt: 'Drucken',
    takeOrder: 'Bestellung aufgeben',
    tapToViewReceipt: 'Tippen Sie, um die tägliche Zusammenfassung anzuzeigen',
    receiptHistory: 'Belegverlauf',
    voided: 'Ungültig',
    markAsVoided: 'Als ungültig markieren',
    unmarkAsVoided: 'Ungültig-Markierung entfernen',
    receiptNumber: 'Beleg #',
    viewReceiptHistory: 'Belegverlauf anzeigen',
    taxSettings: 'Steuereinstellungen',
    taxType: 'Steuertyp',
    taxPercentage: 'Prozentsatz (%)',
    taxFixedAmount: 'Fester Betrag',
    taxValue: 'Steuerwert',
    exportDailyReceipts: 'Tagesbelege Exportieren',
    receiptsOnDate: '{{count}} Belege am {{date}}',
    noReceiptsOnDate: 'Keine Belege an diesem Datum',
    loadMoreReceipts: 'Weitere Belege Laden',
    dailyReceiptsReport: 'Täglicher Belegbericht',
    totalReceipts: 'Gesamtbelege',
  },
  it: {
    appTitle: 'Gestione Inventario',
    searchPlaceholder: 'Cerca articoli...',
    filterByCategory: 'Filtra per Categoria',
    sortBy: 'Ordina per',
    addItem: 'Aggiungi Articolo',
    itemName: 'Nome Articolo',
    price: 'Prezzo',
    unitsSold: 'Unità Vendute',
    currency: '€',
    totalAmount: 'Totale',
    category: 'Categoria',
    unitType: 'Tipo di Unità',
    save: 'Salva',
    cancel: 'Annulla',
    dailyTotal: 'Totale Giornaliero',
    noItems: 'Nessun articolo per questa data',
    all: 'Tutti',
    sharePDF: 'Condividi come PDF',
    confirmDay: 'Conferma Giorno',
    dayConfirmed: 'Giorno Confermato',
    sortByName: 'Nome',
    sortByPrice: 'Prezzo',
    sortByAmount: 'Totale',
    sortByTime: 'Data di Creazione',
    filters: 'Filtri',
    sort: 'Ordina',
    selectCategory: 'Seleziona Categoria',
    selectSortOption: 'Seleziona Opzione Ordinamento',
    selectUnitType: 'Seleziona Tipo Unità',
    customItem: 'Crea Articolo Personalizzato',
    predefinedItems: 'Seleziona Articolo Predefinito',
    selectItemType: 'Seleziona Tipo Articolo',
    dailySummary: 'Riepilogo Vendite Giornaliere',
    shareViaEmail: 'Condividi via Email',
    shareViaText: 'Condividi via SMS',
    close: 'Chiudi',
    settings: 'Impostazioni',
    language: 'Lingua',
    appTitleSetting: 'Titolo App',
    profile: 'Profilo',
    showingItems: 'Mostrando {{count}} di {{total}} articoli filtrati ({{all}} totale)',
    bulkActions: 'Azioni di Massa',
    managePredefined: 'Gestisci la tua collezione di articoli predefiniti',
    bulkAddItems: 'Aggiungi Articoli in Massa',
    bulkAddDescription: 'Aggiungi più articoli contemporaneamente',
    createCustomItem: 'Crea Articolo Personalizzato',
    createCustomDescription: 'Crea un nuovo articolo personalizzato',
    exportCSV: 'Esporta come CSV',
    exportCSVDescription: 'Salva tutti gli articoli in file CSV',
    importCSV: 'Importa CSV',
    importCSVDescription: 'Carica articoli da file CSV',
    deleteAllItems: 'Elimina Tutti gli Articoli',
    deleteAllDescription: 'Rimuovi tutti gli articoli predefiniti',
    totalItems: 'Articoli Totali',
    delete: 'Elimina',
    deleteItem: 'Elimina Articolo',
    deleteItemConfirm: 'Sei sicuro di voler eliminare questo articolo dagli articoli predefiniti?',
    deleteAllConfirm: 'Sei sicuro di voler eliminare tutti i {{count}} articoli predefiniti? Questa azione non può essere annullata.',
    bulkAddInstructions: 'Inserisci un articolo per riga. Puoi usare formati come:\n- Mela\n- Banana, Cibo, lb\n- Caffè, Bevande, kg',
    bulkAddDefaults: 'Valori predefiniti per articoli senza categoria/unità',
    deleteItem: 'Elimina Articolo',
    deleteItemConfirm: 'Sei sicuro di voler eliminare questo articolo dagli articoli predefiniti?',
    itemDeletedSuccess: 'Articolo eliminato con successo',
    successTitle: 'Successo',
    itemUpdated: 'Articolo Aggiornato',
    itemUpdatedMessage: 'Aggiunti {{units}} {{unitType}} all\'articolo esistente. Nuovo totale: {{total}} {{unitType}}',
    combineItems: 'Combina Articoli Identici',
    combineItemsDescription: 'Quando abilitato, gli articoli con lo stesso nome e prezzo verranno combinati',
    monthlySalesTracking: 'Monitoraggio Vendite Mensili',
    yearlyTotal: 'Totale Annuale',
    date: 'Data',
    dailySaleAmount: 'Importo Vendite Giornaliere',
    monthlyTotal: 'Totale Mensile',
    deleteMonth: 'Elimina Mese',
    deleteMonthConfirm: 'Sei sicuro di voler eliminare tutti i dati di vendita per',
    salesDataSaved: 'Dati di vendita salvati con successo',
    monthlySalesInfo: 'Il monitoraggio delle vendite mensili è indipendente dai registri di inventario giornalieri. Usalo per tracciare vendite mensili complessive, acquisti o altri dati finanziari.',
    longPressToRename: 'Premere a lungo il nome del negozio per rinominare',
    storeName: 'Negozio',
    addNewStore: 'Aggiungi Nuovo Negozio',
    subtotal: 'Subtotale',
    tax: 'Tassa',
    receiptCreator: 'Creatore Ricevuta',
    receiptCreatorPlaceholder: 'Nome Creatore Ricevuta',
    receipt: 'Ricevuta',
    items: 'Articoli',
    customerName: 'Cliente',
    cart: 'Carrello',
    emptyCart: 'Il tuo carrello è vuoto',
    addItemsFromList: 'Aggiungi articoli dalla lista',
    customerInformation: 'Informazioni Cliente (Opzionale)',
    checkout: 'Checkout',
    addToCart: 'Aggiungi al Carrello',
    receiptCreated: 'Successo',
    receiptSaved: 'Ricevuta creata con successo!',
    printReceipt: 'Stampa',
    takeOrder: 'Prendi Ordine',
    tapToViewReceipt: 'Tocca per visualizzare il riepilogo quotidiano',
    receiptHistory: 'Cronologia Ricevute',
    voided: 'Annullato',
    markAsVoided: 'Contrassegna come Annullato',
    unmarkAsVoided: 'Rimuovi Annullamento',
    receiptNumber: 'Ricevuta #',
    viewReceiptHistory: 'Visualizza cronologia ricevute',
    taxSettings: 'Impostazioni Fiscali',
    taxType: 'Tipo di Imposta',
    taxPercentage: 'Percentuale (%)',
    taxFixedAmount: 'Importo Fisso',
    taxValue: 'Valore Fiscale',
    exportDailyReceipts: 'Esporta Ricevute del Giorno',
    receiptsOnDate: '{{count}} ricevute il {{date}}',
    noReceiptsOnDate: 'Nessuna ricevuta in questa data',
    loadMoreReceipts: 'Carica Più Ricevute',
    dailyReceiptsReport: 'Rapporto Ricevute Giornaliere',
    totalReceipts: 'Totale Ricevute',
  },
  pt: {
    appTitle: 'Gestão de Inventário',
    searchPlaceholder: 'Pesquisar itens...',
    filterByCategory: 'Filtrar por Categoria',
    sortBy: 'Ordenar por',
    addItem: 'Adicionar Item',
    itemName: 'Nome do Item',
    price: 'Preço',
    unitsSold: 'Unidades Vendidas',
    currency: 'R$',
    totalAmount: 'Valor Total',
    category: 'Categoria',
    unitType: 'Tipo de Unidade',
    save: 'Salvar',
    cancel: 'Cancelar',
    dailyTotal: 'Total Diário',
    noItems: 'Nenhum item para esta data',
    all: 'Todos',
    sharePDF: 'Compartilhar como PDF',
    confirmDay: 'Confirmar Dia',
    dayConfirmed: 'Dia Confirmado',
    sortByName: 'Nome',
    sortByPrice: 'Preço',
    sortByAmount: 'Valor Total',
    sortByTime: 'Hora de Criação',
    filters: 'Filtros',
    sort: 'Ordenar',
    selectCategory: 'Selecionar Categoria',
    selectSortOption: 'Selecionar Opção de Ordenação',
    selectUnitType: 'Selecionar Tipo de Unidade',
    customItem: 'Criar Item Personalizado',
    predefinedItems: 'Selecionar Item Predefinido',
    selectItemType: 'Selecionar Tipo de Item',
    dailySummary: 'Resumo de Vendas Diárias',
    shareViaEmail: 'Compartilhar por Email',
    shareViaText: 'Compartilhar por SMS',
    close: 'Fechar',
    settings: 'Configurações',
    language: 'Idioma',
    appTitleSetting: 'Título do App',
    profile: 'Perfil',
    showingItems: 'Mostrando {{count}} de {{total}} itens filtrados ({{all}} total)',
    bulkActions: 'Ações em Massa',
    managePredefined: 'Gerencie sua coleção de itens predefinidos',
    bulkAddItems: 'Adicionar Itens em Massa',
    bulkAddDescription: 'Adicionar vários itens de uma vez',
    createCustomItem: 'Criar Item Personalizado',
    createCustomDescription: 'Criar um novo item personalizado',
    exportCSV: 'Exportar como CSV',
    exportCSVDescription: 'Salvar todos os itens em arquivo CSV',
    importCSV: 'Importar CSV',
    importCSVDescription: 'Carregar itens de arquivo CSV',
    deleteAllItems: 'Excluir Todos os Itens',
    deleteAllDescription: 'Remover todos os itens predefinidos',
    totalItems: 'Total de Itens',
    delete: 'Excluir',
    deleteItem: 'Excluir Item',
    deleteItemConfirm: 'Tem certeza de que deseja excluir este item dos itens predefinidos?',
    deleteAllConfirm: 'Tem certeza de que deseja excluir todos os {{count}} itens predefinidos? Esta ação não pode ser desfeita.',
    bulkAddInstructions: 'Digite um item por linha. Você pode usar formatos como:\n- Maçã\n- Banana, Comida, lb\n- Café, Bebidas, kg',
    bulkAddDefaults: 'Valores padrão para itens sem categoria/unidade',
    deleteItem: 'Excluir Item',
    deleteItemConfirm: 'Tem certeza de que deseja excluir este item dos itens predefinidos?',
    itemDeletedSuccess: 'Item excluído com sucesso',
    successTitle: 'Sucesso',
    itemUpdated: 'Item Atualizado',
    itemUpdatedMessage: 'Adicionados {{units}} {{unitType}} ao item existente. Novo total: {{total}} {{unitType}}',
    combineItems: 'Combinar Itens Idênticos',
    combineItemsDescription: 'Quando ativado, itens com o mesmo nome e preço serão combinados',
    monthlySalesTracking: 'Acompanhamento de Vendas Mensais',
    yearlyTotal: 'Total Anual',
    date: 'Data',
    dailySaleAmount: 'Valor de Vendas Diárias',
    monthlyTotal: 'Total Mensal',
    deleteMonth: 'Excluir Mês',
    deleteMonthConfirm: 'Tem certeza de que deseja excluir todos os dados de vendas para',
    salesDataSaved: 'Dados de vendas salvos com sucesso',
    monthlySalesInfo: 'O acompanhamento de vendas mensais é independente dos registros de inventário diário. Use-o para rastrear vendas mensais gerais, compras ou quaisquer outros dados financeiros.',
    longPressToRename: 'Pressione longamente o nome da loja para renomear',
    storeName: 'Loja',
    addNewStore: 'Adicionar Nova Loja',
    subtotal: 'Subtotal',
    tax: 'Imposto',
    receiptCreator: 'Criador de Recibo',
    receiptCreatorPlaceholder: 'Nome do Criador de Recibo',
    receipt: 'Recibo',
    items: 'Itens',
    customerName: 'Cliente',
    cart: 'Carrinho de Compras',
    emptyCart: 'Seu carrinho está vazio',
    addItemsFromList: 'Adicionar itens da lista',
    customerInformation: 'Informações do Cliente (Opcional)',
    checkout: 'Finalizar Compra',
    addToCart: 'Adicionar ao Carrinho',
    receiptCreated: 'Sucesso',
    receiptSaved: 'Recibo criado com sucesso!',
    printReceipt: 'Imprimir',
    takeOrder: 'Fazer Pedido',
    tapToViewReceipt: 'Toque para ver o resumo diário',
    receiptHistory: 'Histórico de Recibos',
    voided: 'Anulado',
    markAsVoided: 'Marcar como Anulado',
    unmarkAsVoided: 'Desmarcar como Anulado',
    receiptNumber: 'Recibo #',
    viewReceiptHistory: 'Ver histórico de recibos',
    taxSettings: 'Configurações de Impostos',
    taxType: 'Tipo de Imposto',
    taxPercentage: 'Porcentagem (%)',
    taxFixedAmount: 'Valor Fixo',
    taxValue: 'Valor do Imposto',
    exportDailyReceipts: 'Exportar Recibos do Dia',
    receiptsOnDate: '{{count}} recibos em {{date}}',
    noReceiptsOnDate: 'Nenhum recibo nesta data',
    loadMoreReceipts: 'Carregar Mais Recibos',
    dailyReceiptsReport: 'Relatório de Recibos Diários',
    totalReceipts: 'Total de Recibos',
  },
  zh: {
    appTitle: '库存管理',
    searchPlaceholder: '搜索物品...',
    filterByCategory: '按类别筛选',
    sortBy: '排序方式',
    addItem: '添加物品',
    itemName: '物品名称',
    price: '价格',
    unitsSold: '已售数量',
    currency: '¥',
    totalAmount: '总金额',
    category: '类别',
    unitType: '单位类型',
    save: '保存',
    cancel: '取消',
    dailyTotal: '每日总计',
    noItems: '此日期没有物品',
    all: '全部',
    sharePDF: '分享为PDF',
    confirmDay: '确认日期',
    dayConfirmed: '已确认',
    sortByName: '名称',
    sortByPrice: '价格',
    sortByAmount: '总金额',
    sortByTime: '创建时间',
    filters: '筛选',
    sort: '排序',
    selectCategory: '选择类别',
    selectSortOption: '选择排序选项',
    selectUnitType: '选择单位类型',
    customItem: '创建自定义物品',
    predefinedItems: '选择预定义物品',
    selectItemType: '选择物品类型',
    dailySummary: '每日销售摘要',
    shareViaEmail: '通过电子邮件分享',
    shareViaText: '通过短信分享',
    close: '关闭',
    settings: '设置',
    language: '语言',
    appTitleSetting: '应用标题',
    profile: '个人资料',
    bulkActions: '批量操作',
    managePredefined: '管理您的预定义物品集合',
    bulkAddItems: '批量添加物品',
    bulkAddDescription: '一次添加多个物品',
    createCustomItem: '创建自定义物品',
    createCustomDescription: '创建新的自定义物品',
    exportCSV: '导出为CSV',
    exportCSVDescription: '将所有物品保存到CSV文件',
    importCSV: '导入CSV',
    importCSVDescription: '从CSV文件加载物品',
    deleteAllItems: '删除所有物品',
    deleteAllDescription: '删除所有预定义物品',
    showingItems: '显示 {{count}} / {{total}} 已筛选物品（共 {{all}} 个）',
    tapToViewReceipt: '点击查看收据',
    deleteItem: '删除物品',
    deleteItemConfirm: '您确定要从预定义物品中删除此物品吗？',
    itemDeletedSuccess: '物品删除成功',
    successTitle: '成功',
    itemUpdated: '物品已更新',
    itemUpdatedMessage: '已添加 {{units}} {{unitType}} 到现有物品。新总计: {{total}} {{unitType}}',
    combineItems: '合并相同物品',
    combineItemsDescription: '启用后，名称和价格相同的物品将被合并',
    monthlySalesTracking: '每月销售跟踪',
    yearlyTotal: '年度总计',
    date: '日期',
    dailySaleAmount: '每日销售额',
    monthlyTotal: '月度总计',
    deleteMonth: '删除月份',
    deleteMonthConfirm: '您确定要删除以下月份的所有销售数据吗',
    salesDataSaved: '销售数据保存成功',
    monthlySalesInfo: '月度销售跟踪独立于每日库存记录。使用它来跟踪整体月度销售、采购或任何其他财务数据。',
    longPressToRename: '长按商店名称以重命名',
    storeName: '商店',
    addNewStore: '添加新商店',
    subtotal: '小计',
    tax: '税',
    receiptCreator: '收据创建者',
    receiptCreatorPlaceholder: '收据创建者姓名',
    receipt: '收据',
    items: '商品',
    customerName: '客户',
    cart: '购物车',
    emptyCart: '您的购物车是空的',
    addItemsFromList: '从列表中添加商品',
    customerInformation: '客户信息（可选）',
    checkout: '结账',
    addToCart: '加入购物车',
    receiptCreated: '成功',
    receiptSaved: '收据创建成功！',
    printReceipt: '打印',
    takeOrder: '接受订单',
    tapToViewReceipt: '点击查看每日总结',
    receiptHistory: '收据历史',
    voided: '已作废',
    markAsVoided: '标记为已作废',
    unmarkAsVoided: '取消作废标记',
    receiptNumber: '收据 #',
    viewReceiptHistory: '查看收据历史',
    taxSettings: '税务设置',
    taxType: '税务类型',
    taxPercentage: '百分比 (%)',
    taxFixedAmount: '固定金额',
    taxValue: '税值',
    exportDailyReceipts: '导出当日收据',
    receiptsOnDate: '{{date}} 有 {{count}} 张收据',
    noReceiptsOnDate: '此日期没有收据',
    loadMoreReceipts: '加载更多收据',
    dailyReceiptsReport: '每日收据报告',
    totalReceipts: '收据总数',
  },
  ja: {
    appTitle: '在庫管理',
    searchPlaceholder: 'アイテムを検索...',
    filterByCategory: 'カテゴリーでフィルター',
    sortBy: '並べ替え',
    addItem: 'アイテムを追加',
    itemName: 'アイテム名',
    price: '価格',
    unitsSold: '販売数',
    currency: '¥',
    totalAmount: '合計金額',
    category: 'カテゴリー',
    unitType: '単位タイプ',
    save: '保存',
    cancel: 'キャンセル',
    dailyTotal: '日次合計',
    noItems: 'この日付にはアイテムがありません',
    all: 'すべて',
    sharePDF: 'PDFとして共有',
    confirmDay: '日を確認',
    dayConfirmed: '確認済み',
    sortByName: '名前',
    sortByPrice: '価格',
    sortByAmount: '合計金額',
    sortByTime: '作成日時',
    filters: 'フィルター',
    sort: '並べ替え',
    selectCategory: 'カテゴリーを選択',
    selectSortOption: '並べ替えオプションを選択',
    selectUnitType: '単位タイプを選択',
    customItem: 'カスタムアイテムを作成',
    predefinedItems: '事前定義アイテムを選択',
    selectItemType: 'アイテムタイプを選択',
    dailySummary: '日次販売概要',
    shareViaEmail: 'メールで共有',
    shareViaText: 'テキストで共有',
    close: '閉じる',
    settings: '設定',
    language: '言語',
    appTitleSetting: 'アプリタイトル',
    profile: 'プロフィール',
    bulkActions: '一括操作',
    managePredefined: '事前定義アイテムコレクションを管理',
    bulkAddItems: '一括アイテム追加',
    bulkAddDescription: '複数のアイテムを一度に追加',
    createCustomItem: 'カスタムアイテムを作成',
    createCustomDescription: '新しいカスタムアイテムを作成',
    exportCSV: 'CSVとしてエクスポート',
    exportCSVDescription: 'すべてのアイテムをCSVファイルに保存',
    importCSV: 'CSVをインポート',
    importCSVDescription: 'CSVファイルからアイテムを読み込む',
    deleteAllItems: 'すべてのアイテムを削除',
    deleteAllDescription: '事前定義アイテムをすべて削除',
    showingItems: '{{count}} / {{total}} 件の絞り込みアイテムを表示中（全 {{all}} 件）',
    tapToViewReceipt: 'タップしてレシートを表示',
    deleteItem: 'アイテムを削除',
    deleteItemConfirm: '事前定義アイテムからこのアイテムを削除してもよろしいですか？',
    itemDeletedSuccess: 'アイテムが正常に削除されました',
    successTitle: '成功',
    itemUpdated: 'アイテムが更新されました',
    itemUpdatedMessage: '既存のアイテムに {{units}} {{unitType}} を追加しました。新しい合計: {{total}} {{unitType}}',
    combineItems: '同一アイテムを結合',
    combineItemsDescription: '有効にすると、同じ名前と価格のアイテムが結合されます',
    monthlySalesTracking: '月次売上追跡',
    yearlyTotal: '年間合計',
    date: '日付',
    dailySaleAmount: '日次売上額',
    monthlyTotal: '月間合計',
    deleteMonth: '月を削除',
    deleteMonthConfirm: '以下の月の売上データをすべて削除してもよろしいですか',
    salesDataSaved: '売上データが正常に保存されました',
    monthlySalesInfo: '月次売上追跡は日次在庫記録とは独立しています。全体的な月次売上、購入、その他の財務データを追跡するために使用してください。',
    longPressToRename: '店舗名を長押しして名前を変更',
    storeName: '店舗',
    addNewStore: '新しい店舗を追加',
    subtotal: '小計',
    tax: '税',
    receiptCreator: 'レシート作成者',
    receiptCreatorPlaceholder: 'レシート作成者名',
    receipt: 'レシート',
    items: '商品',
    customerName: '顧客',
    cart: 'ショッピングカート',
    emptyCart: 'カートは空です',
    addItemsFromList: 'リストから商品を追加',
    customerInformation: '顧客情報（オプション）',
    checkout: 'チェックアウト',
    addToCart: 'カートに追加',
    receiptCreated: '成功',
    receiptSaved: 'レシートが正常に作成されました！',
    printReceipt: '印刷',
    takeOrder: '注文を受け付ける',
    tapToViewReceipt: 'タップして日次レポートを表示',
    receiptHistory: 'レシート履歴',
    voided: '無効',
    markAsVoided: '無効としてマーク',
    unmarkAsVoided: '無効マークを解除',
    receiptNumber: 'レシート #',
    viewReceiptHistory: 'レシート履歴を表示',
    taxSettings: '税金設定',
    taxType: '税金タイプ',
    taxPercentage: 'パーセンテージ (%)',
    taxFixedAmount: '固定金額',
    taxValue: '税額',
    exportDailyReceipts: '日次レシートをエクスポート',
    receiptsOnDate: '{{date}} に {{count}} 件のレシート',
    noReceiptsOnDate: 'この日付にレシートはありません',
    loadMoreReceipts: 'さらにレシートを読み込む',
    dailyReceiptsReport: '日次レシートレポート',
    totalReceipts: 'レシート総数',
  },
  ko: {
    appTitle: '재고 관리',
    searchPlaceholder: '품목 검색...',
    filterByCategory: '카테고리별 필터',
    sortBy: '정렬 기준',
    addItem: '품목 추가',
    itemName: '품목 이름',
    price: '가격',
    unitsSold: '판매 수량',
    currency: '₩',
    totalAmount: '총액',
    category: '카테고리',
    unitType: '단위 유형',
    save: '저장',
    cancel: '취소',
    dailyTotal: '일일 합계',
    noItems: '이 날짜에 품목이 없습니다',
    all: '전체',
    sharePDF: 'PDF로 공유',
    confirmDay: '날짜 확인',
    dayConfirmed: '확인됨',
    sortByName: '이름',
    sortByPrice: '가격',
    sortByAmount: '총액',
    sortByTime: '생성 시간',
    filters: '필터',
    sort: '정렬',
    selectCategory: '카테고리 선택',
    selectSortOption: '정렬 옵션 선택',
    selectUnitType: '단위 유형 선택',
    customItem: '맞춤 품목 만들기',
    predefinedItems: '사전 정의된 품목 선택',
    selectItemType: '품목 유형 선택',
    dailySummary: '일일 판매 요약',
    shareViaEmail: '이메일로 공유',
    shareViaText: '문자로 공유',
    close: '닫기',
    settings: '설정',
    language: '언어',
    appTitleSetting: '앱 제목',
    profile: '프로필',
    showingItems: '{{count}} / {{total}} 필터링된 항목 표시 중 (총 {{all}}개)',
    bulkActions: '일괄 작업',
    managePredefined: '사전 정의된 품목 컬렉션 관리',
    bulkAddItems: '일괄 품목 추가',
    bulkAddDescription: '여러 품목을 한 번에 추가',
    createCustomItem: '맞춤 품목 만들기',
    createCustomDescription: '새 맞춤 품목 만들기',
    exportCSV: 'CSV로 내보내기',
    exportCSVDescription: '모든 품목을 CSV 파일로 저장',
    importCSV: 'CSV 가져오기',
    importCSVDescription: 'CSV 파일에서 품목 로드',
    deleteAllItems: '모든 품목 삭제',
    deleteAllDescription: '사전 정의된 품목 모두 제거',
    totalItems: '총 품목',
    delete: '삭제',
    deleteItem: '품목 삭제',
    deleteItemConfirm: '사전 정의된 품목에서 이 품목을 삭제하시겠습니까?',
    deleteAllConfirm: '모든 {{count}}개의 사전 정의된 품목을 삭제하시겠습니까? 이 작업은 취소할 수 없습니다.',
    bulkAddInstructions: '한 줄에 하나의 품목을 입력하세요. 다음과 같은 형식을 사용할 수 있습니다:\n- 사과\n- 바나나, 식품, lb\n- 커피, 음료, kg',
    bulkAddDefaults: '카테고리/단위가 없는 품목의 기본값',
    deleteItem: '품목 삭제',
    deleteItemConfirm: '사전 정의된 품목에서 이 품목을 삭제하시겠습니까?',
    itemDeletedSuccess: '품목이 성공적으로 삭제되었습니다',
    successTitle: '성공',
    itemUpdated: '품목 업데이트됨',
    itemUpdatedMessage: '기존 품목에 {{units}} {{unitType}}이(가) 추가되었습니다. 새 합계: {{total}} {{unitType}}',
    combineItems: '동일한 품목 결합',
    combineItemsDescription: '활성화하면 이름과 가격이 같은 품목이 결합됩니다', 
    monthlySalesTracking: '월별 판매 추적',
    yearlyTotal: '연간 총계',
    date: '날짜',
    dailySaleAmount: '일일 판매 금액',
    monthlyTotal: '월간 총계',
    deleteMonth: '월 삭제',
    deleteMonthConfirm: '다음 월의 모든 판매 데이터를 삭제하시겠습니까',
    salesDataSaved: '판매 데이터가 성공적으로 저장되었습니다',
    monthlySalesInfo: '월별 판매 추적은 일일 재고 기록과 독립적입니다. 전체 월별 판매, 구매 또는 기타 재무 데이터를 추적하는 데 사용하세요.',
    longPressToRename: '매장 이름을 길게 눌러 이름 변경',
    storeName: '매장',
    addNewStore: '매장 추가',
    subtotal: '소계',
    tax: '세금',
    receiptCreator: '영수증 생성자',
    receiptCreatorPlaceholder: '영수증 생성자 이름',
    receipt: '영수증',
    items: '상품',
    customerName: '고객',
    cart: '장바구니',
    emptyCart: '장바구니가 비어 있습니다',
    addItemsFromList: '목록에서 상품 추가',
    customerInformation: '고객 정보 (선택 사항)',
    checkout: '결제',
    addToCart: '장바구니에 담기',
    receiptCreated: '성공',
    receiptSaved: '영수증이 성공적으로 생성되었습니다!',
    printReceipt: '인쇄',
    takeOrder: '주문 받기',
    tapToViewReceipt: '탭하여 일일 요약 보기',
    receiptHistory: '영수증 내역',
    voided: '무효화됨',
    markAsVoided: '무효로 표시',
    unmarkAsVoided: '무효 표시 해제',
    receiptNumber: '영수증 #',
    viewReceiptHistory: '영수증 내역 보기',
    taxSettings: '세금 설정',
    taxType: '세금 유형',
    taxPercentage: '백분율 (%)',
    taxFixedAmount: '고정 금액',
    taxValue: '세금 값',
    exportDailyReceipts: '오늘의 영수증 내보내기',
    receiptsOnDate: '{{date}}에 {{count}}개의 영수증',
    noReceiptsOnDate: '이 날짜에 영수증이 없습니다',
    loadMoreReceipts: '더 많은 영수증 로드',
    dailyReceiptsReport: '일일 영수증 보고서',
    totalReceipts: '총 영수증',
  },
  th: {
    appTitle: 'การจัดการสินค้าคงคลัง',
    searchPlaceholder: 'ค้นหาสินค้า...',
    filterByCategory: 'กรองตามหมวดหมู่',
    sortBy: 'เรียงตาม',
    addItem: 'เพิ่มสินค้า',
    itemName: 'ชื่อสินค้า',
    price: 'ราคา',
    unitsSold: 'จำนวนที่ขาย',
    currency: '฿',
    totalAmount: 'ยอดรวม',
    category: 'หมวดหมู่',
    unitType: 'ประเภทหน่วย',
    save: 'บันทึก',
    cancel: 'ยกเลิก',
    dailyTotal: 'ยอดรวมรายวัน',
    noItems: 'ไม่มีสินค้าในวันนี้',
    all: 'ทั้งหมด',
    sharePDF: 'แชร์เป็น PDF',
    confirmDay: 'ยืนยันวัน',
    dayConfirmed: 'ยืนยันแล้ว',
    sortByName: 'ชื่อ',
    sortByPrice: 'ราคา',
    sortByAmount: 'ยอดรวม',
    sortByTime: 'เวลาที่สร้าง',
    filters: 'ตัวกรอง',
    sort: 'เรียง',
    selectCategory: 'เลือกหมวดหมู่',
    selectSortOption: 'เลือกตัวเลือกการเรียง',
    selectUnitType: 'เลือกประเภทหน่วย',
    customItem: 'สร้างสินค้าที่กำหนดเอง',
    predefinedItems: 'เลือกสินค้าที่กำหนดไว้',
    selectItemType: 'เลือกประเภทสินค้า',
    dailySummary: 'สรุปยอดขายรายวัน',
    shareViaEmail: 'แชร์ทางอีเมล',
    shareViaText: 'แชร์ทางข้อความ',
    close: 'ปิด',
    settings: 'การตั้งค่า',
    language: 'ภาษา',
    appTitleSetting: 'ชื่อแอป',
    profile: 'โปรไฟล์',
    showingItems: 'แสดง {{count}} จาก {{total}} รายการที่กรอง ({{all}} ทั้งหมด)',
    bulkActions: 'การดำเนินการจำนวนมาก',
    managePredefined: 'จัดการคอลเลกชันสินค้าที่กำหนดไว้ล่วงหน้า',
    bulkAddItems: 'เพิ่มสินค้าจำนวนมาก',
    bulkAddDescription: 'เพิ่มหลายรายการพร้อมกัน',
    createCustomItem: 'สร้างสินค้าที่กำหนดเอง',
    createCustomDescription: 'สร้างสินค้าที่กำหนดเองใหม่',
    exportCSV: 'ส่งออกเป็น CSV',
    exportCSVDescription: 'บันทึกสินค้าทั้งหมดเป็นไฟล์ CSV',
    importCSV: 'นำเข้า CSV',
    importCSVDescription: 'โหลดสินค้าจากไฟล์ CSV',
    deleteAllItems: 'ลบสินค้าทั้งหมด',
    deleteAllDescription: 'ลบสินค้าที่กำหนดไว้ล่วงหน้าทั้งหมด',
    totalItems: 'สินค้าทั้งหมด',
    delete: 'ลบ',
    deleteItem: 'ลบสินค้า',
    deleteItemConfirm: 'คุณแน่ใจหรือไม่ว่าต้องการลบสินค้านี้จากรายการที่กำหนดไว้ล่วงหน้า?',
    deleteAllConfirm: 'คุณแน่ใจหรือไม่ว่าต้องการลบสินค้าที่กำหนดไว้ล่วงหน้าทั้งหมด {{count}} รายการ? การดำเนินการนี้ไม่สามารถยกเลิกได้',
    bulkAddInstructions: 'ป้อนสินค้าหนึ่งรายการต่อบรรทัด คุณสามารถใช้รูปแบบเช่น:\n- แอปเปิ้ล\n- กล้วย, อาหาร, lb\n- กาแฟ, เครื่องดื่ม, kg',
    bulkAddDefaults: 'ค่าเริ่มต้นสำหรับสินค้าที่ไม่มีหมวดหมู่/หน่วย',
    deleteItem: 'ลบสินค้า',
    deleteItemConfirm: 'คุณแน่ใจหรือไม่ว่าต้องการลบสินค้านี้จากรายการที่กำหนดไว้ล่วงหน้า?',
    itemDeletedSuccess: 'ลบสินค้าเรียบร้อยแล้ว',
    successTitle: 'สำเร็จ',
    itemUpdated: 'อัปเดตสินค้าแล้ว',
    itemUpdatedMessage: 'เพิ่ม {{units}} {{unitType}} ไปยังสินค้าที่มีอยู่ รวมใหม่: {{total}} {{unitType}}',
    combineItems: 'รวมสินค้าที่เหมือนกัน',
    combineItemsDescription: 'เมื่อเปิดใช้งาน สินค้าที่มีชื่อและราคาเหมือนกันจะถูกรวมเข้าด้วยกัน',
    monthlySalesTracking: 'การติดตามยอดขายรายเดือน',
    yearlyTotal: 'ยอดรวมรายปี',
    date: 'วันที่',
    dailySaleAmount: 'ยอดขายรายวัน',
    monthlyTotal: 'ยอดรวมรายเดือน',
    deleteMonth: 'ลบข้อมูลเดือน',
    deleteMonthConfirm: 'คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลยอดขายทั้งหมดสำหรับ',
    salesDataSaved: 'บันทึกข้อมูลยอดขายเรียบร้อยแล้ว',
    monthlySalesInfo: 'การติดตามยอดขายรายเดือนเป็นอิสระจากบันทึกสินค้าคงคลังรายวัน ใช้เพื่อติดตามยอดขายรายเดือนโดยรวม การซื้อ หรือข้อมูลทางการเงินอื่นๆ',
    longPressToRename: 'กดค้างชื่อร้านค้าเพื่อเปลี่ยนชื่อ',
    storeName: 'ร้านค้า',
    addNewStore: 'เพิ่มร้านค้าใหม่',
    subtotal: 'ยอดรวมย่อย',
    tax: 'ภาษี',
    receiptCreator: 'ผู้สร้างใบเสร็จ',
    receiptCreatorPlaceholder: 'ชื่อผู้สร้างใบเสร็จ',
    receipt: 'ใบเสร็จ',
    items: 'รายการ',
    customerName: 'ลูกค้า',
    cart: 'ตะกร้าสินค้า',
    emptyCart: 'ตะกร้าของคุณว่างเปล่า',
    addItemsFromList: 'เพิ่มสินค้าจากรายการ',
    customerInformation: 'ข้อมูลลูกค้า (ไม่บังคับ)',
    checkout: 'ชำระเงิน',
    addToCart: 'เพิ่มลงตะกร้า',
    receiptCreated: 'สำเร็จ',
    receiptSaved: 'ใบเสร็จถูกสร้างสำเร็จแล้ว!',
    printReceipt: 'พิมพ์',
    takeOrder: 'รับคำสั่งซื้อ',
    tapToViewReceipt: 'แตะเพื่อดูสรุปรายวัน',
    receiptHistory: 'ประวัติใบเสร็จ',
    voided: 'ยกเลิกแล้ว',
    markAsVoided: 'ทำเครื่องหมายว่ายกเลิก',
    unmarkAsVoided: 'ยกเลิกการทำเครื่องหมาย',
    receiptNumber: 'ใบเสร็จ #',
    viewReceiptHistory: 'ดูประวัติใบเสร็จ',
    taxSettings: 'การตั้งค่าภาษี',
    taxType: 'ประเภทภาษี',
    taxPercentage: 'เปอร์เซ็นต์ (%)',
    taxFixedAmount: 'จำนวนคงที่',
    taxValue: 'มูลค่าภาษี',
    exportDailyReceipts: 'ส่งออกใบเสร็จรายวัน',
    receiptsOnDate: '{{count}} ใบเสร็จใน {{date}}',
    noReceiptsOnDate: 'ไม่มีใบเสร็จในวันนี้',
    loadMoreReceipts: 'โหลดใบเสร็จเพิ่มเติม',
    dailyReceiptsReport: 'รายงานใบเสร็จรายวัน',
    totalReceipts: 'ใบเสร็จทั้งหมด',
  },
  vi: {
    appTitle: 'Quản Lý Hàng Tồn Kho',
    searchPlaceholder: 'Tìm kiếm sản phẩm...',
    filterByCategory: 'Lọc theo Danh Mục',
    sortBy: 'Sắp Xếp Theo',
    addItem: 'Thêm Sản Phẩm',
    itemName: 'Tên Sản Phẩm',
    price: 'Giá',
    unitsSold: 'Số Lượng Bán',
    currency: '₫',
    totalAmount: 'Tổng Số Tiền',
    category: 'Danh Mục',
    unitType: 'Loại Đơn Vị',
    save: 'Lưu',
    cancel: 'Hủy',
    dailyTotal: 'Tổng Hàng Ngày',
    noItems: 'Không có sản phẩm cho ngày này',
    all: 'Tất Cả',
    sharePDF: 'Chia Sẻ dưới dạng PDF',
    confirmDay: 'Xác Nhận Ngày',
    dayConfirmed: 'Đã Xác Nhận',
    sortByName: 'Tên',
    sortByPrice: 'Giá',
    sortByAmount: 'Tổng Số Tiền',
    sortByTime: 'Thời Gian Tạo',
    filters: 'Bộ Lọc',
    sort: 'Sắp Xếp',
    selectCategory: 'Chọn Danh Mục',
    selectSortOption: 'Chọn Tùy Chọn Sắp Xếp',
    selectUnitType: 'Chọn Loại Đơn Vị',
    customItem: 'Tạo Sản Phẩm Tùy Chỉnh',
    predefinedItems: 'Chọn Sản Phẩm Có Sẵn',
    selectItemType: 'Chọn Loại Sản Phẩm',
    dailySummary: 'Tóm Tắt Doanh Số Hàng Ngày',
    shareViaEmail: 'Chia Sẻ qua Email',
    shareViaText: 'Chia Sẻ qua Tin Nhắn',
    close: 'Đóng',
    settings: 'Cài Đặt',
    language: 'Ngôn Ngữ',
    appTitleSetting: 'Tiêu Đề Ứng Dụng',
    profile: 'Hồ Sơ',
    showingItems: 'Hiển thị {{count}} trong số {{total}} mục đã lọc ({{all}} tổng)',
    bulkActions: 'Hành Động Hàng Loạt',
    managePredefined: 'Quản lý bộ sưu tập mục có sẵn của bạn',
    bulkAddItems: 'Thêm Mục Hàng Loạt',
    bulkAddDescription: 'Thêm nhiều mục cùng một lúc',
    createCustomItem: 'Tạo Mục Tùy Chỉnh',
    createCustomDescription: 'Tạo mục tùy chỉnh mới',
    exportCSV: 'Xuất dưới dạng CSV',
    exportCSVDescription: 'Lưu tất cả các mục vào tệp CSV',
    importCSV: 'Nhập CSV',
    importCSVDescription: 'Tải mục từ tệp CSV',
    deleteAllItems: 'Xóa Tất Cả Mục',
    deleteAllDescription: 'Xóa tất cả các mục có sẵn',
    totalItems: 'Tổng Số Mục',
    delete: 'Xóa',
    deleteItem: 'Xóa Mục',
    deleteItemConfirm: 'Bạn có chắc chắn muốn xóa mục này khỏi các mục có sẵn không?',
    deleteAllConfirm: 'Bạn có chắc chắn muốn xóa tất cả {{count}} mục có sẵn không? Hành động này không thể hoàn tác.',
    bulkAddInstructions: 'Nhập một mục mỗi dòng. Bạn có thể sử dụng các định dạng như:\n- Táo\n- Chuối, Thực phẩm, lb\n- Cà phê, Đồ uống, kg',
    bulkAddDefaults: 'Giá trị mặc định cho các mục không có danh mục/đơn vị',
    deleteItem: 'Xóa Mục',
    deleteItemConfirm: 'Bạn có chắc chắn muốn xóa mục này khỏi các mục có sẵn không?',
    itemDeletedSuccess: 'Mục đã được xóa thành công',
    successTitle: 'Thành Công',
    itemUpdated: 'Đã Cập Nhật Mục',
    itemUpdatedMessage: 'Đã thêm {{units}} {{unitType}} vào mục hiện có. Tổng mới: {{total}} {{unitType}}',
    combineItems: 'Kết Hợp Mục Giống Nhau',
    combineItemsDescription: 'Khi bật, các mục có cùng tên và giá sẽ được kết hợp',
    monthlySalesTracking: 'Theo Dõi Doanh Số Hàng Tháng',
    yearlyTotal: 'Tổng Năm',
    date: 'Ngày',
    dailySaleAmount: 'Doanh Số Hàng Ngày',
    monthlyTotal: 'Tổng Tháng',
    deleteMonth: 'Xóa Tháng',
    deleteMonthConfirm: 'Bạn có chắc chắn muốn xóa tất cả dữ liệu doanh số cho',
    salesDataSaved: 'Dữ liệu doanh số đã được lưu thành công',
    monthlySalesInfo: 'Theo dõi doanh số hàng tháng độc lập với hồ sơ hàng tồn kho hàng ngày. Sử dụng nó để theo dõi doanh số hàng tháng tổng thể, mua hàng hoặc bất kỳ dữ liệu tài chính nào khác.',
    longPressToRename: 'Nhấn giữ tên cửa hàng để đổi tên',
    storeName: 'Cửa hàng',
    addNewStore: 'Thêm Cửa hàng Mới',
    subtotal: 'Tổng phụ',
    tax: 'Thuế',
    receiptCreator: 'Người tạo hóa đơn',
    receiptCreatorPlaceholder: 'Tên người tạo hóa đơn',
    receipt: 'Hóa đơn',
    items: 'Mặt hàng',
    customerName: 'Khách hàng',
    cart: 'Giỏ hàng',
    emptyCart: 'Giỏ hàng của bạn trống',
    addItemsFromList: 'Thêm sản phẩm từ danh sách',
    customerInformation: 'Thông tin Khách hàng (Không bắt buộc)',
    checkout: 'Thanh toán',
    addToCart: 'Thêm vào Giỏ',
    receiptCreated: 'Thành Công',
    receiptSaved: 'Hóa đơn đã được tạo thành công!',
    printReceipt: 'In',
    takeOrder: 'Nhận Đơn Hàng',
    tapToViewReceipt: 'Nhấn để xem tóm tắt hàng ngày',
    receiptHistory: 'Lịch Sử Hóa Đơn',
    voided: 'Đã Hủy',
    markAsVoided: 'Đánh Dấu Đã Hủy',
    unmarkAsVoided: 'Bỏ Đánh Dấu Đã Hủy',
    receiptNumber: 'Hóa Đơn #',
    viewReceiptHistory: 'Xem lịch sử hóa đơn',
    taxSettings: 'Cài Đặt Thuế',
    taxType: 'Loại Thuế',
    taxPercentage: 'Phần Trăm (%)',
    taxFixedAmount: 'Số Tiền Cố Định',
    taxValue: 'Giá Trị Thuế',
    exportDailyReceipts: 'Xuất Hóa Đơn Trong Ngày',
    receiptsOnDate: '{{count}} hóa đơn vào {{date}}',
    noReceiptsOnDate: 'Không có hóa đơn vào ngày này',
    loadMoreReceipts: 'Tải Thêm Hóa Đơn',
    dailyReceiptsReport: 'Báo Cáo Hóa Đơn Hàng Ngày',
    totalReceipts: 'Tổng Hóa Đơn',
  },
  id: {
    appTitle: 'Manajemen Inventaris',
    searchPlaceholder: 'Cari barang...',
    filterByCategory: 'Filter berdasarkan Kategori',
    sortBy: 'Urutkan Berdasarkan',
    addItem: 'Tambah Barang',
    itemName: 'Nama Barang',
    price: 'Harga',
    unitsSold: 'Unit Terjual',
    currency: 'Rp',
    totalAmount: 'Jumlah Total',
    category: 'Kategori',
    unitType: 'Jenis Unit',
    save: 'Simpan',
    cancel: 'Batal',
    dailyTotal: 'Total Harian',
    noItems: 'Tidak ada barang untuk tanggal ini',
    all: 'Semua',
    sharePDF: 'Bagikan sebagai PDF',
    confirmDay: 'Konfirmasi Hari',
    dayConfirmed: 'Dikonfirmasi',
    sortByName: 'Nama',
    sortByPrice: 'Harga',
    sortByAmount: 'Jumlah Total',
    sortByTime: 'Waktu Dibuat',
    filters: 'Filter',
    sort: 'Urutkan',
    selectCategory: 'Pilih Kategori',
    selectSortOption: 'Pilih Opsi Urutan',
    selectUnitType: 'Pilih Jenis Unit',
    customItem: 'Buat Barang Kustom',
    predefinedItems: 'Pilih Barang Terdefinisi',
    selectItemType: 'Pilih Jenis Barang',
    dailySummary: 'Ringkasan Penjualan Harian',
    shareViaEmail: 'Bagikan via Email',
    shareViaText: 'Bagikan via Teks',
    close: 'Tutup',
    settings: 'Pengaturan',
    language: 'Bahasa',
    appTitleSetting: 'Judul Aplikasi',
    profile: 'Profil',
    showingItems: 'Menampilkan {{count}} dari {{total}} item yang difilter ({{all}} total)',
    bulkActions: 'Tindakan Massal',
    managePredefined: 'Kelola koleksi barang terdefinisi Anda',
    bulkAddItems: 'Tambah Barang Massal',
    bulkAddDescription: 'Tambahkan beberapa barang sekaligus',
    createCustomItem: 'Buat Barang Kustom',
    createCustomDescription: 'Buat barang kustom baru',
    exportCSV: 'Ekspor sebagai CSV',
    exportCSVDescription: 'Simpan semua barang ke file CSV',
    importCSV: 'Impor CSV',
    importCSVDescription: 'Muat barang dari file CSV',
    deleteAllItems: 'Hapus Semua Barang',
    deleteAllDescription: 'Hapus semua barang terdefinisi',
    totalItems: 'Total Barang',
    delete: 'Hapus',
    deleteItem: 'Hapus Barang',
    deleteItemConfirm: 'Apakah Anda yakin ingin menghapus barang ini dari barang terdefinisi?',
    deleteAllConfirm: 'Apakah Anda yakin ingin menghapus semua {{count}} barang terdefinisi? Tindakan ini tidak dapat dibatalkan.',
    bulkAddInstructions: 'Masukkan satu barang per baris. Anda dapat menggunakan format seperti:\n- Apel\n- Pisang, Makanan, lb\n- Kopi, Minuman, kg',
    bulkAddDefaults: 'Nilai default untuk barang tanpa kategori/unit',
    deleteItem: 'Hapus Barang',
    deleteItemConfirm: 'Apakah Anda yakin ingin menghapus barang ini dari barang terdefinisi?',
    itemDeletedSuccess: 'Barang berhasil dihapus',
    successTitle: 'Berhasil',
    itemUpdated: 'Barang Diperbarui',
    itemUpdatedMessage: 'Menambahkan {{units}} {{unitType}} ke barang yang ada. Total baru: {{total}} {{unitType}}',
    combineItems: 'Gabungkan Barang Identik',
    combineItemsDescription: 'Ketika diaktifkan, barang dengan nama dan harga yang sama akan digabungkan',
    monthlySalesTracking: 'Pelacakan Penjualan Bulanan',
    yearlyTotal: 'Total Tahunan',
    date: 'Tanggal',
    dailySaleAmount: 'Jumlah Penjualan Harian',
    monthlyTotal: 'Total Bulanan',
    deleteMonth: 'Hapus Bulan',
    deleteMonthConfirm: 'Apakah Anda yakin ingin menghapus semua data penjualan untuk',
    salesDataSaved: 'Data penjualan berhasil disimpan',
    monthlySalesInfo: 'Pelacakan penjualan bulanan independen dari catatan inventaris harian. Gunakan untuk melacak penjualan bulanan keseluruhan, pembelian, atau data keuangan lainnya.',
    longPressToRename: 'Tekan lama nama toko untuk mengganti nama',
    storeName: 'Toko',
    addNewStore: 'Tambah Toko Baru',
    subtotal: 'Subtotal',
    tax: 'Pajak',
    receiptCreator: 'Pembuat Tanda Terima',
    receiptCreatorPlaceholder: 'Nama Pembuat Tanda Terima',
    receipt: 'Tanda Terima',
    items: 'Barang',
    customerName: 'Pelanggan',
    cart: 'Keranjang Belanja',
    emptyCart: 'Keranjang Anda kosong',
    addItemsFromList: 'Tambahkan barang dari daftar',
    customerInformation: 'Informasi Pelanggan (Opsional)',
    checkout: 'Checkout',
    addToCart: 'Tambah ke Keranjang',
    receiptCreated: 'Berhasil',
    receiptSaved: 'Tanda Terima berhasil dibuat!',
    printReceipt: 'Cetak',
    takeOrder: 'Terima Pesanan',
    tapToViewReceipt: 'Ketuk untuk melihat ringkasan harian',
    receiptHistory: 'Riwayat Struk',
    voided: 'Dibatalkan',
    markAsVoided: 'Tandai Sebagai Dibatalkan',
    unmarkAsVoided: 'Hapus Tanda Dibatalkan',
    receiptNumber: 'Struk #',
    viewReceiptHistory: 'Lihat riwayat struk',
    taxSettings: 'Pengaturan Pajak',
    taxType: 'Jenis Pajak',
    taxPercentage: 'Persentase (%)',
    taxFixedAmount: 'Jumlah Tetap',
    taxValue: 'Nilai Pajak',
    exportDailyReceipts: 'Ekspor Struk Hari Ini',
    receiptsOnDate: '{{count}} struk pada {{date}}',
    noReceiptsOnDate: 'Tidak ada struk pada tanggal ini',
    loadMoreReceipts: 'Muat Lebih Banyak Struk',
    dailyReceiptsReport: 'Laporan Struk Harian',
    totalReceipts: 'Total Struk',
  },
  hi: {
    appTitle: 'इन्वेंटरी प्रबंधन',
    searchPlaceholder: 'वस्तुएं खोजें...',
    filterByCategory: 'श्रेणी के अनुसार फ़िल्टर करें',
    sortBy: 'इसके अनुसार क्रमबद्ध करें',
    addItem: 'वस्तु जोड़ें',
    itemName: 'वस्तु का नाम',
    price: 'मूल्य',
    unitsSold: 'बेची गई इकाइयाँ',
    currency: '₹',
    totalAmount: 'कुल राशि',
    category: 'श्रेणी',
    unitType: 'इकाई प्रकार',
    save: 'सहेजें',
    cancel: 'रद्द करें',
    dailyTotal: 'दैनिक कुल',
    noItems: 'इस तारीख के लिए कोई वस्तु नहीं',
    all: 'सभी',
    sharePDF: 'PDF के रूप में साझा करें',
    confirmDay: 'दिन की पुष्टि करें',
    dayConfirmed: 'पुष्टि हो गई',
    sortByName: 'नाम',
    sortByPrice: 'मूल्य',
    sortByAmount: 'कुल राशि',
    sortByTime: 'बनाने का समय',
    filters: 'फ़िल्टर',
    sort: 'क्रमबद्ध करें',
    selectCategory: 'श्रेणी चुनें',
    selectSortOption: 'क्रमबद्ध विकल्प चुनें',
    selectUnitType: 'इकाई प्रकार चुनें',
    customItem: 'कस्टम वस्तु बनाएं',
    predefinedItems: 'पूर्वनिर्धारित वस्तु चुनें',
    selectItemType: 'वस्तु प्रकार चुनें',
    dailySummary: 'दैनिक बिक्री सारांश',
    shareViaEmail: 'ईमेल के माध्यम से साझा करें',
    shareViaText: 'टेक्स्ट के माध्यम से साझा करें',
    close: 'बंद करें',
    settings: 'सेटिंग्स',
    language: 'भाषा',
    appTitleSetting: 'ऐप शीर्षक',
    profile: 'प्रोफ़ाइल',
    showingItems: '{{count}} में से {{total}} फ़िल्टर की गई वस्तुएं दिखा रहे हैं ({{all}} कुल)',
    bulkActions: 'थोक क्रियाएं',
    managePredefined: 'अपने पूर्वनिर्धारित वस्तु संग्रह का प्रबंधन करें',
    bulkAddItems: 'थोक वस्तुएं जोड़ें',
    bulkAddDescription: 'एक साथ कई वस्तुएं जोड़ें',
    createCustomItem: 'कस्टम वस्तु बनाएं',
    createCustomDescription: 'नई कस्टम वस्तु बनाएं',
    exportCSV: 'CSV के रूप में निर्यात करें',
    exportCSVDescription: 'सभी वस्तुओं को CSV फ़ाइल में सहेजें',
    importCSV: 'CSV आयात करें',
    importCSVDescription: 'CSV फ़ाइल से वस्तुएं लोड करें',
    deleteAllItems: 'सभी वस्तुएं हटाएं',
    deleteAllDescription: 'सभी पूर्वनिर्धारित वस्तुओं को हटाएं',
    totalItems: 'कुल वस्तुएं',
    delete: 'हटाएं',
    deleteItem: 'वस्तु हटाएं',
    deleteItemConfirm: 'क्या आप वाकई इस वस्तु को पूर्वनिर्धारित वस्तुओं से हटाना चाहते हैं?',
    deleteAllConfirm: 'क्या आप वाकई सभी {{count}} पूर्वनिर्धारित वस्तुओं को हटाना चाहते हैं? इस क्रिया को पूर्ववत नहीं किया जा सकता।',
    bulkAddInstructions: 'प्रति पंक्ति एक वस्तु दर्ज करें। आप इस तरह के प्रारूपों का उपयोग कर सकते हैं:\n- सेब\n- केला, भोजन, lb\n- कॉफी, पेय, kg',
    bulkAddDefaults: 'श्रेणी/इकाई के बिना वस्तुओं के लिए डिफ़ॉल्ट मान',
    deleteItem: 'वस्तु हटाएं',
    deleteItemConfirm: 'क्या आप वाकई इस वस्तु को पूर्वनिर्धारित वस्तुओं से हटाना चाहते हैं?',
    itemDeletedSuccess: 'वस्तु सफलतापूर्वक हटा दी गई',
    successTitle: 'सफलता',
    itemUpdated: 'वस्तु अपडेट की गई',
    itemUpdatedMessage: 'मौजूदा वस्तु में {{units}} {{unitType}} जोड़ा गया। नया कुल: {{total}} {{unitType}}',
    combineItems: 'समान वस्तुओं को संयोजित करें',
    combineItemsDescription: 'सक्षम होने पर, समान नाम और मूल्य वाली वस्तुओं को संयोजित किया जाएगा',
    monthlySalesTracking: 'मासिक बिक्री ट्रैकिंग',
    yearlyTotal: 'वार्षिक कुल',
    date: 'तारीख',
    dailySaleAmount: 'दैनिक बिक्री राशि',
    monthlyTotal: 'मासिक कुल',
    deleteMonth: 'महीना हटाएं',
    deleteMonthConfirm: 'क्या आप वाकई सभी बिक्री डेटा हटाना चाहते हैं',
    salesDataSaved: 'बिक्री डेटा सफलतापूर्वक सहेजा गया',
    monthlySalesInfo: 'मासिक बिक्री ट्रैकिंग दैनिक इन्वेंट्री रिकॉर्ड से स्वतंत्र है। इसका उपयोग समग्र मासिक बिक्री, खरीद या किसी अन्य वित्तीय डेटा को ट्रैक करने के लिए करें।',
    longPressToRename: 'नाम बदलने के लिए स्टोर का नाम लंबे समय तक दबाएं',
    storeName: 'दुकान',
    addNewStore: 'नया स्टोर जोड़ें',
    subtotal: 'उप-कुल',
    tax: 'कर',
    receiptCreator: 'रसीद निर्माता',
    receiptCreatorPlaceholder: 'रसीद निर्माता का नाम',
    receipt: 'रसीद',
    items: 'आइटम',
    customerName: 'ग्राहक',
    cart: 'शॉपिंग कार्ट',
    emptyCart: 'आपकी कार्ट खाली है',
    addItemsFromList: 'सूची से आइटम जोड़ें',
    customerInformation: 'ग्राहक जानकारी (वैकल्पिक)',
    checkout: 'चेकआउट',
    addToCart: 'कार्ट में जोड़ें',
    receiptCreated: 'सफलता',
    receiptSaved: 'रसीद सफलतापूर्वक बनाई गई!',
    printReceipt: 'प्रिंट',
    takeOrder: 'ऑर्डर लें',
    tapToViewReceipt: 'दैनिक सारांश देखने के लिए टैप करें',
    receiptHistory: 'रसीद इतिहास',
    voided: 'रद्द किया गया',
    markAsVoided: 'रद्द के रूप में चिह्नित करें',
    unmarkAsVoided: 'रद्द चिह्न हटाएं',
    receiptNumber: 'रसीद #',
    viewReceiptHistory: 'रसीद इतिहास देखें',
    taxSettings: 'कर सेटिंग्स',
    taxType: 'कर प्रकार',
    taxPercentage: 'प्रतिशत (%)',
    taxFixedAmount: 'निश्चित राशि',
    taxValue: 'कर मूल्य',
    exportDailyReceipts: 'दिन की रसीदें निर्यात करें',
    receiptsOnDate: '{{date}} को {{count}} रसीदें',
    noReceiptsOnDate: 'इस तिथि पर कोई रसीद नहीं',
    loadMoreReceipts: 'अधिक रसीदें लोड करें',
    dailyReceiptsReport: 'दैनिक रसीद रिपोर्ट',
    totalReceipts: 'कुल रसीदें',
  },
  my: {
    appTitle: 'ပစ္စည်းလက်ကျန်စီမံခန့်ခွဲမှု',
    searchPlaceholder: 'ပစ္စည်းများရှာပါ...',
    filterByCategory: 'အမျိုးအစားအလိုက်စစ်ထုတ်ပါ',
    sortBy: 'အစီအစဉ်',
    addItem: 'ပစ္စည်းထည့်ပါ',
    itemName: 'ပစ္စည်းအမည်',
    price: 'ဈေးနှုန်း',
    unitsSold: 'ရောင်းချသောယူနစ်',
    currency: 'Ks',
    totalAmount: 'စုစုပေါင်းပမာဏ',
    category: 'အမျိုးအစား',
    unitType: 'ယူနစ်အမျိုးအစား',
    save: 'သိမ်းပါ',
    cancel: 'ပယ်ဖျက်ပါ',
    dailyTotal: 'နေ့စဉ်စုစုပေါင်း',
    noItems: 'ဤနေ့ရက်အတွက်ပစ္စည်းမရှိပါ',
    all: 'အားလုံး',
    sharePDF: 'PDF အနေဖြင့်မျှဝေပါ',
    confirmDay: 'နေ့ချိန်အတည်ပြုပါ',
    dayConfirmed: 'နေ့ချိန်အတည်ပြုပြီး',
    sortByName: 'အမည်',
    sortByPrice: 'ဈေးနှုန်း',
    sortByAmount: 'စုစုပေါင်းပမာဏ',
    sortByTime: 'ဖန်တီးချိန်',
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
    bulkActions: 'အစုလိုက်လုပ်ဆောင်ချက်များ',
    managePredefined: 'သင်၏ကြိုတင်သတ်မှတ်ထားသောပစ္စည်းစုစည်းမှုကိုစီမံပါ',
    bulkAddItems: 'အစုလိုက်ပစ္စည်းထည့်ရန်',
    bulkAddDescription: 'ပစ္စည်းများစွာကိုတစ်ခါတည်းထည့်ပါ',
    createCustomItem: 'စိတ်ကြိုက်ပစ္စည်းဖန်တီးရန်',
    createCustomDescription: 'အသစ်စိတ်ကြိုက်ပစ္စည်းဖန်တီးပါ',
    exportCSV: 'CSV အဖြစ်ထုတ်ယူရန်',
    exportCSVDescription: 'ပစ္စည်းအားလုံးကို CSV ဖိုင်သို့သိမ်းဆည်းပါ',
    importCSV: 'CSV တင်သွင်းရန်',
    importCSVDescription: 'CSV ဖိုင်မှပစ္စည်းများကိုတင်သွင်းပါ',
    deleteAllItems: 'ပစ္စည်းအားလုံးဖျက်ရန်',
    deleteAllDescription: 'ကြိုတင်သတ်မှတ်ထားသောပစ္စည်းအားလုံးကိုဖျက်ရှားပါ',
    showingItems: '{{count}} / {{total}} စစ်ထုတ်ပစ္စည်းများပြသနေသည် (စုစုပေါင်း {{all}})',
    tapToViewReceipt: 'ငွေလက်ခံဖြတ်ပိုင်းကြည့်ရန်တို့ပါ',
    totalItems: 'စုစုပေါင်းပစ္စည်းများ',
    delete: 'ဖျက်ပါ',
    deleteItem: 'ပစ္စည်းဖျက်ရန်',
    deleteItemConfirm: 'ဤပစ္စည်းကိုကြိုတင်သတ်မှတ်ထားသောပစ္စည်းများမှဖျက်လိုသည်မှာသေချာပါသလား?',
    deleteAllConfirm: 'ကြိုတင်သတ်မှတ်ထားသောပစ္စည်းအားလုံး {{count}} ခုကိုဖျက်လိုသည်မှာသေချာပါသလား? ဤလုပ်ဆောင်ချက်ကိုပြန်ပြောင်း၍မရပါ။',
    deleteItem: 'ပစ္စည်းဖျက်ရန်',
    deleteItemConfirm: 'ကြိုတင်သတ်မှတ်ထားသောပစ္စည်းများမှဤပစ္စည်းကိုဖျက်လိုသည်မှာသေချာပါသလား?',
    itemDeletedSuccess: 'ပစ္စည်းအောင်မြင်စွာဖျက်ပြီးပါပြီ',
    successTitle: 'အောင်မြင်ပါသည်',
    itemUpdated: 'ပစ္စည်းအပ်ဒိတ်လုပ်ပြီးပြီ',
    itemUpdatedMessage: 'ရှိပြီးသားပစ္စည်းတွင် {{units}} {{unitType}} ထည့်သွင်းပြီးပြီ။ စုစုပေါင်းအသစ်: {{total}} {{unitType}}',
    combineItems: 'တူညီသောပစ္စည်းများပေါင်းစပ်ရန်',
    combineItemsDescription: 'ဖွင့်ထားလျှင်၊ အမည်နှင့်စျေးနှုန်းတူညီသောပစ္စည်းများကိုပေါင်းစပ်မည်',
    monthlySalesTracking: 'လစဉ်ရောင်းချမှုခြေရာခံခြင်း',
    yearlyTotal: 'နှစ်စုစုပေါင်း',
    date: 'ရက်စွဲ',
    dailySaleAmount: 'နေ့စဉ်ရောင်းချမှုပမာဏ',
    monthlyTotal: 'လစဉ်စုစုပေါင်း',
    deleteMonth: 'လကိုဖျက်ရန်',
    deleteMonthConfirm: 'အောက်ပါလအတွက်ရောင်းချမှုဒေတာအားလုံးကိုဖျက်လိုသည်မှာသေချာပါသလား',
    salesDataSaved: 'ရောင်းချမှုဒေတာအောင်မြင်စွာသိမ်းဆည်းပြီးပါပြီ',
    monthlySalesInfo: 'လစဉ်ရောင်းချမှုခြေရာခံခြင်းသည် နေ့စဉ်ပစ္စည်းလက်ကျန်မှတ်တမ်းများနှင့် သီးခြားဖြစ်သည်။ ၎င်းကို စုစုပေါင်းလစဉ်ရောင်းချမှု၊ ဝယ်ယူမှု သို့မဟုတ် အခြားငွေကြေးဆိုင်ရာဒေတာများကို ခြေရာခံရန် အသုံးပြုပါ။',
    longPressToRename: 'အမည်ပြောင်းရန် စတိုးအမည်ကို ကြာကြာနှိပ်ပါ',
    storeName: 'စတိုး',
    addNewStore: 'စတိုးအသစ်ထည့်ပါ',
    subtotal: 'စုစုပေါင်းခွဲ',
    tax: 'အခွန်',
    receiptCreator: 'ငွေလက်ခံဖြတ်ပိုင်းဖန်တီးသူ',
    receiptCreatorPlaceholder: 'ငွေလက်ခံဖြတ်ပိုင်းဖန်တီးသူအမည်',
    receipt: 'ငွေလက်ခံဖြတ်ပိုင်း',
    items: 'ပစ္စည်းများ',
    customerName: 'ဖောက်သည်',
    cart: 'စျေးဝယ်ခြင်းတောင်း',
    emptyCart: 'သင့်ခြင်းတောင်းသည် ဗလာဖြစ်နေသည်',
    addItemsFromList: 'စာရင်းမှ ပစ္စည်းများထည့်ပါ',
    customerInformation: 'ဖောက်သည်အချက်အလက် (ရွေးချယ်ခွင့်)',
    checkout: 'ငွေရှင်းရန်',
    addToCart: 'ခြင်းတောင်းထဲသို့ထည့်ရန်',
    receiptCreated: 'အောင်မြင်သည်',
    receiptSaved: 'ရောင်းချမှတ်တမ်း ဖန်တီးပြီးပါပြီ!',
    printReceipt: 'ပရင့်ထုတ်ပါ',
    takeOrder: 'မှာယူမှု လက်ခံမည်',
    tapToViewReceipt: 'နေ့စဥ်အနှစ်ချုပ် ကြည့်ရန် တို့ပါ',
    receiptHistory: 'ရောင်းချမှတ်တမ်းမှတ်တမ်း',
    voided: 'ပယ်ဖျက်ပြီး',
    markAsVoided: 'ပယ်ဖျက်ပြီးအဖြစ် မှတ်သားရန်',
    unmarkAsVoided: 'ပယ်ဖျက်မှတ်သား ဖယ်ရှားရန်',
    receiptNumber: 'ရောင်းချမှတ်တမ်း #',
    viewReceiptHistory: 'ရောင်းချမှတ်တမ်းမှတ်တမ်း ကြည့်ရန်',
    taxSettings: 'အခွန်ဆက်တင်များ',
    taxType: 'အခွန်အမျိုးအစား',
    taxPercentage: 'ရာခိုင်နှုန်း (%)',
    taxFixedAmount: 'သတ်မှတ်ငွေပမာဏ',
    taxValue: 'အခွန်တန်ဖိုး',
    exportDailyReceipts: 'နေ့စဉ်ရောင်းချမှတ်တမ်းများ ပို့ကုန်တင်ပို့ပါ',
    receiptsOnDate: '{{date}} တွင် {{count}} ရောင်းချမှတ်တမ်းများ',
    noReceiptsOnDate: 'ဒီရက်စွဲမှာ ရောင်းချမှတ်တမ်း မရှိပါ',
    loadMoreReceipts: 'နောက်ထပ် ရောင်းချမှတ်တမ်း များ ဖွင့်ပါ',
    dailyReceiptsReport: 'နေ့စဉ် ရောင်းချမှတ်တမ်း အစီရင်ခံစာ',
    totalReceipts: 'စုစုပေါင်း ရောင်းချမှတ်တမ်းများ',
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
    { id: 'apples', name: 'Apples', category: 'Food', unitType: 'lb', lastPrice: '' },
    { id: 'bananas', name: 'Bananas', category: 'Food', unitType: 'lb', lastPrice: '' },
    { id: 'milk', name: 'Milk', category: 'Beverages', unitType: 'liters', lastPrice: '' },
    { id: 'bread', name: 'Bread', category: 'Food', unitType: 'pcs', lastPrice: '' },
    { id: 'eggs', name: 'Eggs', category: 'Food', unitType: 'pcs', lastPrice: '' },
    { id: 'chicken', name: 'Chicken Breast', category: 'Food', unitType: 'lb', lastPrice: '' },
    { id: 'rice', name: 'Rice', category: 'Food', unitType: 'kg', lastPrice: '' },
    { id: 'water', name: 'Water Bottles', category: 'Beverages', unitType: 'pcs', lastPrice: '' },
    { id: 'coffee', name: 'Coffee', category: 'Beverages', unitType: 'kg', lastPrice: '' },
    { id: 'phone', name: 'Smartphone', category: 'Electronics', unitType: 'pcs', lastPrice: '' },
  ];
}

// OCR API URL removed - OCR functionality has been disabled

const InventoryApp = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortBy, setSortBy] = useState('time');
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
  const [dailyConfirmations, setDailyConfirmations] = useState({});
  const [isDayConfirmed, setIsDayConfirmed] = useState(false);
  const [debouncedSearchText, setDebouncedSearchText] = useState('');
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('$');
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [sortDirection, setSortDirection] = useState('asc');
  const [combineIdenticalItems, setCombineIdenticalItems] = useState(false);
  const [showSalesTrackingModal, setShowSalesTrackingModal] = useState(false);
  const [showMonthlyDataModal, setShowMonthlyDataModal] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [monthlyData, setMonthlyData] = useState({});
  const [yearlyTotals, setYearlyTotals] = useState({});
  // const [stores, setStores] = useState([{ id: 'default', name: 'Main Store' }]);
  // const [selectedStore, setSelectedStore] = useState('default');
  const [showStoreDropdown, setShowStoreDropdown] = useState(false);
  const [showAddStoreModal, setShowAddStoreModal] = useState(false);
  const [showEditStoreModal, setShowEditStoreModal] = useState(false);
  const [newStoreName, setNewStoreName] = useState('');
  const [editingStore, setEditingStore] = useState(null);
  const [stores, setStores] = useState([{ id: 'main_store', name: 'Main Store', isDefault: true }]);
  const [selectedStore, setSelectedStore] = useState('main_store');
  const [showTakeOrderModal, setShowTakeOrderModal] = useState(false);
  const [showCartView, setShowCartView] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [showAddToCartModal, setShowAddToCartModal] = useState(false);
  const [selectedItemForCart, setSelectedItemForCart] = useState(null);
  const [cartCustomerName, setCartCustomerName] = useState('');
  const [receiptCreator, setReceiptCreator] = useState('');
  const [taxSettings, setTaxSettings] = useState({ type: 'percentage', value: 0 });
  const [receiptHistory, setReceiptHistory] = useState([]);
  const [showReceiptHistoryModal, setShowReceiptHistoryModal] = useState(false);
  const [selectedReceiptDetail, setSelectedReceiptDetail] = useState(null);
  const [receiptHistoryDate, setReceiptHistoryDate] = useState(new Date());
  const [loadedReceiptsCount, setLoadedReceiptsCount] = useState(20);
  const [showReceiptCalendarModal, setShowReceiptCalendarModal] = useState(false);

  
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(predefinedSearchText);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [predefinedSearchText]);

  // Calculate total amount in real-time
  const calculateTotal = () => {
    const price = parseFloat(newItem.price) || 0;
    const units = parseFloat(newItem.unitsSold) || 0;
    return formatNumber(price * units, 2);
  };

  useEffect(() => {
    const initializeApp = async () => {
      await loadSettings();
      await loadData();
      await loadLanguageConfig();
      await loadPredefinedItems();
      await loadDailyConfirmation(selectedDate);
      await loadTaxSettings();  // Add this line
      await loadReceiptHistory();  // Add this line
      await loadLastReceiptCreator();  // Add this line
    };
    
    initializeApp();
  }, [selectedDate]);

  useEffect(() => {
    filterAndSortItems();
  }, [items, searchText, filterCategory, sortBy, sortDirection]); // ADD sortDirection

  useEffect(() => {
    resetPagination();
  }, [debouncedSearchText, predefinedFilterCategory, predefinedSortBy]);

  useEffect(() => {
    if (!showPredefinedItemsModal) {
      // Reset all modal states when closed
      setLoadedItemsCount(20);
      setPredefinedSearchText('');
      setDebouncedSearchText(''); // Also reset debounced search
      setPredefinedFilterCategory('All');
      setPredefinedSortBy('name');
      setActiveSwipeId(null);
      
      // Reset any sub-modals
      setShowPredefinedCategoryModal(false);
      setShowBulkActionsModal(false);
    }
  }, [showPredefinedItemsModal]);

  useEffect(() => {
    loadStores();
  }, []);

  useEffect(() => {
    if (selectedStore) {
      loadYearlyTotal(selectedYear);
    }
  }, [selectedYear, selectedStore]);

  // Load last receipt creator when cart view opens
  useEffect(() => {
    if (showCartView) {
      loadLastReceiptCreator();
    }
  }, [showCartView]);

  // Reset receipt history pagination and date when modal opens
  useEffect(() => {
    if (showReceiptHistoryModal) {
      setReceiptHistoryDate(new Date());
      setLoadedReceiptsCount(20);
    }
  }, [showReceiptHistoryModal]);

  // Load predefined items from AsyncStorage with JSON file integration
  const loadPredefinedItems = async () => {
    try {
      const savedPredefinedItems = await AsyncStorage.getItem('predefinedItems');
      if (savedPredefinedItems) {
        const saved = JSON.parse(savedPredefinedItems);
        
        // Create a Map to remove duplicates (keeps first occurrence)
        const uniqueMap = new Map();
        saved.forEach(item => {
          const key = `${item.name.toLowerCase()}_${item.category}_${item.unitType}`;
          if (!uniqueMap.has(key)) {
            uniqueMap. set(key, item);
          }
        });
        
        const uniqueItems = Array.from(uniqueMap.values());
        
        console.log(`Loaded ${saved.length} items, removed ${saved.length - uniqueItems.length} duplicates`);
        
        setPredefinedItems(uniqueItems);
        
        // Always save the cleaned data back
        await savePredefinedItems(uniqueItems);
      } else {
        // Remove duplicates from default items too
        const uniqueMap = new Map();
        defaultPredefinedItems.forEach(item => {
          const key = `${item.name.toLowerCase()}_${item.category}_${item.unitType}`;
          if (!uniqueMap.has(key)) {
            uniqueMap.set(key, item);
          }
        });
        const uniqueDefaults = Array.from(uniqueMap.values());
        
        setPredefinedItems(uniqueDefaults);
        await savePredefinedItems(uniqueDefaults);
      }
    } catch (error) {
      console.error('Error loading predefined items:', error);
      setPredefinedItems(defaultPredefinedItems);
    }
  };
  // Format a number with commas and specified decimal places
  const formatNumber = (number, decimals = 2) => {
    const num = parseFloat(number);
    if (isNaN(num)) return '0';
    return num.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
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
      // Check if item already exists using our helper function
      if (isItemUnique(itemData, predefinedItems)) {
        const newPredefinedItem = {
          id: `custom_${Date.now()}`,
          name: itemData.name,
          category: itemData.category,
          unitType: itemData.unitType,
          lastPrice: itemData.price,
        };

        const updatedPredefinedItems = [...predefinedItems, newPredefinedItem];
        setPredefinedItems(updatedPredefinedItems);
        await savePredefinedItems(updatedPredefinedItems);
        console.log('Added new item to predefined items:', newPredefinedItem.name);
      } else {
        console.log('Item already exists in predefined items, skipping:', itemData.name);
      }
    } catch (error) {
      console.error('Error adding to predefined items:', error);
    }
  };

  // ============ TAKE ORDER / CART FUNCTIONS ============

  // Add item to cart (not to database yet)
  const addItemToCart = () => {
    if (! selectedItemForCart || !selectedItemForCart.price || !selectedItemForCart.unitsSold) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const cartItem = {
      id: Date.now().toString() + Math.random(),
      name: selectedItemForCart.name,
      price: selectedItemForCart.price,
      unitsSold: selectedItemForCart. unitsSold,
      category: selectedItemForCart.category,
      unitType: selectedItemForCart.unitType,
      totalAmount: calculateAmount(selectedItemForCart.price, selectedItemForCart.unitsSold),
    };

    setCartItems([...cartItems, cartItem]);
    
    // Update last price for predefined item
    const predefinedIndex = predefinedItems.findIndex(
      p => p.name. toLowerCase() === selectedItemForCart. name.toLowerCase()
    );
    if (predefinedIndex !== -1) {
      const updatedPredefined = [... predefinedItems];
      updatedPredefined[predefinedIndex]. lastPrice = selectedItemForCart.price;
      setPredefinedItems(updatedPredefined);
      savePredefinedItems(updatedPredefined);
    }

    // Close modal and reset
    setShowAddToCartModal(false);
    setSelectedItemForCart(null);
  };

  // Remove item from cart
  const removeFromCart = (itemId) => {
    setCartItems(cartItems.filter(item => item.id !== itemId));
  };

  // Calculate cart totals
  const calculateCartTotals = () => {
    const subtotal = cartItems.reduce((sum, item) => 
      sum + parseFloat(item.totalAmount || 0), 0
    );
    
    let tax = 0;
    if (taxSettings.type === 'percentage') {
      tax = (subtotal * parseFloat(taxSettings.value || 0)) / 100;
    } else {
      tax = parseFloat(taxSettings.value || 0);
    }
    
    return {
      subtotal:  subtotal. toFixed(2),
      tax: tax.toFixed(2),
      total: (subtotal + tax).toFixed(2)
    };
  };

  const generateExistingReceiptHTML = (receipt) => {
    // Use store name from receipt if available, otherwise try to find it
    let storeName = receipt.storeName;
    if (!storeName && receipt.storeId) {
      const store = stores.find(s => s.id === receipt.storeId);
      storeName = store?.name;
    }
    if (!storeName) {
      storeName = language.appTitle;
    }
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; }
            .store-name { font-size: 24px; font-weight: bold; text-align: center; margin-bottom: 20px; }
            .receipt-header { margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .receipt-items { margin:  20px 0; }
            .item-row { display: flex; justify-content: space-between; padding: 5px 0; }
            .totals { margin-top: 20px; border-top: 2px solid #333; padding-top: 10px; }
            .total-row { display: flex; justify-content: space-between; padding: 3px 0; }
            . grand-total { font-weight: bold; font-size: 1.2em; }
          </style>
        </head>
        <body>
          <div class="store-name">${storeName}</div>
          
          <div class="receipt-header">
            <h1>${language.receipt || 'Receipt'} #${receipt.receiptNumber}</h1>
            <p>${language.date || 'Date'}: ${new Date(receipt.timestamp).toLocaleString()}</p>
            ${receipt.customerName && receipt.customerName !== 'Walk-in Customer' ? `<p>${language.customerName || 'Customer'}: ${receipt.customerName}</p>` : ''}
            ${receipt.receiptCreator ? `<p>${language.receiptCreator || 'Receipt Creator'}: ${receipt.receiptCreator}</p>` : ''}
          </div>
          
          <div class="receipt-items">
            <h2>${language.items || 'Items'}</h2>
            ${receipt.items.map(item => `
              <div class="item-row">
                <span>${item.name} - ${item.unitsSold} ${item.unitType} × ${selectedCurrency}${formatNumber(parseFloat(item.price), 2)}</span>
                <span>${selectedCurrency}${item.totalAmount}</span>
              </div>
            `).join('')}
          </div>
          
          <div class="totals">
            <div class="total-row">
              <span>${language.subtotal || 'Subtotal'}:</span>
              <span>${selectedCurrency}${receipt.subtotal}</span>
            </div>
            <div class="total-row">
              <span>${language.tax || 'Tax'}:</span>
              <span>${selectedCurrency}${receipt.tax}</span>
            </div>
            <div class="total-row grand-total">
              <span>${language.totalAmount || 'Total'}:</span>
              <span>${selectedCurrency}${receipt.total}</span>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  // Checkout - Save all cart items to database
  const handleCartCheckout = async () => {
    if (cartItems.length === 0) {
      Alert.alert('Error', 'Cart is empty');
      return;
    }

    try {
      // Save each cart item to the main items table
      const newItems = [];
      for (const cartItem of cartItems) {
        const item = {
          id: `${Date.now()}_${Math.random()}`,
          name: cartItem.name,
          price: cartItem.price,
          unitsSold: cartItem.unitsSold,
          category: cartItem.category,
          unitType: cartItem.unitType,
          totalAmount: cartItem.totalAmount,
          timestamp: new Date().toISOString(),
        };
        newItems.push(item);
      }

      // Add all items to existing items
      const updatedItems = [...items, ...newItems];
      setItems(updatedItems);
      await saveData(updatedItems);

      // Create receipt for history
      const totals = calculateCartTotals();
      const currentStore = stores.find(s => s.id === selectedStore);
      const receipt = {
        id: Date.now().toString(),
        receiptNumber: `R${Date.now().toString().slice(-8)}`,
        timestamp: new Date().toISOString(),
        date: formatDate(selectedDate),
        customerName: cartCustomerName || 'Walk-in Customer',
        receiptCreator: receiptCreator || '',
        storeId: selectedStore,
        storeName: currentStore?.name || language.appTitle,
        items: cartItems,
        subtotal: totals.subtotal,
        tax: totals.tax,
        total: totals. total,
        taxSettings: { ... taxSettings },
      };

      // Save to receipt history
      const updatedHistory = [receipt, ...receiptHistory];
      setReceiptHistory(updatedHistory);
      await AsyncStorage.setItem('receipt_history', JSON.stringify(updatedHistory));

      // Save receipt creator for future use
      await saveReceiptCreator(receiptCreator);

      // Show success and reset
      Alert.alert(
        language.receiptCreated || 'Success',
        `${language.receiptSaved || 'Receipt created successfully!'}\n\n${language.items || 'Items'}:  ${cartItems.length}\nTotal: ${language.currency}${totals.total}`,
        [
          {
            text: language.printReceipt || 'Print',
            onPress: async () => {
              const html = generateExistingReceiptHTML(receipt);
              await Print. printAsync({ html });
            }
          },
          {
            text: language.close || 'OK',
            style: 'default'
          }
        ]
      );

      // Clear cart and close modal
      // Note: receiptCreator is intentionally NOT cleared here as it's persisted in AsyncStorage
      // This allows the same receipt creator to be reused for subsequent orders
      setCartItems([]);
      setCartCustomerName('');
      setShowTakeOrderModal(false);
      setShowCartView(false);

    } catch (error) {
      console.error('Checkout error:', error);
      Alert.alert('Error', 'Could not complete checkout');
    }
  };

  // Toggle voided status for a receipt
  const toggleReceiptVoided = async (receiptId) => {
    try {
      const updatedHistory = receiptHistory.map(receipt => {
        if (receipt.id === receiptId) {
          return { ...receipt, voided: !receipt.voided };
        }
        return receipt;
      });
      setReceiptHistory(updatedHistory);
      await AsyncStorage.setItem('receipt_history', JSON.stringify(updatedHistory));
      
      // Update selected receipt detail if it's the one being toggled
      if (selectedReceiptDetail && selectedReceiptDetail.id === receiptId) {
        setSelectedReceiptDetail({ ...selectedReceiptDetail, voided: !selectedReceiptDetail.voided });
      }
    } catch (error) {
      console.error('Error toggling voided status:', error);
      Alert.alert('Error', 'Could not update receipt status');
    }
  };

  // Add this function after formatNumber and before loadPredefinedItems
  const calculateAmount = (price, unitsSold) => {
    const p = parseFloat(price) || 0;
    const u = parseFloat(unitsSold) || 0;
    return (p * u).toFixed(2);
  };

  // Handle predefined item selection for cart
  const handlePredefinedItemForCart = (item) => {
    console.log('Item tapped:', item.name);
    
    setSelectedItemForCart({
      name: item.name,
      category: item.category,
      unitType: item.unitType,
      price: item.lastPrice || '',
      unitsSold: '',
    });
    
    // Small delay to ensure state is set
    setTimeout(() => {
      setShowAddToCartModal(true);
    }, 50);
  };

  const loadData = async () => {
    try {
      const dateKey = formatDate(selectedDate);
      const savedData = await AsyncStorage.getItem(`inventory_${dateKey}`);
      if (savedData) {
        const data = JSON.parse(savedData);
        setItems(data);
        
        // Auto-sync current daily total to Main Store
        const total = data.reduce((sum, item) => 
          sum + (parseFloat(item.price) * parseFloat(item.unitsSold)), 0
        );
        await autoSyncMainStoreData(selectedDate, total.toFixed(2));
      } else {
        setItems([]);
        // Sync 0 if no items
        await autoSyncMainStoreData(selectedDate, '0');
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
      
      // Auto-sync to Main Store in Monthly Sales Tracking
      const total = data.reduce((sum, item) => 
        sum + (parseFloat(item.price) * parseFloat(item.unitsSold)), 0
      );
      await autoSyncMainStoreData(selectedDate, total.toFixed(2));
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
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Format number with thousand separator
  const formatCurrency = (amount) => {
    const num = parseFloat(amount) || 0;
    return num.toFixed(2); // Always show 2 decimal places
  };

  // Filter receipts by date
  const getReceiptsForDate = (date) => {
    const dateKey = formatDate(date);
    return receiptHistory.filter(receipt => {
      if (!receipt.timestamp) return false; // Skip receipts with invalid timestamps
      try {
        const receiptDateKey = formatDate(new Date(receipt.timestamp));
        return receiptDateKey === dateKey;
      } catch (error) {
        console.warn('Invalid receipt timestamp:', receipt.timestamp);
        return false;
      }
    });
  };

  // Generate daily receipts export HTML
  const generateDailyReceiptsHTML = (date, receipts) => {
    const dateStr = date.toLocaleDateString();
    const timeStr = new Date().toLocaleTimeString();
    const totalAmount = receipts.reduce((sum, r) => sum + parseFloat(r.total || 0), 0);
    
    const receiptsHTML = receipts.map((receipt, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${receipt.receiptNumber}</td>
        <td>${new Date(receipt.timestamp).toLocaleTimeString()}</td>
        <td>${receipt.customerName || '-'}</td>
        <td>${receipt.items.length}</td>
        <td style="text-align: right;">${selectedCurrency}${formatCurrency(receipt.total)}</td>
      </tr>
    `).join('');
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${language.dailyReceiptsReport || 'Daily Receipts Report'}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
          }
          .title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .date-info {
            color: #666;
            font-size: 14px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }
          th {
            background-color: #f5f5f5;
            font-weight: bold;
          }
          .summary {
            margin-top: 30px;
            padding: 15px;
            background-color: #f9f9f9;
            border-radius: 5px;
          }
          .summary-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            font-size: 16px;
          }
          .summary-total {
            font-weight: bold;
            font-size: 18px;
            border-top: 2px solid #333;
            margin-top: 10px;
            padding-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">${language.dailyReceiptsReport || 'Daily Receipts Report'}</div>
          <div class="date-info">
            ${language.date || 'Date'}: ${dateStr}<br>
            ${language.generatedAt || 'Generated'}: ${timeStr}
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th width="8%">#</th>
              <th width="15%">${language.receiptNumber || 'Receipt #'}</th>
              <th width="15%">${language.time || 'Time'}</th>
              <th width="25%">${language.customerName || 'Customer'}</th>
              <th width="12%">${language.items || 'Items'}</th>
              <th width="25%" style="text-align: right;">${language.totalAmount || 'Total'}</th>
            </tr>
          </thead>
          <tbody>
            ${receiptsHTML || `<tr><td colspan="6" style="text-align: center; color: #666;">${language.noReceiptsOnDate || 'No receipts on this date'}</td></tr>`}
          </tbody>
        </table>
        
        <div class="summary">
          <div class="summary-item">
            <span>${language.totalReceipts || 'Total Receipts'}:</span>
            <span>${receipts.length}</span>
          </div>
          <div class="summary-item summary-total">
            <span>${language.totalAmount || 'Total Amount'}:</span>
            <span>${selectedCurrency}${formatCurrency(totalAmount)}</span>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  // Export daily receipts
  const exportDailyReceipts = async (date) => {
    try {
      const receiptsForDate = getReceiptsForDate(date);
      const nonVoidedReceipts = receiptsForDate.filter(r => r.voided !== true);
      
      if (nonVoidedReceipts.length === 0) {
        Alert.alert(
          language.noReceiptsOnDate || 'No receipts on this date',
          language.selectDifferentDate || 'Please select a different date'
        );
        return;
      }
      
      const html = generateDailyReceiptsHTML(date, nonVoidedReceipts);
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri);
    } catch (error) {
      console.error('Error exporting receipts:', error);
      Alert.alert(
        language.error || 'Error',
        language.exportError || 'Failed to export receipts'
      );
    }
  };

  // Get days in month with day names
  const getDaysInMonth = (year, month) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({
        date: `${String(day).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}/${year}`,
        dayName: dayNames[date.getDay()],
        amount: 0
      });
    }
    return days;
  };

  // Load monthly sales data
  const loadMonthlySalesData = async (year, month) => {
    try {
      const key = `monthly_sales_${selectedStore}_${year}_${month}`;
      const savedData = await AsyncStorage.getItem(key);
      if (savedData) {
        return JSON.parse(savedData);
      } else {
        const days = getDaysInMonth(year, month);
        return days;
      }
    } catch (error) {
      console.error('Error loading monthly sales data:', error);
      return getDaysInMonth(year, month);
    }
  };

  // Save monthly sales data
  const saveMonthlySalesData = async (year, month, data) => {
    try {
      const key = `monthly_sales_${selectedStore}_${year}_${month}`;
      await AsyncStorage.setItem(key, JSON.stringify(data));
      await calculateYearlyTotal(year);
    } catch (error) {
      console.error('Error saving monthly sales data:', error);
    }
  };

  // Calculate yearly total
  const calculateYearlyTotal = async (year) => {
    try {
      let yearTotal = 0;
      for (let month = 0; month < 12; month++) {
        const key = `monthly_sales_${selectedStore}_${year}_${month}`;
        const savedData = await AsyncStorage.getItem(key);
        if (savedData) {
          const monthData = JSON.parse(savedData);
          const monthTotal = monthData.reduce((sum, day) => sum + parseFloat(day.amount || 0), 0);
          yearTotal += monthTotal;
        }
      }
      
      const yearlyKey = `yearly_total_${selectedStore}_${year}`;
      await AsyncStorage.setItem(yearlyKey, yearTotal.toString());
      
      // Update state
      setYearlyTotals(prev => ({ ...prev, [`${selectedStore}_${year}`]: yearTotal }));
    } catch (error) {
      console.error('Error calculating yearly total:', error);
    }
  };

  // Load yearly total
  const loadYearlyTotal = async (year) => {
    try {
      const yearlyKey = `yearly_total_${selectedStore}_${year}`;
      const savedTotal = await AsyncStorage.getItem(yearlyKey);
      if (savedTotal) {
        setYearlyTotals(prev => ({ ...prev, [`${selectedStore}_${year}`]: parseFloat(savedTotal) }));
      } else {
        await calculateYearlyTotal(year);
      }
    } catch (error) {
      console.error('Error loading yearly total:', error);
    }
  };

  const loadTaxSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('tax_settings');
      if (savedSettings) {
        setTaxSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading tax settings:', error);
    }
  };

  const loadReceiptHistory = async () => {
    try {
      const savedHistory = await AsyncStorage.getItem('receipt_history');
      if (savedHistory) {
        const history = JSON.parse(savedHistory);
        // Filter to last 90 days
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        const filteredHistory = history.filter(receipt => 
          new Date(receipt.timestamp) >= ninetyDaysAgo
        );
        setReceiptHistory(filteredHistory);
        
        // Save filtered history back
        if (filteredHistory.length !== history.length) {
          await AsyncStorage.setItem('receipt_history', JSON.stringify(filteredHistory));
        }
      }
    } catch (error) {
      console.error('Error loading receipt history:', error);
    }
  };

  const loadLastReceiptCreator = async () => {
    try {
      const lastCreator = await AsyncStorage.getItem('lastReceiptCreator');
      if (lastCreator) {
        setReceiptCreator(lastCreator);
      }
    } catch (error) {
      console.error('Error loading last receipt creator:', error);
    }
  };

  const saveReceiptCreator = async (creatorName) => {
    try {
      const trimmedName = creatorName?.trim();
      if (trimmedName) {
        await AsyncStorage.setItem('lastReceiptCreator', trimmedName);
      } else {
        // Remove the saved receipt creator if an empty string is provided
        await AsyncStorage.removeItem('lastReceiptCreator');
      }
    } catch (error) {
      console.error('Error saving receipt creator:', error);
    }
  };

  const autoSyncMainStoreData = async (date, dailyTotal) => {
    try {
      const year = date.getFullYear();
      const month = date.getMonth();
      const day = date.getDate();
      
      // Format date to match monthly sales data format
      const dateStr = `${String(day).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}/${year}`;
      
      // Load existing monthly data for main store
      const key = `monthly_sales_main_store_${year}_${month}`;
      let monthData = await loadMonthlySalesData(year, month);
      
      // Find the day entry and update it
      const dayIndex = monthData.findIndex(d => d.date === dateStr);
      if (dayIndex !== -1) {
        monthData[dayIndex].amount = parseFloat(dailyTotal) || 0;
        
        // Save updated data
        await AsyncStorage.setItem(key, JSON.stringify(monthData));
        await calculateYearlyTotal(year);
        
        console.log(`Auto-synced ${dailyTotal} to Main Store for ${dateStr}`);
      }
    } catch (error) {
      console.error('Error auto-syncing main store data:', error);
    }
  };

  // Delete/Reset monthly data
  const deleteMonthlyData = async (year, month) => {
    const monthName = new Date(year, month). toLocaleString('default', { month: 'long', year: 'numeric' });
    
    Alert.alert(
      language.deleteMonth,
      `${language.deleteMonthConfirm} ${monthName}?`,
      [
        { text: language.cancel, style: 'cancel' },
        {
          text: language.delete,
          style: 'destructive',
          onPress: async () => {
            try {
              // Reset all daily amounts to 0 instead of deleting
              const days = getDaysInMonth(year, month);
              const resetData = days.map(day => ({
                ... day,
                amount: 0
              }));
              
              // Save the reset data
              const key = `monthly_sales_${selectedStore}_${year}_${month}`;
              await AsyncStorage.setItem(key, JSON.stringify(resetData));
              
              // Recalculate yearly total
              await calculateYearlyTotal(year);
              
              // Update UI
              setMonthlyData(resetData);
              setShowMonthlyDataModal(false);
              setShowSalesTrackingModal(true);
              
              Alert.alert(language.successTitle, 'All daily amounts reset to 0');
            } catch (error) {
              console.error('Error resetting monthly data:', error);
              Alert. alert('Error', 'Could not reset monthly data');
            }
          }
        }
      ]
    );
  };

  // Clean old sales data (keep only 5 years)
  const cleanOldSalesData = async () => {
    try {
      const currentYear = new Date().getFullYear();
      const keys = await AsyncStorage.getAllKeys();
      const salesKeys = keys.filter(key => 
        key.startsWith('monthly_sales_') || key.startsWith('yearly_total_')
      );
      
      const keysToDelete = [];
      
      for (const key of salesKeys) {
        const match = key.match(/\d{4}/);
        if (match) {
          const year = parseInt(match[0]);
          // Delete data older than 5 years
          if (currentYear - year > 5) {
            keysToDelete.push(key);
          }
        }
      }
      
      if (keysToDelete.length > 0) {
        await AsyncStorage.multiRemove(keysToDelete);
        console.log(`Cleaned ${keysToDelete.length} old sales data entries`);
      }
    } catch (error) {
      console.error('Error cleaning old sales data:', error);
    }
  };

  // Open monthly data modal
  const openMonthlyDataModal = async (month) => {
    setSelectedMonth(month);
    const data = await loadMonthlySalesData(selectedYear, month);
    setMonthlyData(data);
    setShowSalesTrackingModal(false); // Close sales tracking modal
    setShowMonthlyDataModal(true); // Open monthly data modal
  };

  // Update daily amount
  const updateDailyAmount = (index, newAmount) => {
    const numericValue = newAmount.replace(/[^0-9]/g, '');
    const number = parseInt(numericValue) || 0;
    const updatedData = [... monthlyData];
    updatedData[index]. amount = number; // Store as number
    setMonthlyData(updatedData);
  };

  // Save monthly data
  const saveMonthlyData = async () => {
    await saveMonthlySalesData(selectedYear, selectedMonth, monthlyData);
    Alert.alert(language.successTitle, language.salesDataSaved);
    setShowMonthlyDataModal(false);
    setShowSalesTrackingModal(true);
  };

  // Load stores
  const loadStores = async () => {
    try {
      const savedStores = await AsyncStorage.getItem('sales_tracking_stores');
      const savedSelectedStore = await AsyncStorage.getItem('selected_store');
      
      if (savedStores) {
        setStores(JSON.parse(savedStores));
      }
      if (savedSelectedStore) {
        setSelectedStore(savedSelectedStore);
      }
    } catch (error) {
      console.error('Error loading stores:', error);
    }
  };

  // Save stores
  const saveStores = async (storesList) => {
    try {
      await AsyncStorage.setItem('sales_tracking_stores', JSON. stringify(storesList));
    } catch (error) {
      console.error('Error saving stores:', error);
    }
  };

  // Add new store
  const addNewStore = async () => {
    if (! newStoreName.trim()) {
      Alert.alert('Error', 'Please enter a store name');
      return;
    }
    
    const newStore = {
      id: `store_${Date.now()}`,
      name: newStoreName. trim()
    };
    
    const updatedStores = [...stores, newStore];
    setStores(updatedStores);
    await saveStores(updatedStores);
    setSelectedStore(newStore.id);
    await AsyncStorage.setItem('selected_store', newStore.id);
    setNewStoreName('');
    setShowAddStoreModal(false);
    
    Alert.alert('Success', `Store "${newStore.name}" created successfully`);
  };

  // Edit store name
  const editStoreName = async () => {
    if (!newStoreName.trim()) {
      Alert.alert('Error', 'Please enter a store name');
      setEditingStore(null);
      setNewStoreName('');
      return;
    }
    
    const updatedStores = stores.map(store => 
      store.id === editingStore.id 
        ? { ...store, name: newStoreName.trim() }
        : store
    );
    
    setStores(updatedStores);
    await saveStores(updatedStores);
    setNewStoreName('');
    setEditingStore(null);
    
    // Don't show alert, just update silently for better UX
  };

  // Delete store
  const deleteStore = async (storeId) => {
    if (storeId === 'main_store') {
      Alert.alert('Cannot Delete', 'Main Store cannot be deleted as it syncs with daily inventory.');
      return;
    }
    if (stores.length === 1) {
      Alert.alert('Error', 'Cannot delete the last store');
      return;
    }
    
    
    Alert.alert(
      'Delete Store',
      'Are you sure?  This will delete all sales data for this store.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            // Delete all sales data for this store
            const keys = await AsyncStorage.getAllKeys();
            const storeKeys = keys.filter(key => 
              key.startsWith(`monthly_sales_${storeId}_`) || 
              key.startsWith(`yearly_total_${storeId}_`)
            );
            await AsyncStorage.multiRemove(storeKeys);
            
            // Remove store from list
            const updatedStores = stores.filter(s => s.id !== storeId);
            setStores(updatedStores);
            await saveStores(updatedStores);
            
            // Switch to first store if deleted store was selected
            if (selectedStore === storeId) {
              setSelectedStore(updatedStores[0].id);
              await AsyncStorage.setItem('selected_store', updatedStores[0].id);
            }
            
            Alert.alert('Success', 'Store deleted successfully');
          }
        }
      ]
    );
  };

  const filterAndSortItems = () => {
    let filtered = items.filter(item =>
      item.name.toLowerCase().includes(searchText.toLowerCase()) &&
      (filterCategory === 'All' || item.category === filterCategory)
    );

    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          comparison = parseFloat(a.price) - parseFloat(b.price);
          break;
        case 'amount':
          comparison = (parseFloat(a.price) * parseFloat(a.unitsSold)) - (parseFloat(b.price) * parseFloat(b.unitsSold));
          break;
        case 'time':
          comparison = new Date(a.timestamp) - new Date(b.timestamp);
          break;
        default:
          comparison = new Date(a.timestamp) - new Date(b.timestamp);
      }
      
      // Apply sort direction
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    setFilteredItems(filtered);
  };

  const openAddModal = () => {
    setIsCustomItem(true); // Reset to default
    setShowPredefinedItemsModal(true);
  };

  const handleItemTypeSelection = (isCustom) => {
    setIsCustomItem(isCustom);
    if (isCustom) {
      setShowPredefinedItemsModal(false);
      setShowAddModal(true);
    } else {
      setShowPredefinedItemsModal(true);
    }
  };

  const handlePredefinedItemSelection = (predefinedItem) => {
    setNewItem({
      name: predefinedItem.name,
      price: predefinedItem.lastPrice || '',
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

    let updatedItems;
    
    // Only check for existing items if combineIdenticalItems is enabled
    if (combineIdenticalItems) {
      const existingItemIndex = items.findIndex(item => 
        item.name.toLowerCase() === newItem.name.toLowerCase() && 
        parseFloat(item.price) === parseFloat(newItem.price)
      );
      
      if (existingItemIndex !== -1) {
        // Combine with existing item
        const existingItem = items[existingItemIndex];
        const newUnitsSold = parseFloat(existingItem.unitsSold) + parseFloat(newItem.unitsSold);
        const newTotalAmount = (parseFloat(newItem.price) * newUnitsSold).toFixed(2);
        
        updatedItems = [...items];
        updatedItems[existingItemIndex] = {
          ...existingItem,
          unitsSold: newUnitsSold.toString(),
          totalAmount: newTotalAmount,
        };
        
        Alert.alert(
          language.itemUpdated, 
          language.itemUpdatedMessage
            .replace('{{units}}', formatNumber(parseFloat(newItem.unitsSold), 0))
            .replace('{{unitType}}', newItem.unitType)
            .replace('{{total}}', formatNumber(newUnitsSold, 0))
            .replace('{{unitType}}', newItem.unitType)
        );
      } else {
        // No matching item found, add as new
        const price = parseFloat(newItem.price);
        const units = parseFloat(newItem.unitsSold);
        const totalAmount = (price * units).toFixed(2);
        
        const item = {
          id: Date.now().toString(),
          ...newItem,
          totalAmount: totalAmount,
          timestamp: new Date().toISOString(),
        };
        updatedItems = [...items, item];
      }
    } else {
      // Always add as new entry (default behavior)
      const price = parseFloat(newItem.price);
      const units = parseFloat(newItem.unitsSold);
      const totalAmount = (price * units).toFixed(2);
      
      const item = {
        id: Date.now().toString(),
        ...newItem,
        totalAmount: totalAmount,
        timestamp: new Date().toISOString(),
      };
      updatedItems = [...items, item];
    }

    setItems(updatedItems);
    await saveData(updatedItems);

    // Update existing predefined item's price or add new item
    const existingPredefinedIndex = predefinedItems.findIndex(item =>
      item.name.toLowerCase() === newItem.name.toLowerCase() &&
      item.category === newItem.category &&
      item.unitType === newItem.unitType
    );

    if (existingPredefinedIndex !== -1) {
      // Update the price of existing predefined item
      const updatedPredefinedItems = [...predefinedItems];
      updatedPredefinedItems[existingPredefinedIndex] = {
        ...updatedPredefinedItems[existingPredefinedIndex],
        lastPrice: newItem.price,
      };
      setPredefinedItems(updatedPredefinedItems);
      await savePredefinedItems(updatedPredefinedItems);
    } else if (isItemUnique(newItem, predefinedItems)) {
      // Add new predefined item with price
      await addToPredefinedItems(newItem);
    }

    setNewItem({
      name: '',
      price: '',
      unitsSold: '',
      category: defaultCategories[4],
      unitType: defaultUnitTypes[4],
    });
    setIsCustomItem(true);
    setShowAddModal(false);
  };

  const deleteItem = async (itemId) => {
    const updatedItems = items.filter(item => item.id !== itemId);
    setItems(updatedItems);
    await saveData(updatedItems);
  };

  const getDailyTotal = () => {
    const total = filteredItems.reduce((total, item) =>
      total + (parseFloat(item.price) * parseFloat(item.unitsSold)), 0
    );
    return formatNumber(total, 2);
  };

  const getFilteredPredefinedItems = useMemo(() => {
    let filtered = predefinedItems.filter(item =>
      item.name.toLowerCase().includes(debouncedSearchText.toLowerCase()) &&
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
  }, [predefinedItems, predefinedSearchText, predefinedFilterCategory, predefinedSortBy]);

  // const getFilteredPredefinedItems = () => {
  //   let filtered = predefinedItems.filter(item =>
  //     item.name.toLowerCase().includes(predefinedSearchText.toLowerCase()) &&
  //     (predefinedFilterCategory === 'All' || item.category === predefinedFilterCategory)
  //   );

  //   filtered.sort((a, b) => {
  //     switch (predefinedSortBy) {
  //       case 'name':
  //         return a.name.localeCompare(b.name);
  //       case 'category':
  //         return a.category.localeCompare(b.category);
  //       default:
  //         return 0;
  //     }
  //   });

  //   return filtered;
  // };

  const [loadedItemsCount, setLoadedItemsCount] = useState(20);
  const ITEMS_PER_LOAD = 20;

  const loadedPredefinedItems = useMemo(() => {
    const filtered = getFilteredPredefinedItems;
    return filtered.slice(0, loadedItemsCount);
  }, [getFilteredPredefinedItems, loadedItemsCount]);

  const loadMoreItems = () => {
    const filtered = getFilteredPredefinedItems;
    if (loadedItemsCount < filtered.length) {
      setLoadedItemsCount(prev => prev + ITEMS_PER_LOAD);
    }
  };

  const resetPagination = () => {
    setLoadedItemsCount(20);
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
      const priceIndex = headers.findIndex(h => h.includes('price') || h.includes('cost'));

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
            unitType: values[unitIndex] || 'pcs',
            lastPrice: values[priceIndex] || ''
          });
        }
      }

      if (importedItems.length > 0) {
        // Check how many are unique before showing the dialog
        const uniqueItems = importedItems.filter(item => isItemUnique(item, predefinedItems));
        const duplicatesCount = importedItems.length - uniqueItems.length;
        
        const message = `Found ${importedItems.length} items${duplicatesCount > 0 ? ` (${duplicatesCount} would be duplicates)` : ''}. Import them?`;
        
        Alert.alert(
          'CSV Import',
          message,
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

    // Export predefined items to CSV file
  const exportPredefinedItemsCSV = async () => {
    try {
      // Create CSV header
      let csvContent = 'name,category,unitType,price\n';

      // Add each item as a CSV row
      predefinedItems.forEach(item => {
        const name = `"${item.name.replace(/"/g, '""')}"`;
        const category = `"${item.category.replace(/"/g, '""')}"`;
        const unitType = `"${item.unitType.replace(/"/g, '""')}"`;
        const price = `"${(item.lastPrice || '').toString().replace(/"/g, '""')}"`;
        csvContent += `${name},${category},${unitType},${price}\n`;
      });
      
      const filename = `predefined-items-${new Date().toISOString().split('T')[0]}.csv`;
      const fileUri = FileSystem.documentDirectory + filename;
      
      await FileSystem.writeAsStringAsync(fileUri, csvContent);
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('Export Complete', `CSV file saved to: ${filename}`);
      }
    } catch (error) {
      Alert.alert('Export Error', 'Could not export predefined items to CSV');
      console.error('CSV Export error:', error);
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
      // Filter out duplicates using our helper function
      const uniqueNewItems = newItems.filter(item => isItemUnique(item, predefinedItems))
        .map((item, index) => ({
          ...item,
          id: item.id || `imported_${Date.now()}_${index}`
        }));
      
      const mergedItems = [...predefinedItems, ...uniqueNewItems];
      setPredefinedItems(mergedItems);
      await savePredefinedItems(mergedItems);
      
      const duplicatesSkipped = newItems.length - uniqueNewItems.length;
      
      Alert.alert(
        'Success', 
        `Added ${uniqueNewItems.length} new items${duplicatesSkipped > 0 ? ` (${duplicatesSkipped} duplicates skipped)` : ''}`
      );
    } catch (error) {
      Alert.alert('Error', 'Could not merge predefined items');
    }
  };

  const generateReceiptHTML = () => {
    const dateStr = selectedDate.toLocaleDateString();
    const timeStr = new Date().toLocaleTimeString();
    
    let itemsHTML = '';
    if (filteredItems.length === 0) {
      itemsHTML = '<tr><td colspan="4" style="text-align: center; color: #666; font-style: italic;">No items sold on this date</td></tr>';
    } else {
      filteredItems.forEach((item, index) => {
        const total = formatNumber(parseFloat(item.price) * parseFloat(item.unitsSold), 2);
        const price = formatNumber(parseFloat(item.price), 2);
        const units = formatNumber(parseFloat(item.unitsSold), 2);
        
        itemsHTML += `
          <tr>
            <td>${index + 1}</td>
            <td>
              <strong>${item.name}</strong><br>
              <small style="color: #666;">${item.category}</small>
            </td>
            <td>${language.currency}${price}/${item.unitType} × ${units}</td>
            <td style="text-align: right; font-weight: bold;">${language.currency}${total}</td>
          </tr>
        `;
      });
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Daily Sales Summary</title>
        <style>
          /* ... existing styles ... */
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">${language.dailySummary}</div>
          ${isDayConfirmed ? '<div class="confirmed-badge">✅ Confirmed</div>' : ''}
          <div class="date-info">
            Date: ${dateStr}<br>
            Generated: ${timeStr}
          </div>
        </div>
        
        <table class="summary-table">
          <thead>
            <tr>
              <th width="8%">#</th>
              <th width="40%">Item</th>
              <th width="32%">Price × Quantity</th>
              <th width="20%">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>
        
        <div class="total-section">
          <div class="total-row">
            <span>Total Items:</span>
            <span>${formatNumber(filteredItems.length, 0)}</span>
          </div>
          <div class="total-row grand-total">
            <span>Daily Total:</span>
            <span>${language.currency}${getDailyTotal()}</span>
          </div>
        </div>
        
        <div class="footer">
          Generated by ${language.appTitle}<br>
          ${new Date().toLocaleString()}
        </div>
      </body>
      </html>
    `;
  };

  const generateAndSharePDF = async () => {
    try {
      const htmlContent = generateReceiptHTML();
      const fileName = `receipt-${formatDate(selectedDate)}.pdf`;
      
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          UTI: '.pdf',
          mimeType: 'application/pdf',
        });
        setShowReceiptModal(false);
      } else {
        Alert.alert('PDF Generated', `PDF created successfully`);
        setShowReceiptModal(false);
      }
    } catch (error) {
      console.error('PDF Generation Error:', error);
      Alert.alert('Error', 'Could not generate PDF. Please try again.');
    }
  };

  const shareViaEmailPDF = async () => {
    try {
      const htmlContent = generateReceiptHTML();
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });
      
      const subject = `Daily Sales Summary - ${selectedDate.toLocaleDateString()}`;
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          UTI: '.pdf',
          mimeType: 'application/pdf',
        });
        setShowReceiptModal(false);
      }
    } catch (error) {
      console.error('PDF Email Error:', error);
      Alert.alert('Error', 'Could not generate PDF for email.');
    }
  };

  // Generate dynamic categories from existing items
  const getDynamicCategories = useCallback(() => {
    const itemCategories = new Set();
    
    // Add categories from current day's items
    items.forEach(item => {
      if (item.category) {
        itemCategories.add(item.category);
      }
    });
    
    // Add categories from predefined items
    predefinedItems.forEach(item => {
      if (item.category) {
        itemCategories.add(item.category);
      }
    });
    
    // Add default categories to ensure they're always available
    categories.forEach(cat => {
      itemCategories.add(cat);
    });
    
    // Always ensure "Other" is included (in current language)
    const otherInCurrentLanguage = selectedLanguage === 'my' ? 'အခြား' : 'Other';
    itemCategories.add(otherInCurrentLanguage);
    
    return ['All', ...Array.from(itemCategories).sort()];
  }, [items, predefinedItems, categories, selectedLanguage]);

  // Generate dynamic unit types from existing items
  const getDynamicUnitTypes = useCallback(() => {
    const itemUnitTypes = new Set();
    
    // Add unit types from current day's items
    items.forEach(item => {
      if (item.unitType) {
        itemUnitTypes.add(item.unitType);
      }
    });
    
    // Add unit types from predefined items
    predefinedItems.forEach(item => {
      if (item.unitType) {
        itemUnitTypes.add(item.unitType);
      }
    });
    
    // Add default unit types to ensure they're always available
    unitTypes.forEach(unit => {
      itemUnitTypes.add(unit);
    });
    
    return Array.from(itemUnitTypes).sort();
  }, [items, predefinedItems, unitTypes]);

  const loadDailyConfirmation = async (date) => {
    try {
      const dateKey = formatDate(date);
      const confirmationData = await AsyncStorage.getItem('daily_confirmations');
      if (confirmationData) {
        const confirmations = JSON.parse(confirmationData);
        setIsDayConfirmed(confirmations[dateKey] || false);
      } else {
        setIsDayConfirmed(false);
      }
    } catch (error) {
      console.error('Error loading daily confirmation:', error);
      setIsDayConfirmed(false);
    }
  };

  const saveDailyConfirmation = async (date, isConfirmed) => {
    try {
      const dateKey = formatDate(date);
      const confirmationData = await AsyncStorage.getItem('daily_confirmations');
      let confirmations = {};
      
      if (confirmationData) {
        confirmations = JSON.parse(confirmationData);
      }
      
      confirmations[dateKey] = isConfirmed;
      await AsyncStorage.setItem('daily_confirmations', JSON.stringify(confirmations));
      setIsDayConfirmed(isConfirmed);
    } catch (error) {
      console.error('Error saving daily confirmation:', error);
    }
  };

  const toggleDayConfirmation = () => {
    const newConfirmationState = !isDayConfirmed;
    saveDailyConfirmation(selectedDate, newConfirmationState);
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
            unitType: parts[2] || bulkAddUnitType,
            lastPrice: ''
          });
        }
      });
      
      if (newItems.length > 0) {
        // Check for duplicates before showing confirmation
        const uniqueItems = newItems.filter(item => isItemUnique(item, predefinedItems));
        const duplicatesCount = newItems.length - uniqueItems.length;
        
        const message = `Add ${newItems.length} items to predefined items?${duplicatesCount > 0 ? `\n(${duplicatesCount} duplicates will be skipped)` : ''}`;
        
        Alert.alert(
          'Bulk Add Confirmation',
          message,
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
      // Filter out duplicates using our helper function
      const uniqueItems = newItems.filter(item => isItemUnique(item, predefinedItems));
      
      const updatedItems = [...predefinedItems, ...uniqueItems];
      setPredefinedItems(updatedItems);
      await savePredefinedItems(updatedItems);
      
      const duplicatesCount = newItems.length - uniqueItems.length;
      
      Alert.alert(
        'Success',
        `Added ${uniqueItems.length} items${duplicatesCount > 0 ? ` (${duplicatesCount} duplicates skipped)` : ''}`
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
        const savedCurrency = await AsyncStorage.getItem('selectedCurrency'); 
        const savedCombinePreference = await AsyncStorage.getItem('combineIdenticalItems');
        
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

        if (savedCurrency) {
          setSelectedCurrency(savedCurrency);
          languageConfig.currency = savedCurrency;
        } else {
          setSelectedCurrency(languageConfig.currency || '$');
        }
        
        if (savedCombinePreference !== null) {
          setCombineIdenticalItems(savedCombinePreference === 'true');
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
      await AsyncStorage.setItem('selectedCurrency', selectedCurrency);
      await AsyncStorage.setItem('combineIdenticalItems', combineIdenticalItems.toString());
      await AsyncStorage.setItem('tax_settings', JSON.stringify(taxSettings));
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
      } else {
        setCategories(defaultCategories);
        setUnitTypes(defaultUnitTypes);
      }

      // Reset form to use appropriate defaults based on available options
      // This will use dynamic categories/units if they exist, otherwise fallback to defaults
      const otherCategory = languageCode === 'my' ? 'အခြား' : 'Other';
      const defaultUnit = languageCode === 'my' ? 'အတု' : 'pcs';

      setNewItem(prev => ({
        ...prev,
        category: otherCategory,
        unitType: defaultUnit,
      }));
      
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
  // const isItemUnique = (itemToCheck, existingItems) => {
  //   return !existingItems.some(existingItem => 
  //     existingItem.name.toLowerCase() === itemToCheck.name.toLowerCase() &&
  //     existingItem.category === itemToCheck.category &&
  //     existingItem.unitType === itemToCheck.unitType
  //   );
  // };

  const isItemUnique = useCallback((itemToCheck, existingItems) => {
    const key = `${itemToCheck.name.toLowerCase()}-${itemToCheck.category}-${itemToCheck.unitType}`;
    const existingKeys = new Set(existingItems.map(item => 
      `${item.name.toLowerCase()}-${item.category}-${item.unitType}`
    ));
    return !existingKeys.has(key);
  }, []);
  
  const [activeSwipeId, setActiveSwipeId] = useState(null);

// Reset all swipes when modal closes
  useEffect(() => {
    if (!showPredefinedItemsModal) {
      setActiveSwipeId(null);
    }
  }, [showPredefinedItemsModal]);

  const SwipeableItem = React.memo(({ item, onSelect, onDelete }) => {
    const [translateX] = useState(new Animated.Value(0));
    const [isDeleteVisible, setIsDeleteVisible] = useState(false);

    const panResponder = useMemo(() => PanResponder.create({
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
    }), []);

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
  });

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
      setSwipedItemId(null);
      Alert.alert(language.successTitle, language.itemDeletedSuccess);
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
      language.deleteItem,
      language.deleteItemConfirm.replace('"${item.name}"', `"${item.name}"`),
      [
        { text: language.cancel, style: 'cancel' },
        { 
          text: language.delete, 
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
        receiptText += `   Price: ${language.currency}${item.price} per ${item.unitType}\n`;
        receiptText += `   Quantity: ${item.unitsSold} ${item.unitType}\n`;
        receiptText += `   Total: ${language.currency}${total}\n\n`;
      });
    }
    
    receiptText += `${'-'.repeat(40)}\n`;
    receiptText += `Daily Total: ${language.currency}${getDailyTotal()}\n`;
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

  // OCR Integration removed - camera and image picker functionality disabled

  // Filter and Sort option arrays
  const sortOptions = [
    { label: language.sortByTime, value: 'time' },
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
          onPress={() => setShowCalendarModal(true)}
        >
          <Text style={styles.dateText}>📅 {selectedDate.toDateString()}</Text>
        </TouchableOpacity>
        
        {/* + Add Item Button */}
        <TouchableOpacity
          style={styles.headerAddItemButton}
          onPress={() => {
            console.log('Add Item button clicked'); // Debug log
            // setShowPredefinedItemsModal(true);
            setShowTakeOrderModal(false); // Close Take Order if open
            setShowAddToCartModal(false); // Close cart modal if open  
            openAddModal();
          }}
        >
          <Text style={styles.headerAddItemButtonText}>+ {language.addItem}</Text>
        </TouchableOpacity>
      </View>

      {/* Conditional DateTimePicker with error handling */}
      <Modal
        visible={showCalendarModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowCalendarModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowCalendarModal(false)}>
          <View style={styles.calendarModalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.calendarModalContent}>
                <Calendar
                  current={formatDate(selectedDate)}
                  onDayPress={(day) => {
                    const [year, month, dayNum] = day.dateString.split('-');
                    // Create date at noon local time to avoid timezone issues
                    const newDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(dayNum), 12, 0, 0);
                    setSelectedDate(newDate);
                    setShowCalendarModal(false);
                  }}
                  markedDates={{
                    [formatDate(selectedDate)]: {
                      selected: true,
                      selectedColor: '#2196f3'
                    }
                  }}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) setSelectedDate(date);
          }}
        />
      )} */}

      {/* {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) setSelectedDate(date);
          }}
        />
      )} */}

      {/* Confirmation Toggle */}
      {/* <View style={styles.confirmationContainer}>
        <TouchableOpacity
          style={[
            styles.confirmationButton,
            isDayConfirmed && styles.confirmationButtonConfirmed
          ]}
          onPress={toggleDayConfirmation}
          activeOpacity={0.7}
        >
          <Text style={styles.confirmationIcon}>
            {isDayConfirmed ? '✅' : '⭕'}
          </Text>
          <Text style={[
            styles.confirmationText,
            isDayConfirmed && styles.confirmationTextConfirmed
          ]}>
            {isDayConfirmed ? language.dayConfirmed : language.confirmDay}
          </Text>
        </TouchableOpacity>
      </View> */}

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={language.searchPlaceholder}
          value={searchText}
          onChangeText={setSearchText}
        />
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Text style={styles.filterIcon}>☰</Text>
        </TouchableOpacity>
      </View>

      {/* Items List */}
      <ScrollView style={styles.itemsList}>
        {filteredItems.length === 0 ? (
          <View style={styles.noItemsContainer}>
            <Text style={styles.noItemsText}>{language.noItems}</Text>
          </View>
        ) : (
          filteredItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={styles.itemCard}
              onPress={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
            >
              <View style={styles.itemHeader}>
                <Text style={styles.itemNumber}>{index + 1}.</Text>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemAmount}>
                  {language.currency}{formatNumber(parseFloat(item.price) * parseFloat(item.unitsSold), 2)}
                </Text>
              </View>

              <View style={styles.itemSubInfo}>
                <Text style={styles.itemDetail}>
                  {language.price}: {language.currency}{formatNumber(parseFloat(item.price), 2)} | {language.unitsSold}: {formatNumber(parseFloat(item.unitsSold), 2)} {item.unitType}
                </Text>
                <Text style={styles.itemCategory}>{item.category}</Text>
              </View>

              {expandedItem === item.id && (
                <View style={styles.expandedInfo}>
                  <Text style={styles.expandedText}>
                    {language.price}: {language.currency}{formatNumber(parseFloat(item.price), 2)}
                  </Text>
                  <Text style={styles.expandedText}>
                    {language.unitsSold}: {formatNumber(parseFloat(item.unitsSold), 2)} {item.unitType}
                  </Text>
                  <Text style={styles.expandedText}>
                    {language.totalAmount}: {language.currency}{formatNumber(parseFloat(item.totalAmount), 2)}
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
      {/* <TouchableOpacity
        style={styles.addButton}
        onPress={openAddModal}
      >
        <Text style={styles.addButtonText}>+ {language.addItem}</Text>
      </TouchableOpacity> */}

      {/* Take Order Button */}
      <TouchableOpacity
        style={styles.takeOrderButton}
        onPress={() => {
          // Reset search/filters when opening
          setPredefinedSearchText('');
          setPredefinedFilterCategory('All');
          setLoadedItemsCount(20);
          setShowTakeOrderModal(true);
        }}
      >
        <Text style={styles.takeOrderButtonText}>{language.takeOrder || 'Take Order'}</Text>
      </TouchableOpacity>

      {/* Bottom Navigation Bar */}
      <TouchableOpacity 
        style={styles.bottomNav}
        onPress={() => setShowReceiptModal(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.totalText}>
          {language.dailyTotal}: {language.currency}{getDailyTotal()}
        </Text>
        <Text style={styles.tapToViewReceipt}>
          {language.tapToViewReceipt}
        </Text>
      </TouchableOpacity>

      {/* Receipt Modal */}
      <Modal
        visible={showReceiptModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowReceiptModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowReceiptModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.receiptModalContent}>
                <View style={styles.receiptTitleContainer}>
                  <Text style={styles.receiptTitle}>{language.dailySummary}</Text>
                  {isDayConfirmed && (
                    <View style={styles.confirmedBadge}>
                      <Text style={styles.confirmedBadgeIcon}>✅</Text>
                      <Text style={styles.confirmedBadgeText}>Confirmed</Text>
                    </View>
                  )}
                </View>
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
                            {language.currency}{formatNumber(parseFloat(item.price) * parseFloat(item.unitsSold), 2)}
                          </Text>
                        </View>
                        <View style={styles.receiptItemDetails}>
                          <Text style={styles.receiptItemDetail}>
                            {language.currency}{formatNumber(parseFloat(item.price), 2)}/{item.unitType} × {formatNumber(parseFloat(item.unitsSold), 2)} {item.unitType}
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
                    <Text style={styles.receiptSummaryLabel}>{language.totalItems || 'Total Items'}:</Text>
                    <Text style={styles.receiptSummaryValue}>{filteredItems.length}</Text>
                  </View>
                  <View style={styles.receiptSummaryRow}>
                    <Text style={styles.receiptTotalLabel}>{language.dailyTotal}:</Text>
                    <Text style={styles.receiptTotalValue}>{language.currency}{getDailyTotal()}</Text>
                  </View>
                </View>
                
                {/* <View style={styles.receiptButtonRow}>
                  <TouchableOpacity
                    style={styles.shareButton}
                    onPress={shareViaEmailPDF}
                  >
                    <Text style={styles.shareButtonText}>📧 {language.shareViaEmail}</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.shareButton}
                    onPress={shareViaText}
                  >
                    <Text style={styles.shareButtonText}>💬 {language.shareViaText}</Text>
                  </TouchableOpacity>
                </View> */}

                <TouchableOpacity
                  style={styles.pdfShareButton}
                  onPress={generateAndSharePDF}
                >
                  <Text style={styles.pdfShareButtonText}>📄 {language.sharePDF}</Text>
                </TouchableOpacity>
                
                {/* <TouchableOpacity
                  style={styles.genericShareButton}
                  onPress={shareReceipt}
                >
                  <Text style={styles.genericShareButtonText}>📤 Share</Text>
                </TouchableOpacity> */}
                
                <TouchableOpacity
                  style={styles.closeReceiptButton}
                  onPress={() => setShowReceiptModal(false)}
                >
                  <Text style={styles.closeReceiptButtonText}>{language.close}</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
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
          setDebouncedSearchText('');
          setPredefinedFilterCategory('All');
          setPredefinedSortBy('name');
          setShowPredefinedCategoryModal(false);
          setShowBulkActionsModal(false);
          setLoadedItemsCount(20);
          setActiveSwipeId(null);
        }}
      >
        <TouchableWithoutFeedback onPress={() => {
          setShowPredefinedItemsModal(false);
          setPredefinedSearchText('');
          setDebouncedSearchText('');
          setPredefinedFilterCategory('All');
          setPredefinedSortBy('name');
          setShowPredefinedCategoryModal(false);
          setShowBulkActionsModal(false);
          setLoadedItemsCount(20);
          setActiveSwipeId(null);
        }}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.enhancedPredefinedModalContent}>
                <Text style={styles.selectionModalTitle}>{language.predefinedItems}</Text>
                

                
                <View style={styles.predefinedSearchContainer}>
                  <TextInput
                    style={styles.predefinedSearchInput}
                    placeholder="Search items..."
                    value={predefinedSearchText}
                    onChangeText={setPredefinedSearchText}
                    clearButtonMode="while-editing"
                  />
                  <TouchableOpacity
                    style={styles.predefinedFilterButton}
                    onPress={() => setShowPredefinedCategoryModal(true)}
                  >
                    <Text style={styles.predefinedFilterIcon}>☰</Text>
                  </TouchableOpacity>
                </View>
                
                {/* <ScrollView style={styles.predefinedItemsList}>
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
                </ScrollView> */}
                
                <ScrollView 
                  style={styles.predefinedItemsList}
                  onScroll={({ nativeEvent }) => {
                    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
                    const paddingToBottom = 20;
                    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
                      loadMoreItems();
                    }
                  }}
                  scrollEventThrottle={400}
                >
                  {loadedPredefinedItems.length === 0 ? (
                    <View style={styles.noPredefinedItemsContainer}>
                      <Text style={styles.noPredefinedItemsText}>
                        No items found matching your search
                      </Text>
                    </View>
                  ) : (
                    loadedPredefinedItems.map(item => (
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
                  
                  {loadedItemsCount < getFilteredPredefinedItems.length && (
                    <View style={styles.loadingMoreContainer}>
                      <Text style={styles.loadingMoreText}>Loading more items...</Text>
                    </View>
                  )}
                </ScrollView>
                <Text style={styles.resultsCount}>
                  {language.showingItems
                    .replace('{{count}}', Math.min(loadedItemsCount, getFilteredPredefinedItems.length))
                    .replace('{{total}}', getFilteredPredefinedItems.length)
                    .replace('{{all}}', predefinedItems.length)}
                </Text>

                <TouchableOpacity
                  style={styles.bulkActionsButton}
                  onPress={() => setShowBulkActionsModal(true)}
                >
                  <Text style={styles.bulkActionsButtonText}>⚙️ {language.bulkActions}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.closeModalButton}
                  onPress={() => {
                    setShowPredefinedItemsModal(false);
                    setPredefinedSearchText('');
                    setDebouncedSearchText('');
                    setPredefinedFilterCategory('All');
                    setPredefinedSortBy('name');
                    setShowPredefinedCategoryModal(false);
                    setShowBulkActionsModal(false);
                    setLoadedItemsCount(20);
                    setActiveSwipeId(null);
                  }}
                >
                  <Text style={styles.closeModalButtonText}>{language.cancel}</Text>
                </TouchableOpacity>
                
                {showPredefinedCategoryModal && (
                  <Modal
                    visible={showPredefinedCategoryModal}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setShowPredefinedCategoryModal(false)}
                  >
                    <View style={styles.filterModalOverlay}>
                      <View style={styles.filterModalContent}>
                        {/* Header */}
                        <View style={styles.filterModalHeader}>
                          <View style={styles.filterHeaderLeft}>
                            <Text style={styles.filterIcon}>🔍</Text>
                            <Text style={styles.filterTitle}>FILTER</Text>
                          </View>
                          <TouchableOpacity onPress={() => setShowPredefinedCategoryModal(false)}>
                            <Text style={styles.closeIcon}>✕</Text>
                          </TouchableOpacity>
                        </View>
                        
                        {/* Category Section */}
                        <View style={styles.filterSection}>
                          <View style={styles.filterSectionHeader}>
                            <Text style={styles.filterSectionTitle}>CATEGORY</Text>
                            {/* <TouchableOpacity 
                              style={styles.clearButton}
                              onPress={() => setPredefinedFilterCategory('All')}
                            >
                              <Text style={styles.clearButtonText}>Clear</Text>
                            </TouchableOpacity> */}
                          </View>
                          
                          <View style={styles.categoryChips}>
                            {getDynamicCategories().map(cat => (
                              <TouchableOpacity
                                key={cat}
                                style={[styles.categoryChip, predefinedFilterCategory === cat && styles.selectedCategoryChip]}
                                onPress={() => setPredefinedFilterCategory(cat)}
                              >
                                <Text style={[styles.categoryChipText, predefinedFilterCategory === cat && styles.selectedCategoryChipText]}>
                                  {cat}
                                </Text>
                              </TouchableOpacity>
                            ))}
                            {/* <TouchableOpacity
                              style={[styles.overlayOption, styles.addNewCategoryOption]}
                              onPress={() => {
                                // You can implement a text input modal here
                                Alert.prompt(
                                  'New Category',
                                  'Enter a new category name:',
                                  [
                                    { text: 'Cancel', style: 'cancel' },
                                    {
                                      text: 'Add',
                                      onPress: (categoryName) => {
                                        if (categoryName && categoryName.trim()) {
                                          const newCategory = categoryName.trim();
                                          setCategories(prev => [...prev, newCategory]);
                                          setNewItem(prev => ({ ...prev, category: newCategory }));
                                          setShowCategoryModal(false);
                                        }
                                      }
                                    }
                                  ],
                                  'plain-text'
                                );
                              }}
                            >
                              <Text style={styles.addNewCategoryText}>+ Add New Category</Text>
                            </TouchableOpacity> */}
                          </View>
                        </View>
                        
                        {/* Sort Section */}
                        <View style={styles.filterSection}>
                          <View style={styles.filterSectionHeader}>
                            <Text style={styles.filterSectionTitle}>SORT BY</Text>
                          </View>
                          
                          <TouchableOpacity 
                            style={styles.sortOption}
                            onPress={() => setPredefinedSortBy('name')}
                          >
                            <Text style={styles.sortOptionText}>Name (A-Z)</Text>
                            <View style={[styles.sortToggle, predefinedSortBy === 'name' && styles.activeSortToggle]} />
                          </TouchableOpacity>
                          
                          <TouchableOpacity 
                            style={styles.sortOption}
                            onPress={() => setPredefinedSortBy('category')}
                          >
                            <Text style={styles.sortOptionText}>Category</Text>
                            <View style={[styles.sortToggle, predefinedSortBy === 'category' && styles.activeSortToggle]} />
                          </TouchableOpacity>
                        </View>
                        
                        {/* Apply Button */}
                        <TouchableOpacity
                          style={styles.applyButton}
                          onPress={() => setShowPredefinedCategoryModal(false)}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.applyButtonText}>Apply</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </Modal>
                )}
              
                {showBulkActionsModal && (
                  <View style={styles.overlayModalContainer}>
                    <View style={styles.bulkActionsModalContent}>
                      <Text style={styles.overlayModalTitle}>{language.bulkActions}</Text>
                      <Text style={styles.bulkActionsSubtitle}>
                        {language.managePredefined}
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
                            <Text style={styles.bulkActionTitle}>{language.bulkAddItems}</Text>
                            <Text style={styles.bulkActionDescription}>
                              {language.bulkAddDescription}
                            </Text>
                          </View>
                        </TouchableOpacity>

                        {/* Create Custom Item */}
                        <TouchableOpacity
                          style={styles.bulkActionOption}
                          onPress={() => {
                            setShowBulkActionsModal(false);
                            setShowPredefinedItemsModal(false);
                            setShowAddModal(true);
                            setIsCustomItem(true);
                          }}
                        >
                          <Text style={styles.bulkActionIcon}>✏️</Text>
                          <View style={styles.bulkActionContent}>
                            <Text style={styles.bulkActionTitle}>{language.createCustomItem}</Text>
                            <Text style={styles.bulkActionDescription}>
                              {language.createCustomDescription}
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

                        {/* Export CSV */}
                          <TouchableOpacity
                            style={styles.bulkActionOption}
                            onPress={() => {
                              setShowBulkActionsModal(false);
                              exportPredefinedItemsCSV();
                            }}
                          >
                            <Text style={styles.bulkActionIcon}>📊</Text>
                            <View style={styles.bulkActionContent}>
                              <Text style={styles.bulkActionTitle}>{language.exportCSV}</Text>
                              <Text style={styles.bulkActionDescription}>
                                {language.exportCSVDescription}
                              </Text>
                            </View>
                          </TouchableOpacity>

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
                            <Text style={styles.bulkActionTitle}>{language.importCSV}</Text>
                            <Text style={styles.bulkActionDescription}>
                              {language.importCSVDescription}
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
                              {language.deleteAllItems}
                            </Text>
                            <Text style={[styles.bulkActionDescription, styles.dangerousActionText]}>
                              {language.deleteAllDescription}
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
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
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
                    onChangeText={(text) => {
                      // Only allow numbers and one decimal point
                      const numericValue = text.replace(/[^0-9.]/g, '');
                      const parts = numericValue.split('.');
                      const filteredValue = parts.length > 2 
                        ? parts[0] + '.' + parts.slice(1).join('') 
                        : numericValue;
                      setNewItem(prev => ({ ...prev, price: filteredValue }));
                    }}
                    keyboardType="decimal-pad"
                  />
                  <TextInput
                    style={[styles.modernInput, { flex: 1, marginLeft: 8 }]}
                    placeholder={language.unitsSold}
                    value={newItem.unitsSold}
                    onChangeText={(text) => {
                      // Only allow numbers and one decimal point
                      const numericValue = text.replace(/[^0-9.]/g, '');
                      const parts = numericValue.split('.');
                      const filteredValue = parts.length > 2 
                        ? parts[0] + '.' + parts.slice(1).join('') 
                        : numericValue;
                      setNewItem(prev => ({ ...prev, unitsSold: filteredValue }));
                    }}
                    keyboardType="decimal-pad"
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
                    Total Amount: {language.currency}{calculateTotal()}
                  </Text>
                </View>

                {/* <TouchableOpacity style={styles.modernOcrButton} onPress={handleOCRScan}>
                  <Text style={styles.modernOcrButtonText}>📷 {language.scanWithOCR}</Text>
                </TouchableOpacity> */}

                <View style={styles.modernButtonRow}>
                  <TouchableOpacity
                    style={[styles.modernButton, styles.modernCancelButton]}
                    onPress={() => {
                      setShowAddModal(false);
                      setIsCustomItem(true); // Reset to default
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
                    {getDynamicCategories().filter(cat => cat !== 'All').map(cat => (
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
                  {/* <TouchableOpacity
                    style={[styles.overlayOption, styles.addNewCategoryOption]}
                    onPress={() => {
                      // You can implement a text input modal here
                      Alert.prompt(
                        'New Category',
                        'Enter a new category name:',
                        [
                          { text: 'Cancel', style: 'cancel' },
                          {
                            text: 'Add',
                            onPress: (categoryName) => {
                              if (categoryName && categoryName.trim()) {
                                const newCategory = categoryName.trim();
                                setCategories(prev => [...prev, newCategory]);
                                setNewItem(prev => ({ ...prev, category: newCategory }));
                                setShowCategoryModal(false);
                              }
                            }
                          }
                        ],
                        'plain-text'
                      );
                    }}
                  >
                    <Text style={styles.addNewCategoryText}>+ Add New Category</Text>
                  </TouchableOpacity> */}
                  
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
                    {getDynamicUnitTypes().map(unit => (
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
                    
                    {/* Add new unit type option */}
                    <TouchableOpacity
                      style={[styles.overlayOption, styles.addNewUnitOption]}
                      onPress={() => {
                        Alert.prompt(
                          'New Unit Type',
                          'Enter a new unit type (e.g., bottles, boxes, etc.):',
                          [
                            { text: 'Cancel', style: 'cancel' },
                            {
                              text: 'Add',
                              onPress: (unitName) => {
                                if (unitName && unitName.trim()) {
                                  const newUnit = unitName.trim();
                                  setUnitTypes(prev => [...prev, newUnit]);
                                  setNewItem(prev => ({ ...prev, unitType: newUnit }));
                                  setShowUnitTypeModal(false);
                                }
                              }
                            }
                          ],
                          'plain-text'
                        );
                      }}
                    >
                      <Text style={styles.addNewUnitText}>+ Add New Unit Type</Text>
                    </TouchableOpacity>
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
        <TouchableWithoutFeedback onPress={() => setShowFilterModal(false)}>
          <View style={styles.filterModalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.filterModalContent}>
                {/* Header */}
                <View style={styles.filterModalHeader}>
                  <View style={styles.filterHeaderLeft}>
                    <Text style={styles.filterIcon}>🔍</Text>
                    <Text style={styles.filterTitle}>FILTER</Text>
                  </View>
                  <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                    <Text style={styles.closeIcon}>✕</Text>
                  </TouchableOpacity>
                </View>
                
                {/* Category Section */}
                <View style={styles.filterSection}>
                  <View style={styles.filterSectionHeader}>
                    <Text style={styles.filterSectionTitle}>CATEGORY</Text>
                    {/* <View style={styles.clearButton}>
                      <Text style={styles.clearButtonText}>Clear</Text>
                    </View> */}
                  </View>
                  
                  <View style={styles.categoryChips}>
                    {getDynamicCategories().map(cat => (
                      <TouchableOpacity
                        key={cat}
                        style={[styles.categoryChip, filterCategory === cat && styles.selectedCategoryChip]}
                        onPress={() => setFilterCategory(cat)}
                      >
                        <Text style={[styles.categoryChipText, filterCategory === cat && styles.selectedCategoryChipText]}>
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    ))}
                    {/* <TouchableOpacity
                      style={[styles.overlayOption, styles.addNewCategoryOption]}
                      onPress={() => {
                        // You can implement a text input modal here
                        Alert.prompt(
                          'New Category',
                          'Enter a new category name:',
                          [
                            { text: 'Cancel', style: 'cancel' },
                            {
                              text: 'Add',
                              onPress: (categoryName) => {
                                if (categoryName && categoryName.trim()) {
                                  const newCategory = categoryName.trim();
                                  setCategories(prev => [...prev, newCategory]);
                                  setNewItem(prev => ({ ...prev, category: newCategory }));
                                  setShowCategoryModal(false);
                                }
                              }
                            }
                          ],
                          'plain-text'
                        );
                      }}
                    >
                      <Text style={styles.addNewCategoryText}>+ Add New Category</Text>
                    </TouchableOpacity> */}
                  </View>
                </View>
                
                {/* Sort Section */}
                <View style={styles.filterSection}>
                  <View style={styles.filterSectionHeader}>
                    <Text style={styles.filterSectionTitle}>SORT BY</Text>
                    <TouchableOpacity 
                      style={styles.directionToggle}
                      onPress={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                    >
                      <Text style={styles.directionToggleText}>
                        {sortDirection === 'asc' ? '↑ ASC' : '↓ DESC'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.sortOption}
                    onPress={() => setSortBy('name')}
                  >
                    <Text style={styles.sortOptionText}>Name (A-Z)</Text>
                    <View style={[styles.sortToggle, sortBy === 'name' && styles.activeSortToggle]} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.sortOption}
                    onPress={() => setSortBy('price')}
                  >
                    <Text style={styles.sortOptionText}>Price</Text>
                    <View style={[styles.sortToggle, sortBy === 'price' && styles.activeSortToggle]} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.sortOption}
                    onPress={() => setSortBy('amount')}
                  >
                    <Text style={styles.sortOptionText}>Total Amount</Text>
                    <View style={[styles.sortToggle, sortBy === 'amount' && styles.activeSortToggle]} />
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.sortOption}
                    onPress={() => setSortBy('time')}
                  >
                    <Text style={styles.sortOptionText}>Time Created</Text>
                    <View style={[styles.sortToggle, sortBy === 'time' && styles.activeSortToggle]} />
                  </TouchableOpacity>
                </View>
                
                {/* Apply Button */}
                <TouchableOpacity
                  style={styles.applyButton}
                  onPress={() => setShowFilterModal(false)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.applyButtonText}>Apply</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Sort Modal */}
      <Modal
        visible={showSortModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSortModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowSortModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
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
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Bulk Add Modal */}
      <Modal
        visible={showBulkAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowBulkAddModal(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.keyboardAvoidingView}
            >
              <View style={styles.bulkAddModalContent}>
                <Text style={styles.bulkAddTitle}>{language.bulkAddItems}</Text>
                <Text style={styles.bulkAddInstructions}>
                  {language.bulkAddInstructions || 
                        `Enter one item per line. You can use formats like:
                    - Apple
                    - Banana, Food, lb
                    - Coffee, Beverages, kg`}
                </Text>
                
                <TextInput
                  style={styles.bulkAddTextArea}
                  multiline={true}
                  numberOfLines={8}
                  placeholder="Enter item names (one per line)..."
                  value={bulkAddText}
                  onChangeText={setBulkAddText}
                  textAlignVertical="top"
                  blurOnSubmit={false}
                  returnKeyType="done"
                />
                
                <View style={styles.bulkAddDefaults}>
                  <Text style={styles.bulkAddDefaultsLabel}>{language.bulkAddDefaults || 'Default values for items without category/unit'}:</Text>
                  <View style={styles.bulkAddDefaultsRow}>
                    <TouchableOpacity
                      style={styles.bulkAddDefaultSelector}
                      onPress={() => {
                        const dynamicCategories = getDynamicCategories().filter(cat => cat !== 'All');
                        const currentIndex = dynamicCategories.indexOf(bulkAddCategory);
                        const nextIndex = (currentIndex + 1) % dynamicCategories.length;
                        setBulkAddCategory(dynamicCategories[nextIndex]);
                      }}
                    >
                      <Text style={styles.bulkAddDefaultText}>{language.category}: {bulkAddCategory}</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.bulkAddDefaultSelector}
                      onPress={() => {
                        const dynamicUnits = getDynamicUnitTypes();
                        const currentIndex = dynamicUnits.indexOf(bulkAddUnitType);
                        const nextIndex = (currentIndex + 1) % dynamicUnits.length;
                        setBulkAddUnitType(dynamicUnits[nextIndex]);
                      }}
                    >
                      <Text style={styles.bulkAddDefaultText}>{language.unitType}: {bulkAddUnitType}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
                <View style={styles.bulkAddButtonRow}>
                  <TouchableOpacity
                    style={[styles.bulkAddButton, styles.bulkAddCancelButton]}
                    onPress={() => {
                      Keyboard.dismiss();
                      setShowBulkAddModal(false);
                      setBulkAddText('');
                    }}
                  >
                    <Text style={styles.bulkAddCancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.bulkAddButton, styles.bulkAddSaveButton]}
                    onPress={() => {
                      Keyboard.dismiss();
                      processBulkAdd();
                    }}
                  >
                    <Text style={styles.bulkAddSaveButtonText}>{language.bulkAddItems}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Settings Modal */}
      <Modal
        visible={showSettingsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSettingsModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => {
          setShowSettingsModal(false);
          setShowLanguageDropdown(false);
          setShowCurrencyDropdown(false);
        }}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.fixedSettingsModalContent}>
                <Text style={styles.settingsTitle}>{language.settings || 'Settings'}</Text>
                
                <ScrollView 
                  style={styles.settingsScrollView}
                  showsVerticalScrollIndicator={true}
                  contentContainerStyle={{ paddingBottom: 20 }}
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
                  {/* Currency Setting */}
                  <View style={styles.settingItem}>
                    <Text style={styles.settingLabel}>{language.currency || 'Currency'}</Text>
                    <TouchableOpacity
                      style={styles.languageSelector}
                      onPress={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                    >
                      <Text style={styles.languageSelectorText}>
                        {selectedCurrency} ({availableCurrencies.find(c => c.symbol === selectedCurrency)?.name || 'Custom'})
                      </Text>
                      <Text style={styles.selectorArrow}>{showCurrencyDropdown ? '▲' : '▼'}</Text>
                    </TouchableOpacity>
                    
                    {showCurrencyDropdown && (
                      <View style={styles.languageDropdown}>
                        <ScrollView 
                          style={styles.languageDropdownScroll}
                          nestedScrollEnabled={true}
                        >
                          {availableCurrencies.map(curr => (
                            <TouchableOpacity
                              key={curr.code}
                              style={[
                                styles.languageDropdownItem,
                                selectedCurrency === curr.symbol && styles.selectedLanguageDropdownItem
                              ]}
                              onPress={() => {
                                setSelectedCurrency(curr.symbol);
                                setLanguage(prev => ({ ...prev, currency: curr.symbol }));
                                setShowCurrencyDropdown(false);
                              }}
                            >
                              <Text style={styles.languageDropdownFlag}>{curr.symbol}</Text>
                              <Text style={[
                                styles.languageDropdownText,
                                selectedCurrency === curr.symbol && styles.selectedLanguageDropdownText
                              ]}>
                                {curr.name}
                              </Text>
                              {selectedCurrency === curr.symbol && (
                                <Text style={styles.languageDropdownCheck}>✓</Text>
                              )}
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    )}
                  </View>
                  
                  {/* Tax Settings */}
                  <View style={styles.settingItem}>
                    <Text style={styles.settingLabel}>{language.taxSettings || 'Tax Settings'}</Text>
                    
                    {/* Tax Type Selector */}
                    <View style={styles.taxTypeContainer}>
                      <TouchableOpacity
                        style={[
                          styles.taxTypeButton,
                          taxSettings.type === 'percentage' && styles.taxTypeButtonActive
                        ]}
                        onPress={() => setTaxSettings({ ...taxSettings, type: 'percentage' })}
                      >
                        <Text style={[
                          styles.taxTypeButtonText,
                          taxSettings.type === 'percentage' && styles.taxTypeButtonTextActive
                        ]}>
                          {language.taxPercentage || 'Percentage (%)'}
                        </Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={[
                          styles.taxTypeButton,
                          taxSettings.type === 'fixed' && styles.taxTypeButtonActive
                        ]}
                        onPress={() => setTaxSettings({ ...taxSettings, type: 'fixed' })}
                      >
                        <Text style={[
                          styles.taxTypeButtonText,
                          taxSettings.type === 'fixed' && styles.taxTypeButtonTextActive
                        ]}>
                          {language.taxFixedAmount || 'Fixed Amount'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    
                    {/* Tax Value Input */}
                    <TextInput
                      style={styles.settingInput}
                      placeholder={taxSettings.type === 'percentage' ? '7' : '2.50'}
                      value={taxSettings.value.toString()}
                      onChangeText={(text) => setTaxSettings({ ...taxSettings, value: parseFloat(text) || 0 })}
                      keyboardType="decimal-pad"
                    />
                  </View>
                  
                  {/* Combine Items Setting */}
                  <View style={styles.settingItem}>
                    <Text style={styles.settingLabel}>{language.combineItems || 'Combine Identical Items'}</Text>
                    <Text style={styles.settingDescription}>
                      {language.combineItemsDescription || 'When enabled, items with same name and price will be combined'}
                    </Text>
                    <TouchableOpacity
                      style={[
                        styles.materialSwitch,
                        combineIdenticalItems && styles.materialSwitchActive
                      ]}
                      onPress={() => setCombineIdenticalItems(!combineIdenticalItems)}
                      activeOpacity={0.8}
                    >
                      <View style={[
                        styles.materialSwitchThumb,
                        combineIdenticalItems && styles.materialSwitchThumbActive
                      ]} />
                    </TouchableOpacity>
                  </View>
                </ScrollView> 

                {/* Info text about Monthly Sales Tracking */}
                <View style={styles.trackingInfoContainer}>
                  <Text style={styles.trackingInfoIcon}>ℹ️</Text>
                  <Text style={styles.trackingInfoText}>
                    {language.monthlySalesInfo || 'Monthly Sales Tracking is independent of daily inventory records.  Use it to track overall monthly sales, purchases, or any other financial data.'}
                  </Text>
                </View>  

                {/* Sales Tracking Button */}
                <TouchableOpacity
                  style={styles.salesTrackingButton}
                  onPress={() => {
                    setShowSettingsModal(false);
                    setShowSalesTrackingModal(true);
                  }}
                >
                  <Text style={styles.salesTrackingButtonText}>📊 {language.monthlySalesTracking}</Text>
                </TouchableOpacity>
                
                {/* Receipt History Button */}
                <TouchableOpacity
                  style={styles.salesTrackingButton}
                  onPress={() => {
                    setShowSettingsModal(false);
                    setShowReceiptHistoryModal(true);
                  }}
                >
                  <Text style={styles.salesTrackingButtonText}>📜 {language.receiptHistory}</Text>
                </TouchableOpacity>
                
                <View style={styles.settingsButtonRow}>
                  <TouchableOpacity
                    style={[styles.settingsButton, styles.settingsCancelButton]}
                    onPress={() => {
                      setShowSettingsModal(false);
                      setShowLanguageDropdown(false);
                      setShowCurrencyDropdown(false);
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
                      setShowCurrencyDropdown(false);
                    }}
                  >
                    <Text style={styles.settingsSaveButtonText}>{language.save}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Receipt History List Modal */}
      <Modal
        visible={showReceiptHistoryModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowReceiptHistoryModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowReceiptHistoryModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.fixedSettingsModalContent}>
                {/* Header with Date Selector */}
                <View style={styles.receiptHistoryHeader}>
                  <Text style={styles.settingsTitle}>{language.receiptHistory || 'Receipt History'}</Text>
                  <TouchableOpacity
                    style={styles.receiptDateButton}
                    onPress={() => setShowReceiptCalendarModal(true)}
                  >
                    <Text style={styles.receiptDateText}>
                      📅 {receiptHistoryDate.toLocaleDateString()}
                    </Text>
                  </TouchableOpacity>
                </View>
                
                {/* Receipt Count Indicator */}
                {(() => {
                  const filteredReceipts = getReceiptsForDate(receiptHistoryDate);
                  const displayedReceipts = filteredReceipts.slice(0, loadedReceiptsCount);
                  
                  return (
                    <>
                      <Text style={styles.receiptCountText}>
                        {filteredReceipts.length > 0
                          ? (language.receiptsOnDate || '{{count}} receipts on {{date}}')
                              .replace('{{count}}', filteredReceipts.length)
                              .replace('{{date}}', receiptHistoryDate.toLocaleDateString())
                          : (language.noReceiptsOnDate || 'No receipts on this date')
                        }
                      </Text>
                      
                      <ScrollView 
                        style={styles.settingsScrollView}
                        showsVerticalScrollIndicator={true}
                        contentContainerStyle={{ paddingBottom: 20 }}
                      >
                        {displayedReceipts.length === 0 ? (
                          <Text style={styles.noItemsText}>{language.noReceiptsOnDate || 'No receipts on this date'}</Text>
                        ) : (
                          <>
                            {displayedReceipts.map((receipt) => (
                              <TouchableOpacity
                                key={receipt.id}
                                style={[
                                  styles.receiptHistoryItem,
                                  receipt.voided && styles.receiptHistoryItemVoided
                                ]}
                                onPress={() => {
                                  setSelectedReceiptDetail(receipt);
                                  setShowReceiptHistoryModal(false);
                                }}
                              >
                                <View style={styles.receiptHistoryItemHeader}>
                                  <Text style={[
                                    styles.receiptHistoryItemNumber,
                                    receipt.voided && styles.receiptHistoryItemTextVoided
                                  ]}>
                                    {language.receiptNumber || 'Receipt #'}{receipt.receiptNumber}
                                  </Text>
                                  {receipt.voided && (
                                    <View style={styles.voidedBadge}>
                                      <Text style={styles.voidedBadgeText}>{language.voided || 'VOIDED'}</Text>
                                    </View>
                                  )}
                                </View>
                                <Text style={[
                                  styles.receiptHistoryItemDate,
                                  receipt.voided && styles.receiptHistoryItemTextVoided
                                ]}>
                                  {new Date(receipt.timestamp).toLocaleString()}
                                </Text>
                                <Text style={[
                                  styles.receiptHistoryItemCustomer,
                                  receipt.voided && styles.receiptHistoryItemTextVoided
                                ]}>
                                  {language.customerName || 'Customer'}: {receipt.customerName}
                                </Text>
                                <Text style={[
                                  styles.receiptHistoryItemTotal,
                                  receipt.voided && styles.receiptHistoryItemTextVoided
                                ]}>
                                  {language.totalAmount || 'Total'}: {language.currency}{receipt.total}
                                </Text>
                              </TouchableOpacity>
                            ))}
                            
                            {/* Load More Button */}
                            {filteredReceipts.length > loadedReceiptsCount && (
                              <TouchableOpacity
                                style={styles.loadMoreButton}
                                onPress={() => setLoadedReceiptsCount(prev => prev + 20)}
                              >
                                <Text style={styles.loadMoreButtonText}>{language.loadMoreReceipts || 'Load More Receipts'}</Text>
                              </TouchableOpacity>
                            )}
                          </>
                        )}
                      </ScrollView>
                      
                      {/* Export Button */}
                      <TouchableOpacity
                        style={[
                          styles.exportReceiptsButton,
                          filteredReceipts.length === 0 && { opacity: 0.5 }
                        ]}
                        onPress={() => exportDailyReceipts(receiptHistoryDate)}
                        disabled={filteredReceipts.length === 0}
                      >
                        <Text style={styles.exportReceiptsButtonText}>
                          📄 {language.exportDailyReceipts || 'Export Day\'s Receipts'}
                        </Text>
                      </TouchableOpacity>
                    </>
                  );
                })()}
                
                <TouchableOpacity
                  style={styles.receiptHistoryCloseButton}
                  onPress={() => setShowReceiptHistoryModal(false)}
                >
                  <Text style={styles.receiptHistoryCloseButtonText}>{language.close || 'Close'}</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Receipt Detail Modal */}
      <Modal
        visible={selectedReceiptDetail !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedReceiptDetail(null)}
      >
        <TouchableWithoutFeedback onPress={() => setSelectedReceiptDetail(null)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.fixedSettingsModalContent}>
                {selectedReceiptDetail && (
                  <>
                    <View style={styles.receiptDetailHeader}>
                      <Text style={styles.settingsTitle}>
                        {language.receiptNumber || 'Receipt #'}{selectedReceiptDetail.receiptNumber}
                      </Text>
                      {selectedReceiptDetail.voided && (
                        <View style={styles.voidedBadge}>
                          <Text style={styles.voidedBadgeText}>{language.voided || 'VOIDED'}</Text>
                        </View>
                      )}
                    </View>
                    
                    <ScrollView 
                      style={styles.settingsScrollView}
                      showsVerticalScrollIndicator={true}
                      contentContainerStyle={{ paddingBottom: 20 }}
                    >
                      <View style={styles.receiptDetailSection}>
                        <Text style={styles.receiptDetailLabel}>{language.date || 'Date'}:</Text>
                        <Text style={styles.receiptDetailValue}>
                          {new Date(selectedReceiptDetail.timestamp).toLocaleString()}
                        </Text>
                      </View>
                      
                      <View style={styles.receiptDetailSection}>
                        <Text style={styles.receiptDetailLabel}>{language.customerName || 'Customer'}:</Text>
                        <Text style={styles.receiptDetailValue}>{selectedReceiptDetail.customerName}</Text>
                      </View>
                      
                      {selectedReceiptDetail.receiptCreator && (
                        <View style={styles.receiptDetailSection}>
                          <Text style={styles.receiptDetailLabel}>{language.receiptCreator || 'Receipt Creator'}:</Text>
                          <Text style={styles.receiptDetailValue}>{selectedReceiptDetail.receiptCreator}</Text>
                        </View>
                      )}
                      
                      <Text style={styles.receiptDetailSectionTitle}>{language.items || 'Items'}:</Text>
                      {selectedReceiptDetail.items.map((item, index) => (
                        <View key={index} style={styles.receiptDetailItem}>
                          <Text style={styles.receiptDetailItemName}>{item.name}</Text>
                          <Text style={styles.receiptDetailItemDetails}>
                            {item.unitsSold} {item.unitType} × {language.currency}{item.price}
                          </Text>
                          <Text style={styles.receiptDetailItemTotal}>
                            {language.currency}{item.totalAmount}
                          </Text>
                        </View>
                      ))}
                      
                      <View style={styles.receiptDetailTotals}>
                        <View style={styles.receiptDetailTotalRow}>
                          <Text style={styles.receiptDetailTotalLabel}>{language.subtotal || 'Subtotal'}:</Text>
                          <Text style={styles.receiptDetailTotalValue}>
                            {language.currency}{selectedReceiptDetail.subtotal}
                          </Text>
                        </View>
                        <View style={styles.receiptDetailTotalRow}>
                          <Text style={styles.receiptDetailTotalLabel}>{language.tax || 'Tax'}:</Text>
                          <Text style={styles.receiptDetailTotalValue}>
                            {language.currency}{selectedReceiptDetail.tax}
                          </Text>
                        </View>
                        <View style={styles.receiptDetailTotalRow}>
                          <Text style={styles.receiptDetailTotalLabelBold}>{language.totalAmount || 'Total'}:</Text>
                          <Text style={styles.receiptDetailTotalValueBold}>
                            {language.currency}{selectedReceiptDetail.total}
                          </Text>
                        </View>
                      </View>
                    </ScrollView>
                    
                    <View style={styles.settingsButtonRow}>
                      <TouchableOpacity
                        style={[styles.settingsButton, styles.settingsCancelButton]}
                        onPress={() => setSelectedReceiptDetail(null)}
                      >
                        <Text style={styles.settingsCancelButtonText}>{language.close || 'Close'}</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={[styles.settingsButton, styles.settingsSaveButton]}
                        onPress={() => toggleReceiptVoided(selectedReceiptDetail.id)}
                      >
                        <Text style={styles.settingsSaveButtonText}>
                          {selectedReceiptDetail.voided 
                            ? (language.unmarkAsVoided || 'Unmark as Voided')
                            : (language.markAsVoided || 'Mark as Voided')
                          }
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Receipt History Calendar Modal */}
      <Modal
        visible={showReceiptCalendarModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowReceiptCalendarModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowReceiptCalendarModal(false)}>
          <View style={styles.calendarModalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.calendarModalContent}>
                <Calendar
                  current={formatDate(receiptHistoryDate)}
                  onDayPress={(day) => {
                    const [year, month, dayNum] = day.dateString.split('-');
                    const newDate = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(dayNum, 10), 12, 0, 0);
                    setReceiptHistoryDate(newDate);
                    setLoadedReceiptsCount(20); // Reset pagination when date changes
                    setShowReceiptCalendarModal(false);
                  }}
                  markedDates={{
                    [formatDate(receiptHistoryDate)]: {
                      selected: true,
                      selectedColor: '#2196f3'
                    }
                  }}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowLanguageModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
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
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      {/* Sales Tracking Modal */}
      <Modal
        visible={showSalesTrackingModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSalesTrackingModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => {
          setShowSalesTrackingModal(false);
          setShowStoreDropdown(false);
        }}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.salesTrackingModalContent}>
                {/* Store Selector */}
                <View style={styles.storeSelectorContainer}>
                  <TouchableOpacity
                    style={styles.storeSelector}
                    onPress={() => setShowStoreDropdown(! showStoreDropdown)}
                  >
                    <Text style={styles.storeSelectorLabel}>{language.storeName || 'Store'}:</Text>
                    <Text style={styles.storeSelectorText}>
                      {stores.find(s => s.id === selectedStore)?.name || 'Main Store'}
                    </Text>
                    <Text style={styles.storeSelectorArrow}>{showStoreDropdown ? '▲' : '▼'}</Text>
                  </TouchableOpacity>
                </View>
                
                {/* Store Dropdown */}
                {showStoreDropdown && (
                  <View style={styles.storeDropdown}>
                    {/* Help hint at the top - NOW WITH TRANSLATION */}
                    <View style={styles.storeDropdownHint}>
                      <Text style={styles.storeDropdownHintIcon}>ℹ️</Text>
                      <Text style={styles.storeDropdownHintText}>
                        {language.longPressToRename || 'Long press store name to rename'}
                      </Text>
                    </View>
                    
                    <ScrollView 
                      style={styles.storeDropdownScroll} 
                      nestedScrollEnabled={true}
                    >
                      {stores.map(store => (
                        <View key={store.id} style={styles.storeDropdownItemContainer}>
                          {editingStore?.id === store.id ?  (
                            // Edit mode - show text input
                            <View style={styles.editingStoreContainer}>
                              <TextInput
                                style={styles.editingStoreInput}
                                value={newStoreName}
                                onChangeText={setNewStoreName}
                                autoFocus={true}
                                onBlur={() => {
                                  if (newStoreName.trim()) {
                                    editStoreName();
                                  } else {
                                    setEditingStore(null);
                                    setNewStoreName('');
                                  }
                                }}
                                onSubmitEditing={() => {
                                  if (newStoreName.trim()) {
                                    editStoreName();
                                    setShowStoreDropdown(false);
                                  }
                                }}
                              />
                              <TouchableOpacity
                                style={styles.saveEditButton}
                                onPress={() => {
                                  if (newStoreName.trim()) {
                                    editStoreName();
                                    setShowStoreDropdown(false);
                                  }
                                }}
                              >
                                <Text style={styles.saveEditButtonText}>✓</Text>
                              </TouchableOpacity>
                            </View>
                          ) : (
                            // Normal mode - show store name with edit icon
                            <TouchableOpacity
                              style={[
                                styles.storeDropdownItem,
                                selectedStore === store.id && styles.selectedStoreDropdownItem
                              ]}
                              onPress={async () => {
                                setSelectedStore(store.id);
                                await AsyncStorage.setItem('selected_store', store.id);
                                setShowStoreDropdown(false);
                                loadYearlyTotal(selectedYear);
                              }}
                              onLongPress={() => {
                                // Allow editing all stores including main_store
                                setEditingStore(store);
                                setNewStoreName(store.name);
                              }}
                            >
                              <Text style={[
                                styles.storeDropdownText,
                                selectedStore === store.id && styles.selectedStoreDropdownText
                              ]}>
                                {store.name}
                                {store.id === 'main_store' && ' 🔄'} {/* Auto-sync indicator */}
                              </Text>
                              {selectedStore === store.id && (
                                <Text style={styles.storeDropdownCheck}>✓</Text>
                              )}
                            </TouchableOpacity>
                          )}
                          
                          {/* Delete button */}
                          {editingStore?.id !== store.id && stores.length > 1 && (
                            <TouchableOpacity
                              style={styles.deleteStoreButton}
                              onPress={() => {
                                setShowStoreDropdown(false);
                                deleteStore(store. id);
                              }}
                            >
                              <Text style={styles.storeActionButtonText}>🗑️</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      ))}
                      
                      {/* Add New Store Option */}
                      <TouchableOpacity
                        style={styles.addNewStoreOption}
                        onPress={() => {
                          const newStoreNumber = stores.length + 1;
                          const newStore = {
                            id: `store_${Date.now()}`,
                            name: `${language.storeName || 'Store'} ${newStoreNumber}`
                          };
                          
                          const updatedStores = [...stores, newStore];
                          setStores(updatedStores);
                          saveStores(updatedStores);
                          setSelectedStore(newStore.id);
                          AsyncStorage.setItem('selected_store', newStore.id);
                          setShowStoreDropdown(false);
                          
                          Alert.alert('Success', `"${newStore.name}" created successfully`);
                        }}
                      >
                        <Text style={styles.addNewStoreIcon}>+</Text>
                        <Text style={styles.addNewStoreText}>
                          {language.addNewStore || 'Add New Store'}
                        </Text>
                      </TouchableOpacity>
                    </ScrollView>
                  </View>
                )}
                
                {/* Year Navigation */}
                <View style={styles.salesTrackingHeader}>
                  <TouchableOpacity
                    onPress={() => setSelectedYear(selectedYear - 1)}
                    style={styles.yearNavigationButton}
                  >
                    <Text style={styles.yearNavigationText}>◀</Text>
                  </TouchableOpacity>
                  
                  <Text style={styles.salesTrackingTitle}>{selectedYear}</Text>
                  
                  <TouchableOpacity
                    onPress={() => setSelectedYear(selectedYear + 1)}
                    style={styles.yearNavigationButton}
                    disabled={selectedYear >= new Date().getFullYear()}
                  >
                    <Text style={[
                      styles.yearNavigationText,
                      selectedYear >= new Date(). getFullYear() && styles.disabledNavigation
                    ]}>▶</Text>
                  </TouchableOpacity>
                </View>
                
                {/* Months Grid */}
                <ScrollView style={styles.monthsGridScroll}>
                  <View style={styles.monthsCalendarGrid}>
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((monthIndex) => {
                      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                      return (
                        <TouchableOpacity
                          key={monthIndex}
                          style={styles.monthCalendarCard}
                          onPress={() => openMonthlyDataModal(monthIndex)}
                        >
                          <Text style={styles.monthCardNumber}>{monthIndex + 1}</Text>
                          <Text style={styles.monthCardName}>{monthNames[monthIndex]}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>
                
                {/* Yearly Total */}
                <View style={styles.yearlyTotalContainer}>
                  <Text style={styles.yearlyTotalLabel}>{language.yearlyTotal}:</Text>
                  <Text style={styles.yearlyTotalAmount}>
                    {selectedCurrency}{formatCurrency(yearlyTotals[`${selectedStore}_${selectedYear}`] || 0)}
                  </Text>
                </View>
                
                <TouchableOpacity
                  style={styles.closeModalButton}
                  onPress={() => {
                    setShowSalesTrackingModal(false);
                    setShowStoreDropdown(false);
                  }}
                >
                  <Text style={styles.closeModalButtonText}>{language.close}</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Add Store Modal */}
      <Modal
        visible={showAddStoreModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowAddStoreModal(false);
          setNewStoreName('');
        }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.keyboardAvoidingView}
            >
              <View style={styles.addStoreModalContent}>
                <Text style={styles.addStoreModalTitle}>Add New Store</Text>
                
                <TextInput
                  style={styles.storeNameInput}
                  placeholder="Enter store name"
                  value={newStoreName}
                  onChangeText={setNewStoreName}
                  autoFocus={true}
                />
                
                <View style={styles.storeModalButtonRow}>
                  <TouchableOpacity
                    style={[styles.storeModalButton, styles.storeModalCancelButton]}
                    onPress={() => {
                      setShowAddStoreModal(false);
                      setNewStoreName('');
                    }}
                  >
                    <Text style={styles.storeModalCancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.storeModalButton, styles.storeModalSaveButton]}
                    onPress={addNewStore}
                  >
                    <Text style={styles.storeModalSaveButtonText}>Add Store</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* EDIT STORE MODAL - MOVE IT HERE, OUTSIDE Sales Tracking Modal */}
      <Modal
        visible={showEditStoreModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowEditStoreModal(false);
          setNewStoreName('');
          setEditingStore(null);
        }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.keyboardAvoidingView}
            >
              <View style={styles.addStoreModalContent}>
                <Text style={styles.addStoreModalTitle}>Edit Store Name</Text>
                
                <TextInput
                  style={styles.storeNameInput}
                  placeholder="Enter store name"
                  value={newStoreName}
                  onChangeText={setNewStoreName}
                  autoFocus={true}
                />
                
                <View style={styles.storeModalButtonRow}>
                  <TouchableOpacity
                    style={[styles.storeModalButton, styles.storeModalCancelButton]}
                    onPress={() => {
                      setShowEditStoreModal(false);
                      setNewStoreName('');
                      setEditingStore(null);
                    }}
                  >
                    <Text style={styles.storeModalCancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.storeModalButton, styles.storeModalSaveButton]}
                    onPress={editStoreName}
                  >
                    <Text style={styles.storeModalSaveButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Monthly Data Modal */}
      <Modal
        visible={showMonthlyDataModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowMonthlyDataModal(false);
          setShowSalesTrackingModal(true);
        }}
      >
        <TouchableWithoutFeedback onPress={Keyboard. dismiss}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.keyboardAvoidingView}
            >
              <View style={styles.monthlyDataModalContent}>
                {/* Header with Delete Button */}
                <View style={styles.monthlyDataHeader}>
                  <Text style={styles.monthlyDataTitle}>
                    {selectedMonth !== null && new Date(selectedYear, selectedMonth). toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </Text>
                  <TouchableOpacity
                    style={styles.deleteMonthButton}
                    onPress={() => deleteMonthlyData(selectedYear, selectedMonth)}
                  >
                    <Text style={styles.deleteMonthButtonText}>🗑️ {language.deleteMonth}</Text>
                  </TouchableOpacity>
                </View>
                
                {/* Fixed Monthly Total at Top */}
                <View style={styles.stickyTotalContainer}>
                  <View style={styles.stickyTotalRow}>
                    <Text style={styles.stickyTotalLabel}>{language.monthlyTotal}:</Text>
                    <Text style={styles.stickyTotalAmount}>
                      {selectedCurrency}{formatCurrency(
                        monthlyData && Array.isArray(monthlyData) 
                          ? monthlyData. reduce((sum, day) => sum + parseFloat(day.amount || 0), 0)
                          : 0
                      )}
                    </Text>
                  </View>
                </View>
                
                {/* Table Header */}
                <View style={styles.tableHeader}>
                  <Text style={styles.tableHeaderCell}>{language.date}</Text>
                  <Text style={styles.tableHeaderCellAmount}>{language.dailySaleAmount}</Text>
                </View>
                
                {/* Scrollable Table Body */}
                <ScrollView 
                  style={styles.tableBody}
                  showsVerticalScrollIndicator={true}
                >
                  {monthlyData && Array.isArray(monthlyData) && monthlyData.map((day, index) => (
                    <View key={index} style={styles.tableRow}>
                      <View style={styles.dateCell}>
                        <Text style={styles.dateCellText}>{day.date}</Text>
                        <Text style={styles.dayCellText}>{day.dayName}</Text>
                      </View>
                      <TextInput
                        style={styles.amountInput}
                        value={day.amount ?  formatCurrency(day.amount) : ''}
                        onChangeText={(text) => updateDailyAmount(index, text)}
                        keyboardType="number-pad"
                        placeholder="0"
                        placeholderTextColor="#999"
                      />
                    </View>
                  ))}
                </ScrollView>
                
                {/* Bottom Buttons */}
                <View style={styles.monthlyDataButtonRow}>
                  <TouchableOpacity
                    style={[styles.modernButton, styles.modernCancelButton]}
                    onPress={() => {
                      setShowMonthlyDataModal(false);
                      setShowSalesTrackingModal(true);
                    }}
                  >
                    <Text style={styles.modernCancelButtonText}>{language.cancel}</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.modernButton, styles.modernSaveButton]}
                    onPress={saveMonthlyData}
                  >
                    <Text style={styles.modernSaveButtonText}>{language.save}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Take Order Modal - Cart System */}
      <Modal
        visible={showTakeOrderModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowTakeOrderModal(false);
          setShowCartView(false);
        }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.keyboardAvoidingView}
            >
              <TouchableWithoutFeedback>
                <View style={styles.takeOrderModalContent}>
                  
                  {/* Header with Cart Icon */}
                  <View style={styles.takeOrderHeader}>
                    <Text style={styles.modernModalTitle}>
                      {showCartView ? language.cart : (language.takeOrder || 'Take Order')}
                    </Text>
                    
                    {! showCartView && (
                      <TouchableOpacity
                        style={styles.cartIconButton}
                        onPress={() => setShowCartView(true)}
                      >
                        <Text style={styles.cartIcon}>🛒</Text>
                        {cartItems.length > 0 && (
                          <View style={styles.cartBadge}>
                            <Text style={styles.cartBadgeText}>{cartItems.length}</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    )}
                    
                    {showCartView && (
                      <TouchableOpacity
                        style={styles.backToItemsButton}
                        onPress={() => setShowCartView(false)}
                      >
                        <Text style={styles.backToItemsText}>← {language.items || 'Items'}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  
                  {/* Show either Item List or Cart View */}
                  {! showCartView ?  (
                    <>
                      {/* Predefined Items Search */}
                      <View style={styles.predefinedSearchContainer}>
                        <TextInput
                          style={styles.predefinedSearchInput}
                          placeholder={language.searchPlaceholder || "Search items..."}
                          value={predefinedSearchText}
                          onChangeText={setPredefinedSearchText}
                          clearButtonMode="while-editing"
                        />
                        <TouchableOpacity
                          style={styles.predefinedFilterButton}
                          onPress={() => setShowPredefinedCategoryModal(true)}
                        >
                          <Text style={styles.predefinedFilterIcon}>☰</Text>
                        </TouchableOpacity>
                      </View>

                      {/* Predefined Items List */}
                      <Text style={styles.sectionTitle}>{language.predefinedItems || 'Select Items'}</Text>
                      <ScrollView 
                        style={styles.takeOrderItemsList}
                        onScroll={({ nativeEvent }) => {
                          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
                          const paddingToBottom = 20;
                          if (layoutMeasurement.height + contentOffset.y >= contentSize. height - paddingToBottom) {
                            loadMoreItems();
                          }
                        }}
                        scrollEventThrottle={400}
                      >
                        {getFilteredPredefinedItems. length === 0 ? (
                          <View style={styles.noPredefinedItemsContainer}>
                            <Text style={styles.noPredefinedItemsText}>
                              No items found matching your search
                            </Text>
                          </View>
                        ) : (
                          getFilteredPredefinedItems.map(item => (
                            <TouchableOpacity
                              key={item.id}
                              style={styles.takeOrderItemOption}
                              onPress={() => {
                                console.log('Item tapped:', item.name);
                                handlePredefinedItemForCart(item);
                              }}
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
                              <Text style={styles.selectArrow}>+</Text>
                            </TouchableOpacity>
                          ))
                        )}
                      </ScrollView>
                    </>
                  ) : (
                    <>
                      {/* Cart View */}
                      <ScrollView style={styles.cartViewList}>
                        {cartItems. length === 0 ? (
                          <View style={styles.emptyCartContainer}>
                            <Text style={styles.emptyCartIcon}>🛒</Text>
                            <Text style={styles.emptyCartText}>{language.emptyCart}</Text>
                            <Text style={styles.emptyCartSubtext}>{language.addItemsFromList}</Text>
                          </View>
                        ) : (
                          cartItems.map((item) => (
                            <View key={item.id} style={styles.cartItemCompact}>
                              <Text style={styles.cartItemCompactName} numberOfLines={1}>
                                {item.name} - {item.unitsSold} {item.unitType} × {selectedCurrency}{formatNumber(parseFloat(item.price), 2)} = {selectedCurrency}{item.totalAmount}
                              </Text>
                              <TouchableOpacity
                                onPress={() => removeFromCart(item.id)}
                                style={styles.removeCartItemCompactButton}
                              >
                                <Text style={styles.removeCartItemCompactText}>✕</Text>
                              </TouchableOpacity>
                            </View>
                          ))
                        )}
                      </ScrollView>

                      {/* Cart Totals */}
                      {cartItems.length > 0 && (
                        <View style={styles.cartTotalsSection}>
                          {(() => {
                            const totals = calculateCartTotals();
                            return (
                              <>
                                <View style={styles.totalRow}>
                                  <Text style={styles.totalLabel}>{language.subtotal}:</Text>
                                  <Text style={styles.totalValue}>{selectedCurrency}{formatCurrency(totals.subtotal)}</Text>
                                </View>
                                <View style={styles.totalRow}>
                                  <Text style={styles.totalLabel}>{language.tax}:</Text>
                                  <Text style={styles.totalValue}>{selectedCurrency}{formatCurrency(totals.tax)}</Text>
                                </View>
                                <View style={[styles.totalRow, styles.grandTotalRow]}>
                                  <Text style={styles.grandTotalLabel}>{language.totalAmount}:</Text>
                                  <Text style={styles.grandTotalValue}>{selectedCurrency}{formatCurrency(totals.total)}</Text>
                                </View>
                              </>
                            );
                          })()}
                        </View>
                      )}

                      {/* Customer Info (Optional) */}
                      <View style={styles.customerInfoSection}>
                        <Text style={styles.sectionTitle}>
                          {language.customerInformation}
                        </Text>
                        <TextInput
                          style={styles.modernInput}
                          placeholder={language.customerName || "Customer Name"}
                          value={cartCustomerName}
                          onChangeText={setCartCustomerName}
                        />
                        <TextInput
                          style={styles.modernInput}
                          placeholder={language.receiptCreatorPlaceholder || "Receipt Creator Name"}
                          value={receiptCreator}
                          onChangeText={setReceiptCreator}
                        />
                      </View>

                      {/* Checkout Button */}
                      {cartItems.length > 0 && (
                        <TouchableOpacity
                          style={styles.checkoutButton}
                          onPress={handleCartCheckout}
                        >
                          <Text style={styles.checkoutButtonText}>
                            ✓ {language.checkout} ({cartItems.length} {language.items})
                          </Text>
                        </TouchableOpacity>
                      )}
                    </>
                  )}
                  
                  {/* Close Button */}
                  <TouchableOpacity
                    style={styles.closeTakeOrderButton}
                    onPress={() => {
                      setShowTakeOrderModal(false);
                      setShowCartView(false);
                    }}
                  >
                    <Text style={styles.closeTakeOrderButtonText}>{language.close || 'Close'}</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </KeyboardAvoidingView>

            {/* Add to Cart Modal */}
            <Modal
              visible={showAddToCartModal}
              animationType="slide"
              transparent={true}
              onRequestClose={() => {
                setShowAddToCartModal(false);
                setSelectedItemForCart(null);
              }}
            >
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.modalOverlay}>
                  <KeyboardAvoidingView
                    behavior={Platform. OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardAvoidingView}
                  >
                    <View style={styles.modernModalContent}>
                      <Text style={styles.modernModalTitle}>{language.addToCart}</Text>

                      {/* Item Display */}
                      <View style={styles.predefinedItemDisplay}>
                        <Text style={styles.predefinedItemDisplayName}>
                          {selectedItemForCart?. name}
                        </Text>
                        <Text style={styles.predefinedItemDisplayDetails}>
                          {selectedItemForCart?.category} • {selectedItemForCart?.unitType}
                        </Text>
                      </View>

                      {/* Price and Units */}
                      <View style={styles.modernInputRow}>
                        <TextInput
                          style={[styles.modernInput, { flex: 1, marginRight: 8 }]}
                          placeholder={language.price}
                          value={selectedItemForCart?.price}
                          onChangeText={(text) => {
                            const numericValue = text.replace(/[^0-9.]/g, '');
                            const parts = numericValue.split('.');
                            const filteredValue = parts.length > 2 
                              ? parts[0] + '.' + parts. slice(1).join('') 
                              : numericValue;
                            setSelectedItemForCart(prev => ({ ...prev, price: filteredValue }));
                          }}
                          keyboardType="decimal-pad"
                        />
                        <TextInput
                          style={[styles.modernInput, { flex: 1, marginLeft: 8 }]}
                          placeholder={language.unitsSold}
                          value={selectedItemForCart?.unitsSold}
                          onChangeText={(text) => {
                            const numericValue = text.replace(/[^0-9.]/g, '');
                            const parts = numericValue. split('.');
                            const filteredValue = parts.length > 2 
                              ? parts[0] + '.' + parts.slice(1).join('') 
                              : numericValue;
                            setSelectedItemForCart(prev => ({ ...prev, unitsSold: filteredValue }));
                          }}
                          keyboardType="decimal-pad"
                        />
                      </View>

                      {/* Total Amount */}
                      {selectedItemForCart?. price && selectedItemForCart?.unitsSold && (
                        <View style={styles.totalAmountContainer}>
                          <Text style={styles.totalAmountText}>
                            Total: {selectedCurrency}{calculateAmount(selectedItemForCart.price, selectedItemForCart.unitsSold)}
                          </Text>
                        </View>
                      )}

                      {/* Buttons */}
                      <View style={styles.modernButtonRow}>
                        <TouchableOpacity
                          style={[styles.modernButton, styles.modernCancelButton]}
                          onPress={() => {
                            setShowAddToCartModal(false);
                            setSelectedItemForCart(null);
                          }}
                        >
                          <Text style={styles.modernCancelButtonText}>{language.cancel}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.modernButton, styles.modernSaveButton]}
                          onPress={addItemToCart}
                        >
                          <Text style={styles.modernSaveButtonText}>{language.addToCart}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </KeyboardAvoidingView>
                </View>
              </TouchableWithoutFeedback>
            </Modal>
          </View>
        </TouchableWithoutFeedback>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateButton: {
    padding: 8,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    flex: 1,
    marginRight: 12,
    alignItems: 'center',
  },
  // confirmDayToggle: {
  //   padding: 8,
  //   backgroundColor: '#f8f9fa',
  //   borderRadius: 8,
  //   borderWidth: 2,
  //   borderColor: '#e0e0e0',
  //   flex: 1,
  //   alignItems: 'center',
  // },
  // confirmDayToggleActive: {
  //   backgroundColor: '#e8f5e8',
  //   borderColor: '#4caf50',
  // },
  // confirmDayToggleText: {
  //   fontSize: 14,
  //   fontWeight: '600',
  //   color: '#666',
  //   textAlign: 'center',
  // },
  // confirmDayToggleTextActive: {
  //   color: '#2e7d32',
  // },
  dateText: {
    fontSize: 16,
    color: '#1976d2',
  },
  searchContainer: {
    backgroundColor: '#fff',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    flex: 1,
    marginRight: 12,
  },
  filterButton: {
    backgroundColor: '#5A7FFF',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterIcon: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 18,
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
    gap: 8,
  },
  itemNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    minWidth: 30,
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
    maxWidth: 600,
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
    maxWidth: 600,
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
    maxWidth: 500,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    maxHeight: '75%',
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
    maxWidth: 650,
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
    backgroundColor: '#f8f9fa',
    flex: 1,
    marginRight: 12,
  },
  predefinedFilterButton: {
    backgroundColor: '#5A7FFF',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
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
    maxWidth: 450,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    maxHeight: '70%',
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
    maxWidth: 650,
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
  taxTypeContainer: {
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 8,
    gap: 8,
  },
  taxTypeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  taxTypeButtonActive: {
    backgroundColor: '#2196f3',
    borderColor: '#2196f3',
  },
  taxTypeButtonText: {
    fontSize: 14,
    color: '#666',
  },
  taxTypeButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
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
    maxWidth: 600,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    height: '80%', 
    flexDirection: 'column',
  },
  settingsScrollView: {
    flex: 1,
    marginBottom: 16,
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
    maxWidth: 550,
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
  pdfShareButton: {
    backgroundColor: '#dc3545',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  pdfShareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  receiptTitleContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  confirmedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  confirmedBadgeIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  confirmedBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2e7d32',
  },
  confirmDayContainer: {
    alignItems: 'center',
    flex: 0.5,
    // position: 'absolute',
    left: '10%',
  },
  confirmDayLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6,
    textAlign: 'center',
  },
  materialSwitch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
    padding: 2,
    justifyContent: 'center',
  },
  materialSwitchActive: {
    backgroundColor: '#4caf50',
  },
  materialSwitchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  materialSwitchThumbActive: {
    transform: [{ translateX: 20 }],
  },
  iconButton: {
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  filterDropdown: {
    position: 'absolute',
    top: 150,
    right: 20,
    backgroundColor: '#5A7FFF',
    borderRadius: 20,
    minWidth: 120,
    paddingVertical: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  filterDropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  selectedFilterItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  filterDropdownText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  selectedFilterText: {
    fontWeight: 'bold',
  },
  filterModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterModalContent: {
    width: '85%',
    maxWidth: 550,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    maxHeight: '70%',
  },
  filterModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  filterHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#5A7FFF',
  },
  closeIcon: {
    fontSize: 18,
    color: '#999',
    fontWeight: 'bold',
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5A7FFF',
    letterSpacing: 0.5,
  },
  clearButton: {
    backgroundColor: '#E8E8E8',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  clearButtonText: {
    fontSize: 12,
    color: '#666',
  },
  categoryChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    backgroundColor: '#E8E8E8',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  selectedCategoryChip: {
    backgroundColor: '#5A7FFF',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  selectedCategoryChipText: {
    color: '#fff',
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#E8E8E8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  sortOptionText: {
    fontSize: 14,
    color: '#666',
  },
  sortToggle: {
    width: 20,
    height: 12,
    backgroundColor: '#DDD',
    borderRadius: 6,
  },
  addIcon: {
    fontSize: 20,
    color: '#999',
    fontWeight: 'bold',
  },
  applyButton: {
    backgroundColor: '#C8D4FF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5A7FFF',
  },
  activeSortToggle: {
    backgroundColor: '#5A7FFF',
  },
  predefinedSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  predefinedFilterIcon: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 18,
  },
  loadingMoreContainer: {
    padding: 16,
    alignItems: 'center',
  },
  loadingMoreText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  calendarModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    margin: 20,
    minWidth: 350,
  },
  addNewCategoryOption: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#007bff',
    backgroundColor: '#f8f9ff',
  },
  addNewCategoryText: {
    fontSize: 16,
    color: '#007bff',
    textAlign: 'center',
    fontWeight: '600',
  },
  addNewUnitOption: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#28a745',
    backgroundColor: '#f8fff8',
  },
  addNewUnitText: {
    fontSize: 16,
    color: '#28a745',
    textAlign: 'center',
    fontWeight: '600',
  },
  directionToggle: {
    backgroundColor: '#5A7FFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  directionToggleText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  settingDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
    lineHeight: 18,
  },
  salesTrackingButton: {
    backgroundColor: '#28a745',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  salesTrackingButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  salesTrackingModalContent: {
    width: '90%',
    maxWidth: 650,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    maxHeight: '85%',
  },
  salesTrackingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  salesTrackingTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  yearNavigationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  yearNavigationText: {
    fontSize: 20,
    color: '#333',
    fontWeight: 'bold',
  },
  disabledNavigation: {
    color: '#ccc',
  },
  monthsGrid: {
    maxHeight: 400,
    marginBottom: 20,
  },
  monthCard: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  monthName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  monthYear: {
    fontSize: 14,
    color: '#666',
  },
  yearlyTotalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  yearlyTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  yearlyTotalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  monthlyDataModalContent: {
    width: '90%',
    maxWidth: 650,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    maxHeight: '85%',
  },
  monthlyDataHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthlyDataTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  deleteMonthButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  deleteMonthButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  tableHeaderCell: {
    flex: 1,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  tableHeaderCellAmount: {
    flex: 1,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'right',
  },
  tableBody: {
    maxHeight: 320,
    marginBottom: 16,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    alignItems: 'center',
  },
  dateCell: {
    flex: 1,
  },
  dateCellText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  dayCellText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  amountInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    textAlign: 'right',
    backgroundColor: '#f8f9fa',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  monthlyDataButtonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  monthsCalendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  monthCalendarCard: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthCardNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  monthCardName: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  trackingInfoContainer: {
    flexDirection: 'row',
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  trackingInfoIcon: {
    fontSize: 16,
    marginRight: 8,
    marginTop: 2,
  },
  trackingInfoText: {
    flex: 1,
    fontSize: 13,
    color: '#1565c0',
    lineHeight: 18,
  },
  stickyTotalContainer: {
    backgroundColor: '#e8f5e8',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#4caf50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stickyTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  stickyTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  stickyTotalAmount: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  storeSelectorContainer: {
    position: 'relative',
    marginBottom: 16,
    zIndex: 1,
  },
  storeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2196f3',
  },
  storeSelectorLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginRight: 8,
  },
  storeSelectorText: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  storeSelectorArrow: {
    fontSize: 12,
    color: '#1976d2',
  },
  addStoreButton: {
    backgroundColor: '#4caf50',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: 'center',
  },
  addStoreButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  storeDropdown: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0, // CHANGE from 80 to 0 - full width
    zIndex: 1000,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    maxHeight: 200,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  storeDropdownScroll: {
    maxHeight: 190,
  },
  storeDropdownItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  storeDropdownItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  selectedStoreDropdownItem: {
    backgroundColor: '#e3f2fd',
  },
  storeDropdownText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  selectedStoreDropdownText: {
    color: '#1976d2',
    fontWeight: '600',
  },
  storeDropdownCheck: {
    fontSize: 16,
    color: '#1976d2',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  storeActionButtons: {
    flexDirection: 'row',
    gap: 4,
    paddingRight: 8,
  },
  editStoreButton: {
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
  },
  deleteStoreButton: {
    padding: 8,
    backgroundColor: '#ffebee',
    borderRadius: 6,
  },
  storeActionButtonText: {
    fontSize: 16,
  },
  addStoreModalContent: {
    width: '85%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
  },
  addStoreModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  storeNameInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
    marginBottom: 20,
  },
  storeModalButtonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  storeModalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  storeModalCancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  storeModalSaveButton: {
    backgroundColor: '#2196f3',
  },
  storeModalCancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  storeModalSaveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  monthsGridScroll: {
    maxHeight: 420,
  },
  editingStoreContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  editingStoreInput: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#2196f3',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#fff',
    marginRight: 8,
  },
  saveEditButton: {
    backgroundColor: '#4caf50',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveEditButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  addNewStoreOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 2,
    borderTopColor: '#4caf50',
    backgroundColor: '#f0f8f0',
  },
  addNewStoreIcon: {
    fontSize: 20,
    color: '#4caf50',
    fontWeight: 'bold',
    marginRight: 8,
  },
  addNewStoreText: {
    fontSize: 16,
    color: '#4caf50',
    fontWeight: '600',
  },
  storeDropdownHint: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ffc107',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  storeDropdownHintIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  storeDropdownHintText: {
    flex: 1,
    fontSize: 12,
    color: '#856404',
    fontWeight: '500',
  },
  editHintIcon: {
    fontSize: 14,
    color: '#999',
    marginLeft: 4,
    marginRight: 4,
  },
  storeDropdownItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  takeOrderButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    backgroundColor: '#4caf50',
    borderRadius: 50,
    paddingVertical: 16,
    paddingHorizontal: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity:  0.3,
    shadowRadius: 4,
    zIndex: 1000,
  },
  takeOrderButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  takeOrderModalContent: {
    width: '100%',
    maxWidth: 600,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    maxHeight: '90%',
  },
  takeOrderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems:  'center',
    marginBottom: 16,
  },
  cartIconButton: {
    position:  'relative',
    padding: 8,
  },
  cartIcon: {
    fontSize: 24,
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#f44336',
    borderRadius:  10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  backToItemsButton: {
    padding: 8,
  },
  backToItemsText: {
    color: '#2196f3',
    fontSize:  16,
    fontWeight: '600',
  },
  takeOrderItemsList: {
    maxHeight: 400,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 16,
  },
  takeOrderItemOption: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cartViewList: {
    maxHeight: 300,
    marginBottom: 16,
    flexGrow: 0,
  },
  emptyCartContainer: {
    padding: 60,
    alignItems: 'center',
  },
  emptyCartIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyCartText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  emptyCartSubtext: {
    fontSize: 14,
    color:  '#999',
  },
  cartItemCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
  },
  cartItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  removeCartItemButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f44336',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeCartItemText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cartItemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cartItemDetail: {
    fontSize: 14,
    color:  '#666',
  },
  cartItemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4caf50',
  },
  cartItemCategory: {
    fontSize: 12,
    color: '#999',
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 8,
    paddingVertical:  2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  cartItemCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#4caf50',
  },
  cartItemCompactName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
    marginRight: 8,
  },
  cartItemCompactQty: {
    fontSize: 13,
    color: '#666',
    marginRight: 4,
  },
  cartItemCompactPrice: {
    fontSize: 13,
    color: '#666',
    marginRight: 4,
  },
  cartItemCompactTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4caf50',
    marginRight: 8,
  },
  removeCartItemCompactButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f44336',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeCartItemCompactText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    lineHeight: 14,
  },
  cartTotalsSection: {
    backgroundColor: '#f0f8ff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#2196f3',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  grandTotalRow: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#2196f3',
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196f3',
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196f3',
  },
  customerInfoSection: {
    marginBottom: 16,
  },
  checkoutButton: {
    backgroundColor: '#4caf50',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeTakeOrderButton: {
    backgroundColor: '#e0e0e0',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeTakeOrderButtonText:  {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  nestedModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right:  0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems:  'center',
    zIndex: 1000,
  },
  nestedModalContainer: {
    width: '90%',
    maxWidth: 500,
    justifyContent: 'center',
    alignItems: 'center',
  },
  receiptHistoryItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  receiptHistoryItemVoided: {
    backgroundColor: '#f5f5f5',
    opacity: 0.7,
  },
  receiptHistoryItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  receiptHistoryItemNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  receiptHistoryItemDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  receiptHistoryItemCustomer: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  receiptHistoryItemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 4,
  },
  receiptHistoryItemTextVoided: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  voidedBadge: {
    backgroundColor: '#f44336',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  voidedBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  receiptDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  receiptDetailSection: {
    marginBottom: 12,
  },
  receiptDetailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  receiptDetailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  receiptDetailSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 12,
  },
  receiptDetailItem: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    marginVertical: 6,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  receiptDetailItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  receiptDetailItemDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  receiptDetailItemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  receiptDetailTotals: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 2,
    borderTopColor: '#e0e0e0',
  },
  receiptDetailTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  receiptDetailTotalLabel: {
    fontSize: 16,
    color: '#666',
  },
  receiptDetailTotalValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  receiptDetailTotalLabelBold: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  receiptDetailTotalValueBold: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  receiptHistoryCloseButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 12,
  },
  receiptHistoryCloseButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  receiptHistoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  receiptDateButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#e3f2fd',
    borderWidth: 1,
    borderColor: '#2196f3',
  },
  receiptDateText: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: '600',
  },
  receiptCountText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
  },
  exportReceiptsButton: {
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#4caf50',
    marginTop: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  exportReceiptsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadMoreButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
    marginTop: 12,
    alignItems: 'center',
  },
  loadMoreButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default InventoryApp;