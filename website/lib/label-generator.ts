import { createCanvas, loadImage, GlobalFonts, Canvas, SKRSContext2D } from '@napi-rs/canvas';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const bwipjs = require('bwip-js');
import path from 'path';
import fs from 'fs';

const TEMPLATES_DIR = path.join(process.cwd(), 'public', 'label-templates');
const FONTS_DIR = path.join(TEMPLATES_DIR, 'fonts');

const RENDER_SCALE = 2;

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
    scale: 5,
    height: 16,
    includetext: false,
  });
}

async function generateBrandQR(content: string): Promise<Buffer> {
  return bwipjs.toBuffer({
    bcid: 'qrcode',
    text: content || 'LABELMAKER',
    scale: 5,
    eclevel: 'M',
  });
}

async function loadTemplate(filename: string): Promise<{ canvas: Canvas; ctx: SKRSContext2D }> {
  const templatePath = path.join(TEMPLATES_DIR, filename);
  const img = await loadImage(fs.readFileSync(templatePath));
  const pw = (img.width as number) * RENDER_SCALE;
  const ph = (img.height as number) * RENDER_SCALE;
  const canvas = createCanvas(pw, ph);
  const ctx = canvas.getContext('2d');
  // Draw template upscaled then lock in the scale so all callers use logical (1×) coords
  ctx.drawImage(img, 0, 0, pw, ph);
  ctx.scale(RENDER_SCALE, RENDER_SCALE);
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

// Replaces every digit with a random digit; preserves letters (e.g. UPS "1Z" prefix).
function scrambleTrackingNumber(tn: string): string {
  return tn.replace(/[0-9]/g, () => String(Math.floor(Math.random() * 10)));
}

function applyWatermark(canvas: Canvas, ctx: SKRSContext2D): void {
  const W = canvas.width / RENDER_SCALE;
  const H = canvas.height / RENDER_SCALE;
  const text = 'VOID • NOT FOR USE • VOID';
  const fontSize = Math.max(28, Math.round(W * 0.075));

  ctx.save();
  ctx.globalAlpha = 0.38;
  ctx.fillStyle = '#CC0000';
  ctx.font = `bold ${fontSize}px HelveticaBold`;

  // Three diagonal stamps evenly spaced down the label
  [H * 0.22, H * 0.52, H * 0.78].forEach(yCenter => {
    ctx.save();
    ctx.translate(W / 2, yCenter);
    ctx.rotate(-Math.PI / 4.5);
    const m = ctx.measureText(text);
    ctx.fillText(text, -m.width / 2, 0);
    ctx.restore();
  });

  ctx.restore();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function generateCanadaPostLabel(data: Record<string, any>): Promise<Canvas> {
  ensureFonts();
  const service = data.service || 'Regular Parcel';
  const templateFile = TEMPLATES.canada_post[service] || 'canada_3_master.png';
  const { canvas, ctx } = await loadTemplate(templateFile);

  const rawTn = (data.trackingNumber || '').toUpperCase();
  const tn = data.scrambleTracking ? scrambleTrackingNumber(rawTn) : rawTn;
  const modifiedTracking = `${tn.slice(7, 11)} ${tn.slice(11, 15)} ${tn.slice(15, 19)} ${tn.slice(19, 23)}`;

  ctx.fillStyle = '#000000';
  ctx.font = '19px Helvetica';
  ctx.fillText((data.shipToName || '').toUpperCase(), 72, 290);
  ctx.fillText((data.shipToAddress || '').toUpperCase(), 72, 312);
  ctx.fillText(`${(data.shipToCity || '').toUpperCase()} ${(data.shipToProvince || '').toUpperCase()} ${(data.shipToPostal || '').toUpperCase()}`, 72, 334);

  let extraLineY = 358;
  if (data.customPhone) {
    ctx.font = '17px Helvetica';
    ctx.fillText(String(data.customPhone), 72, extraLineY);
    extraLineY += 22;
  }
  if (data.customReference) {
    ctx.font = '14px Helvetica';
    ctx.fillText(`REF: ${data.customReference}`, 72, extraLineY);
  }

  ctx.font = 'bold 58px HelveticaBold';
  ctx.fillText((data.shipToPostal || '').toUpperCase(), 75, 480);

  await pasteBarcode(ctx, tn, 72, 550, 596, 108);

  ctx.font = 'bold 18px HelveticaBold';
  ctx.fillText(modifiedTracking, 295, 716);

  if (!data.litMode) {
    ctx.font = '14px Helvetica';
    ctx.fillText(data.returnName || 'SENDER NAME',                75, 816);
    ctx.fillText(data.returnAddress || '123 MAIN ST',             75, 835);
    ctx.fillText(data.returnCityStateZip || 'CITY, PROV A1A 1A1', 75, 854);
  }

  return canvas;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function generatePurolatorLabel(data: Record<string, any>): Promise<Canvas> {
  ensureFonts();
  const service = data.service || 'Purolator Ground';
  const templateFile = TEMPLATES.purolator[service] || 'purolator_master.png';
  const { canvas, ctx } = await loadTemplate(templateFile);

  const rawTn = (data.trackingNumber || '').toUpperCase();
  const tn = data.scrambleTracking ? scrambleTrackingNumber(rawTn) : rawTn;
  const modifiedTracking = tn.slice(11, 18) + tn.slice(20, 23) + tn.slice(18, 20);
  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();

  ctx.fillStyle = '#000000';
  ctx.font = '14px Helvetica';

  if (!data.litMode) {
    ctx.fillText(data.returnName || 'SENDER NAME',                28, 80);
    ctx.fillText(data.returnAddress || '123 MAIN ST',             28, 97);
    ctx.fillText(data.returnCityStateZip || 'CITY, PROV A1A 1A1', 28, 114);
    ctx.fillText(`${randInt(100, 900)}-${randInt(100, 900)}-${randInt(1000, 9999)}`, 28, 130);
    ctx.fillText(`REF: ${randInt(1000000000, 8999999999)}`, 28, 157);
  }

  ctx.font = '20px Helvetica';
  ctx.fillText((data.shipToName || '').replace(/\b\w/g, (c: string) => c.toUpperCase()), 263, 80);
  ctx.fillText((data.shipToAddress || '').replace(/\b\w/g, (c: string) => c.toUpperCase()), 263, 103);

  ctx.font = 'bold 24px HelveticaBold';
  ctx.fillText(`${(data.shipToCity || '').replace(/\b\w/g, (c: string) => c.toUpperCase())} ${(data.shipToProvince || '').toUpperCase()}`, 263, 128);
  ctx.fillText((data.shipToPostal || '').toUpperCase(), 263, 154);

  let extraY = 178;
  if (data.customPhone) {
    ctx.font = '18px Helvetica';
    ctx.fillText(String(data.customPhone), 263, extraY);
    extraY += 24;
  }
  if (data.customReference) {
    ctx.font = '14px Helvetica';
    ctx.fillText(`REF: ${data.customReference}`, 263, extraY);
  }

  ctx.font = '20px Helvetica';
  ctx.fillText(`${randInt(100, 900)}-${randInt(100, 900)}-${randInt(1000, 9999)}`, 580, 285);

  ctx.font = 'bold 95px HelveticaBold';
  ctx.fillText(data.sortingCode || '55', 600, 580);

  ctx.font = '14px Helvetica';
  ctx.fillText(today, 32, 608);

  if (!data.removeWeight) {
    ctx.font = 'bold 46px HelveticaBold';
    ctx.fillText(`${data.weight || '1'} LB`, 150, 619);
  }

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

  const rawTn = (data.trackingNumber || '').toUpperCase();
  const tn = data.scrambleTracking ? scrambleTrackingNumber(rawTn) : rawTn;
  const formattedTracking = `1Z ${tn.slice(2, 5)} ${tn.slice(5, 9)} ${tn.slice(9, 13)} ${tn.slice(13, 17)} ${tn.slice(17)}`;
  const zip = (data.shipToZip || '').toUpperCase();
  const city = (data.shipToCity || '').toUpperCase();
  const state = (data.shipToState || '').toUpperCase();
  const addr2 = (data.shipToAddress2 || '').toUpperCase();

  ctx.fillStyle = '#000000';

  if (!data.litMode) {
    ctx.font = '13px Helvetica';
    ctx.fillText(data.returnName || 'SENDER NAME',            30, 45);
    ctx.fillText(data.returnAddress || '123 MAIN ST',         30, 60);
    ctx.fillText(data.returnCityStateZip || 'CITY, ST 12345', 30, 75);
  }

  ctx.font = 'bold 24px HelveticaBold';
  ctx.fillText((data.shipToName || '').toUpperCase(), 30, 280);

  ctx.font = '22px Helvetica';
  let addrEndY: number;
  if (addr2) {
    ctx.fillText((data.shipToAddress || '').toUpperCase(), 30, 310);
    ctx.fillText(addr2, 30, 335);
    ctx.fillText(`${city}, ${state} ${zip}`, 30, 360);
    addrEndY = 360;
  } else {
    ctx.fillText((data.shipToAddress || '').toUpperCase(), 30, 310);
    ctx.fillText(`${city}, ${state} ${zip}`, 30, 335);
    addrEndY = 335;
  }

  let extraY = addrEndY + 28;
  if (data.customPhone) {
    ctx.font = '20px Helvetica';
    ctx.fillText(String(data.customPhone), 30, extraY);
    extraY += 26;
  }
  if (data.customReference) {
    ctx.font = '16px Helvetica';
    ctx.fillText(`REF: ${data.customReference}`, 30, extraY);
  }

  ctx.font = 'bold 72px HelveticaBold';
  ctx.fillText(zip.slice(0, 5), 50, 480);

  ctx.font = 'bold 120px HelveticaBold';
  ctx.fillText(data.upsZone || '959', 580, 120);

  if (!data.removeWeight) {
    ctx.font = 'bold 24px HelveticaBold';
    ctx.fillText(`${data.weight || '1'} LB`, 600, 380);
  }

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

  const rawTn = (data.trackingNumber || '').toUpperCase();
  const tn = data.scrambleTracking ? scrambleTrackingNumber(rawTn) : rawTn;
  const last12 = tn.slice(-12);
  const formattedTracking = `${last12.slice(0, 4)} ${last12.slice(4, 8)} ${last12.slice(8)}`;
  const zip = (data.shipToZip || '').toUpperCase();
  const city = (data.shipToCity || '').toUpperCase();
  const state = (data.shipToState || '').toUpperCase();
  const addr2 = (data.shipToAddress2 || '').toUpperCase();

  ctx.fillStyle = '#000000';

  if (!data.litMode) {
    ctx.font = '13px Helvetica';
    ctx.fillText(data.returnName || 'SENDER NAME',            35, 38);
    ctx.fillText(data.returnAddress || '123 MAIN ST',         35, 54);
    ctx.fillText(data.returnCityStateZip || 'CITY, ST 12345', 35, 70);
  }

  ctx.font = 'bold 22px HelveticaBold';
  ctx.fillText((data.shipToName || '').toUpperCase(), 35, 185);

  ctx.font = '20px Helvetica';
  let addrEndY: number;
  if (addr2) {
    ctx.fillText((data.shipToAddress || '').toUpperCase(), 35, 215);
    ctx.fillText(addr2.toUpperCase(), 35, 245);
    ctx.fillText(`${city}, ${state} ${zip}`, 35, 272);
    addrEndY = 272;
  } else {
    ctx.fillText((data.shipToAddress || '').toUpperCase(), 35, 215);
    ctx.fillText(`${city}, ${state} ${zip}`, 35, 245);
    addrEndY = 245;
  }

  let extraY = addrEndY + 26;
  if (data.customPhone) {
    ctx.font = '18px Helvetica';
    ctx.fillText(String(data.customPhone), 35, extraY);
    extraY += 24;
  }
  if (data.customReference) {
    ctx.font = '14px Helvetica';
    ctx.fillText(`REF: ${data.customReference}`, 35, extraY);
  }

  if (!data.removeWeight) {
    ctx.font = 'bold 20px HelveticaBold';
    ctx.fillText(`${data.weight || '1'} LB`, 600, 355);
  }

  ctx.font = 'bold 68px HelveticaBold';
  ctx.fillText(zip.slice(0, 5), 35, 555);

  await pasteBarcode(ctx, tn, 30, 775, 710, 185);

  ctx.font = 'bold 18px HelveticaBold';
  ctx.fillText(formattedTracking, 35, 980);

  return canvas;
}

interface USPSLayout {
  dividerX: number;
  gBoxBotY: number;
  postageX: number; postageY: number; postageLineH: number;
  sortX: number; sortY: number; sortW: number; sortH: number;
  addrY: number; addrLineH: number;
  weightX: number; weightY: number;
  barcodeY: number; barcodeH: number;
  barcodeMaxW?: number;
  trackingNumY: number;
  fromAddrX?: number;
  fromAddrY?: number;
  fromAddrFontSize?: number;
  fromAddrLineH?: number;
}

const USPS_LAYOUTS: Record<string, USPSLayout> = {
  'Ground Advantage': {
    dividerX: 173, gBoxBotY: 175,
    postageX: 182, postageY: 17,  postageLineH: 19,
    sortX: 496,    sortY: 354,    sortW: 150,       sortH: 58,
    addrY: 520,    addrLineH: 29,
    weightX: 556,  weightY: 295,
    barcodeY: 731, barcodeH: 100,
    trackingNumY: 860,
  },
  'Parcel Select': {
    dividerX: 100, gBoxBotY: 175,
    postageX: 114, postageY: 17,  postageLineH: 19,
    sortX: 496,    sortY: 354,    sortW: 150,       sortH: 58,
    addrY: 520,    addrLineH: 29,
    weightX: 556,  weightY: 295,
    barcodeY: 731, barcodeH: 100,
    trackingNumY: 860,
  },
  'Priority Mail': {
    dividerX: 0,   gBoxBotY: 0,
    postageX: 0,   postageY: 0,   postageLineH: 0,
    sortX: 483,    sortY: 375,    sortW: 148,        sortH: 54,
    addrY: 338,    addrLineH: 28,
    weightX: 556,  weightY: 338,
    barcodeY: 590, barcodeH: 120,
    trackingNumY: 725,
  },
  'Priority Mail Return': {
    dividerX: 0,   gBoxBotY: 0,
    postageX: 0,   postageY: 0,   postageLineH: 0,
    sortX: 483,    sortY: 375,    sortW: 148,        sortH: 54,
    addrY: 338,    addrLineH: 28,
    weightX: 556,  weightY: 338,
    barcodeY: 700, barcodeH: 120,
    trackingNumY: 840,
    fromAddrX: 210, fromAddrY: 74,
  },
  'First Class Package': {
    dividerX: 0,   gBoxBotY: 0,
    postageX: 0,   postageY: 0,   postageLineH: 0,
    sortX: 483,    sortY: 360,    sortW: 148,        sortH: 54,
    addrY: 376,    addrLineH: 28,
    weightX: 556,  weightY: 376,
    barcodeY: 590, barcodeH: 120,
    trackingNumY: 725,
  },
  'First Class Package Return': {
    dividerX: 0,   gBoxBotY: 0,
    postageX: 0,   postageY: 0,   postageLineH: 0,
    sortX: 483,    sortY: 360,    sortW: 148,        sortH: 54,
    addrY: 376,    addrLineH: 28,
    weightX: 556,  weightY: 376,
    barcodeY: 590, barcodeH: 120,
    trackingNumY: 725,
  },
  'Priority Mail Express': {
    dividerX: 0,   gBoxBotY: 0,
    postageX: 0,   postageY: 0,   postageLineH: 0,
    sortX: 483,    sortY: 325,    sortW: 148,        sortH: 54,
    addrY: 370,    addrLineH: 28,
    weightX: 556,  weightY: 320,
    barcodeY: 700, barcodeH: 100,
    trackingNumY: 812,
    fromAddrX: 210, fromAddrY: 67,
  },
  'UPS Mail Innovations': {
    dividerX: 0,   gBoxBotY: 0,
    postageX: 0,   postageY: 0,   postageLineH: 0,
    sortX: 538,    sortY: 690,    sortW: 185,        sortH: 55,
    addrY: 295,    addrLineH: 30,
    weightX: 620,  weightY: 295,
    barcodeY: 519, barcodeH: 88,
    trackingNumY: 625,
    fromAddrX: 30, fromAddrY: 47,
  },
  'Smart Label / Pitney Bowes': {
    dividerX: 0,   gBoxBotY: 0,
    postageX: 0,   postageY: 0,   postageLineH: 0,
    sortX: 400,    sortY: 374,    sortW: 235,        sortH: 65,
    addrY: 240,    addrLineH: 28,
    weightX: 500,  weightY: 240,
    barcodeY: 680, barcodeH: 100,
    trackingNumY: 800,
    fromAddrX: 30, fromAddrY: 38,
    fromAddrFontSize: 18, fromAddrLineH: 22,
  },
};

const DEFAULT_USPS_LAYOUT = USPS_LAYOUTS['Ground Advantage'];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function generateUSPSLabel(data: Record<string, any>): Promise<Canvas> {
  ensureFonts();
  const service = data.service || 'Ground Advantage';
  const templateFile = TEMPLATES.usps[service] || 'ground_advantage_master.png';
  const { canvas, ctx } = await loadTemplate(templateFile);

  const W = canvas.width / RENDER_SCALE;
  const L = USPS_LAYOUTS[service] ?? DEFAULT_USPS_LAYOUT;

  const rawTn = (data.trackingNumber || '').toUpperCase();
  const tn = data.scrambleTracking ? scrambleTrackingNumber(rawTn) : rawTn;
  const formattedTracking = `${tn.slice(0, 4)} ${tn.slice(4, 8)} ${tn.slice(8, 12)} ${tn.slice(12, 16)} ${tn.slice(16)}`.trim();
  const zip   = (data.shipToZip      || '').toUpperCase();
  const city  = (data.shipToCity     || '').toUpperCase();
  const state = (data.shipToState    || '').toUpperCase();
  const addr2 = (data.shipToAddress2 || '').toUpperCase();

  if (L.dividerX > 0) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(L.dividerX + 2, 6, W - L.dividerX - 11, L.gBoxBotY - 6);
    ctx.fillStyle = '#000000';

    const mailDate   = data.mailDate || new Date().toISOString().slice(0, 10);
    const originZip  = String(data.shipFromZip  || '');
    const rateType   = String(data.rateType     || 'Commercial');
    const weightVal  = String(data.weight       || '');
    const zone       = String(data.zone         || '');
    const permitNum  = String(data.permitNumber || '');
    const weightZone = weightVal
      ? (zone ? `${weightVal} CUBIC ZONE ${zone}` : `${weightVal} LB`)
      : '';

    const postageLines = [
      'US POSTAGE PAID IMI',
      mailDate,
      ...(originZip ? [originZip] : []),
      ...(permitNum ? [permitNum] : []),
      rateType,
      ...(weightZone ? [weightZone] : []),
    ];

    ctx.font = '12px Helvetica';
    postageLines.forEach((line, i) => {
      ctx.fillText(line, L.postageX, L.postageY + i * L.postageLineH);
    });

    if (!data.litMode && data.returnName) {
      const retY = L.postageY + postageLines.length * L.postageLineH + 6;
      ctx.font = '11px Helvetica';
      ctx.fillText(String(data.returnName),         L.postageX, retY);
      if (data.returnAddress)      ctx.fillText(String(data.returnAddress),      L.postageX, retY + 13);
      if (data.returnCityStateZip) ctx.fillText(String(data.returnCityStateZip), L.postageX, retY + 26);
    }

    // Brand QR code (top-right of G-box)
    const qrSize = 100;
    const qrX = W - 80 - qrSize;
    const qrY = Math.round((L.gBoxBotY - qrSize) / 2);
    const qrBuffer = await generateBrandQR(tn || 'LABELMAKER');
    const qrImg = await loadImage(qrBuffer);
    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

  } else {
    if (!data.litMode && data.returnName) {
      ctx.fillStyle = '#000000';
      const fromFontSize = L.fromAddrFontSize ?? 14;
      const fromLineH    = L.fromAddrLineH    ?? 18;
      ctx.font = `${fromFontSize}px Helvetica`;
      const fax = L.fromAddrX ?? 190;
      const fay = L.fromAddrY ?? 97;
      ctx.fillText(String(data.returnName),         fax, fay);
      if (data.returnAddress)      ctx.fillText(String(data.returnAddress),      fax, fay + fromLineH);
      if (data.returnCityStateZip) ctx.fillText(String(data.returnCityStateZip), fax, fay + fromLineH * 2);
    }
  }

  // Sort code box — removeRG whites out the area; otherwise render if a sort code was entered
  if (data.removeRG) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(L.sortX - 4, L.sortY - 4, L.sortW + 8, L.sortH + 8);
    ctx.fillStyle = '#000000';
  } else {
    const sortCode = String(data.sortingCode || '').toUpperCase();
    if (sortCode) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(L.sortX - 4, L.sortY - 4, L.sortW + 8, L.sortH + 8);
      ctx.fillStyle = '#000000';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth   = 2;
      ctx.strokeRect(L.sortX, L.sortY, L.sortW, L.sortH);
      ctx.font = `bold ${Math.round(L.sortH * 0.58)}px HelveticaBold`;
      const m = ctx.measureText(sortCode);
      ctx.fillText(sortCode, L.sortX + (L.sortW - m.width) / 2, L.sortY + L.sortH * 0.73);
    }
  }

  ctx.fillStyle = '#000000';
  ctx.font = 'bold 22px HelveticaBold';
  ctx.fillText((data.shipToName || '').toUpperCase(), 30, L.addrY);

  ctx.font = '20px Helvetica';
  let addrLineCount: number;
  if (addr2) {
    ctx.fillText((data.shipToAddress || '').toUpperCase(), 30, L.addrY + L.addrLineH);
    ctx.fillText(addr2,                                    30, L.addrY + L.addrLineH * 2);
    ctx.fillText(`${city}, ${state} ${zip}`,               30, L.addrY + L.addrLineH * 3);
    addrLineCount = 3;
  } else {
    ctx.fillText((data.shipToAddress || '').toUpperCase(), 30, L.addrY + L.addrLineH);
    ctx.fillText(`${city}, ${state} ${zip}`,               30, L.addrY + L.addrLineH * 2);
    addrLineCount = 2;
  }

  let extraLineY = L.addrY + L.addrLineH * (addrLineCount + 1);
  if (data.customPhone) {
    ctx.font = '18px Helvetica';
    ctx.fillText(String(data.customPhone), 30, extraLineY);
    extraLineY += 22;
  }
  if (data.customReference) {
    ctx.font = '14px Helvetica';
    ctx.fillText(`REF: ${data.customReference}`, 30, extraLineY);
  }

  // For services with a postage block (dividerX > 0), weight is already rendered
  // inside that block via weightZone. Only add the secondary weight text for
  // services without a postage block (Priority Mail, First Class, etc.).
  if (!data.removeWeight && data.weight && L.dividerX === 0) {
    ctx.font = 'bold 20px HelveticaBold';
    ctx.fillText(`${data.weight} LB`, L.weightX, L.weightY);
  }

  await pasteBarcode(ctx, tn, 30, L.barcodeY, L.barcodeMaxW ?? (W - 60), L.barcodeH);

  ctx.fillStyle = '#000000';
  ctx.font = 'bold 15px HelveticaBold';
  ctx.fillText(formattedTracking, 30, L.trackingNumY);

  return canvas;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function generateLabelBuffer(data: Record<string, any>, preview = false): Promise<Buffer> {
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
      throw new Error(`Carrier "${data.carrier}" not supported`);
  }

  if (preview) {
    const ctx = canvas.getContext('2d');
    applyWatermark(canvas, ctx);
  }

  return canvas.encode('png') as Promise<Buffer>;
}
