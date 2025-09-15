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
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';

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
};

// Default categories and unit types
const defaultCategories = ['Food', 'Beverages', 'Electronics', 'Clothing', 'Other'];
const defaultUnitTypes = ['lb', 'oz', 'kg', 'g', 'pieces', 'liters', 'ml'];

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
  const [expandedItem, setExpandedItem] = useState(null);
  const [language, setLanguage] = useState(defaultLanguage);
  const [categories, setCategories] = useState(defaultCategories);
  const [unitTypes, setUnitTypes] = useState(defaultUnitTypes);

  // Add item form state
  const [newItem, setNewItem] = useState({
    name: '',
    price: '',
    unitsSold: '',
    category: defaultCategories[0],
    unitType: defaultUnitTypes[0],
  });

  useEffect(() => {
    loadData();
    loadLanguageConfig();
  }, [selectedDate]);

  useEffect(() => {
    filterAndSortItems();
  }, [items, searchText, filterCategory, sortBy]);

  const loadData = async () => {
    try {
      const dateKey = formatDate(selectedDate);
      const savedData = await AsyncStorage.getItem(`inventory_${dateKey}`);
      if (savedData) {
        setItems(JSON.parse(savedData));
      } else {
        setItems([]);
      }
      // Clean old data (older than 30 days)
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

  const addItem = async () => {
    if (!newItem.name || !newItem.price || !newItem.unitsSold) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    const item = {
      id: Date.now().toString(),
      ...newItem,
      totalAmount: (parseFloat(newItem.price) * parseFloat(newItem.unitsSold)).toFixed(2),
      timestamp: new Date().toISOString(),
    };

    const updatedItems = [...items, item];
    setItems(updatedItems);
    await saveData(updatedItems);

    setNewItem({
      name: '',
      price: '',
      unitsSold: '',
      category: categories[0],
      unitType: unitTypes[0],
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

  // --- OCR Integration ---

  // API call to Flask backend for OCR
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

  // --- END OCR Integration ---

  // processOCRResult is now only used for fallback/simulated results if you want
  // Keep for legacy or testing if needed
  const processOCRResult = (ocrText) => {
    // Simple OCR text parsing - you'd implement more sophisticated parsing
    const lines = ocrText.split('\n');
    const name = lines[0] || '';
    const priceMatch = ocrText.match(/price:?\s*(\d+\.?\d*)/i);
    const quantityMatch = ocrText.match(/quantity:?\s*(\d+)/i);

    setNewItem(prev => ({
      ...prev,
      name: name,
      price: priceMatch ? priceMatch[1] : '',
      unitsSold: quantityMatch ? quantityMatch[1] : '',
    }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{language.appTitle}</Text>
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

      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={language.searchPlaceholder}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <View style={styles.filtersContainer}>
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>{language.filterByCategory}</Text>
          <Picker
            selectedValue={filterCategory}
            style={styles.picker}
            onValueChange={setFilterCategory}
          >
            <Picker.Item label={language.all} value="All" />
            {categories.map(cat => (
              <Picker.Item key={cat} label={cat} value={cat} />
            ))}
          </Picker>
        </View>

        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>{language.sortBy}</Text>
          <Picker
            selectedValue={sortBy}
            style={styles.picker}
            onValueChange={setSortBy}
          >
            <Picker.Item label={language.sortByName} value="name" />
            <Picker.Item label={language.sortByPrice} value="price" />
            <Picker.Item label={language.sortByAmount} value="amount" />
          </Picker>
        </View>
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
        onPress={() => setShowAddModal(true)}
      >
        <Text style={styles.addButtonText}>+ {language.addItem}</Text>
      </TouchableOpacity>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <Text style={styles.totalText}>
          {language.dailyTotal}: ${getDailyTotal()}
        </Text>
      </View>

      {/* Add Item Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{language.addItem}</Text>

            <TextInput
              style={styles.input}
              placeholder={language.itemName}
              value={newItem.name}
              onChangeText={(text) => setNewItem(prev => ({ ...prev, name: text }))}
            />

            <TextInput
              style={styles.input}
              placeholder={language.price}
              value={newItem.price}
              onChangeText={(text) => setNewItem(prev => ({ ...prev, price: text }))}
              keyboardType="numeric"
            />

            <TextInput
              style={styles.input}
              placeholder={language.unitsSold}
              value={newItem.unitsSold}
              onChangeText={(text) => setNewItem(prev => ({ ...prev, unitsSold: text }))}
              keyboardType="numeric"
            />

            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>{language.category}</Text>
              <Picker
                selectedValue={newItem.category}
                style={styles.modalPicker}
                onValueChange={(value) => setNewItem(prev => ({ ...prev, category: value }))}
              >
                {categories.map(cat => (
                  <Picker.Item key={cat} label={cat} value={cat} />
                ))}
              </Picker>
            </View>

            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>{language.unitType}</Text>
              <Picker
                selectedValue={newItem.unitType}
                style={styles.modalPicker}
                onValueChange={(value) => setNewItem(prev => ({ ...prev, unitType: value }))}
              >
                {unitTypes.map(unit => (
                  <Picker.Item key={unit} label={unit} value={unit} />
                ))}
              </Picker>
            </View>

            <TouchableOpacity style={styles.ocrButton} onPress={handleOCRScan}>
              <Text style={styles.ocrButtonText}>{language.scanWithOCR}</Text>
            </TouchableOpacity>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.modalButtonText}>{language.cancel}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={addItem}
              >
                <Text style={styles.modalButtonText}>{language.save}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // ... (styles unchanged)
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
  filtersContainer: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterGroup: {
    flex: 1,
    marginHorizontal: 4,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
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
    bottom: 80,
    right: 20,
    backgroundColor: '#2196f3',
    borderRadius: 50,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#4caf50',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  pickerContainer: {
    marginBottom: 12,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  modalPicker: {
    borderWidth: 1,
    borderColor: '#ddd',
  },
  ocrButton: {
    backgroundColor: '#ff9800',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  ocrButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: '#666',
  },
  saveButton: {
    backgroundColor: '#4caf50',
  },
  modalButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default InventoryApp;