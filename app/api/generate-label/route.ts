import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route: Generate Label
 * 
 * This endpoint receives label data from the frontend and forwards it to the Python
 * label generation service, then returns the generated label image.
 * 
 * For now, this is a placeholder that validates the request.
 * You'll need to either:
 * 1. Run the Python Flask service (scripts/label_generator.py) and proxy to it
 * 2. Implement label generation in Node.js using canvas and bwip-js
 */

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validate required fields
    const requiredFields = ['carrier', 'service', 'trackingNumber', 'shipToName', 'shipToAddress', 'shipToCity'];
    const missingFields = requiredFields.filter(field => !data[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Proxy to Python Flask service
    const pythonServiceUrl = process.env.LABEL_GENERATOR_URL || 'http://localhost:5000';
    const response = await fetch(`${pythonServiceUrl}/api/generate-label`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json({ error: error.message || 'Label generation failed' }, { status: 500 });
    }

    // Get the image blob
    const imageBlob = await response.blob();

    // Return the image
    return new NextResponse(imageBlob, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="label_${data.trackingNumber}.png"`,
      },
    });

  } catch (error) {
    console.error('Label generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
