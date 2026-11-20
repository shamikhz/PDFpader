import fs from 'fs';
import path from 'path';

const userPngPath = 'C:/Users/shami/.gemini/antigravity/brain/4a30fffa-0898-4e35-8db2-f83edaad9927/.user_uploaded/media_1795183641973_1017863c.png';
const pngBuffer = fs.readFileSync(userPngPath);

// Create valid ICO binary containing PNG image (Vista+ standard format)
function createIco(pngBuf, width, height) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // 1 = ICO
  header.writeUInt16LE(1, 4); // 1 image

  const dirEntry = Buffer.alloc(16);
  dirEntry.writeUInt8(width >= 256 ? 0 : width, 0);
  dirEntry.writeUInt8(height >= 256 ? 0 : height, 1);
  dirEntry.writeUInt8(0, 2); // Colors
  dirEntry.writeUInt8(0, 3); // Reserved
  dirEntry.writeUInt16LE(1, 4); // Planes
  dirEntry.writeUInt16LE(32, 6); // Bits per pixel
  dirEntry.writeUInt32LE(pngBuf.length, 8); // Size of PNG
  dirEntry.writeUInt32LE(22, 12); // Offset = 6 + 16 = 22

  return Buffer.concat([header, dirEntry, pngBuf]);
}

const icoBuffer = createIco(pngBuffer, 48, 48);

// Ensure directories exist
fs.mkdirSync('public', { recursive: true });
fs.mkdirSync('src/app', { recursive: true });

// Write ICO files
fs.writeFileSync('public/favicon.ico', icoBuffer);
fs.writeFileSync('src/app/favicon.ico', icoBuffer);
console.log('✓ Created public/favicon.ico and src/app/favicon.ico');

// Write PNG files
fs.writeFileSync('public/icon.png', pngBuffer);
fs.writeFileSync('src/app/icon.png', pngBuffer);
fs.writeFileSync('public/apple-icon.png', pngBuffer);
fs.writeFileSync('src/app/apple-icon.png', pngBuffer);
console.log('✓ Created public/icon.png and src/app/icon.png');

// Vector SVG icon matched exactly to the user squircle
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <defs>
    <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fb923c" />
      <stop offset="50%" stop-color="#f97316" />
      <stop offset="100%" stop-color="#ea580c" />
    </linearGradient>
  </defs>
  <rect x="1.5" y="1.5" width="29" height="29" rx="8" fill="url(#brandGrad)" />
  <g transform="translate(6, 6) scale(0.833)" stroke="#ffffff" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <path d="m3 15 2 2 4-4" />
  </g>
</svg>
`;

fs.writeFileSync('src/app/icon.svg', svgContent);
fs.writeFileSync('public/icon.svg', svgContent);
fs.writeFileSync('src/app/apple-icon.svg', svgContent);
console.log('✓ Created vector SVGs for icon and apple-icon');
