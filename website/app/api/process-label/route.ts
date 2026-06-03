import { NextRequest, NextResponse } from 'next/server';
import Tesseract from 'tesseract.js';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import EasyPost from '@easypost/api';

// Carrier detection patterns
const CARRIER_PATTERNS: { carrier: string; pattern: RegExp }[] = [
    { carrier: 'UPS', pattern: /\b1Z[A-Z0-9]{16}\b/ },
    { carrier: 'FedEx', pattern: /\b\d{12,22}\b/ },
    { carrier: 'USPS', pattern: /\b9[24][0-9]{20}\b/ },
    { carrier: 'Purolator', pattern: /\bPUR[A-Z0-9]{9,}\b/i },
    { carrier: 'Canada Post', pattern: /\b[A-Z]{2}\d{9}CA\b/ },
];

// UPS service keywords
const UPS_SERVICE_PATTERNS: { service: string; pattern: RegExp }[] = [
    { service: 'UPS Next Day Air', pattern: /next\s*day\s*air/i },
    { service: 'UPS 2nd Day Air', pattern: /2nd\s*day\s*air/i },
    { service: 'UPS 3 Day Select', pattern: /3\s*day\s*select/i },
    { service: 'UPS Ground Return Service', pattern: /ground\s*return/i },
    { service: 'UPS Ground', pattern: /ups\s*ground|ground\s*service/i },
];

// FedEx service keywords
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

// USPS service keywords
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
    // Check for explicit carrier name first
    if (/\bUPS\b/.test(text)) return 'UPS';
    if (/\bFedEx\b|\bFEDEX\b/.test(text)) return 'FedEx';
    if (/\bUSPS\b|United States Postal/i.test(text)) return 'USPS';
    if (/\bPurolator\b/i.test(text)) return 'Purolator';
    if (/\bCanada Post\b|Postes Canada/i.test(text)) return 'Canada Post';

    // Fall back to tracking number format
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

function extractAddress(text: string): {
    shipToName: string;
    shipToAddress: string;
    shipToAddress2: string;
    shipToCity: string;
    shipToState: string;
    shipToZip: string;
} {
    const lines = text
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 0);

    let shipToName = '';
    let shipToAddress = '';
    let shipToAddress2 = '';
    let shipToCity = '';
    let shipToState = '';
    let shipToZip = '';

    // Look for a "SHIP TO" or "DELIVER TO" section
    let addressStart = -1;
    for (let i = 0; i < lines.length; i++) {
        if (/ship\s*to|deliver\s*to|recipient/i.test(lines[i])) {
            addressStart = i + 1;
            break;
        }
    }

    // If no explicit section found, try to find address-like lines
    const addressLines = addressStart >= 0 ? lines.slice(addressStart, addressStart + 6) : lines;

    // US ZIP: 5 digits or ZIP+4
    const zipPattern = /\b(\d{5})(?:-\d{4})?\b/;
    // Canadian postal: A1A 1A1
    const caPostalPattern = /\b([A-Z]\d[A-Z]\s*\d[A-Z]\d)\b/i;
    // State abbreviation
    const statePattern = /\b([A-Z]{2})\b/;
    // Street address line: starts with a number
    const streetPattern = /^\d+\s+\w/;

    for (let i = 0; i < addressLines.length; i++) {
        const line = addressLines[i];

        // City, State ZIP line
        const cityStateZip = line.match(/^([A-Za-z\s.]+),?\s+([A-Z]{2})\s+(\d{5}(?:-\d{4})?)\s*$/);
        if (cityStateZip) {
            shipToCity = cityStateZip[1].trim();
            shipToState = cityStateZip[2];
            shipToZip = cityStateZip[3];
            continue;
        }

        // Canadian city, province postal
        const caLine = line.match(/^([A-Za-z\s.]+),?\s+([A-Z]{2})\s+([A-Z]\d[A-Z]\s*\d[A-Z]\d)\s*$/i);
        if (caLine) {
            shipToCity = caLine[1].trim();
            shipToState = caLine[2];
            shipToZip = caLine[3].toUpperCase();
            continue;
        }

        // Street address — must start with a number followed by a word,
        // but exclude tracking numbers (long digit-only sequences with spaces)
        const isTrackingNumber = /^[\d\s]{15,}$/.test(line);
        if (streetPattern.test(line) && !shipToAddress && !isTrackingNumber) {
            shipToAddress = line;
            continue;
        }

        // Second address line (apt, suite, etc.)
        if (shipToAddress && !shipToCity && /apt|ste|suite|unit|#/i.test(line)) {
            shipToAddress2 = line;
            continue;
        }

        // Name (first non-address, non-tracking line before street)
        if (!shipToName && !shipToAddress && line.length > 2 && !/^\d/.test(line) && !/tracking|barcode|usps|ups|fedex/i.test(line)) {
            shipToName = line;
        }
    }

    // Fallback: scan all lines for ZIP if not found yet
    if (!shipToZip) {
        for (const line of lines) {
            const zipMatch = line.match(zipPattern);
            if (zipMatch) { shipToZip = zipMatch[1]; break; }
            const caMatch = line.match(caPostalPattern);
            if (caMatch) { shipToZip = caMatch[1].toUpperCase(); break; }
        }
    }

    // Fallback: scan for state if not found
    if (!shipToState && shipToZip) {
        for (const line of lines) {
            if (line.includes(shipToZip)) {
                const stateMatch = line.match(statePattern);
                if (stateMatch) { shipToState = stateMatch[1]; break; }
            }
        }
    }

    return { shipToName, shipToAddress, shipToAddress2, shipToCity, shipToState, shipToZip };
}

function extractWeight(text: string): string {
    // Matches patterns like "2.5 LB", "3 LBS", "1.2 KG"
    const match = text.match(/(\d+(?:\.\d+)?)\s*(?:lb|lbs|kg)/i);
    return match ? match[1] : '';
}

/**
 * Parse GS1 Application Identifiers from a DataMatrix/barcode string.
 * e.g. "(420)76133(94)34636208303361905241"
 * Returns a map of AI code → value.
 */
function parseGS1(data: string): Record<string, string> {
    const result: Record<string, string> = {};
    // Match parenthesised AIs: (420)value(94)value ...
    const parenPattern = /\((\d{2,4})\)([^(]*)/g;
    let m: RegExpExecArray | null;
    while ((m = parenPattern.exec(data)) !== null) {
        result[m[1]] = m[2].trim();
    }
    if (Object.keys(result).length > 0) return result;

    // Raw GS1 (no parens) — fixed-length AIs only, best-effort
    // AI 420 = 3 digits AI + 5 digit ZIP (fixed length 5)
    const raw420 = data.match(/^420(\d{5})/);
    if (raw420) result['420'] = raw420[1];

    return result;
}

/**
 * Extract ZIP and tracking number from decoded barcodes using GS1 AIs.
 * AI 420 = destination ZIP, AI 94 = tracking number.
 */
function extractFromBarcodes(barcodes: { format: string; data: string }[]): {
    zip: string;
    trackingNumber: string;
} {
    let zip = '';
    let trackingNumber = '';

    for (const { data } of barcodes) {
        const gs1 = parseGS1(data);

        // AI 420 = Ship-To Postal Code
        if (!zip && gs1['420']) {
            zip = gs1['420'].slice(0, 5); // take first 5 digits
        }

        // AI 94 = USPS tracking number
        if (!trackingNumber && gs1['94']) {
            trackingNumber = gs1['94'].replace(/\s/g, '');
        }
    }

    return { zip, trackingNumber };
}

// Address region: cover the upper-middle band of the label where the SHIP TO
// block lives across all carriers and label generators.
// Left: 5% (don't clip left border), Right: 77% (avoid right-side codes)
// Top: 12% (below logo/header), Bottom: 78% (above barcode zone)
// This intentionally over-covers so we never miss the address regardless of
// label proportions — the parser handles noise inside the region.
const ADDRESS_REGION = { left: 0.05, top: 0.12, width: 0.72, height: 0.66 };

/**
 * Run a dedicated high-resolution OCR pass on just the address region.
 * Returns the raw OCR text from that crop.
 */
async function ocrAddressRegion(buffer: Buffer): Promise<string> {
    try {
        const metadata = await sharp(buffer).metadata();
        const w = metadata.width ?? 800;
        const h = metadata.height ?? 1000;

        const left = Math.round(ADDRESS_REGION.left * w);
        const top = Math.round(ADDRESS_REGION.top * h);
        const width = Math.round(ADDRESS_REGION.width * w);
        const height = Math.round(ADDRESS_REGION.height * h);

        // 5× upscale (was 3×) + binarise (threshold 145) so bold label fonts
        // don't bleed into each other at low source DPI.
        const cropBuffer = await sharp(buffer)
            .extract({ left, top, width, height })
            .resize(width * 5, height * 5, { fit: 'fill', kernel: 'lanczos3' })
            .greyscale()
            .threshold(145)   // binarise: pure black/white → far fewer garbled chars
            .png()
            .toBuffer();

        const { data: { text } } = await Tesseract.recognize(cropBuffer, 'eng', {
            logger: () => { },
        });

        return text;
    } catch (err) {
        console.warn('Address region OCR failed:', err);
        return '';
    }
}

/**
 * Extract the raw address block from full OCR text by isolating lines that sit
 * between the "SHIP TO" / "DELIVER TO" header and the next major section marker
 * (USPS TRACKING #, RETURN TO, or a long digit-only tracking number sequence).
 *
 * This gives `extractAddress()` a much cleaner input than the full-page OCR dump.
 */
function extractShipToBlock(ocrText: string): string {
    // Capture everything after "SHIP TO:" up to the tracking / barcode section.
    // Handles variations: "SHIP TO:", "SHIP TO", "DELIVER TO:", "RECIPIENT:"
    const match = ocrText.match(
        /(?:SHIP\s*TO|DELIVER\s*TO|RECIPIENT)\s*:?\s*[\r\n]+([\s\S]*?)(?=[\r\n]\s*(?:USPS\s*TRACKING|TRACKING\s*[#\d]|RETURN\s*TO|FROM\s*:|(?:[\d\s]{18,})))/i
    );
    if (match) {
        return match[1]
            .split('\n')
            .map(l => l.trim())
            .filter(l => l.length > 1 && !/^[|_\-=*#]+$/.test(l)) // drop noise/rules
            .join('\n');
    }
    return '';
}

// Map our carrier names to EasyPost carrier strings
const EASYPOST_CARRIER_MAP: Record<string, string> = {
    'USPS': 'USPS',
    'UPS': 'UPS',
    'FedEx': 'FedEx',
    'Purolator': 'Purolator',
    'Canada Post': 'CanadaPost',
};

/**
 * Look up a shipment via EasyPost Tracker API.
 * Returns destination address fields and service if available.
 */
async function lookupEasyPost(trackingNumber: string, carrier: string): Promise<{
    shipToName: string;
    shipToAddress: string;
    shipToAddress2: string;
    shipToCity: string;
    shipToState: string;
    shipToZip: string;
    shipToCountry: string;
    service: string;
    weight: string;
    easyPostStatus: string;
} | null> {
    const apiKey = process.env.EASYPOST_API_KEY;
    if (!apiKey || !trackingNumber) return null;

    try {
        const client = new EasyPost(apiKey);
        const epCarrier = EASYPOST_CARRIER_MAP[carrier] ?? carrier;

        const tracker = await client.Tracker.create({
            tracking_code: trackingNumber,
            carrier: epCarrier,
        });

        // EasyPost returns address in tracker.to_address (if available)
        // and service info in tracker.service
        const addr = (tracker as any).to_address ?? {};
        const details = (tracker as any).tracking_details ?? [];
        const latestDetail = details[details.length - 1] ?? {};

        return {
            shipToName: addr.name ?? '',
            shipToAddress: addr.street1 ?? '',
            shipToAddress2: addr.street2 ?? '',
            shipToCity: addr.city ?? '',
            shipToState: addr.state ?? '',
            shipToZip: addr.zip ?? '',
            shipToCountry: addr.country ?? '',
            service: (tracker as any).service ?? '',
            weight: (tracker as any).weight ?? '',
            easyPostStatus: (tracker as any).status ?? latestDetail.message ?? '',
        };
    } catch (err) {
        console.warn('EasyPost lookup failed:', err);
        return null;
    }
}

// Regions to crop and scan independently (as fractions of image dimensions)
// Based on typical USPS Ground Advantage label layout
const SCAN_REGIONS = [
    { name: 'top-right', left: 0.55, top: 0, width: 0.45, height: 0.22 }, // PDF417 / easypost barcode
    { name: 'ship-to-qr', left: 0, top: 0.35, width: 0.35, height: 0.25 }, // DataMatrix next to SHIP TO
    { name: 'bottom-right', left: 0.65, top: 0.78, width: 0.35, height: 0.22 }, // QR bottom-right
    { name: 'full', left: 0, top: 0, width: 1, height: 1 }, // fallback: scan entire label
];

async function decodeQRCodes(buffer: Buffer): Promise<{ name: string; format: string; data: string }[]> {
    const results: { name: string; format: string; data: string }[] = [];

    try {
        const metadata = await sharp(buffer).metadata();
        const originalWidth = metadata.width ?? 800;
        const originalHeight = metadata.height ?? 1000;

        // zxing-wasm is the actual ZXing C++ compiled to WASM — works natively in Node.js
        const { readBarcodes } = await import('zxing-wasm/reader');

        for (const region of SCAN_REGIONS) {
            const regionLeft = Math.round(region.left * originalWidth);
            const regionTop = Math.round(region.top * originalHeight);
            const regionWidth = Math.round(region.width * originalWidth);
            const regionHeight = Math.round(region.height * originalHeight);

            for (const scale of [2, 3, 4]) {
                try {
                    // zxing-wasm accepts PNG/JPEG buffers directly
                    const regionPng = await sharp(buffer)
                        .extract({ left: regionLeft, top: regionTop, width: regionWidth, height: regionHeight })
                        .resize(Math.round(regionWidth * scale), Math.round(regionHeight * scale), { fit: 'fill' })
                        .greyscale()
                        .png()
                        .toBuffer();

                    const decoded = await readBarcodes(regionPng, {
                        tryHarder: true,
                        formats: [], // empty = all formats: DataMatrix, PDF417, QR, etc.
                    });

                    for (const code of decoded) {
                        if (code.text && !results.find(r => r.data === code.text)) {
                            console.log(`[${region.name}] Decoded at ${scale}x — format: ${code.format}`);
                            results.push({ name: region.name, format: code.format, data: code.text });
                        }
                    }

                    if (decoded.length > 0) break; // found something, move to next region
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

        // Run full OCR, address-region OCR, and barcode decoding in parallel
        const [{ data: { text: ocrText } }, addressOcrText, qrResults] = await Promise.all([
            Tesseract.recognize(buffer, 'eng', {
                logger: () => { }, // suppress progress logs
            }),
            ocrAddressRegion(buffer),
            decodeQRCodes(buffer),
        ]);

        // Extract structured data from GS1 barcodes (more reliable than OCR for ZIP/tracking)
        const gs1Data = extractFromBarcodes(qrResults);

        // Pull the SHIP TO block out of the full OCR before it gets mixed with
        // the rest of the label text. Wrap it so extractAddress() finds the header.
        const shipToBlock = extractShipToBlock(ocrText);
        const shipToSection = shipToBlock ? `SHIP TO:\n${shipToBlock}` : '';

        // Priority order for the combined text fed to the parsers:
        //   1. Extracted SHIP TO block (cleanest, most focused)
        //   2. Address-region OCR crop (high-res region scan)
        //   3. Barcode data (GS1 strings)
        //   4. Full-page OCR (last resort, most noisy)
        const text = [shipToSection, addressOcrText, ...qrResults.map(r => r.data), ocrText].join('\n');

        const carrier = detectCarrier(text);
        const service = detectService(text, carrier);

        // Prefer GS1 tracking number (from DataMatrix), fall back to OCR
        const trackingNumber = gs1Data.trackingNumber || extractTrackingNumber(text, carrier);
        const address = extractAddress(text);
        const weight = extractWeight(text);

        // Prefer GS1 ZIP (from DataMatrix AI 420), fall back to OCR-parsed ZIP
        if (gs1Data.zip && !address.shipToZip) {
            address.shipToZip = gs1Data.zip;
        }

        // --- EasyPost enrichment ---
        // If we have a tracking number, ask EasyPost for the full shipment details.
        // EasyPost data takes priority over OCR for address fields.
        let easyPostData: Awaited<ReturnType<typeof lookupEasyPost>> = null;
        if (trackingNumber) {
            easyPostData = await lookupEasyPost(trackingNumber, carrier);
        }

        // Merge: EasyPost wins over OCR where it has data
        const mergedAddress = {
            shipToName: easyPostData?.shipToName || address.shipToName,
            shipToAddress: easyPostData?.shipToAddress || address.shipToAddress,
            shipToAddress2: easyPostData?.shipToAddress2 || address.shipToAddress2,
            shipToCity: easyPostData?.shipToCity || address.shipToCity,
            shipToState: easyPostData?.shipToState || address.shipToState,
            shipToZip: easyPostData?.shipToZip || address.shipToZip,
            shipToCountry: easyPostData?.shipToCountry || '',
        };

        const mergedService = easyPostData?.service || service;
        const mergedWeight = easyPostData?.weight || weight;

        const result = {
            carrier: carrier || undefined,
            service: mergedService || undefined,
            trackingNumber: trackingNumber || undefined,
            weight: mergedWeight || undefined,
            easyPostStatus: easyPostData?.easyPostStatus || undefined,
            ...Object.fromEntries(
                Object.entries(mergedAddress).filter(([, v]) => v !== '')
            ),
        };

        // Save scan result to a JSON log file for debugging
        try {
            const logsDir = path.join(process.cwd(), 'scan-logs');
            if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const logEntry = {
                timestamp: new Date().toISOString(),
                fileName: file.name,
                fileSize: file.size,
                qrCodesFound: qrResults.length,
                barcodes: qrResults,
                gs1Extracted: gs1Data,
                easyPostData,
                shipToBlockExtracted: shipToBlock,          // ← new: the isolated SHIP TO lines
                addressOcrSnippet: addressOcrText.slice(0, 500),
                ocrTextSnippet: ocrText.slice(0, 500),
                extracted: result,
            };

            fs.writeFileSync(
                path.join(logsDir, `scan-${timestamp}.json`),
                JSON.stringify(logEntry, null, 2)
            );
        } catch (logError) {
            // Logging failure should never break the actual response
            console.warn('Failed to write scan log:', logError);
        }

        return NextResponse.json(result);

    } catch (error) {
        console.error('Label OCR error:', error);
        return NextResponse.json({ error: 'OCR processing failed' }, { status: 500 });
    }
}
