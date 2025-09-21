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
import logging

app = Flask(__name__)
CORS(app)  # Enable CORS for React Native

# Configuration
DATA_FILE = 'inventory_data.json'
RETENTION_DAYS = 30

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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
            logger.error(f"Error loading data: {e}")
            self.data = {}
    
    def save_data(self):
        """Save data to JSON file"""
        try:
            with open(self.data_file, 'w', encoding='utf-8') as f:
                json.dump(self.data, f, ensure_ascii=False, indent=2)
        except Exception as e:
            logger.error(f"Error saving data: {e}")
    
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
                logger.info(f"Cleaned up data for {date_str}")
            if dates_to_remove:
                self.save_data()
        except Exception as e:
            logger.error(f"Error during cleanup: {e}")
    
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

def preprocess_image_for_ocr(image):
    """Advanced image preprocessing for better OCR results"""
    try:
        # Convert to grayscale if not already
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image.copy()
        
        # Apply multiple preprocessing techniques
        processed_images = []
        
        # Original grayscale
        processed_images.append(('original', gray))
        
        # Method 1: CLAHE + Denoising
        clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8,8))
        clahe_enhanced = clahe.apply(gray)
        denoised = cv2.fastNlMeansDenoising(clahe_enhanced, h=10)
        processed_images.append(('clahe_denoised', denoised))
        
        # Method 2: Gaussian blur + Threshold
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        _, thresh_binary = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        processed_images.append(('otsu_threshold', thresh_binary))
        
        # Method 3: Adaptive threshold
        adaptive_thresh = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                                               cv2.THRESH_BINARY, 11, 2)
        processed_images.append(('adaptive_threshold', adaptive_thresh))
        
        # Method 4: Morphological operations
        kernel = np.ones((2,2), np.uint8)
        morph = cv2.morphologyEx(gray, cv2.MORPH_CLOSE, kernel)
        processed_images.append(('morphological', morph))
        
        # Method 5: Edge enhancement
        kernel_sharpen = np.array([[-1,-1,-1], [-1,9,-1], [-1,-1,-1]])
        sharpened = cv2.filter2D(gray, -1, kernel_sharpen)
        processed_images.append(('sharpened', sharpened))
        
        return processed_images
        
    except Exception as e:
        logger.error(f"Error in image preprocessing: {e}")
        return [('original', image)]

def extract_text_with_multiple_configs(image):
    """Try multiple Tesseract configurations for better results"""
    configs = [
        '--psm 6 -c tessedit_char_whitelist=0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.,- ',
        '--psm 8 --oem 3',
        '--psm 7 --oem 3',
        '--psm 6 --oem 3',
        '--psm 4 --oem 3',
        '--psm 3 --oem 3',
        '--psm 13 --oem 3',
        '-l eng --psm 6',
        '-l eng+mya --psm 6' if check_myanmar_support() else '-l eng --psm 6'
    ]
    
    results = []
    pil_image = Image.fromarray(image) if isinstance(image, np.ndarray) else image
    
    for config in configs:
        try:
            text = pytesseract.image_to_string(pil_image, config=config).strip()
            if text and len(text) > 2:  # Only keep meaningful results
                results.append((config, text))
                logger.info(f"Config '{config}' extracted: {text[:50]}...")
        except Exception as e:
            logger.warning(f"Config '{config}' failed: {e}")
            continue
    
    return results

def check_myanmar_support():
    """Check if Myanmar language is supported by Tesseract"""
    try:
        langs = pytesseract.get_languages()
        return 'mya' in langs
    except:
        return False

def extract_numbers_and_text_from_results(ocr_results):
    """Enhanced extraction from multiple OCR results"""
    all_extractions = []
    
    for config, text in ocr_results:
        extraction = extract_numbers_and_text_from_text(text)
        extraction['config'] = config
        extraction['confidence'] = calculate_extraction_confidence(extraction, text)
        all_extractions.append(extraction)
    
    # Return the extraction with highest confidence
    if all_extractions:
        best_extraction = max(all_extractions, key=lambda x: x['confidence'])
        return best_extraction
    
    return {
        'item_name': '',
        'price': '',
        'quantity': '',
        'total': '',
        'confidence': 0,
        'config': 'none'
    }

def calculate_extraction_confidence(extraction, original_text):
    """Calculate confidence score for extraction quality"""
    score = 0
    
    # Check if we found meaningful data
    if extraction['item_name'] and len(extraction['item_name']) > 2:
        score += 30
    
    if extraction['price'] and float(extraction['price'] or 0) > 0:
        score += 25
    
    if extraction['quantity'] and float(extraction['quantity'] or 0) > 0:
        score += 20
    
    if extraction['total'] and float(extraction['total'] or 0) > 0:
        score += 15
    
    # Bonus for having original text
    if original_text and len(original_text.strip()) > 5:
        score += 10
    
    return score

def extract_numbers_and_text_from_text(ocr_text):
    """Extract meaningful information from OCR results text"""
    extracted_info = {
        'item_name': '',
        'price': '',
        'quantity': '',
        'total': ''
    }
    
    if not ocr_text or not ocr_text.strip():
        return extracted_info
    
    lines = [line.strip() for line in ocr_text.split('\n') if line.strip()]
    
    # Extract all text and numbers
    all_text = []
    all_numbers = []
    
    for line in lines:
        all_text.append(line)
        # Find numbers (including decimals and currency symbols)
        number_matches = re.findall(r'[\d,]+\.?\d*', line)
        for match in number_matches:
            try:
                # Clean and convert number
                clean_number = match.replace(',', '')
                if clean_number and '.' in clean_number:
                    all_numbers.append(float(clean_number))
                elif clean_number:
                    all_numbers.append(int(clean_number))
            except ValueError:
                continue
    
    # Extract item name (longest non-numeric text)
    text_candidates = []
    for text in all_text:
        # Skip lines that are mostly numbers
        if not re.match(r'^[\d\s.,]+$', text) and len(text) > 2:
            text_candidates.append(text)
    
    if text_candidates:
        # Take the longest meaningful text as item name
        extracted_info['item_name'] = max(text_candidates, key=len)
    
    # Sort numbers for better extraction
    if all_numbers:
        sorted_numbers = sorted(set(all_numbers), reverse=True)
        
        # Heuristic: largest number is likely total, second largest is price
        if len(sorted_numbers) >= 1:
            extracted_info['total'] = str(sorted_numbers[0])
        
        if len(sorted_numbers) >= 2:
            extracted_info['price'] = str(sorted_numbers[1])
            
        if len(sorted_numbers) >= 3:
            extracted_info['quantity'] = str(sorted_numbers[2])
        elif len(sorted_numbers) == 2:
            # If only 2 numbers, assume price and quantity (total = price * quantity)
            price = sorted_numbers[1]
            total = sorted_numbers[0]
            if price > 0:
                calculated_qty = total / price
                if calculated_qty == int(calculated_qty):
                    extracted_info['quantity'] = str(int(calculated_qty))
    
    return extracted_info

# API Routes (keeping existing ones, updating OCR route)

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
    """Enhanced OCR processing with multiple preprocessing methods"""
    print("11111111111111")
    try:
        data = request.get_json()
        logger.info(f"Received OCR request with keys: {list(data.keys()) if data else None}")
        
        if 'image' not in data:
            return jsonify({'error': 'No image provided', 'success': False}), 400
        
        # Decode image
        try:
            print("we are decoding image: 111111111")
            image_data = base64.b64decode(data['image'])
            image = Image.open(io.BytesIO(image_data))
            opencv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
            logger.info(f"Image decoded successfully. Size: {opencv_image.shape}")
        except Exception as e:
            logger.error(f"Image decoding error: {e}")
            return jsonify({'error': f'Invalid image data: {str(e)}', 'success': False}), 400
        
        # Preprocess image with multiple methods
        processed_images = preprocess_image_for_ocr(opencv_image)
        logger.info(f"Generated {len(processed_images)} processed image variants")
        
        all_ocr_results = []
        best_result = None
        best_confidence = 0
        
        # Try OCR on each preprocessed image
        for method_name, processed_img in processed_images:
            logger.info(f"Trying OCR with {method_name} preprocessing...")
            ocr_results = extract_text_with_multiple_configs(processed_img)
            
            if ocr_results:
                # Get best extraction from this preprocessing method
                extraction = extract_numbers_and_text_from_results(ocr_results)
                extraction['preprocessing_method'] = method_name
                all_ocr_results.append({
                    'method': method_name,
                    'results': ocr_results,
                    'extraction': extraction
                })
                
                # Track best overall result
                if extraction['confidence'] > best_confidence:
                    best_confidence = extraction['confidence']
                    best_result = extraction
        
        # Fallback if no good results
        if not best_result or best_confidence == 0:
            logger.warning("No meaningful OCR results found, trying basic extraction")
            try:
                basic_text = pytesseract.image_to_string(Image.fromarray(processed_images[0][1]))
                best_result = extract_numbers_and_text_from_text(basic_text)
                best_result['preprocessing_method'] = 'fallback'
                best_result['config'] = 'basic'
                best_result['raw_text'] = basic_text
            except Exception as e:
                logger.error(f"Fallback OCR failed: {e}")
                best_result = {
                    'item_name': '',
                    'price': '',
                    'quantity': '',
                    'total': '',
                    'confidence': 0,
                    'preprocessing_method': 'failed',
                    'config': 'none',
                    'raw_text': ''
                }
        
        response = {
            'success': True,
            'extracted': {
                'item_name': best_result.get('item_name', ''),
                'price': best_result.get('price', ''),
                'quantity': best_result.get('quantity', ''),
                'total': best_result.get('total', '')
            },
            'confidence': best_result.get('confidence', 0),
            'method_used': best_result.get('preprocessing_method', 'unknown'),
            'config_used': best_result.get('config', 'unknown'),
            'raw_text': best_result.get('raw_text', ''),
            'debug_info': {
                'methods_tried': len(processed_images),
                'total_extractions': len(all_ocr_results),
                'best_confidence': best_confidence
            }
        }

        print("000000000000")
        print(response)
        
        logger.info(f"OCR completed. Best confidence: {best_confidence}, Method: {best_result.get('preprocessing_method')}")
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"OCR scan error: {e}", exc_info=True)
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
        'data_file_exists': os.path.exists(DATA_FILE),
        'tesseract_available': check_tesseract_installation(),
        'myanmar_support': check_myanmar_support()
    })

def check_tesseract_installation():
    """Check if Tesseract is properly installed"""
    try:
        version = pytesseract.get_tesseract_version()
        return True
    except:
        return False

@app.route('/api/ocr/debug', methods=['GET'])
def ocr_debug():
    """Debug endpoint to check OCR setup"""
    try:
        info = {
            'tesseract_installed': check_tesseract_installation(),
            'tesseract_version': None,
            'available_languages': [],
            'myanmar_support': check_myanmar_support()
        }
        
        try:
            info['tesseract_version'] = str(pytesseract.get_tesseract_version())
            info['available_languages'] = pytesseract.get_languages()
        except Exception as e:
            info['tesseract_error'] = str(e)
        
        return jsonify(info)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Ensure data directory exists
    os.makedirs(os.path.dirname(os.path.abspath(DATA_FILE)), exist_ok=True)
    
    print("Starting Enhanced Inventory Management Backend...")
    print("=" * 50)
    
    # Check Tesseract installation
    if check_tesseract_installation():
        try:
            version = pytesseract.get_tesseract_version()
            print(f"✓ Tesseract version: {version}")
            languages = pytesseract.get_languages()
            print(f"✓ Available languages: {', '.join(languages)}")
            if 'mya' in languages:
                print("✓ Myanmar language support available")
            else:
                print("⚠ Myanmar language not available (install tesseract-ocr-mya)")
        except Exception as e:
            print(f"⚠ Tesseract installation issue: {e}")
    else:
        print("❌ Tesseract not found. Please install tesseract-ocr")
        print("   Ubuntu: sudo apt install tesseract-ocr")
        print("   macOS: brew install tesseract")
        print("   Windows: Download from GitHub releases")
    
    print(f"✓ Data storage: {DATA_FILE}")
    print(f"✓ Data retention: {RETENTION_DAYS} days")
    print(f"✓ Debug endpoint: /api/ocr/debug")
    print("=" * 50)
    
    app.run(debug=True, host='0.0.0.0', port=5001)