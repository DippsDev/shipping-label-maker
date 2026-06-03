import { NextRequest, NextResponse } from 'next/server';
import { generateLabelBuffer } from '@/lib/label-generator';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const requiredFields = ['carrier', 'service', 'trackingNumber', 'shipToName', 'shipToAddress', 'shipToCity'];
    const missingFields = requiredFields.filter(field => !data[field]);
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    const preview = data.preview === true;
    const pngBuffer = await generateLabelBuffer(data, preview);

    return new NextResponse(new Uint8Array(pngBuffer), {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `inline; filename="label_${data.trackingNumber}.png"`,
      },
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('Label generation error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
