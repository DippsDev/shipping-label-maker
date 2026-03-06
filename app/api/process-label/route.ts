import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route: Process Label
 * 
 * This endpoint receives an uploaded label image and extracts data from it
 * using OCR (Optical Character Recognition) to auto-fill the form.
 * 
 * For now, this is a placeholder. You'll need to either:
 * 1. Integrate with an OCR service (Tesseract.js, Google Vision API, AWS Textract)
 * 2. Use the Python service with OCR capabilities
 */

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('label') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No file uploaded' },
                { status: 400 }
            );
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            return NextResponse.json(
                { error: 'File must be an image' },
                { status: 400 }
            );
        }

        // Option 1: Proxy to Python OCR service
        // Uncomment this when you have the Python OCR service running
        /*
        const pythonServiceUrl = process.env.LABEL_GENERATOR_URL || 'http://localhost:5000';
        
        const ocrFormData = new FormData();
        const buffer = await file.arrayBuffer();
        const blob = new Blob([buffer], { type: file.type });
        ocrFormData.append('label', blob, file.name);

        const response = await fetch(`${pythonServiceUrl}/api/process-label`, {
            method: 'POST',
            body: ocrFormData,
        });

        if (!response.ok) {
            const error = await response.json();
            return NextResponse.json({ error: error.message || 'OCR processing failed' }, { status: 500 });
        }

        const data = await response.json();
        return NextResponse.json(data);
        */

        // Option 2: For now, return a message indicating OCR is not configured
        return NextResponse.json({
            success: false,
            message: 'OCR service not yet configured',
            instructions: [
                '1. Install OCR dependencies (Tesseract, pytesseract, or use cloud OCR)',
                '2. Implement OCR endpoint in Python service (scripts/label_generator.py)',
                '3. Uncomment the proxy code in this file',
                '4. The service will extract: tracking number, addresses, carrier info, etc.',
            ],
            // Return empty data so form isn't auto-filled
            carrier: null,
            service: null,
            trackingNumber: null,
            shipToName: null,
            shipToAddress: null,
            shipToCity: null,
            shipToState: null,
            shipToZip: null,
        }, { status: 200 });

    } catch (error) {
        console.error('Label processing error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
