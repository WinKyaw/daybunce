from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from datetime import datetime, timedelta
import pytesseract
import cv2
import numpy as np
from PIL import Image
import base64
import io
import re

app = Flask(__name__)
CORS(app)  # Enable CORS for React Native

# Configuration
DATA_FILE = 'inventory_data.json'
RETENTION_DAYS = 30

class InventoryManager:
    def __init__(self, data_file):
        self.data_file = data_file
        self.load_data()
        self.cleanup_old_data()
    
    def load_data(self):
        """Load data from JSON file"""
        try:
            if os.path.exists(self.data_file):
                with open(self.data_file, 'r', encoding='utf-8') as f:
                    self.data = json.load(f)
            else:
                self.data = {}
        except Exception as e:
            print(f"Error loading data: {e}")
            self.data = {}
    
    def save_data(self):
        """Save data to JSON file"""
        try:
            with open(self.data_file, 'w', encoding='utf-8') as f:
                json.dump(self.data, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"Error saving data: {e}")
    
    def cleanup_old_data(self):
        """Remove data older than RETENTION_DAYS"""
        try:
            cutoff_date = datetime.now() - timedelta(days=RETENTION_DAYS)
            cutoff_str = cutoff_date.strftime('%Y-%m-%d')
            dates_to_remove = []
            for date_str in self.data.keys():
                if date_str < cutoff_str:
                    dates_to_remove.append(date_str)
            for date_str in dates_to_remove:
                del self.data[date_str]
                print(f"Cleaned up data for {date_str}")
            if dates_to_remove:
                self.save_data()
        except Exception as e:
            print(f"Error during cleanup: {e}")
    
    def get_items_by_date(self, date):
        """Get all items for a specific date"""
        return self.data.get(date, [])
    
    def add_item(self, date, item):
        """Add item to specific date"""
        if date not in self.data:
            self.data[date] = []
        item['id'] = f"{date}_{len(self.data[date])}"
        item['timestamp'] = datetime.now().isoformat()
        self.data[date].append(item)
        self.save_data()
        return item
    
    def update_item(self, date, item_id, updated_item):
        """Update existing item"""
        if date in self.data:
            for i, item in enumerate(self.data[date]):
                if item['id'] == item_id:
                    self.data[date][i] = {**item, **updated_item}
                    self.save_data()
                    return self.data[date][i]
        return None
    
    def delete_item(self, date, item_id):
        """Delete item"""
        if date in self.data:
            self.data[date] = [item for item in self.data[date] if item['id'] != item_id]
            self.save_data()
            return True
        return False

# Initialize inventory manager
inventory_manager = InventoryManager(DATA_FILE)

def extract_numbers_and_text_from_text(ocr_text):
    """Extract meaningful information from OCR results text"""
    extracted_info = {
        'item_name': '',
        'price': '',
        'quantity': '',
        'total': ''
    }
    lines = ocr_text.split('\n')
    all_text = []
    numbers = []
    for text in lines:
        text = text.strip()
        if not text:
            continue
        all_text.append(text)
        number_matches = re.findall(r'\d+\.?\d*', text)
        numbers.extend(number_matches)
    # Try to identify item name (usually longest text that's not a number)
    text_candidates = [text for text in all_text if not re.match(r'^\d+\.?\d*$', text)]
    if text_candidates:
        extracted_info['item_name'] = max(text_candidates, key=len)
    # Try to identify price and quantity from numbers
    if numbers:
        sorted_numbers = sorted([float(n) for n in numbers], reverse=True)
        if len(sorted_numbers) >= 1:
            extracted_info['price'] = str(sorted_numbers[0])
        if len(sorted_numbers) >= 2:
            extracted_info['quantity'] = str(sorted_numbers[1])
        if len(sorted_numbers) >= 3:
            extracted_info['total'] = str(sorted_numbers[2])
    return extracted_info

@app.route('/api/items/<date>', methods=['GET'])
def get_items(date):
    """Get items for specific date"""
    try:
        items = inventory_manager.get_items_by_date(date)
        return jsonify({'items': items, 'count': len(items)})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/items', methods=['POST'])
def add_item():
    """Add new item"""
    try:
        data = request.get_json()
        date = data.get('date', datetime.now().strftime('%Y-%m-%d'))
        price = float(data.get('price', 0))
        units_sold = float(data.get('unitsSold', 0))
        total_amount = price * units_sold
        item = {
            'name': data.get('name', ''),
            'price': price,
            'unitsSold': units_sold,
            'totalAmount': total_amount,
            'category': data.get('category', 'other'),
            'unit': data.get('unit', 'pcs'),
            'date': date
        }
        added_item = inventory_manager.add_item(date, item)
        items = inventory_manager.get_items_by_date(date)
        return jsonify({'success': True, 'item': added_item, 'items': items})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/items/<date>/<item_id>', methods=['PUT'])
def update_item(date, item_id):
    """Update existing item"""
    try:
        data = request.get_json()
        if 'price' in data or 'unitsSold' in data:
            items = inventory_manager.get_items_by_date(date)
            current_item = next((item for item in items if item['id'] == item_id), {})
            price = float(data.get('price', current_item.get('price', 0)))
            units_sold = float(data.get('unitsSold', current_item.get('unitsSold', 0)))
            data['totalAmount'] = price * units_sold
        updated_item = inventory_manager.update_item(date, item_id, data)
        if updated_item:
            return jsonify({'success': True, 'item': updated_item})
        else:
            return jsonify({'error': 'Item not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/items/<date>/<item_id>', methods=['DELETE'])
def delete_item(date, item_id):
    """Delete item"""
    try:
        success = inventory_manager.delete_item(date, item_id)
        if success:
            items = inventory_manager.get_items_by_date(date)
            return jsonify({'success': True, 'items': items})
        else:
            return jsonify({'error': 'Item not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/ocr/scan', methods=['POST'])
def ocr_scan():
    """Process image with OCR using pytesseract"""
    try:
        data = request.get_json()
        print("Received OCR request with keys:", data.keys() if data else None)
        if 'image' in data:
            image_data = base64.b64decode(data['image'])
            image = Image.open(io.BytesIO(image_data))
            opencv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        else:
            return jsonify({'error': 'No image provided'}), 400
        # Preprocess image for better OCR results
        gray = cv2.cvtColor(opencv_image, cv2.COLOR_BGR2GRAY)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
        gray = clahe.apply(gray)
        gray = cv2.fastNlMeansDenoising(gray)
        pil_gray = Image.fromarray(gray)
        # Perform OCR using pytesseract
        # To use Myanmar script, you need Tesseract installed with 'mya' language pack.
        # To use, set lang='mya+eng', but fallback to 'eng' if not available.
        try:
            ocr_text = pytesseract.image_to_string(pil_gray, lang='mya')
        except pytesseract.TesseractError:
            ocr_text = pytesseract.image_to_string(pil_gray, lang='eng')
        extracted_info = extract_numbers_and_text_from_text(ocr_text)
        response = {
            'success': True,
            'raw_text': ocr_text,
            'extracted': extracted_info
        }
        return jsonify(response)
    except Exception as e:
        print("OCR scan error:", e)
        return jsonify({'error': str(e), 'success': False}), 500

@app.route('/api/daily-total/<date>', methods=['GET'])
def get_daily_total(date):
    """Get total sales amount for a specific date"""
    try:
        items = inventory_manager.get_items_by_date(date)
        total = sum(item.get('totalAmount', 0) for item in items)
        return jsonify({
            'date': date,
            'total': total,
            'item_count': len(items)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get overall statistics"""
    try:
        total_days = len(inventory_manager.data)
        total_items = sum(len(items) for items in inventory_manager.data.values())
        total_sales = sum(
            sum(item.get('totalAmount', 0) for item in items) 
            for items in inventory_manager.data.values()
        )
        return jsonify({
            'total_days': total_days,
            'total_items': total_items,
            'total_sales': total_sales,
            'avg_daily_sales': total_sales / max(total_days, 1)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/cleanup', methods=['POST'])
def manual_cleanup():
    """Manually trigger data cleanup"""
    try:
        old_count = sum(len(items) for items in inventory_manager.data.values())
        inventory_manager.cleanup_old_data()
        new_count = sum(len(items) for items in inventory_manager.data.values())
        return jsonify({
            'success': True,
            'items_removed': old_count - new_count,
            'remaining_items': new_count
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'data_file_exists': os.path.exists(DATA_FILE)
    })

if __name__ == '__main__':
    os.makedirs(os.path.dirname(os.path.abspath(DATA_FILE)), exist_ok=True)
    print("Starting Inventory Management Backend...")
    print("OCR Reader initialized with pytesseract")
    print(f"Data will be stored in: {DATA_FILE}")
    print(f"Data retention: {RETENTION_DAYS} days")
    app.run(debug=True, host='0.0.0.0', port=5001)