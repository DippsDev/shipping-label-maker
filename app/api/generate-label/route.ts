import { NextRequest, NextResponse } from 'next/server';
import { createCanvas, loadImage, GlobalFonts, Canvas, SKRSContext2D } from '@napi-rs/canvas';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const bwipjs = require('bwip-js');
import path from 'path';
import fs from 'fs';

const TEMPLATES_DIR = path.join(process.cwd(), 'public', 'label-templates');
const FONTS_DIR = path.join(TEMPLATES_DIR, 'fonts');

let fontsRegistered = false;
function ensureFonts() {
  if (fontsRegistered) return;
  GlobalFonts.registerFromPath(path.join(FONTS_DIR, 'Helvetica.ttf'), 'Helvetica');
  GlobalFonts.registerFromPath(path.join(FONTS_DIR, 'HelveticaBold.ttf'), 'HelveticaBold');
  fontsRegistered = true;
}

const TEMPLATES: Record<string, Record<string, string>> = {
  ups: {
    'UPS Ground': 'ups_ground.png',
    'UPS Next Day Air': 'ups_express.png',
    'UPS 2nd Day Air': 'ups_saver.png',
    'UPS 3 Day Select': 'ups_standard.png',
    'UPS Ground Return Service': 'master.png',
  },
  fedex: {
    'FedEx Ground': 'master_fedex.png',
    'FedEx Home Delivery': 'master_fedex.png',
    'FedEx Express Saver': 'fedex_express.png',
    'FedEx 2Day': 'fedex_express.png',
    'FedEx Standard Overnight': 'fedex_express.png',
    'FedEx Priority Overnight': 'fedex_express.png',
    'Smart Post': 'smartp_master.png',
    'Ground Return Service': 'master_fedex.png',
  },
  usps: {
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
  purolator: {
    'Purolator Ground': 'purolator_master.png',
    'Purolator Express': 'purolator_express.png',
  },
  canada_post: {
    'Regular Parcel': 'canada_3_master.png',
    'Expedited Parcel': 'canada_2_master.png',
    'Regular Parcel Return': 'canada_3_r_master.png',
    'Expedited Parcel Return': 'canada_2_r_master.png',
  },
};

async function generateBarcode(data: string): Promise<Buffer> {
  return bwipjs.toBuffer({
    bcid: 'code128',
    text: data,
    scale: 3,
    height: 16,
    includetext: false,
  });
}

async function loadTemplate(filename: string): Promise<{ canvas: Canvas; ctx: SKRSContext2D }> {
  const templatePath = path.join(TEMPLATES_DIR, filename);
  const img = await loadImage(fs.readFileSync(templatePath));
  const canvas = createCanvas(img.width as number, img.height as number);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  return { canvas, ctx };
}

async function pasteBarcode(ctx: SKRSContext2D, trackingNumber: string, x: number, y: number, w: number, h: number) {
  const barcodeBuffer = await generateBarcode(trackingNumber);
  const barcodeImg = await loadImage(barcodeBuffer);
  ctx.drawImage(barcodeImg, x, y, w, h);
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function generateCanadaPostLabel(data: Record<string, any>): Promise<Canvas> {
  ensureFonts();
  const service = data.service || 'Regular Parcel';
  const templateFile = TEMPLATES.canada_post[service] || 'canada_3_master.png';
  const { canvas, ctx } = await loadTemplate(templateFile);

  const tn = (data.trackingNumber || '').toUpperCase();
  const modifiedTracking = `${tn.slice(7, 11)} ${tn.slice(11, 15)} ${tn.slice(15, 19)} ${tn.slice(19, 23)}`;

  ctx.fillStyle = '#000000';
  ctx.font = '14px Helvetica';
  ctx.fillText(data.returnName || 'SENDER NAME', 75, 800);
  ctx.fillText(data.returnAddress || '123 MAIN ST', 75, 815);
  ctx.fillText(data.returnCityStateZip || 'CITY, PROV A1A 1A1', 75, 830);
  ctx.fillText(`PIN / NIP:  ${modifiedTracking}`, 240, 895);

  ctx.font = '19px Helvetica';
  ctx.fillText((data.shipToName || '').toUpperCase(), 72, 273);
  ctx.fillText((data.shipToAddress || '').toUpperCase(), 72, 293);
  ctx.fillText(`${(data.shipToCity || '').toUpperCase()} ${(data.shipToProvince || '').toUpperCase()} ${(data.shipToPostal || '').toUpperCase()}`, 72, 313);

  ctx.font = 'bold 58px HelveticaBold';
  ctx.fillText((data.shipToPostal || '').toUpperCase(), 75, 453);

  ctx.font = 'bold 18px HelveticaBold';
  ctx.fillText(modifiedTracking, 295, 700);

  await pasteBarcode(ctx, tn, 63, 560, 625, 130);
  return canvas;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function generatePurolatorLabel(data: Record<string, any>): Promise<Canvas> {
  ensureFonts();
  const service = data.service || 'Purolator Ground';
  const templateFile = TEMPLATES.purolator[service] || 'purolator_master.png';
  const { canvas, ctx } = await loadTemplate(templateFile);

  const tn = (data.trackingNumber || '').toUpperCase();
  const modifiedTracking = tn.slice(11, 18) + tn.slice(20, 23) + tn.slice(18, 20);
  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();

  ctx.fillStyle = '#000000';
  ctx.font = '14px Helvetica';
  ctx.fillText(data.returnName || 'SENDER NAME', 28, 80);
  ctx.fillText(data.returnAddress || '123 MAIN ST', 28, 97);
  ctx.fillText(data.returnCityStateZip || 'CITY, PROV A1A 1A1', 28, 114);
  ctx.fillText(`${randInt(100, 900)}-${randInt(100, 900)}-${randInt(1000, 9999)}`, 28, 130);
  ctx.fillText(`REF: ${randInt(1000000000, 8999999999)}`, 28, 157);

  ctx.font = '20px Helvetica';
  ctx.fillText((data.shipToName || '').replace(/\b\w/g, (c: string) => c.toUpperCase()), 263, 80);
  ctx.fillText((data.shipToAddress || '').replace(/\b\w/g, (c: string) => c.toUpperCase()), 263, 103);

  ctx.font = 'bold 24px HelveticaBold';
  ctx.fillText(`${(data.shipToCity || '').replace(/\b\w/g, (c: string) => c.toUpperCase())} ${(data.shipToProvince || '').toUpperCase()}`, 263, 128);
  ctx.fillText((data.shipToPostal || '').toUpperCase(), 263, 154);

  ctx.font = '20px Helvetica';
  ctx.fillText(`${randInt(100, 900)}-${randInt(100, 900)}-${randInt(1000, 9999)}`, 580, 285);

  ctx.font = 'bold 95px HelveticaBold';
  ctx.fillText(data.sortingCode || '55', 600, 580);

  ctx.font = '14px Helvetica';
  ctx.fillText(today, 32, 608);

  ctx.font = 'bold 46px HelveticaBold';
  ctx.fillText(`${data.weight || '1'} LB`, 150, 619);

  ctx.font = 'bold 32px HelveticaBold';
  ctx.fillText(modifiedTracking, 397, 1005);

  await pasteBarcode(ctx, tn, 43, 819, 640, 180);
  return canvas;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function generateUPSLabel(data: Record<string, any>): Promise<Canvas> {
  ensureFonts();
  const service = data.service || 'UPS Ground';
  const templateFile = TEMPLATES.ups[service] || 'ups_ground.png';
  const { canvas, ctx } = await loadTemplate(templateFile);

  const tn = (data.trackingNumber || '').toUpperCase();
  const formattedTracking = `1Z ${tn.slice(2, 5)} ${tn.slice(5, 9)} ${tn.slice(9, 13)} ${tn.slice(13, 17)} ${tn.slice(17)}`;
  const zip = (data.shipToZip || '').toUpperCase();
  const city = (data.shipToCity || '').toUpperCase();
  const state = (data.shipToState || '').toUpperCase();
  const addr2 = (data.shipToAddress2 || '').toUpperCase();

  ctx.fillStyle = '#000000';
  ctx.font = '13px Helvetica';
  ctx.fillText(data.returnName || 'SENDER NAME', 30, 45);
  ctx.fillText(data.returnAddress || '123 MAIN ST', 30, 60);
  ctx.fillText(data.returnCityStateZip || 'CITY, ST 12345', 30, 75);

  ctx.font = 'bold 24px HelveticaBold';
  ctx.fillText((data.shipToName || '').toUpperCase(), 30, 280);

  ctx.font = '22px Helvetica';
  ctx.fillText((data.shipToAddress || '').toUpperCase(), 30, 310);
  if (addr2) {
    ctx.fillText(addr2, 30, 335);
    ctx.fillText(`${city}, ${state} ${zip}`, 30, 360);
  } else {
    ctx.fillText(`${city}, ${state} ${zip}`, 30, 335);
  }

  ctx.font = 'bold 72px HelveticaBold';
  ctx.fillText(zip.slice(0, 5), 50, 480);

  ctx.font = 'bold 120px HelveticaBold';
  ctx.fillText(data.upsZone || '959', 580, 120);

  ctx.font = 'bold 24px HelveticaBold';
  ctx.fillText(`${data.weight || '1'} LB`, 600, 380);

  ctx.font = 'bold 20px HelveticaBold';
  ctx.fillText(formattedTracking, 30, 750);

  await pasteBarcode(ctx, tn, 30, 600, 680, 140);
  return canvas;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function generateFedExLabel(data: Record<string, any>): Promise<Canvas> {
  ensureFonts();
  const service = data.service || 'FedEx Ground';
  const templateFile = TEMPLATES.fedex[service] || 'master_fedex.png';
  const { canvas, ctx } = await loadTemplate(templateFile);

  const tn = (data.trackingNumber || '').toUpperCase();
  const formattedTracking = `${tn.slice(0, 4)} ${tn.slice(4, 8)} ${tn.slice(8)}`;
  const zip = (data.shipToZip || '').toUpperCase();
  const city = (data.shipToCity || '').toUpperCase();
  const state = (data.shipToState || '').toUpperCase();
  const addr2 = (data.shipToAddress2 || '').toUpperCase();

  ctx.fillStyle = '#000000';
  ctx.font = '13px Helvetica';
  ctx.fillText(data.returnName || 'SENDER NAME', 35, 50);
  ctx.fillText(data.returnAddress || '123 MAIN ST', 35, 65);
  ctx.fillText(data.returnCityStateZip || 'CITY, ST 12345', 35, 80);

  ctx.font = 'bold 22px HelveticaBold';
  ctx.fillText((data.shipToName || '').toUpperCase(), 35, 300);

  ctx.font = '20px Helvetica';
  ctx.fillText((data.shipToAddress || '').toUpperCase(), 35, 325);
  if (addr2) {
    ctx.fillText(addr2, 35, 350);
    ctx.fillText(`${city}, ${state} ${zip}`, 35, 375);
  } else {
    ctx.fillText(`${city}, ${state} ${zip}`, 35, 350);
  }

  ctx.font = 'bold 68px HelveticaBold';
  ctx.fillText(zip.slice(0, 5), 50, 500);

  ctx.font = 'bold 22px HelveticaBold';
  ctx.fillText(`${data.weight || '1'} LB`, 600, 400);

  ctx.font = 'bold 18px HelveticaBold';
  ctx.fillText(formattedTracking, 35, 780);

  await pasteBarcode(ctx, tn, 30, 630, 680, 140);
  return canvas;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function generateUSPSLabel(data: Record<string, any>): Promise<Canvas> {
  ensureFonts();
  const service = data.service || 'Priority Mail';
  const templateFile = TEMPLATES.usps[service] || 'priority_master.png';
  const { canvas, ctx } = await loadTemplate(templateFile);

  const tn = (data.trackingNumber || '').toUpperCase();
  const formattedTracking = `${tn.slice(0, 4)} ${tn.slice(4, 8)} ${tn.slice(8, 12)} ${tn.slice(12, 16)} ${tn.slice(16)}`;
  const zip = (data.shipToZip || '').toUpperCase();
  const city = (data.shipToCity || '').toUpperCase();
  const state = (data.shipToState || '').toUpperCase();
  const addr2 = (data.shipToAddress2 || '').toUpperCase();

  ctx.fillStyle = '#000000';
  ctx.font = '14px Helvetica';
  ctx.fillText(data.returnName || 'SENDER NAME', 40, 60);
  ctx.fillText(data.returnAddress || '123 MAIN ST', 40, 78);
  ctx.fillText(data.returnCityStateZip || 'CITY, ST 12345', 40, 96);

  ctx.font = 'bold 22px HelveticaBold';
  ctx.fillText((data.shipToName || '').toUpperCase(), 40, 320);

  ctx.font = '20px Helvetica';
  ctx.fillText((data.shipToAddress || '').toUpperCase(), 40, 348);
  if (addr2) {
    ctx.fillText(addr2, 40, 376);
    ctx.fillText(`${city}, ${state} ${zip}`, 40, 404);
  } else {
    ctx.fillText(`${city}, ${state} ${zip}`, 40, 376);
  }

  ctx.font = 'bold 64px HelveticaBold';
  ctx.fillText(zip.slice(0, 5), 60, 530);

  ctx.font = 'bold 22px HelveticaBold';
  ctx.fillText(`${data.weight || '1'} LB`, 600, 420);

  ctx.font = 'bold 16px HelveticaBold';
  ctx.fillText(formattedTracking, 40, 820);

  await pasteBarcode(ctx, tn, 30, 670, 680, 140);
  return canvas;
}

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

    const carrier = (data.carrier as string).toLowerCase().replace(' ', '_');
    let canvas: Canvas;

    switch (carrier) {
      case 'ups':
        canvas = await generateUPSLabel(data);
        break;
      case 'fedex':
        canvas = await generateFedExLabel(data);
        break;
      case 'usps':
        canvas = await generateUSPSLabel(data);
        break;
      case 'purolator':
        canvas = await generatePurolatorLabel(data);
        break;
      case 'canada_post':
        canvas = await generateCanadaPostLabel(data);
        break;
      default:
        return NextResponse.json({ error: `Carrier "${data.carrier}" not supported` }, { status: 400 });
    }

    const pngBuffer = await canvas.encode('png');

    return new NextResponse(new Uint8Array(pngBuffer), {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="label_${data.trackingNumber}.png"`,
      },
    });

  } catch (error) {
    console.error('Label generation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
