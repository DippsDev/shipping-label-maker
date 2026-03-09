"""
Label Generator API
Replicates the desktop application's label generation logic for web use.
Includes OCR functionality to extract data from uploaded labels.
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from PIL import Image, ImageDraw, ImageFont
import barcode
from barcode.writer import ImageWriter
import io
import os
import random
from datetime import datetime
import re

app = Flask(__name__)
CORS(app)

# Base paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
RESOURCES_DIR = os.path.join(BASE_DIR, '..', 'public', 'label-templates')
FONTS_DIR = os.path.join(RESOURCES_DIR, 'fonts')

# Try to import OCR library (optional)
try:
    import pytesseract
    from PIL import Image
    
    # Configure Tesseract path for Windows
    pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
    
    OCR_AVAILABLE = True
    print("✓ Tesseract OCR configured and ready")
except ImportError:
    OCR_AVAILABLE = False
    print("Warning: pytesseract not installed. OCR functionality will be disabled.")
    print("Install with: pip install pytesseract")
    print("Also install Tesseract OCR: https://github.com/tesseract-ocr/tesseract")

# Template mapping
TEMPLATES = {
    'ups': {
        'UPS Ground': 'ups_ground.png',
        'UPS Next Day Air': 'ups_express.png',
        'UPS 2nd Day Air': 'ups_saver.png',
        'UPS 3 Day Select': 'ups_standard.png',
        'UPS Ground Return Service': 'master.png',
    },
    'fedex': {
        'FedEx Ground': 'master_fedex.png',
        'FedEx Home Delivery': 'master_fedex.png',
        'FedEx Express Saver': 'fedex_express.png',
        'FedEx 2Day': 'fedex_express.png',
        'FedEx Standard Overnight': 'fedex_express.png',
        'FedEx Priority Overnight': 'fedex_express.png',
        'Smart Post': 'smartp_master.png',
        'Ground Return Service': 'master_fedex.png',
    },
    'usps': {
        'Priority Mail': 'priority_master.png',
        'Priority Mail Express': 'priority_e_master.png',
        'First Class Package': 'firstclass_master.png',
        'Parcel Select': 'parcel_master.png',
        'Ground Advantage': 'ground_advantage_master.png',
        'Priority Mail Return': 'priority_r_master.png',
        'First Class Package Return': 'firstclass_master.png',
        'UPS Mail Innovations': 'mailinno_master.png',
        'Smart Label / Pitney Bowes': 'smartl_master.png',
    },
    'purolator': {
        'Purolator Ground': 'purolator_master.png',
        'Purolator Express': 'purolator_express.png',
    },
    'canada_post': {
        'Regular Parcel': 'canada_3_master.png',
        'Expedited Parcel': 'canada_2_master.png',
        'Regular Parcel Return': 'canada_3_r_master.png',
        'Expedited Parcel Return': 'canada_2_r_master.png',
    }
}


def generate_code128_barcode(data, height=160):
    """Generate Code 128 barcode as PIL Image"""
    code128 = barcode.get_barcode_class('code128')
    barcode_instance = code128(data, writer=ImageWriter())
    
    # Generate barcode to bytes
    buffer = io.BytesIO()
    barcode_instance.write(buffer, options={'write_text': False, 'module_height': height / 10})
    buffer.seek(0)
    
    return Image.open(buffer)


def generate_canada_post_label(data):
    """Generate Canada Post label"""
    service = data.get('service', 'Regular Parcel')
    template_file = TEMPLATES['canada_post'].get(service, 'canada_3_master.png')
    template_path = os.path.join(RESOURCES_DIR, template_file)
    
    # Load template
    blank_label = Image.open(template_path)
    
    # Load fonts
    helvetica = os.path.join(FONTS_DIR, 'Helvetica.ttf')
    helvetica_bold = os.path.join(FONTS_DIR, 'HelveticaBold.ttf')
    
    return_address_font = ImageFont.truetype(helvetica, 14)
    tracking_label_font = ImageFont.truetype(helvetica_bold, 18)
    ship_to_font = ImageFont.truetype(helvetica, 19)
    big_postal_font = ImageFont.truetype(helvetica_bold, 58)
    
    # Get data
    ship_to_name = data.get('shipToName', '').upper()
    ship_to_address = data.get('shipToAddress', '').upper()
    ship_to_city = data.get('shipToCity', '').upper()
    ship_to_province = data.get('shipToProvince', '').upper()
    ship_to_postal = data.get('shipToPostal', '').upper()
    tracking_number = data.get('trackingNumber', '').upper()
    
    # Return address (fake or custom)
    return_name = data.get('returnName', 'SENDER NAME')
    return_address = data.get('returnAddress', '123 MAIN ST')
    return_city_state_zip = data.get('returnCityStateZip', 'CITY, PROV A1A 1A1')
    
    # Format tracking number
    modified_tracking = f"{tracking_number[7:11]} {tracking_number[11:15]} {tracking_number[15:19]} {tracking_number[19:23]}"
    
    # Create drawing context
    draw = ImageDraw.Draw(blank_label)
    
    # Draw return address
    draw.text((75, 800), return_name, (0, 0, 0), font=return_address_font)
    draw.text((75, 815), return_address, (0, 0, 0), font=return_address_font)
    draw.text((75, 830), return_city_state_zip, (0, 0, 0), font=return_address_font)
    draw.text((240, 895), f'PIN / NIP:  {modified_tracking}', (0, 0, 0), font=return_address_font)
    
    # Draw ship to address
    ship_to_city_state_zip = f"{ship_to_city} {ship_to_province} {ship_to_postal}"
    draw.text((72, 273), ship_to_name, (0, 0, 0), font=ship_to_font)
    draw.text((72, 293), ship_to_address, (0, 0, 0), font=ship_to_font)
    draw.text((72, 313), ship_to_city_state_zip, (0, 0, 0), font=ship_to_font)
    
    # Draw large postal code
    draw.text((75, 453), ship_to_postal, (0, 0, 0), font=big_postal_font)
    
    # Draw tracking number
    draw.text((295, 700), modified_tracking, (0, 0, 0), font=tracking_label_font)
    
    # Generate and paste barcode
    barcode_img = generate_code128_barcode(tracking_number, height=160)
    barcode_resized = barcode_img.resize((625, 130))
    blank_label.paste(barcode_resized, (63, 560))
    
    return blank_label


def generate_purolator_label(data):
    """Generate Purolator label"""
    service = data.get('service', 'Purolator Ground')
    template_file = TEMPLATES['purolator'].get(service, 'purolator_master.png')
    template_path = os.path.join(RESOURCES_DIR, template_file)
    
    # Load template
    blank_label = Image.open(template_path)
    
    # Load fonts
    helvetica = os.path.join(FONTS_DIR, 'Helvetica.ttf')
    helvetica_bold = os.path.join(FONTS_DIR, 'HelveticaBold.ttf')
    
    return_address_font = ImageFont.truetype(helvetica, 14)
    ship_to_font = ImageFont.truetype(helvetica, 20)
    ship_to_font_2 = ImageFont.truetype(helvetica_bold, 24)
    ship_to_font_3 = ImageFont.truetype(helvetica_bold, 32)
    big_postal_font = ImageFont.truetype(helvetica_bold, 46)
    sorting_font = ImageFont.truetype(helvetica_bold, 95)
    
    # Get data
    ship_to_name = data.get('shipToName', '').title()
    ship_to_address = data.get('shipToAddress', '').title()
    ship_to_city = data.get('shipToCity', '').title()
    ship_to_province = data.get('shipToProvince', '').upper()
    ship_to_postal = data.get('shipToPostal', '').upper()
    tracking_number = data.get('trackingNumber', '').upper()
    sorting_code = data.get('sortingCode', '55')
    weight = data.get('weight', '1')
    
    # Return address
    return_name = data.get('returnName', 'SENDER NAME')
    return_address = data.get('returnAddress', '123 MAIN ST')
    return_city_state_zip = data.get('returnCityStateZip', 'CITY, PROV A1A 1A1')
    
    # Format tracking number
    modified_tracking = tracking_number[11:18] + tracking_number[20:23] + tracking_number[18:20]
    
    # Create drawing context
    draw = ImageDraw.Draw(blank_label)
    
    # Draw return address
    draw.text((28, 80), return_name, (0, 0, 0), font=return_address_font)
    draw.text((28, 97), return_address, (0, 0, 0), font=return_address_font)
    draw.text((28, 114), return_city_state_zip, (0, 0, 0), font=return_address_font)
    draw.text((28, 130), f"{random.randint(100, 900)}-{random.randint(100, 900)}-{random.randint(1000, 9999)}", (0, 0, 0), font=return_address_font)
    draw.text((28, 157), f"REF: {random.randint(1000000000, 8999999999)}", (0, 0, 0), font=return_address_font)
    
    # Draw ship to address
    ship_to_city_state = f"{ship_to_city} {ship_to_province}"
    draw.text((263, 80), ship_to_name, (0, 0, 0), font=ship_to_font)
    draw.text((263, 103), ship_to_address, (0, 0, 0), font=ship_to_font)
    draw.text((263, 128), ship_to_city_state, (0, 0, 0), font=ship_to_font_2)
    draw.text((263, 154), ship_to_postal, (0, 0, 0), font=ship_to_font_2)
    
    # Draw phone number
    draw.text((580, 285), f"{random.randint(100, 900)}-{random.randint(100, 900)}-{random.randint(1000, 9999)}", (0, 0, 0), font=ship_to_font)
    
    # Draw sorting code
    draw.text((600, 580), sorting_code, (0, 0, 0), font=sorting_font)
    
    # Draw date and weight
    today = datetime.today().strftime('%d %b %Y').upper()
    draw.text((32, 608), today, (0, 0, 0), font=return_address_font)
    draw.text((150, 619), f"{weight} LB", (0, 0, 0), font=big_postal_font)
    
    # Draw tracking number
    draw.text((397, 1005), modified_tracking, (0, 0, 0), font=ship_to_font_3)
    
    # Generate and paste barcode
    barcode_img = generate_code128_barcode(tracking_number, height=160)
    barcode_resized = barcode_img.resize((640, 180))
    blank_label.paste(barcode_resized, (43, 819))
    
    return blank_label


def generate_ups_label(data):
    """Generate UPS label"""
    service = data.get('service', 'UPS Ground')
    template_file = TEMPLATES['ups'].get(service, 'ups_ground.png')
    template_path = os.path.join(RESOURCES_DIR, template_file)
    
    # Load template
    blank_label = Image.open(template_path)
    
    # Load fonts
    helvetica = os.path.join(FONTS_DIR, 'Helvetica.ttf')
    helvetica_bold = os.path.join(FONTS_DIR, 'HelveticaBold.ttf')
    arial_narrow = os.path.join(FONTS_DIR, 'Arial Narrow.ttf')
    
    return_address_font = ImageFont.truetype(helvetica, 13)
    ship_to_font = ImageFont.truetype(helvetica, 22)
    ship_to_font_bold = ImageFont.truetype(helvetica_bold, 24)
    tracking_font = ImageFont.truetype(helvetica_bold, 20)
    zip_font = ImageFont.truetype(helvetica_bold, 72)
    zone_font = ImageFont.truetype(helvetica_bold, 120)
    
    # Get data
    ship_to_name = data.get('shipToName', '').upper()
    ship_to_address = data.get('shipToAddress', '').upper()
    ship_to_address2 = data.get('shipToAddress2', '').upper()
    ship_to_city = data.get('shipToCity', '').upper()
    ship_to_state = data.get('shipToState', '').upper()
    ship_to_zip = data.get('shipToZip', '').upper()
    tracking_number = data.get('trackingNumber', '').upper()
    weight = data.get('weight', '1')
    ups_zone = data.get('upsZone', '959')
    sorting_code = data.get('sortingCode', '')
    
    # Return address
    return_name = data.get('returnName', 'SENDER NAME')
    return_address = data.get('returnAddress', '123 MAIN ST')
    return_city_state_zip = data.get('returnCityStateZip', 'CITY, ST 12345')
    
    # Create drawing context
    draw = ImageDraw.Draw(blank_label)
    
    # Draw return address (top left)
    draw.text((30, 45), return_name, (0, 0, 0), font=return_address_font)
    draw.text((30, 60), return_address, (0, 0, 0), font=return_address_font)
    draw.text((30, 75), return_city_state_zip, (0, 0, 0), font=return_address_font)
    
    # Draw ship to address
    draw.text((30, 280), ship_to_name, (0, 0, 0), font=ship_to_font_bold)
    draw.text((30, 310), ship_to_address, (0, 0, 0), font=ship_to_font)
    if ship_to_address2:
        draw.text((30, 335), ship_to_address2, (0, 0, 0), font=ship_to_font)
        draw.text((30, 360), f"{ship_to_city}, {ship_to_state} {ship_to_zip}", (0, 0, 0), font=ship_to_font)
    else:
        draw.text((30, 335), f"{ship_to_city}, {ship_to_state} {ship_to_zip}", (0, 0, 0), font=ship_to_font)
    
    # Draw large ZIP code
    draw.text((50, 480), ship_to_zip[:5], (0, 0, 0), font=zip_font)
    
    # Draw zone code (top right)
    draw.text((580, 120), ups_zone, (0, 0, 0), font=zone_font)
    
    # Draw weight
    draw.text((600, 380), f"{weight} LB", (0, 0, 0), font=ship_to_font_bold)
    
    # Draw tracking number
    formatted_tracking = f"1Z {tracking_number[2:5]} {tracking_number[5:9]} {tracking_number[9:13]} {tracking_number[13:17]} {tracking_number[17:]}"
    draw.text((30, 750), formatted_tracking, (0, 0, 0), font=tracking_font)
    
    # Generate and paste barcode
    barcode_img = generate_code128_barcode(tracking_number, height=160)
    barcode_resized = barcode_img.resize((680, 140))
    blank_label.paste(barcode_resized, (30, 600))
    
    return blank_label


def generate_fedex_label(data):
    """Generate FedEx label"""
    service = data.get('service', 'FedEx Ground')
    template_file = TEMPLATES['fedex'].get(service, 'master_fedex.png')
    template_path = os.path.join(RESOURCES_DIR, template_file)
    
    # Load template
    blank_label = Image.open(template_path)
    
    # Load fonts
    helvetica = os.path.join(FONTS_DIR, 'Helvetica.ttf')
    helvetica_bold = os.path.join(FONTS_DIR, 'HelveticaBold.ttf')
    
    return_address_font = ImageFont.truetype(helvetica, 13)
    ship_to_font = ImageFont.truetype(helvetica, 20)
    ship_to_font_bold = ImageFont.truetype(helvetica_bold, 22)
    tracking_font = ImageFont.truetype(helvetica_bold, 18)
    zip_font = ImageFont.truetype(helvetica_bold, 68)
    
    # Get data
    ship_to_name = data.get('shipToName', '').upper()
    ship_to_address = data.get('shipToAddress', '').upper()
    ship_to_address2 = data.get('shipToAddress2', '').upper()
    ship_to_city = data.get('shipToCity', '').upper()
    ship_to_state = data.get('shipToState', '').upper()
    ship_to_zip = data.get('shipToZip', '').upper()
    tracking_number = data.get('trackingNumber', '').upper()
    weight = data.get('weight', '1')
    
    # Return address
    return_name = data.get('returnName', 'SENDER NAME')
    return_address = data.get('returnAddress', '123 MAIN ST')
    return_city_state_zip = data.get('returnCityStateZip', 'CITY, ST 12345')
    
    # Create drawing context
    draw = ImageDraw.Draw(blank_label)
    
    # Draw return address
    draw.text((35, 50), return_name, (0, 0, 0), font=return_address_font)
    draw.text((35, 65), return_address, (0, 0, 0), font=return_address_font)
    draw.text((35, 80), return_city_state_zip, (0, 0, 0), font=return_address_font)
    
    # Draw ship to address
    draw.text((35, 300), ship_to_name, (0, 0, 0), font=ship_to_font_bold)
    draw.text((35, 325), ship_to_address, (0, 0, 0), font=ship_to_font)
    if ship_to_address2:
        draw.text((35, 350), ship_to_address2, (0, 0, 0), font=ship_to_font)
        draw.text((35, 375), f"{ship_to_city}, {ship_to_state} {ship_to_zip}", (0, 0, 0), font=ship_to_font)
    else:
        draw.text((35, 350), f"{ship_to_city}, {ship_to_state} {ship_to_zip}", (0, 0, 0), font=ship_to_font)
    
    # Draw large ZIP code
    draw.text((50, 500), ship_to_zip[:5], (0, 0, 0), font=zip_font)
    
    # Draw weight
    draw.text((600, 400), f"{weight} LB", (0, 0, 0), font=ship_to_font_bold)
    
    # Draw tracking number
    formatted_tracking = f"{tracking_number[:4]} {tracking_number[4:8]} {tracking_number[8:]}"
    draw.text((35, 780), formatted_tracking, (0, 0, 0), font=tracking_font)
    
    # Generate and paste barcode
    barcode_img = generate_code128_barcode(tracking_number, height=160)
    barcode_resized = barcode_img.resize((680, 140))
    blank_label.paste(barcode_resized, (30, 630))
    
    return blank_label


def generate_usps_label(data):
    """Generate USPS label"""
    service = data.get('service', 'Priority Mail')
    template_file = TEMPLATES['usps'].get(service, 'priority_master.png')
    template_path = os.path.join(RESOURCES_DIR, template_file)
    
    # Load template
    blank_label = Image.open(template_path)
    
    # Load fonts
    helvetica = os.path.join(FONTS_DIR, 'Helvetica.ttf')
    helvetica_bold = os.path.join(FONTS_DIR, 'HelveticaBold.ttf')
    
    return_address_font = ImageFont.truetype(helvetica, 14)
    ship_to_font = ImageFont.truetype(helvetica, 20)
    ship_to_font_bold = ImageFont.truetype(helvetica_bold, 22)
    tracking_font = ImageFont.truetype(helvetica_bold, 16)
    zip_font = ImageFont.truetype(helvetica_bold, 64)
    
    # Get data
    ship_to_name = data.get('shipToName', '').upper()
    ship_to_address = data.get('shipToAddress', '').upper()
    ship_to_address2 = data.get('shipToAddress2', '').upper()
    ship_to_city = data.get('shipToCity', '').upper()
    ship_to_state = data.get('shipToState', '').upper()
    ship_to_zip = data.get('shipToZip', '').upper()
    tracking_number = data.get('trackingNumber', '').upper()
    weight = data.get('weight', '1')
    
    # Return address
    return_name = data.get('returnName', 'SENDER NAME')
    return_address = data.get('returnAddress', '123 MAIN ST')
    return_city_state_zip = data.get('returnCityStateZip', 'CITY, ST 12345')
    
    # Create drawing context
    draw = ImageDraw.Draw(blank_label)
    
    # Draw return address
    draw.text((40, 60), return_name, (0, 0, 0), font=return_address_font)
    draw.text((40, 78), return_address, (0, 0, 0), font=return_address_font)
    draw.text((40, 96), return_city_state_zip, (0, 0, 0), font=return_address_font)
    
    # Draw ship to address
    draw.text((40, 320), ship_to_name, (0, 0, 0), font=ship_to_font_bold)
    draw.text((40, 348), ship_to_address, (0, 0, 0), font=ship_to_font)
    if ship_to_address2:
        draw.text((40, 376), ship_to_address2, (0, 0, 0), font=ship_to_font)
        draw.text((40, 404), f"{ship_to_city}, {ship_to_state} {ship_to_zip}", (0, 0, 0), font=ship_to_font)
    else:
        draw.text((40, 376), f"{ship_to_city}, {ship_to_state} {ship_to_zip}", (0, 0, 0), font=ship_to_font)
    
    # Draw large ZIP code
    draw.text((60, 530), ship_to_zip[:5], (0, 0, 0), font=zip_font)
    
    # Draw weight
    draw.text((600, 420), f"{weight} LB", (0, 0, 0), font=ship_to_font_bold)
    
    # Draw tracking number
    formatted_tracking = f"{tracking_number[:4]} {tracking_number[4:8]} {tracking_number[8:12]} {tracking_number[12:16]} {tracking_number[16:]}"
    draw.text((40, 820), formatted_tracking, (0, 0, 0), font=tracking_font)
    
    # Generate and paste barcode
    barcode_img = generate_code128_barcode(tracking_number, height=160)
    barcode_resized = barcode_img.resize((680, 140))
    blank_label.paste(barcode_resized, (30, 670))
    
    return blank_label


@app.route('/api/generate-label', methods=['POST'])
def generate_label():
    """Main endpoint to generate labels"""
    try:
        data = request.json
        carrier = data.get('carrier', '').lower().replace(' ', '_')
        
        if carrier == 'canada_post':
            label_image = generate_canada_post_label(data)
        elif carrier == 'purolator':
            label_image = generate_purolator_label(data)
        elif carrier == 'ups':
            label_image = generate_ups_label(data)
        elif carrier == 'fedex':
            label_image = generate_fedex_label(data)
        elif carrier == 'usps':
            label_image = generate_usps_label(data)
        else:
            return jsonify({'error': f'Carrier {carrier} not yet implemented'}), 400
        
        # Save to bytes
        img_io = io.BytesIO()
        label_image.save(img_io, 'PNG')
        img_io.seek(0)
        
        # Return image
        return send_file(img_io, mimetype='image/png', as_attachment=True, download_name=f'label_{data.get("trackingNumber", "output")}.png')
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'ok'})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)


def extract_tracking_number(text):
    """Extract tracking number from OCR text"""
    # UPS tracking: 1Z followed by 16 characters
    ups_pattern = r'1Z[A-Z0-9]{16}'
    # FedEx tracking: 12-14 digits
    fedex_pattern = r'\b\d{12,14}\b'
    # USPS tracking: 20-22 digits
    usps_pattern = r'\b\d{20,22}\b'
    # Canada Post: 16 digits
    canada_pattern = r'\b\d{16}\b'
    
    patterns = [
        (ups_pattern, 'UPS'),
        (usps_pattern, 'USPS'),
        (fedex_pattern, 'FedEx'),
        (canada_pattern, 'Canada Post'),
    ]
    
    for pattern, carrier in patterns:
        match = re.search(pattern, text)
        if match:
            return match.group(0), carrier
    
    return None, None


def extract_zip_code(text):
    """Extract ZIP/postal code from text"""
    # US ZIP: 5 digits or 5+4
    us_zip = r'\b\d{5}(?:-\d{4})?\b'
    # Canadian postal: A1A 1A1
    ca_postal = r'\b[A-Z]\d[A-Z]\s?\d[A-Z]\d\b'
    
    # Try Canadian first (more specific)
    match = re.search(ca_postal, text, re.IGNORECASE)
    if match:
        return match.group(0).upper()
    
    # Try US ZIP
    match = re.search(us_zip, text)
    if match:
        return match.group(0)
    
    return None


def extract_address_info(text):
    """Extract address information from OCR text"""
    lines = text.split('\n')
    
    # Look for common address patterns
    address_data = {
        'name': None,
        'address': None,
        'city': None,
        'state': None,
        'zip': None,
    }
    
    # Extract ZIP code first
    zip_code = extract_zip_code(text)
    if zip_code:
        address_data['zip'] = zip_code
        
        # Find the line with ZIP code
        for i, line in enumerate(lines):
            if zip_code in line:
                # City and state are usually on the same line or line before
                city_state_line = line.replace(zip_code, '').strip()
                if city_state_line:
                    parts = city_state_line.split(',')
                    if len(parts) >= 2:
                        address_data['city'] = parts[0].strip()
                        address_data['state'] = parts[1].strip().split()[0]
                    elif len(parts) == 1:
                        # Might be "CITY STATE" format
                        words = parts[0].strip().split()
                        if len(words) >= 2:
                            address_data['state'] = words[-1]
                            address_data['city'] = ' '.join(words[:-1])
                
                # Address is usually 1-2 lines before city/state/zip
                if i > 0:
                    address_data['address'] = lines[i-1].strip()
                if i > 1 and not address_data['name']:
                    address_data['name'] = lines[i-2].strip()
                break
    
    return address_data


@app.route('/api/process-label', methods=['POST'])
def process_label():
    """Process uploaded label image and extract data using OCR"""
    try:
        if not OCR_AVAILABLE:
            return jsonify({
                'error': 'OCR not available',
                'message': 'Install pytesseract and Tesseract OCR to enable label processing',
                'instructions': [
                    'pip install pytesseract',
                    'Install Tesseract: https://github.com/tesseract-ocr/tesseract',
                ]
            }), 503
        
        # Get uploaded file
        if 'label' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['label']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Read image
        image = Image.open(file.stream)
        
        # Perform OCR
        text = pytesseract.image_to_string(image)
        
        # Extract tracking number and carrier
        tracking_number, carrier = extract_tracking_number(text)
        
        # Extract address information
        address_info = extract_address_info(text)
        
        # Extract weight (look for patterns like "70 LB" or "70LBS")
        weight_match = re.search(r'(\d+\.?\d*)\s*LBS?', text, re.IGNORECASE)
        weight = weight_match.group(1) if weight_match else None
        
        # Return extracted data
        return jsonify({
            'success': True,
            'carrier': carrier,
            'service': None,  # Service type is harder to extract reliably
            'trackingNumber': tracking_number,
            'shipToName': address_info.get('name'),
            'shipToAddress': address_info.get('address'),
            'shipToAddress2': None,
            'shipToCity': address_info.get('city'),
            'shipToState': address_info.get('state'),
            'shipToZip': address_info.get('zip'),
            'weight': weight,
            'phone': None,  # Phone extraction can be added if needed
            'extractedText': text,  # Include full text for debugging
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


