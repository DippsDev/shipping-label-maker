export const maxDuration = 60; // safety net if plan is ever upgraded

import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// ---------------------------------------------------------------------------
// Carrier / service detection
// ---------------------------------------------------------------------------

const CARRIER_PATTERNS: { carrier: string; pattern: RegExp }[] = [
    { carrier: 'UPS', pattern: /\b1Z[A-Z0-9]{16}\b/ },
    { carrier: 'FedEx', pattern: /\b\d{12,22}\b/ },
    { carrier: 'USPS', pattern: /\b9[24][0-9]{20}\b/ },
    { carrier: 'Purolator', pattern: /\bPUR[A-Z0-9]{9,}\b/i },
    { carrier: 'Canada Post', pattern: /\b[A-Z]{2}\d{9}CA\b/ },
];

const UPS_SERVICE_PATTERNS: { service: string; pattern: RegExp }[] = [
    { service: 'UPS Next Day Air', pattern: /next\s*day\s*air/i },
    { service: 'UPS 2nd Day Air', pattern: /2nd\s*day\s*air/i },
    { service: 'UPS 3 Day Select', pattern: /3\s*day\s*select/i },
    { service: 'UPS Ground Return Service', pattern: /ground\s*return/i },
    { service: 'UPS Ground', pattern: /ups\s*ground|ground\s*service/i },
];

const FEDEX_SERVICE_PATTERNS: { service: string; pattern: RegExp }[] = [
    { service: 'FedEx Priority Overnight', pattern: /priority\s*overnight/i },
    { service: 'FedEx Standard Overnight', pattern: /standard\s*overnight/i },
    { service: 'FedEx 2Day', pattern: /fedex\s*2\s*day|2day/i },
    { service: 'FedEx Express Saver', pattern: /express\s*saver/i },
    { service: 'Smart Post', pattern: /smart\s*post/i },
    { service: 'Ground Return Service', pattern: /ground\s*return/i },
    { service: 'FedEx Home Delivery', pattern: /home\s*delivery/i },
    { service: 'FedEx Ground', pattern: /fedex\s*ground/i },
];

const USPS_SERVICE_PATTERNS: { service: string; pattern: RegExp }[] = [
    { service: 'Priority Mail Express', pattern: /priority\s*mail\s*express/i },
    { service: 'Priority Mail Return', pattern: /priority\s*mail\s*return/i },
    { service: 'Priority Mail', pattern: /priority\s*mail/i },
    { service: 'First Class Package Return', pattern: /first\s*class.*return/i },
    { service: 'First Class Package', pattern: /first\s*class/i },
    { service: 'Ground Advantage', pattern: /ground\s*advantage/i },
    { service: 'Parcel Select', pattern: /parcel\s*select/i },
    { service: 'UPS Mail Innovations', pattern: /mail\s*innov/i },
    { service: 'Smart Label / Pitney Bowes', pattern: /pitney|smart\s*label/i },
];

function detectCarrier(text: string): string {
    if (/\bUPS\b/.test(text)) return 'UPS';
    if (/\bFedEx\b|\bFEDEX\b/.test(text)) return 'FedEx';
    if (/\bUSPS\b|United States Postal/i.test(text)) return 'USPS';
    if (/\bPurolator\b/i.test(text)) return 'Purolator';
    if (/\bCanada Post\b|Postes Canada/i.test(text)) return 'Canada Post';

    for (const { carrier, pattern } of CARRIER_PATTERNS) {
        if (pattern.test(text)) return carrier;
    }
    return '';
}

function detectService(text: string, carrier: string): string {
    const serviceMap: Record<string, { service: string; pattern: RegExp }[]> = {
        'UPS': UPS_SERVICE_PATTERNS,
        'FedEx': FEDEX_SERVICE_PATTERNS,
        'USPS': USPS_SERVICE_PATTERNS,
    };
    const patterns = serviceMap[carrier];
    if (!patterns) return '';
    for (const { service, pattern } of patterns) {
        if (pattern.test(text)) return service;
    }
    return '';
}

function extractTrackingNumber(text: string, carrier: string): string {
    const patterns: Record<string, RegExp> = {
        'UPS': /\b(1Z[A-Z0-9]{16})\b/,
        'FedEx': /\b(\d{12}|\d{15}|\d{20}|\d{22})\b/,
        'USPS': /\b(9[24][0-9]{20})\b/,
        'Purolator': /\b(PUR[A-Z0-9]{9,})\b/i,
        'Canada Post': /\b([A-Z]{2}\d{9}CA)\b/,
    };
    const pattern = patterns[carrier];
    if (!pattern) return '';
    const match = text.match(pattern);
    return match ? match[1] : '';
}

// ---------------------------------------------------------------------------
// GS1 barcode parsing
// ---------------------------------------------------------------------------

function parseGS1(data: string): Record<string, string> {
    const result: Record<string, string> = {};
    const parenPattern = /\((\d{2,4})\)([^(]*)/g;
    let m: RegExpExecArray | null;
    while ((m = parenPattern.exec(data)) !== null) {
        result[m[1]] = m[2].trim();
    }
    if (Object.keys(result).length > 0) return result;

    const raw420 = data.match(/^420(\d{5})/);
    if (raw420) result['420'] = raw420[1];
    return result;
}

// USPS tracking prefix → service name (first 4 digits of the full 22-digit IMpb number)
const USPS_TRACKING_SERVICE: Record<string, string> = {
    '9400': 'Ground Advantage', '9410': 'Ground Advantage',
    '9420': 'Ground Advantage', '9430': 'Ground Advantage',
    '9434': 'Ground Advantage', '9440': 'Ground Advantage',
    '9205': 'Priority Mail',   '9202': 'Priority Mail',
    '9208': 'Priority Mail',   '9210': 'Priority Mail',
    '9300': 'Priority Mail Express', '9308': 'Priority Mail Express',
    '9261': 'Ground Advantage', '9274': 'Priority Mail',
};

function inferUSPSService(fullTracking: string): string {
    return USPS_TRACKING_SERVICE[fullTracking.slice(0, 4)] ?? '';
}

function extractFromBarcodes(barcodes: { format: string; data: string }[]): {
    zip: string;
    trackingNumber: string;
    carrierHint: string;
    serviceHint: string;
} {
    let zip = '';
    let trackingNumber = '';
    let carrierHint = '';
    let serviceHint = '';

    for (const { data } of barcodes) {
        const gs1 = parseGS1(data);

        if (!zip && gs1['420']) zip = gs1['420'].slice(0, 5);

        if (!trackingNumber && gs1['94']) {
            const ai94 = gs1['94'].replace(/\s/g, '');
            // USPS IMpb: AI 420 (destination ZIP) co-present with AI 94 → USPS label.
            // Reconstruct the full 22-digit tracking number by restoring the "94" prefix.
            if (gs1['420']) {
                carrierHint = 'USPS';
                const fullTracking = '94' + ai94;
                trackingNumber = fullTracking;
                serviceHint = inferUSPSService(fullTracking);
            } else {
                trackingNumber = ai94;
            }
        }
    }
    return { zip, trackingNumber, carrierHint, serviceHint };
}

// ---------------------------------------------------------------------------
// Barcode scanning regions (fractions of image dimensions)
// ---------------------------------------------------------------------------

const SCAN_REGIONS = [
    { name: 'top-right', left: 0.55, top: 0, width: 0.45, height: 0.22 },
    { name: 'ship-to-qr', left: 0, top: 0.35, width: 0.35, height: 0.25 },
    { name: 'bottom-right', left: 0.65, top: 0.78, width: 0.35, height: 0.22 },
    { name: 'full', left: 0, top: 0, width: 1, height: 1 },
];

async function decodeQRCodes(buffer: Buffer): Promise<{ name: string; format: string; data: string }[]> {
    const results: { name: string; format: string; data: string }[] = [];

    try {
        const metadata = await sharp(buffer).metadata();
        const originalWidth = metadata.width ?? 800;
        const originalHeight = metadata.height ?? 1000;

        const { readBarcodes } = await import('zxing-wasm/reader');

        for (const region of SCAN_REGIONS) {
            const regionLeft = Math.round(region.left * originalWidth);
            const regionTop = Math.round(region.top * originalHeight);
            const regionWidth = Math.round(region.width * originalWidth);
            const regionHeight = Math.round(region.height * originalHeight);

            for (const scale of [2, 3, 4]) {
                try {
                    const regionPng = await sharp(buffer)
                        .extract({ left: regionLeft, top: regionTop, width: regionWidth, height: regionHeight })
                        .resize(Math.round(regionWidth * scale), Math.round(regionHeight * scale), { fit: 'fill' })
                        .greyscale()
                        .png()
                        .toBuffer();

                    const decoded = await readBarcodes(regionPng, {
                        tryHarder: true,
                        formats: [],
                    });

                    for (const code of decoded) {
                        if (code.text && !results.find(r => r.data === code.text)) {
                            results.push({ name: region.name, format: code.format, data: code.text });
                        }
                    }

                    if (decoded.length > 0) break;
                } catch {
                    // try next scale
                }
            }
        }
    } catch (err) {
        console.warn('Barcode decoding failed:', err);
    }

    return results;
}

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('label') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }
        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // Scan barcodes — fast (1-4 s), works within any Vercel plan timeout
        const qrResults = await decodeQRCodes(buffer);

        // Build a combined text blob from all decoded barcode data
        const barcodeText = qrResults.map(r => r.data).join('\n');

        const gs1Data = extractFromBarcodes(qrResults);

        // GS1 hints are the most reliable source (carrier/service inferred from barcode structure)
        const carrier = gs1Data.carrierHint || detectCarrier(barcodeText);
        const trackingNumber = gs1Data.trackingNumber || extractTrackingNumber(barcodeText, carrier);
        const service = gs1Data.serviceHint || detectService(barcodeText, carrier);
        const zip = gs1Data.zip;

        const result: Record<string, string> = {};
        if (carrier) result.carrier = carrier;
        if (service) result.service = service;
        if (trackingNumber) result.trackingNumber = trackingNumber;
        if (zip) result.shipToZip = zip;

        // Save scan log — /tmp is the only writable dir on Vercel serverless
        try {
            const logsDir = process.env.VERCEL
                ? path.join('/tmp', 'scan-logs')
                : path.join(process.cwd(), 'scan-logs');
            if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            fs.writeFileSync(
                path.join(logsDir, `scan-${timestamp}.json`),
                JSON.stringify({
                    timestamp: new Date().toISOString(),
                    fileName: file.name,
                    fileSize: file.size,
                    qrCodesFound: qrResults.length,
                    barcodes: qrResults,
                    gs1Extracted: gs1Data,
                    extracted: result,
                }, null, 2)
            );
        } catch {
            // logging failure must never break the response
        }

        return NextResponse.json(result);

    } catch (error) {
        console.error('Label scan error:', error);
        return NextResponse.json({ error: 'Scan failed' }, { status: 500 });
    }
}
