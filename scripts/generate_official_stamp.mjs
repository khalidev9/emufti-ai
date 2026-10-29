import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Ensure public/images directory exists
const imagesDir = path.resolve('./public/images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// 1. Generate Crisp Official Transparent SVG Stamp
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <defs>
    <!-- Circular Paths for curved text -->
    <path id="topCurve" d="M 50,200 A 150,150 0 1,1 350,200" fill="none" />
    <path id="bottomCurve" d="M 350,200 A 150,150 0 0,1 50,200" fill="none" />
    <path id="innerTopCurve" d="M 75,200 A 125,125 0 1,1 325,200" fill="none" />
    <path id="innerBottomCurve" d="M 325,200 A 125,125 0 0,1 75,200" fill="none" />
    
    <filter id="subtleStamp" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" xChannelSelector="R" yChannelSelector="G" />
    </filter>
  </defs>

  <!-- Transparent Background Group -->
  <g fill="none" stroke="#1e3a8a" stroke-linecap="round" stroke-linejoin="round" transform="rotate(-5 200 200)">
    <!-- Scalloped / Toothed Outer Border -->
    <circle cx="200" cy="200" r="190" stroke="#b45309" stroke-width="2.5" stroke-dasharray="3,3" opacity="0.85" />
    
    <!-- Outer Main Ring -->
    <circle cx="200" cy="200" r="182" stroke="#1e3a8a" stroke-width="5" />
    <circle cx="200" cy="200" r="174" stroke="#d97706" stroke-width="1.8" />
    
    <!-- Middle Separator Ring -->
    <circle cx="200" cy="200" r="126" stroke="#d97706" stroke-width="1.8" />
    <circle cx="200" cy="200" r="118" stroke="#1e3a8a" stroke-width="3.5" />

    <!-- Inner Core Circle -->
    <circle cx="200" cy="200" r="92" stroke="#1e3a8a" stroke-width="1.5" stroke-dasharray="4,2" />

    <!-- Stars on Sides -->
    <path d="M 42,200 L 46,192 L 54,192 L 48,197 L 50,205 L 42,200 Z" fill="#d97706" stroke="none" />
    <path d="M 358,200 L 354,192 L 346,192 L 352,197 L 350,205 L 358,200 Z" fill="#d97706" stroke="none" />

    <!-- Top Text along curve -->
    <text font-family="Arial, Helvetica, sans-serif" font-size="14.5" font-weight="900" fill="#1e3a8a" letter-spacing="3.5">
      <textPath href="#topCurve" startOffset="50%" text-anchor="middle">
        ★ EMUFTI AI ISLAMIC PLATFORM ★
      </textPath>
    </text>

    <!-- Bottom Text along curve -->
    <text font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="800" fill="#b45309" letter-spacing="2.5">
      <textPath href="#bottomCurve" startOffset="50%" text-anchor="middle">
        OFFICIAL KHATM SEAL • XAQIIJIN RASMI AH
      </textPath>
    </text>

    <!-- Center Seal Content -->
    <!-- Crescent & Star -->
    <g transform="translate(182, 122) scale(0.9)">
      <circle cx="20" cy="20" r="16" fill="#1e3a8a" />
      <circle cx="25" cy="17" r="13" fill="#ffffff" />
      <polygon points="26,16 28,21 33,21 29,24 31,29 26,26 22,29 24,24 20,21 25,21" fill="#d97706" />
    </g>

    <!-- Arabic Calligraphy Text in Center -->
    <text x="200" y="180" font-family="'Traditional Arabic', 'Amiri', serif" font-size="21" font-weight="bold" fill="#1e3a8a" text-anchor="middle" letter-spacing="1">
      خَتْمُ القُرْآنِ الكَرِيمِ
    </text>

    <!-- Center Ribbon / Banner -->
    <rect x="110" y="196" width="180" height="28" rx="5" fill="#1e3a8a" stroke="#d97706" stroke-width="2" />
    <text x="200" y="215" font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="2">
      VERIFIED &amp; APPROVED
    </text>

    <!-- Bottom Center Sub-text -->
    <text x="200" y="246" font-family="Arial, Helvetica, sans-serif" font-size="10.5" font-weight="bold" fill="#b45309" text-anchor="middle" letter-spacing="1.5">
      SHAHAADO RASMI AH
    </text>

    <text x="200" y="264" font-family="Arial, Helvetica, sans-serif" font-size="9" font-weight="bold" fill="#1e3a8a" text-anchor="middle" letter-spacing="1">
      ★ 100% AUTHENTIC KHATM ★
    </text>

    <!-- Decorative inner flourishes -->
    <circle cx="200" cy="280" r="3" fill="#d97706" stroke="none" />
  </g>
</svg>`;

fs.writeFileSync(path.resolve('./public/images/official-stamp.svg'), svgContent, 'utf-8');
console.log('✓ Created public/images/official-stamp.svg');

// 2. Generate a valid PNG with true transparency (RGBA)
// We create a clean circular stamp directly into a 320x320 PNG
const width = 320;
const height = 320;
const rgba = Buffer.alloc(width * height * 4, 0); // initial alpha 0 (transparent)

function setPixel(x, y, r, g, b, a) {
  if (x < 0 || x >= width || y < 0 || y >= height) return;
  const idx = (y * width + x) * 4;
  rgba[idx] = r;
  rgba[idx + 1] = g;
  rgba[idx + 2] = b;
  rgba[idx + 3] = a;
}

function drawCircleOutline(cx, cy, r, strokeWidth, rC, gC, bC, aC) {
  for (let y = Math.max(0, Math.floor(cy - r - strokeWidth)); y <= Math.min(height - 1, Math.ceil(cy + r + strokeWidth)); y++) {
    for (let x = Math.max(0, Math.floor(cx - r - strokeWidth)); x <= Math.min(width - 1, Math.ceil(cx + r + strokeWidth)); x++) {
      const d = Math.hypot(x - cx, y - cy);
      const diff = Math.abs(d - r);
      if (diff <= strokeWidth / 2) {
        const factor = 1 - (diff / (strokeWidth / 2));
        setPixel(x, y, rC, gC, bC, Math.round(aC * Math.min(1, factor * 1.5)));
      }
    }
  }
}

function fillCircle(cx, cy, r, rC, gC, bC, aC) {
  for (let y = Math.max(0, Math.floor(cy - r)); y <= Math.min(height - 1, Math.ceil(cy + r)); y++) {
    for (let x = Math.max(0, Math.floor(cx - r)); x <= Math.min(width - 1, Math.ceil(cx + r)); x++) {
      const d = Math.hypot(x - cx, y - cy);
      if (d <= r) {
        setPixel(x, y, rC, gC, bC, aC);
      }
    }
  }
}

function fillRect(rx, ry, rw, rh, rC, gC, bC, aC) {
  for (let y = Math.max(0, ry); y < Math.min(height, ry + rh); y++) {
    for (let x = Math.max(0, rx); x < Math.min(width, rx + rw); x++) {
      setPixel(x, y, rC, gC, bC, aC);
    }
  }
}

const cx = width / 2;
const cy = height / 2;

// Draw layered circular stamp seals
// Outer scalloped ring
for (let angle = 0; angle < Math.PI * 2; angle += 0.05) {
  const toothR = 152 + Math.sin(angle * 48) * 2;
  const tx = Math.round(cx + Math.cos(angle) * toothR);
  const ty = Math.round(cy + Math.sin(angle) * toothR);
  setPixel(tx, ty, 180, 83, 9, 210); // Amber/gold
}

// Outer solid rings
drawCircleOutline(cx, cy, 146, 3.5, 30, 58, 138, 240); // Royal blue #1E3A8A
drawCircleOutline(cx, cy, 140, 1.5, 217, 119, 6, 220); // Gold #D97706
drawCircleOutline(cx, cy, 102, 1.5, 217, 119, 6, 220);
drawCircleOutline(cx, cy, 96, 2.5, 30, 58, 138, 240);
drawCircleOutline(cx, cy, 74, 1.2, 30, 58, 138, 180);

// Stars at 9 o'clock and 3 o'clock
fillCircle(cx - 120, cy, 4, 217, 119, 6, 240);
fillCircle(cx + 120, cy, 4, 217, 119, 6, 240);

// Center Banner
fillRect(cx - 72, cy - 12, 144, 24, 30, 58, 138, 230); // Banner blue
drawCircleOutline(cx, cy - 35, 12, 2, 217, 119, 6, 220); // Crescent ring

// Little dots around ring
for (let i = 0; i < 36; i++) {
  const a = (i / 36) * Math.PI * 2;
  const px = Math.round(cx + Math.cos(a) * 85);
  const py = Math.round(cy + Math.sin(a) * 85);
  fillCircle(px, py, 1.2, 30, 58, 138, 190);
}

// Convert RGBA buffer to valid PNG format
function createPng(width, height, rgbaBuffer) {
  // Each scanline begins with filter byte 0
  const scanlineWidth = width * 4 + 1;
  const rawData = Buffer.alloc(height * scanlineWidth);
  for (let y = 0; y < height; y++) {
    rawData[y * scanlineWidth] = 0; // Filter None
    rgbaBuffer.copy(rawData, y * scanlineWidth + 1, y * width * 4, (y + 1) * width * 4);
  }

  const compressedData = zlib.deflateSync(rawData, { level: 9 });

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth: 8
  ihdrData[9] = 6; // Color type: 6 (RGBA)
  ihdrData[10] = 0; // Compression
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Interlace: None

  function makeChunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(4 + 4 + len + 4);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4, 4, 'ascii');
    data.copy(buf, 8);
    // CRC calculation
    const crc = crc32(buf.subarray(4, 8 + len));
    buf.writeInt32BE(crc, 8 + len);
    return buf;
  }

  // Precomputed CRC table
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    crcTable[n] = c;
  }

  function crc32(buf) {
    let crc = -1;
    for (let i = 0; i < buf.length; i++) {
      crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
    }
    return crc ^ -1;
  }

  const ihdrChunk = makeChunk('IHDR', ihdrData);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const pngBuffer = createPng(width, height, rgba);
fs.writeFileSync(path.resolve('./public/images/official-stamp.png'), pngBuffer);
console.log('✓ Created public/images/official-stamp.png with transparent background (' + pngBuffer.length + ' bytes)');
