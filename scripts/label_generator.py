"""
Label Generator API
Replicates the desktop application's label generation logic for web use.
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

app = Flask(__name__)
CORS(app)

# Base paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
RESOURCES_DIR = os.path.join(BASE_DIR, '..', 'public', 'label-templates')
FONTS_DIR = os.path.join(RESOURCES_DIR, 'fonts')

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
