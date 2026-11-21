import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { execFileSync } from "node:child_process";

// 1. Master SVG matching the website's brand icon:
// Rounded squircle + warm gradient (orange-600 to orange-500 to amber-500) + Lucide FileCheck2 outline
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <defs>
    <linearGradient id="brandGrad" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ea580c" />
      <stop offset="50%" stop-color="#f97316" />
      <stop offset="100%" stop-color="#f59e0b" />
    </linearGradient>
  </defs>
  <!-- Squircle rounded rectangle (26% radius matches Tailwind rounded-xl) -->
  <rect x="3" y="3" width="94" height="94" rx="26" ry="26" fill="url(#brandGrad)" />
  <!-- Crisp white Lucide FileCheck2 icon, perfectly centered and proportioned -->
  <g transform="translate(20, 20) scale(2.5)" stroke="#ffffff" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <path d="m3 15 2 2 4-4" />
  </g>
</svg>`;

// CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(12 + len);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, "ascii");
  data.copy(buf, 8);
  const crcVal = crc32(buf.subarray(4, 8 + len));
  buf.writeUInt32BE(crcVal, 8 + len);
  return buf;
}

// Encode raw RGBA buffer to valid PNG
function encodePng(width, height, rgba) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const scanlines = Buffer.alloc(height * (1 + width * 4));
  let inOffset = 0;
  let outOffset = 0;
  for (let y = 0; y < height; y++) {
    scanlines[outOffset++] = 0; // Filter: None
    rgba.copy(scanlines, outOffset, inOffset, inOffset + width * 4);
    outOffset += width * 4;
    inOffset += width * 4;
  }

  const compressed = zlib.deflateSync(scanlines, { level: 9 });
  return Buffer.concat([
    sig,
    makeChunk("IHDR", ihdr),
    makeChunk("IDAT", compressed),
    makeChunk("IEND", Buffer.alloc(0)),
  ]);
}

// Decode PNG to raw RGBA
function decodePng(buf) {
  let offset = 8;
  let width = 0;
  let height = 0;
  const idats = [];

  while (offset < buf.length) {
    const len = buf.readUInt32BE(offset);
    const type = buf.toString("ascii", offset + 4, offset + 8);
    if (type === "IHDR") {
      width = buf.readUInt32BE(offset + 8);
      height = buf.readUInt32BE(offset + 12);
    } else if (type === "IDAT") {
      idats.push(buf.subarray(offset + 8, offset + 8 + len));
    }
    offset += 12 + len;
  }

  const decomp = zlib.inflateSync(Buffer.concat(idats));
  const rgba = Buffer.alloc(width * height * 4);
  let srcPos = 0;
  let dstPos = 0;
  const rowBytes = width * 4;

  for (let y = 0; y < height; y++) {
    const filter = decomp[srcPos++];
    // Chrome screenshot with transparent background uses None filter (0) or Sub/Up
    // Handle unfilter properly
    if (filter === 0) {
      decomp.copy(rgba, dstPos, srcPos, srcPos + rowBytes);
    } else if (filter === 1) { // Sub
      for (let x = 0; x < rowBytes; x++) {
        const left = x >= 4 ? rgba[dstPos + x - 4] : 0;
        rgba[dstPos + x] = (decomp[srcPos + x] + left) & 0xff;
      }
    } else if (filter === 2) { // Up
      for (let x = 0; x < rowBytes; x++) {
        const up = y > 0 ? rgba[dstPos - rowBytes + x] : 0;
        rgba[dstPos + x] = (decomp[srcPos + x] + up) & 0xff;
      }
    } else if (filter === 3) { // Average
      for (let x = 0; x < rowBytes; x++) {
        const left = x >= 4 ? rgba[dstPos + x - 4] : 0;
        const up = y > 0 ? rgba[dstPos - rowBytes + x] : 0;
        rgba[dstPos + x] = (decomp[srcPos + x] + Math.floor((left + up) / 2)) & 0xff;
      }
    } else if (filter === 4) { // Paeth
      for (let x = 0; x < rowBytes; x++) {
        const a = x >= 4 ? rgba[dstPos + x - 4] : 0;
        const b = y > 0 ? rgba[dstPos - rowBytes + x] : 0;
        const c = (x >= 4 && y > 0) ? rgba[dstPos - rowBytes + x - 4] : 0;
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        let pr = c;
        if (pa <= pb && pa <= pc) pr = a;
        else if (pb <= pc) pr = b;
        rgba[dstPos + x] = (decomp[srcPos + x] + pr) & 0xff;
      }
    }
    srcPos += rowBytes;
    dstPos += rowBytes;
  }

  return { width, height, rgba };
}

// High-quality box/area-averaging downsampler with premultiplied alpha
function resampleRgba(src, srcW, srcH, dstW, dstH) {
  const dst = Buffer.alloc(dstW * dstH * 4);
  const scaleX = srcW / dstW;
  const scaleY = srcH / dstH;

  for (let dy = 0; dy < dstH; dy++) {
    const syStart = dy * scaleY;
    const syEnd = (dy + 1) * scaleY;
    const y0 = Math.floor(syStart);
    const y1 = Math.min(Math.ceil(syEnd), srcH);

    for (let dx = 0; dx < dstW; dx++) {
      const sxStart = dx * scaleX;
      const sxEnd = (dx + 1) * scaleX;
      const x0 = Math.floor(sxStart);
      const x1 = Math.min(Math.ceil(sxEnd), srcW);

      let totalWeight = 0;
      let sumR = 0;
      let sumG = 0;
      let sumB = 0;
      let sumA = 0;

      for (let y = y0; y < y1; y++) {
        const yWeight = Math.min(y + 1, syEnd) - Math.max(y, syStart);
        if (yWeight <= 0) continue;

        for (let x = x0; x < x1; x++) {
          const xWeight = Math.min(x + 1, sxEnd) - Math.max(x, sxStart);
          if (xWeight <= 0) continue;

          const weight = xWeight * yWeight;
          const idx = (y * srcW + x) * 4;
          const r = src[idx];
          const g = src[idx + 1];
          const b = src[idx + 2];
          const a = src[idx + 3] / 255;

          // Premultiplied alpha weighting for smooth edges without dark halos
          sumR += r * a * weight;
          sumG += g * a * weight;
          sumB += b * a * weight;
          sumA += a * weight;
          totalWeight += weight;
        }
      }

      const dstIdx = (dy * dstW + dx) * 4;
      if (sumA > 0.0001) {
        const finalA = Math.min(255, Math.round((sumA / totalWeight) * 255));
        const norm = sumA; // un-premultiply
        dst[dstIdx] = Math.min(255, Math.max(0, Math.round(sumR / norm)));
        dst[dstIdx + 1] = Math.min(255, Math.max(0, Math.round(sumG / norm)));
        dst[dstIdx + 2] = Math.min(255, Math.max(0, Math.round(sumB / norm)));
        dst[dstIdx + 3] = finalA;
      } else {
        dst[dstIdx] = 0;
        dst[dstIdx + 1] = 0;
        dst[dstIdx + 2] = 0;
        dst[dstIdx + 3] = 0;
      }
    }
  }

  return dst;
}

// Build Windows multi-image ICO container embedding exact PNGs
function createIco(pngEntries) {
  const count = pngEntries.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  let offset = headerSize + count * dirEntrySize;

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // 1 = ICO
  header.writeUInt16LE(count, 4);

  const dirEntries = [];
  for (const entry of pngEntries) {
    const dir = Buffer.alloc(dirEntrySize);
    dir.writeUInt8(entry.width === 256 ? 0 : entry.width, 0);
    dir.writeUInt8(entry.height === 256 ? 0 : entry.height, 1);
    dir.writeUInt8(0, 2); // palette
    dir.writeUInt8(0, 3); // reserved
    dir.writeUInt16LE(1, 4); // planes
    dir.writeUInt16LE(32, 6); // bpp
    dir.writeUInt32LE(entry.data.length, 8); // size
    dir.writeUInt32LE(offset, 12); // offset
    dirEntries.push(dir);
    offset += entry.data.length;
  }

  return Buffer.concat([header, ...dirEntries, ...pngEntries.map((e) => e.data)]);
}

async function main() {
  const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  const tmpDir = path.resolve("scripts", ".tmp_favicons");
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  const htmlPath = path.join(tmpDir, "icon.html");
  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100vw; height: 100vh; overflow: hidden; background: transparent; }
    svg { display: block; width: 100%; height: 100%; }
  </style>
</head>
<body>
  ${svgContent}
</body>
</html>`;
  fs.writeFileSync(htmlPath, htmlContent, "utf8");

  // Render high-res 512x512 master PNG using headless Chrome
  const masterPngPath = path.join(tmpDir, "master-512.png");
  console.log("Rendering 512x512 master from SVG via Chrome...");
  execFileSync(chromePath, [
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--default-background-color=00000000",
    "--window-size=512,512",
    `--screenshot=${masterPngPath}`,
    `file://${htmlPath.replace(/\\/g, "/")}`,
  ]);

  const masterBuf = fs.readFileSync(masterPngPath);
  console.log(`Rendered master PNG: ${masterBuf.length} bytes`);

  // Decode master RGBA
  const { width: srcW, height: srcH, rgba: srcRgba } = decodePng(masterBuf);
  console.log(`Decoded master RGBA: ${srcW}x${srcH}, ${srcRgba.length} bytes`);

  // Generate downsampled icons
  const targetSizes = [16, 32, 48, 180, 192, 512];
  const pngs = {};

  for (const s of targetSizes) {
    if (s === 512) {
      pngs[512] = encodePng(512, 512, srcRgba);
    } else {
      const downsampledRgba = resampleRgba(srcRgba, srcW, srcH, s, s);
      pngs[s] = encodePng(s, s, downsampledRgba);
    }
    console.log(`Generated ${s}x${s} PNG: ${pngs[s].length} bytes`);
  }

  // Create multi-resolution Windows ICO (16, 32, 48)
  const icoBuffer = createIco([
    { width: 16, height: 16, data: pngs[16] },
    { width: 32, height: 32, data: pngs[32] },
    { width: 48, height: 48, data: pngs[48] },
  ]);
  console.log(`Created multi-resolution ICO (16, 32, 48): ${icoBuffer.length} bytes`);

  // Write files to both public and src/app directories
  const targetDirs = ["public", "src/app"];

  for (const d of targetDirs) {
    const dirPath = path.resolve(d);
    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });

    // favicon.ico
    fs.writeFileSync(path.join(dirPath, "favicon.ico"), icoBuffer);

    // icon.svg
    fs.writeFileSync(path.join(dirPath, "icon.svg"), svgContent.trim(), "utf8");

    // icon.png (32x32 standard web icon)
    fs.writeFileSync(path.join(dirPath, "icon.png"), pngs[32]);

    // apple-icon.png (180x180 standard Apple Touch Icon)
    fs.writeFileSync(path.join(dirPath, "apple-icon.png"), pngs[180]);

    // apple-icon.svg
    fs.writeFileSync(path.join(dirPath, "apple-icon.svg"), svgContent.trim(), "utf8");
  }

  // Also write PWA 192 and 512 to public
  fs.writeFileSync(path.join("public", "icon-192.png"), pngs[192]);
  fs.writeFileSync(path.join("public", "icon-512.png"), pngs[512]);

  // Clean up tmpDir
  fs.rmSync(tmpDir, { recursive: true, force: true });
  console.log("SUCCESS: All favicon and web icon assets generated and placed in public/ and src/app/!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
