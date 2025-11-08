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
  bulkAddInstructions: 'Enter one item per line. You can use formats like:\n- Apple\n- Banana, Food, lb\n- Coffee, Beverages, kg',
  bulkAddDefaults: 'Default values for items without category/unit',
  deleteItem: 'Delete Item',
  deleteItemConfirm: 'Are you sure you want to delete this item from predefined items?',
  itemDeletedSuccess: 'Item deleted successfully',
  successTitle: 'Success',
  itemUpdated: 'Item Updated',
  itemUpdatedMessage: 'Added {{units}} {{unitType}} to existing item. New total: {{total}} {{unitType}}',
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
    tapToViewReceipt: 'Tap to view receipt',
    totalItems: 'Total Items',
    delete: 'Delete',
    deleteItem: 'Delete Item',
    deleteItemConfirm: 'Are you sure you want to delete this item from predefined items?',
    deleteAllConfirm: 'Are you sure you want to delete all {{count}} predefined items? This action cannot be undone.',
    bulkAddInstructions: 'Enter one item per line. You can use formats like:\n- Apple\n- Banana, Food, lb\n- Coffee, Beverages, kg',
    bulkAddDefaults: 'Default values for items without category/unit',
    deleteItem: 'Delete Item',
    deleteItemConfirm: 'Are you sure you want to delete this item from predefined items?',
    itemDeletedSuccess: 'Item deleted successfully',
    successTitle: 'Success',
    itemUpdated: 'Item Updated',
    itemUpdatedMessage: 'Added {{units}} {{unitType}} to existing item. New total: {{total}} {{unitType}}',
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
    tapToViewReceipt: 'Toque para ver el recibo',
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
      await loadSettings(); // Load settings first
      await loadData();
      await loadLanguageConfig(); // This might be redundant now
      await loadPredefinedItems();
      await loadDailyConfirmation(selectedDate);
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

    const existingItemIndex = items.findIndex(item => 
      item.name.toLowerCase() === newItem.name.toLowerCase() && 
      parseFloat(item.price) === parseFloat(newItem.price)
    );

    let updatedItems;
    
    if (existingItemIndex !== -1) {
      const existingItem = items[existingItemIndex];
      const newUnitsSold = parseFloat(existingItem.unitsSold) + parseFloat(newItem.unitsSold);
      const newTotalAmount = (parseFloat(newItem.price) * newUnitsSold).toFixed(2); // Keep as plain number for storage
      
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
      const price = parseFloat(newItem.price);
      const units = parseFloat(newItem.unitsSold);
      const totalAmount = (price * units).toFixed(2); // Keep as plain number for storage
      
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

    if (isItemUnique(newItem, predefinedItems)) {
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
      let csvContent = 'name,category,unitType\n';
      
      // Add each item as a CSV row
      predefinedItems.forEach(item => {
        // Escape commas and quotes in the data
        const name = `"${item.name.replace(/"/g, '""')}"`;
        const category = `"${item.category.replace(/"/g, '""')}"`;
        const unitType = `"${item.unitType.replace(/"/g, '""')}"`;
        csvContent += `${name},${category},${unitType}\n`;
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
            unitType: parts[2] || bulkAddUnitType
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
        <View style={styles.confirmDayContainer}>
          <TouchableOpacity
            style={[
              styles.materialSwitch,
              isDayConfirmed && styles.materialSwitchActive
            ]}
            onPress={toggleDayConfirmation}
            activeOpacity={0.8}
          >
            <View style={[
              styles.materialSwitchThumb,
              isDayConfirmed && styles.materialSwitchThumbActive
            ]} />
          </TouchableOpacity>
        </View>
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
                            <TouchableOpacity 
                              style={styles.clearButton}
                              onPress={() => setPredefinedFilterCategory('All')}
                            >
                              <Text style={styles.clearButtonText}>Clear</Text>
                            </TouchableOpacity>
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
                    <View style={styles.clearButton}>
                      <Text style={styles.clearButtonText}>Clear</Text>
                    </View>
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
                </ScrollView>
                
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
    maxHeight: '85%', // Prevent overflow
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
});

export default InventoryApp;