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
  Platform,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LocalStorage } from './services/LocalStorage';
import { DataService } from './services/DataService';
import { OCRService } from './services/OCRService';

const InventoryApp = () => {
  // State management
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [expandedItem, setExpandedItem] = useState(null);
  const [items, setItems] = useState([]);
  const [showOCRModal, setShowOCRModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Picker modal states
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showUnitPicker, setShowUnitPicker] = useState(false);
  const [showSortPicker, setShowSortPicker] = useState(false);
  const [showFilterCategoryPicker, setShowFilterCategoryPicker] = useState(false);
  
  // Language/Labels state (dynamic labels) - stored locally
  const [labels, setLabels] = useState({
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
  const [categories, setCategories] = useState(['electronics', 'food', 'clothing', 'books', 'other']);
  const [units, setUnits] = useState(['pcs', 'kg', 'lb', 'oz', 'liter', 'gallon']);
  const sortOptions = ['name', 'price', 'quantity', 'total'];

  // New item form state
  const [newItem, setNewItem] = useState({
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

  const loadItemsForDate = async (date) => {
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
        
        if (ocrResult.success) {
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
      // Show error message to user
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
      }
    }
  };

  const handleExportData = async () => {
    try {
      const exportData = await DataService.exportAllData();
      const dataStr = JSON.stringify(exportData, null, 2);
      
      // In real React Native, you'd use react-native-fs to save file
      // For web demo, create download
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventory_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      setShowExportModal(false);
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const handleImportData = async (event) => {
    try {
      const file = event.target.files[0];
      if (file) {
        const text = await file.text();
        const importData = JSON.parse(text);
        await DataService.importData(importData);
        
        // Reload current date items
        await loadItemsForDate(selectedDate);
        await loadSettings();
        
        alert('Data imported successfully!');
      }
    } catch (error) {
      console.error('Import error:', error);
      alert('Error importing data. Please check file format.');
    }
  };

  const handleClearAllData = async () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      try {
        const keys = await LocalStorage.getAllKeys();
        for (const key of keys) {
          await LocalStorage.removeItem(key);
        }
        await LocalStorage.removeItem('app_settings');
        
        setItems([]);
        alert('All data cleared successfully!');
      } catch (error) {
        console.error('Clear data error:', error);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
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
            style={styles.headerButton}
            onPress={() => {
              // TODO: Implement file picker for React Native
              console.log('Import functionality needs React Native file picker');
            }}
          >
            <Ionicons name="cloud-upload-outline" size={20} color="white" />
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
          <Ionicons name="search" size={16} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            placeholder={labels.search}
            value={searchTerm}
            onChangeText={setSearchTerm}
            style={styles.searchInput}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.filtersRow}>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowFilterCategoryPicker(true)}
          >
            <Text style={styles.filterButtonText}>
              {selectedCategory === 'all' ? labels.all : categories.find(cat => cat === selectedCategory)?.charAt(0).toUpperCase() + categories.find(cat => cat === selectedCategory)?.slice(1)}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#374151" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowSortPicker(true)}
          >
            <Text style={styles.filterButtonText}>
              {labels.sortBy}: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* Date Selector */}
        <View style={styles.dateSelector}>
          <TouchableOpacity 
            onPress={() => setShowCalendar(!showCalendar)}
            style={styles.dateIcon}
          >
            <Ionicons name="calendar-outline" size={20} color="#2563EB" />
          </TouchableOpacity>
          <TextInput
            value={selectedDate}
            onChangeText={setSelectedDate}
            style={styles.dateInput}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#9CA3AF"
          />
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
            <View key={item.id} style={styles.itemCard}>
              <TouchableOpacity 
                style={styles.itemHeader}
                onPress={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
              >
                <View style={styles.itemHeaderContent}>
                  <View style={styles.itemMainInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemSubtext}>
                      {item.unitsSold} {item.unit} × ${item.price}
                    </Text>
                  </View>
                  <View style={styles.itemPriceSection}>
                    <Text style={styles.itemTotal}>${(item.totalAmount || 0).toFixed(2)}</Text>
                    <Ionicons 
                      name={expandedItem === item.id ? "chevron-up" : "chevron-down"} 
                      size={16} 
                      color="#374151" 
                    />
                  </View>
                </View>
              </TouchableOpacity>

              {/* Expanded Details */}
              {expandedItem === item.id && (
                <View style={styles.itemDetails}>
                  <View style={styles.itemDetailsGrid}>
                    <View style={styles.itemDetailItem}>
                      <Text style={styles.itemDetailLabel}>{labels.category}:</Text>
                      <Text style={styles.itemDetailValue}>{item.category}</Text>
                    </View>
                    <View style={styles.itemDetailItem}>
                      <Text style={styles.itemDetailLabel}>{labels.unit}:</Text>
                      <Text style={styles.itemDetailValue}>{item.unit}</Text>
                    </View>
                    <View style={styles.itemDetailItem}>
                      <Text style={styles.itemDetailLabel}>{labels.price}:</Text>
                      <Text style={styles.itemDetailValue}>${item.price}</Text>
                    </View>
                    <View style={styles.itemDetailItem}>
                      <Text style={styles.itemDetailLabel}>{labels.unitsSold}:</Text>
                      <Text style={styles.itemDetailValue}>{item.unitsSold}</Text>
                    </View>
                    <View style={styles.itemDetailItemFull}>
                      <Text style={styles.itemDetailLabel}>Added:</Text>
                      <Text style={styles.itemDetailTimestamp}>
                        {item.timestamp ? new Date(item.timestamp).toLocaleString() : 'Unknown'}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* Fixed Bottom Navigation */}
      <View style={styles.bottomNav}>
        <View style={styles.bottomNavContent}>
          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>{labels.dailyTotal}</Text>
            <Text style={styles.totalAmount}>${dailyTotal.toFixed(2)}</Text>
            <Text style={styles.totalItems}>{filteredItems.length} items</Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowAddModal(true)}
            disabled={isLoading}
            style={[styles.addButton, isLoading && styles.addButtonDisabled]}
          >
            <Ionicons name="add" size={16} color="white" />
            <Text style={styles.addButtonText}>{labels.addItem}</Text>
          </TouchableOpacity>
        </View>
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
            
            <View style={styles.modalForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{labels.itemName}</Text>
                <TextInput
                  value={newItem.name}
                  onChangeText={(text) => setNewItem({...newItem, name: text})}
                  style={styles.textInput}
                  placeholder="Enter item name"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputRow}>
                <View style={styles.halfInput}>
                  <Text style={styles.inputLabel}>{labels.price}</Text>
                  <TextInput
                    value={newItem.price}
                    onChangeText={(text) => setNewItem({...newItem, price: text})}
                    style={styles.textInput}
                    placeholder="0.00"
                    keyboardType="numeric"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                <View style={styles.halfInput}>
                  <Text style={styles.inputLabel}>{labels.unitsSold}</Text>
                  <TextInput
                    value={newItem.unitsSold}
                    onChangeText={(text) => setNewItem({...newItem, unitsSold: text})}
                    style={styles.textInput}
                    placeholder="0"
                    keyboardType="numeric"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              <View style={styles.inputRow}>
                <View style={styles.halfInput}>
                  <Text style={styles.inputLabel}>{labels.category}</Text>
                  <TouchableOpacity 
                    style={styles.pickerButton}
                    onPress={() => setShowCategoryPicker(true)}
                  >
                    <Text style={styles.pickerButtonText}>
                      {categories.find(cat => cat === newItem.category)?.charAt(0).toUpperCase() + categories.find(cat => cat === newItem.category)?.slice(1)}
                    </Text>
                    <Ionicons name="chevron-down" size={16} color="#374151" />
                  </TouchableOpacity>
                </View>
                <View style={styles.halfInput}>
                  <Text style={styles.inputLabel}>{labels.unit}</Text>
                  <TouchableOpacity 
                    style={styles.pickerButton}
                    onPress={() => setShowUnitPicker(true)}
                  >
                    <Text style={styles.pickerButtonText}>{newItem.unit}</Text>
                    <Ionicons name="chevron-down" size={16} color="#374151" />
                  </TouchableOpacity>
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
                <Ionicons name="camera-outline" size={16} color="white" />
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
            <View style={styles.ocrIconContainer}>
              <Ionicons name="camera-outline" size={48} color="#059669" />
            </View>
            <Text style={styles.ocrTitle}>OCR Scanner</Text>
            <Text style={styles.ocrSubtitle}>Position receipt in camera view</Text>
            <Text style={styles.ocrMyanmarText}>Supports Myanmar text recognition</Text>
            
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

      {/* Export/Settings Modal */}
      <Modal
        visible={showExportModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowExportModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Data Management</Text>
            
            <View style={styles.exportActions}>
              <TouchableOpacity
                onPress={handleExportData}
                style={styles.exportButton}
              >
                <Ionicons name="download-outline" size={16} color="white" />
                <Text style={styles.exportButtonText}>{labels.exportData}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.importButton}
                onPress={() => {
                  // TODO: Implement file picker for React Native
                  console.log('Import functionality needs React Native file picker');
                }}
              >
                <Ionicons name="cloud-upload-outline" size={16} color="white" />
                <Text style={styles.importButtonText}>{labels.importData}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleClearAllData}
                style={styles.clearButton}
              >
                <Ionicons name="trash-outline" size={16} color="white" />
                <Text style={styles.clearButtonText}>{labels.clearData}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => setShowExportModal(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Category Picker Modal */}
      <Modal
        visible={showCategoryPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCategoryPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.pickerModalContent}>
            <Text style={styles.pickerModalTitle}>Select Category</Text>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={styles.pickerOption}
                onPress={() => {
                  setNewItem({...newItem, category});
                  setShowCategoryPicker(false);
                }}
              >
                <Text style={styles.pickerOptionText}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Text>
                {newItem.category === category && (
                  <Ionicons name="checkmark" size={20} color="#2563eb" />
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.pickerCancelButton}
              onPress={() => setShowCategoryPicker(false)}
            >
              <Text style={styles.pickerCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Unit Picker Modal */}
      <Modal
        visible={showUnitPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowUnitPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.pickerModalContent}>
            <Text style={styles.pickerModalTitle}>Select Unit</Text>
            {units.map((unit) => (
              <TouchableOpacity
                key={unit}
                style={styles.pickerOption}
                onPress={() => {
                  setNewItem({...newItem, unit});
                  setShowUnitPicker(false);
                }}
              >
                <Text style={styles.pickerOptionText}>{unit}</Text>
                {newItem.unit === unit && (
                  <Ionicons name="checkmark" size={20} color="#2563eb" />
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.pickerCancelButton}
              onPress={() => setShowUnitPicker(false)}
            >
              <Text style={styles.pickerCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Filter Category Picker Modal */}
      <Modal
        visible={showFilterCategoryPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilterCategoryPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.pickerModalContent}>
            <Text style={styles.pickerModalTitle}>Filter by Category</Text>
            <TouchableOpacity
              style={styles.pickerOption}
              onPress={() => {
                setSelectedCategory('all');
                setShowFilterCategoryPicker(false);
              }}
            >
              <Text style={styles.pickerOptionText}>{labels.all}</Text>
              {selectedCategory === 'all' && (
                <Ionicons name="checkmark" size={20} color="#2563eb" />
              )}
            </TouchableOpacity>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={styles.pickerOption}
                onPress={() => {
                  setSelectedCategory(category);
                  setShowFilterCategoryPicker(false);
                }}
              >
                <Text style={styles.pickerOptionText}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Text>
                {selectedCategory === category && (
                  <Ionicons name="checkmark" size={20} color="#2563eb" />
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.pickerCancelButton}
              onPress={() => setShowFilterCategoryPicker(false)}
            >
              <Text style={styles.pickerCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Sort Picker Modal */}
      <Modal
        visible={showSortPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSortPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.pickerModalContent}>
            <Text style={styles.pickerModalTitle}>Sort by</Text>
            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.pickerOption}
                onPress={() => {
                  setSortBy(option);
                  setShowSortPicker(false);
                }}
              >
                <Text style={styles.pickerOptionText}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </Text>
                {sortBy === option && (
                  <Ionicons name="checkmark" size={20} color="#2563eb" />
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.pickerCancelButton}
              onPress={() => setShowSortPicker(false)}
            >
              <Text style={styles.pickerCancelText}>Cancel</Text>
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
    backgroundColor: '#2563eb',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInputContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    top: 12,
    zIndex: 1,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 40,
    paddingVertical: 8,
    fontSize: 16,
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: 'white',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#374151',
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateIcon: {
    padding: 4,
  },
  dateInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    fontSize: 16,
  },
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6b7280',
  },
  itemsList: {
    flex: 1,
    padding: 16,
  },
  itemsListContent: {
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
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
  },
  itemHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemMainInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  itemSubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  itemPriceSection: {
    alignItems: 'flex-end',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
  },
  itemDetails: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  itemDetailsGrid: {
    marginTop: 12,
  },
  itemDetailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  itemDetailItemFull: {
    marginTop: 8,
  },
  itemDetailLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  itemDetailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  itemDetailTimestamp: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1f2937',
    marginTop: 2,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    padding: 16,
  },
  bottomNavContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalSection: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#059669',
  },
  totalItems: {
    fontSize: 12,
    color: '#6b7280',
  },
  addButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
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
    borderRadius: 8,
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
  modalForm: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  halfInput: {
    flex: 1,
    gap: 8,
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#374151',
  },
  totalDisplay: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
  },
  totalDisplayText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  ocrButton: {
    backgroundColor: '#059669',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  ocrButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  ocrButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  ocrModalContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  ocrIconContainer: {
    marginBottom: 16,
  },
  ocrTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  ocrSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  ocrMyanmarText: {
    fontSize: 14,
    color: '#2563eb',
    marginBottom: 16,
    textAlign: 'center',
  },
  ocrLoadingContainer: {
    paddingVertical: 16,
  },
  ocrLoadingText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
  ocrActions: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  ocrCancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    alignItems: 'center',
  },
  ocrCancelButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '500',
  },
  ocrScanButton: {
    flex: 1,
    backgroundColor: '#059669',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  ocrScanButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  exportActions: {
    gap: 12,
  },
  exportButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  exportButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  importButton: {
    backgroundColor: '#059669',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  importButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  clearButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  closeButton: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  closeButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '500',
  },
  pickerModalContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    width: '100%',
    maxWidth: 350,
    maxHeight: '70%',
  },
  pickerModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#1f2937',
  },
  pickerOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  pickerOptionText: {
    fontSize: 16,
    color: '#374151',
  },
  pickerCancelButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  pickerCancelText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
});

export default InventoryApp;