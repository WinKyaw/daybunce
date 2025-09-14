import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Modal, 
  Alert,
  StyleSheet,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LocalStorage } from '../src/services/LocalStorage';
import { DataService } from '../src/services/DataService';
import { OCRService } from '../src/services/OCRService';

interface InventoryItem {
  id: string;
  name: string;
  price: string;
  unitsSold: string;
  category: string;
  unit: string;
  totalAmount: number;
  timestamp: string;
}

interface Labels {
  appTitle: string;
  search: string;
  category: string;
  all: string;
  addItem: string;
  dailyTotal: string;
  itemName: string;
  price: string;
  unitsSold: string;
  totalAmount: string;
  unit: string;
  save: string;
  cancel: string;
  scanOCR: string;
  noItems: string;
  sortBy: string;
  exportData: string;
  importData: string;
  clearData: string;
}

interface NewItem {
  name: string;
  price: string;
  unitsSold: string;
  category: string;
  unit: string;
}

const App = () => {
  // State management
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [showOCRModal, setShowOCRModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Language/Labels state (dynamic labels) - stored locally
  const [labels, setLabels] = useState<Labels>({
    appTitle: 'Inventory Management',
    search: 'Search items...',
    category: 'Category',
    all: 'All',
    addItem: 'Add Item',
    dailyTotal: 'Daily Total',
    itemName: 'Item Name',
    price: 'Price',
    unitsSold: 'Units Sold',
    totalAmount: 'Total Amount',
    unit: 'Unit',
    save: 'Save',
    cancel: 'Cancel',
    scanOCR: 'Scan with OCR',
    noItems: 'No items for this date',
    sortBy: 'Sort by',
    exportData: 'Export Data',
    importData: 'Import Data',
    clearData: 'Clear All Data'
  });

  // Categories and units - can be customized and stored locally
  const [categories, setCategories] = useState<string[]>(['electronics', 'food', 'clothing', 'books', 'other']);
  const [units, setUnits] = useState<string[]>(['pcs', 'kg', 'lb', 'oz', 'liter', 'gallon']);
  const sortOptions = ['name', 'price', 'quantity', 'total'];

  // New item form state
  const [newItem, setNewItem] = useState<NewItem>({
    name: '',
    price: '',
    unitsSold: '',
    category: 'other',
    unit: 'pcs'
  });

  // Calculate total amount for new item
  const calculateTotal = () => {
    const price = parseFloat(newItem.price) || 0;
    const units = parseFloat(newItem.unitsSold) || 0;
    return price * units;
  };

  // Load items for selected date
  useEffect(() => {
    loadItemsForDate(selectedDate);
  }, [selectedDate]);

  // Load settings on app start
  useEffect(() => {
    loadSettings();
    performAutoCleanup();
  }, []);

  const loadSettings = async () => {
    const settings = await DataService.getSettings();
    if (settings.labels) setLabels(settings.labels);
    if (settings.categories) setCategories(settings.categories);
    if (settings.units) setUnits(settings.units);
  };

  const loadItemsForDate = async (date: string) => {
    setIsLoading(true);
    try {
      const dateItems = await DataService.getItems(date);
      setItems(dateItems);
    } catch (error) {
      console.error('Error loading items:', error);
      setItems([]);
    }
    setIsLoading(false);
  };

  const performAutoCleanup = async () => {
    try {
      const removedCount = await DataService.cleanup();
      if (removedCount > 0) {
        console.log(`Cleaned up ${removedCount} old records`);
      }
    } catch (error) {
      console.error('Auto cleanup error:', error);
    }
  };

  // Handle OCR scan
  const handleOCRScan = async () => {
    setIsLoading(true);
    try {
      // Capture image
      const imageResult = await OCRService.captureImage();
      
      if (imageResult.success) {
        // Process with OCR
        const ocrResult = await OCRService.scanImage(imageResult.imageUri);
        
        if (ocrResult.success && 'extracted' in ocrResult) {
          setNewItem({
            ...newItem,
            name: ocrResult.extracted.itemName || '',
            price: ocrResult.extracted.price || '',
            unitsSold: ocrResult.extracted.quantity || ''
          });
        }
      }
    } catch (error) {
      console.error('OCR Error:', error);
      Alert.alert('OCR Error', 'Failed to process image. Please try again.');
    }
    setIsLoading(false);
    setShowOCRModal(false);
  };

  // Filter and sort items
  const filteredItems = items
    .filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return parseFloat(b.price) - parseFloat(a.price);
        case 'quantity':
          return parseFloat(b.unitsSold) - parseFloat(a.unitsSold);
        case 'total':
          return b.totalAmount - a.totalAmount;
        default:
          return a.name.localeCompare(b.name);
      }
    });

  // Calculate daily total
  const dailyTotal = items.reduce((sum, item) => sum + (item.totalAmount || 0), 0);

  const handleAddItem = async () => {
    if (newItem.name && newItem.price && newItem.unitsSold) {
      try {
        const savedItem = await DataService.saveItem(selectedDate, newItem);
        const updatedItems = await DataService.getItems(selectedDate);
        setItems(updatedItems);
        setNewItem({ name: '', price: '', unitsSold: '', category: 'other', unit: 'pcs' });
        setShowAddModal(false);
      } catch (error) {
        console.error('Error adding item:', error);
        Alert.alert('Error', 'Failed to add item. Please try again.');
      }
    }
  };

  const handleExportData = async () => {
    try {
      const result = await DataService.exportAllData();
      if (result.success) {
        Alert.alert('Success', 'Data exported successfully!');
      } else {
        Alert.alert('Error', result.error || 'Failed to export data');
      }
      setShowExportModal(false);
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Error', 'Failed to export data. Please try again.');
    }
  };

  const handleClearAllData = async () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to clear all data? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              const keys = await LocalStorage.getAllKeys();
              for (const key of keys) {
                await LocalStorage.removeItem(key);
              }
              await LocalStorage.removeItem('app_settings');
              
              setItems([]);
              Alert.alert('Success', 'All data cleared successfully!');
            } catch (error) {
              console.error('Clear data error:', error);
              Alert.alert('Error', 'Failed to clear data. Please try again.');
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ExpoStatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{labels.appTitle}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => setShowExportModal(true)}
            style={styles.headerButton}
          >
            <Ionicons name="download-outline" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleClearAllData}
            style={styles.headerButton}
          >
            <Ionicons name="trash-outline" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={labels.search}
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>

        <View style={styles.filtersRow}>
          <View style={styles.filterContainer}>
            <Text style={styles.filterLabel}>{labels.category}</Text>
            {/* Note: You would implement a proper picker here */}
            <Text style={styles.filterValue}>{selectedCategory}</Text>
          </View>
          
          <View style={styles.filterContainer}>
            <Text style={styles.filterLabel}>{labels.sortBy}</Text>
            <Text style={styles.filterValue}>{sortBy}</Text>
          </View>
        </View>

        {/* Date Selector */}
        <View style={styles.dateContainer}>
          <Ionicons name="calendar-outline" size={20} color="#3B82F6" />
          <Text style={styles.dateText}>{selectedDate}</Text>
        </View>
      </View>

      {/* Loading indicator */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}

      {/* Items List */}
      <ScrollView style={styles.itemsList} contentContainerStyle={styles.itemsListContent}>
        {filteredItems.length === 0 && !isLoading ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>{labels.noItems}</Text>
            <Text style={styles.emptyStateSubtext}>Tap "Add Item" to get started</Text>
          </View>
        ) : (
          filteredItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.itemCard}
              onPress={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
            >
              <View style={styles.itemHeader}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemDetails}>
                    {item.unitsSold} {item.unit} × ${item.price}
                  </Text>
                </View>
                <View style={styles.itemTotal}>
                  <Text style={styles.itemTotalAmount}>${(item.totalAmount || 0).toFixed(2)}</Text>
                  <Ionicons 
                    name={expandedItem === item.id ? "chevron-up-outline" : "chevron-down-outline"} 
                    size={16} 
                    color="#666" 
                  />
                </View>
              </View>

              {/* Expanded Details */}
              {expandedItem === item.id && (
                <View style={styles.expandedDetails}>
                  <View style={styles.detailsGrid}>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>{labels.category}:</Text>
                      <Text style={styles.detailValue}>{item.category}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>{labels.unit}:</Text>
                      <Text style={styles.detailValue}>{item.unit}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>{labels.price}:</Text>
                      <Text style={styles.detailValue}>${item.price}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>{labels.unitsSold}:</Text>
                      <Text style={styles.detailValue}>{item.unitsSold}</Text>
                    </View>
                  </View>
                  <View style={styles.timestampContainer}>
                    <Text style={styles.timestampLabel}>Added:</Text>
                    <Text style={styles.timestampValue}>
                      {item.timestamp ? new Date(item.timestamp).toLocaleString() : 'Unknown'}
                    </Text>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Fixed Bottom Navigation */}
      <View style={styles.bottomBar}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>{labels.dailyTotal}</Text>
          <Text style={styles.totalAmount}>${dailyTotal.toFixed(2)}</Text>
          <Text style={styles.totalItems}>{filteredItems.length} items</Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowAddModal(true)}
          disabled={isLoading}
          style={[styles.addButton, isLoading && styles.addButtonDisabled]}
        >
          <Ionicons name="add-outline" size={20} color="white" />
          <Text style={styles.addButtonText}>{labels.addItem}</Text>
        </TouchableOpacity>
      </View>

      {/* Add Item Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{labels.addItem}</Text>
            
            <View style={styles.formContainer}>
              <Text style={styles.inputLabel}>{labels.itemName}</Text>
              <TextInput
                style={styles.textInput}
                value={newItem.name}
                onChangeText={(text) => setNewItem({...newItem, name: text})}
                placeholder="Enter item name"
              />

              <View style={styles.inputRow}>
                <View style={styles.halfInput}>
                  <Text style={styles.inputLabel}>{labels.price}</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newItem.price}
                    onChangeText={(text) => setNewItem({...newItem, price: text})}
                    placeholder="0.00"
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.halfInput}>
                  <Text style={styles.inputLabel}>{labels.unitsSold}</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newItem.unitsSold}
                    onChangeText={(text) => setNewItem({...newItem, unitsSold: text})}
                    placeholder="0"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.totalDisplay}>
                <Text style={styles.totalDisplayText}>
                  {labels.totalAmount}: ${calculateTotal().toFixed(2)}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setShowOCRModal(true)}
                disabled={isLoading}
                style={[styles.ocrButton, isLoading && styles.ocrButtonDisabled]}
              >
                <Ionicons name="camera-outline" size={20} color="white" />
                <Text style={styles.ocrButtonText}>{labels.scanOCR}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setShowAddModal(false)}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>{labels.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddItem}
                disabled={!newItem.name || !newItem.price || !newItem.unitsSold || isLoading}
                style={[styles.saveButton, (!newItem.name || !newItem.price || !newItem.unitsSold || isLoading) && styles.saveButtonDisabled]}
              >
                <Text style={styles.saveButtonText}>{labels.save}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* OCR Modal */}
      <Modal
        visible={showOCRModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowOCRModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.ocrModalContent}>
            <Ionicons name="camera-outline" size={48} color="#10B981" style={styles.ocrIcon} />
            <Text style={styles.ocrTitle}>OCR Scanner</Text>
            <Text style={styles.ocrDescription}>Position receipt in camera view</Text>
            <Text style={styles.ocrLanguageInfo}>Supports Myanmar text recognition</Text>
            
            {isLoading ? (
              <View style={styles.ocrLoadingContainer}>
                <Text style={styles.ocrLoadingText}>Processing image...</Text>
              </View>
            ) : (
              <View style={styles.ocrActions}>
                <TouchableOpacity
                  onPress={() => setShowOCRModal(false)}
                  style={styles.ocrCancelButton}
                >
                  <Text style={styles.ocrCancelButtonText}>{labels.cancel}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleOCRScan}
                  style={styles.ocrScanButton}
                >
                  <Text style={styles.ocrScanButtonText}>Scan</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Export Modal */}
      <Modal
        visible={showExportModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowExportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.exportModalContent}>
            <Text style={styles.exportModalTitle}>Data Management</Text>
            
            <TouchableOpacity
              onPress={handleExportData}
              style={styles.exportButton}
            >
              <Ionicons name="download-outline" size={20} color="white" />
              <Text style={styles.exportButtonText}>{labels.exportData}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleClearAllData}
              style={styles.clearButton}
            >
              <Ionicons name="trash-outline" size={20} color="white" />
              <Text style={styles.clearButtonText}>{labels.clearData}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowExportModal(false)}
              style={styles.exportCloseButton}
            >
              <Text style={styles.exportCloseButtonText}>Close</Text>
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
    backgroundColor: '#F3F4F6',
  },
  header: {
    backgroundColor: '#3B82F6',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 4,
    borderRadius: 4,
  },
  searchContainer: {
    backgroundColor: 'white',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 16,
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  filterContainer: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
  },
  filterLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  filterValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 16,
    color: '#374151',
  },
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
  },
  loadingText: {
    color: '#6B7280',
  },
  itemsList: {
    flex: 1,
  },
  itemsListContent: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  itemCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemHeader: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  itemDetails: {
    fontSize: 14,
    color: '#6B7280',
  },
  expandedDetails: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  itemTotal: {
    alignItems: 'flex-end',
  },
  itemTotalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 4,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    paddingTop: 0,
    gap: 16,
  },
  detailItem: {
    width: '45%',
  },
  detailLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  timestampContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  timestampLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  timestampValue: {
    fontSize: 12,
    color: '#374151',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  totalContainer: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10B981',
  },
  totalItems: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  addButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  halfInput: {
    flex: 1,
  },
  totalDisplay: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  totalDisplayText: {
    fontSize: 14,
    color: '#6B7280',
  },
  ocrButton: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  ocrButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  ocrButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  ocrModalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
  },
  ocrIcon: {
    marginBottom: 16,
  },
  ocrTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  ocrDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  ocrLanguageInfo: {
    fontSize: 12,
    color: '#3B82F6',
    marginBottom: 24,
    textAlign: 'center',
  },
  ocrLoadingContainer: {
    paddingVertical: 16,
  },
  ocrLoadingText: {
    fontSize: 14,
    color: '#6B7280',
  },
  ocrActions: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  ocrCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    alignItems: 'center',
  },
  ocrCancelButtonText: {
    color: '#6B7280',
    fontWeight: '600',
  },
  ocrScanButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#10B981',
    borderRadius: 8,
    alignItems: 'center',
  },
  ocrScanButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  exportModalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 300,
  },
  exportModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  exportButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  exportButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  clearButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  clearButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  exportCloseButton: {
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    alignItems: 'center',
  },
  exportCloseButtonText: {
    color: '#6B7280',
    fontWeight: '600',
  },
});

export default App;