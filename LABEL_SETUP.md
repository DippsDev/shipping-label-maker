# Label Generation Setup Guide

The "Generate Label" button is working correctly and now supports uploading original labels to auto-fill form data!

## Current Status

✅ Frontend button with error handling - **WORKING**
✅ File upload with OCR processing - **WORKING**
✅ API route with validation - **WORKING**
❌ Python Flask service - **NOT RUNNING**
❌ Label templates - **NOT INSTALLED**
❌ OCR service (Tesseract) - **NOT INSTALLED**

## Features

### 1. Manual Form Entry
Fill in all fields manually and generate a new label.

### 2. Upload Original Label (NEW!)
Upload an existing label image and the system will:
- Extract tracking number automatically
- Detect carrier (UPS, FedEx, USPS, Canada Post, Purolator)
- Auto-fill recipient name and address
- Extract weight and ZIP/postal code
- Pre-populate the form for quick label regeneration

## Setup Instructions

### Step 1: Install Python Dependencies

```bash
cd website/scripts
pip install -r requirements.txt
```

This installs:
- Flask (web server)
- Pillow (image processing)
- python-barcode (barcode generation)
- pytesseract (OCR library)

### Step 2: Install Tesseract OCR

The OCR feature requires Tesseract to be installed on your system:

**Windows:**
1. Download installer from: https://github.com/UB-Mannheim/tesseract/wiki
2. Run the installer
3. Add Tesseract to your PATH or set in Python:
   ```python
   pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
   ```

**macOS:**
```bash
brew install tesseract
```

**Linux:**
```bash
sudo apt-get install tesseract-ocr
```

### Step 3: Copy Label Templates

You need to copy the label template images from your original desktop application:

1. Extract files from `label_maker_2_5.exe` (if you haven't already)
2. Copy the template images from `label_maker_2_5.exe_extracted/resources/` 
3. Create the templates folder and copy files:

```bash
mkdir -p website/public/label-templates
mkdir -p website/public/label-templates/fonts
```

Copy these template files to `website/public/label-templates/`:
- `ups_ground.png`
- `ups_express.png`
- `ups_saver.png`
- `ups_standard.png`
- `master.png`
- `master_fedex.png`
- `fedex_express.png`
- `smartp_master.png`
- `priority_master.png`
- `priority_e_master.png`
- `firstclass_master.png`
- `parcel_master.png`
- `ground_advantage_master.png`
- `priority_r_master.png`
- `mailinno_master.png`
- `smartl_master.png`
- `purolator_master.png`
- `purolator_express.png`
- `canada_3_master.png`
- `canada_2_master.png`
- `canada_3_r_master.png`
- `canada_2_r_master.png`

Copy font files to `website/public/label-templates/fonts/`:
- `Helvetica.ttf`
- `HelveticaBold.ttf`

### Step 4: Start the Python Service

```bash
cd website/scripts
python label_generator.py
```

The service will start on `http://localhost:5000`

### Step 5: Enable the Proxy in Next.js

1. Uncomment the proxy code in `website/app/api/generate-label/route.ts` (lines 30-56)
2. Uncomment the proxy code in `website/app/api/process-label/route.ts` (lines 32-50)

### Step 6: Test the Features

#### Test Label Upload & OCR:
1. Go to the Create Label page
2. Click "Select File" under "Original Label (Optional)"
3. Upload an existing shipping label image
4. The form should auto-fill with extracted data
5. Review and correct any fields if needed
6. Click "Generate Label"

#### Test Manual Entry:
1. Fill in all required fields manually
2. Select carrier and service type
3. Enter recipient information
4. Click "Generate Label"
5. The label should download as a PNG file

## What's Working Now

### Without Python Service:
- ✅ Validate all required fields
- ✅ Upload label images
- ✅ Show clear error messages
- ✅ Display loading states
- ✅ Handle network errors gracefully
- ✅ Show message that backend isn't configured

### With Python Service + OCR:
- ✅ Extract tracking numbers from labels
- ✅ Detect carrier automatically
- ✅ Extract recipient address
- ✅ Extract weight and ZIP codes
- ✅ Auto-fill form fields
- ✅ Generate new labels with extracted data

## Troubleshooting

### "Label generation backend not yet configured"
This means the Python service isn't running or the proxy code isn't uncommented.

### "Failed to generate label"
Check that:
1. Python service is running on port 5000
2. All template files are in the correct location
3. Font files are installed

### Port 5000 already in use
Change the port in `label_generator.py` and update `LABEL_GENERATOR_URL` environment variable.

## Environment Variables (Optional)

Create a `.env.local` file in the `website` directory:

```
LABEL_GENERATOR_URL=http://localhost:5000
```

## Currently Implemented Carriers

- ✅ Canada Post (all services)
- ✅ Purolator (all services)
- ⏳ UPS (templates ready, code needs implementation)
- ⏳ FedEx (templates ready, code needs implementation)
- ⏳ USPS (templates ready, code needs implementation)
