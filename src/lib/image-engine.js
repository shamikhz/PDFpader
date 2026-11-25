/**
 * High-Performance Client-Side Image Processing Engine
 * Features GPU canvas memory management, chunked operations, and object URL cleanup.
 */

/**
 * Loads a File or Blob into an HTMLImageElement for Canvas rendering.
 * Automatically cleans up the object URL and detached DOM nodes on load/error.
 */
export function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image: " + err.message));
    };
    img.src = url;
  });
}

/**
 * Helper to deallocate HTMLCanvasElement GPU backing buffer immediately.
 */
function cleanupCanvas(canvas) {
  if (canvas) {
    canvas.width = 0;
    canvas.height = 0;
  }
}

/**
 * Compresses an image with a specified quality level (0.01 to 1.0).
 */
export async function compressImage(file, quality = 0.75, onProgress = () => { }) {
  onProgress(20);
  const img = await loadImage(file);
  onProgress(50);

  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);

  onProgress(80);
  const targetType = file.type === "image/png" ? "image/webp" : file.type || "image/jpeg";

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        cleanupCanvas(canvas);
        onProgress(100);
        resolve({
          blob,
          originalSize: file.size,
          compressedSize: blob.size,
          savedBytes: file.size - blob.size,
          savedPercentage: Math.max(0, Math.round(((file.size - blob.size) / file.size) * 100)),
          url: URL.createObjectURL(blob),
          type: targetType,
        });
      },
      targetType,
      quality
    );
  });
}

/**
 * Resizes an image by explicit dimensions or percentage.
 */
export async function resizeImage(file, { width, height, maintainAspect = true }, onProgress = () => { }) {
  onProgress(20);
  const img = await loadImage(file);
  onProgress(50);

  let targetWidth = width || img.naturalWidth;
  let targetHeight = height || img.naturalHeight;

  if (maintainAspect) {
    const ratio = img.naturalWidth / img.naturalHeight;
    if (width && !height) {
      targetHeight = Math.round(width / ratio);
    } else if (height && !width) {
      targetWidth = Math.round(height * ratio);
    }
  }

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  onProgress(80);
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      cleanupCanvas(canvas);
      onProgress(100);
      resolve({
        blob,
        width: targetWidth,
        height: targetHeight,
        url: URL.createObjectURL(blob),
      });
    }, file.type || "image/png");
  });
}

/**
 * Converts image to target format: image/png, image/jpeg, image/webp.
 */
export async function convertImage(file, targetMimeType = "image/webp", quality = 0.9, onProgress = () => { }) {
  onProgress(20);
  const img = await loadImage(file);
  onProgress(50);

  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;

  const ctx = canvas.getContext("2d");
  if (targetMimeType === "image/jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(img, 0, 0);

  onProgress(80);
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        cleanupCanvas(canvas);
        onProgress(100);
        resolve({
          blob,
          url: URL.createObjectURL(blob),
          size: blob.size,
          type: targetMimeType,
        });
      },
      targetMimeType,
      quality
    );
  });
}

/**
 * Crops an image to specific coordinates { x, y, width, height }.
 */
export async function cropImage(file, { x = 0, y = 0, width, height }, onProgress = () => { }) {
  onProgress(20);
  const img = await loadImage(file);
  onProgress(50);

  const safeX = Math.max(0, Math.min(img.naturalWidth - 1, Math.round(x || 0)));
  const safeY = Math.max(0, Math.min(img.naturalHeight - 1, Math.round(y || 0)));
  const safeW = Math.max(1, Math.min(img.naturalWidth - safeX, Math.round(width || img.naturalWidth)));
  const safeH = Math.max(1, Math.min(img.naturalHeight - safeY, Math.round(height || img.naturalHeight)));

  const canvas = document.createElement("canvas");
  canvas.width = safeW;
  canvas.height = safeH;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, safeX, safeY, safeW, safeH, 0, 0, safeW, safeH);

  onProgress(80);
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      cleanupCanvas(canvas);
      onProgress(100);
      resolve({
        blob,
        url: URL.createObjectURL(blob),
        width: safeW,
        height: safeH,
      });
    }, file.type || "image/png");
  });
}

/**
 * Rotates and/or flips an image.
 */
export async function rotateAndFlipImage(file, angle = 90, flipH = false, flipV = false, onProgress = () => { }) {
  onProgress(20);
  const img = await loadImage(file);
  onProgress(50);

  const canvas = document.createElement("canvas");
  const isPerpendicular = angle === 90 || angle === 270;
  canvas.width = isPerpendicular ? img.naturalHeight : img.naturalWidth;
  canvas.height = isPerpendicular ? img.naturalWidth : img.naturalHeight;

  const ctx = canvas.getContext("2d");
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((angle * Math.PI) / 180);
  ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
  ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

  onProgress(80);
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      cleanupCanvas(canvas);
      onProgress(100);
      resolve({
        blob,
        url: URL.createObjectURL(blob),
      });
    }, file.type || "image/png");
  });
}

/**
 * Calculates print dimensions from pixel resolution and DPI.
 */
export function calculatePrintDimensions(pixelsWidth, pixelsHeight, dpi = 300) {
  const inchesWidth = (pixelsWidth / dpi).toFixed(2);
  const inchesHeight = (pixelsHeight / dpi).toFixed(2);
  const cmWidth = ((pixelsWidth / dpi) * 2.54).toFixed(2);
  const cmHeight = ((pixelsHeight / dpi) * 2.54).toFixed(2);
  const mmWidth = ((pixelsWidth / dpi) * 25.4).toFixed(1);
  const mmHeight = ((pixelsHeight / dpi) * 25.4).toFixed(1);

  return {
    dpi,
    inches: `${inchesWidth} × ${inchesHeight} in`,
    cm: `${cmWidth} × ${cmHeight} cm`,
    mm: `${mmWidth} × ${mmHeight} mm`,
    megapixels: ((pixelsWidth * pixelsHeight) / 1000000).toFixed(2) + " MP",
    printQuality: dpi >= 300 ? "Photo Quality (Crisp)" : dpi >= 150 ? "Standard Print (Good)" : "Draft / Screen Only",
  };
}

/**
 * Lightweight client-side JPEG EXIF parser (no external dependencies).
 * Extracts common camera, timestamp, and GPS tags if present.
 */
function parseJpegExif(arrayBuffer) {
  const view = new DataView(arrayBuffer);
  if (view.byteLength < 12 || view.getUint16(0, false) !== 0xffd8) {
    return null;
  }

  let offset = 2;
  while (offset + 4 < view.byteLength) {
    const marker = view.getUint16(offset, false);
    offset += 2;
    if (marker === 0xffe1) {
      // APP1 EXIF header
      if (offset + 8 > view.byteLength) break;
      const exifHeader =
        String.fromCharCode(
          view.getUint8(offset + 2),
          view.getUint8(offset + 3),
          view.getUint8(offset + 4),
          view.getUint8(offset + 5)
        );
      if (exifHeader !== "Exif") break;

      const tiffStart = offset + 8;
      if (tiffStart + 8 > view.byteLength) break;
      const littleEndian = view.getUint16(tiffStart, false) === 0x4949;
      const firstIfdOffset = view.getUint32(tiffStart + 4, littleEndian);

      const readAscii = (valOffset, count) => {
        if (tiffStart + valOffset + count > view.byteLength) return "";
        let str = "";
        for (let i = 0; i < count - 1; i++) {
          const code = view.getUint8(tiffStart + valOffset + i);
          if (code === 0) break;
          str += String.fromCharCode(code);
        }
        return str.trim();
      };

      const readRational = (valOffset) => {
        if (tiffStart + valOffset + 8 > view.byteLength) return null;
        const num = view.getUint32(tiffStart + valOffset, littleEndian);
        const den = view.getUint32(tiffStart + valOffset + 4, littleEndian);
        return den ? num / den : null;
      };

      const readIfd = (ifdRelOffset) => {
        const dirStart = tiffStart + ifdRelOffset;
        if (dirStart + 2 > view.byteLength) return {};
        const entries = view.getUint16(dirStart, littleEndian);
        const tags = {};
        for (let i = 0; i < entries; i++) {
          const entryOffset = dirStart + 2 + i * 12;
          if (entryOffset + 12 > view.byteLength) break;
          const tag = view.getUint16(entryOffset, littleEndian);
          const type = view.getUint16(entryOffset + 2, littleEndian);
          const count = view.getUint32(entryOffset + 4, littleEndian);
          const valueOffset = entryOffset + 8;
          const rawVal = view.getUint32(valueOffset, littleEndian);

          if (type === 2) {
            // ASCII
            const str =
              count <= 4
                ? String.fromCharCode(
                  ...[0, 1, 2, 3].slice(0, count - 1).map((k) => view.getUint8(valueOffset + k))
                ).replace(/\0/g, "").trim()
                : readAscii(rawVal, count);
            tags[tag] = str;
          } else if (type === 3) {
            tags[tag] = view.getUint16(valueOffset, littleEndian);
          } else if (type === 4) {
            tags[tag] = rawVal;
          } else if (type === 5) {
            if (count === 1) {
              tags[tag] = readRational(rawVal);
            } else if (count === 3) {
              tags[tag] = [
                readRational(rawVal),
                readRational(rawVal + 8),
                readRational(rawVal + 16),
              ];
            }
          }
        }
        return tags;
      };

      const ifd0 = readIfd(firstIfdOffset);
      const exifIfd = ifd0[0x8769] ? readIfd(ifd0[0x8769]) : {};
      const gpsIfd = ifd0[0x8825] ? readIfd(ifd0[0x8825]) : {};

      const exif = {};
      if (ifd0[0x010f]) exif.cameraMake = ifd0[0x010f];
      if (ifd0[0x0110]) exif.cameraModel = ifd0[0x0110];
      if (ifd0[0x0131]) exif.software = ifd0[0x0131];
      if (exifIfd[0x9003] || ifd0[0x0132]) exif.dateTaken = exifIfd[0x9003] || ifd0[0x0132];
      if (exifIfd[0x8827]) exif.iso = exifIfd[0x8827];
      if (exifIfd[0x829d]) exif.aperture = `f/${Number(exifIfd[0x829d]).toFixed(1)}`;
      if (exifIfd[0x829a]) {
        const exp = exifIfd[0x829a];
        exif.exposureTime = exp < 1 ? `1/${Math.round(1 / exp)}s` : `${exp.toFixed(1)}s`;
      }
      if (exifIfd[0x920a]) exif.focalLength = `${Math.round(exifIfd[0x920a])}mm`;

      if (Array.isArray(gpsIfd[0x0002]) && Array.isArray(gpsIfd[0x0004])) {
        const toDeg = (dms, ref) => {
          if (!dms || dms.some((v) => v === null)) return null;
          let deg = dms[0] + dms[1] / 60 + dms[2] / 3600;
          if (ref === "S" || ref === "W") deg = -deg;
          return Number(deg.toFixed(6));
        };
        const lat = toDeg(gpsIfd[0x0002], gpsIfd[0x0001]);
        const lon = toDeg(gpsIfd[0x0004], gpsIfd[0x0003]);
        if (lat !== null && lon !== null) {
          exif.gps = `${lat}, ${lon}`;
        }
      }

      return Object.keys(exif).length > 0 ? exif : null;
    } else if ((marker & 0xff00) !== 0xff00) {
      break;
    } else {
      if (offset + 2 > view.byteLength) break;
      const segLen = view.getUint16(offset, false);
      offset += segLen;
    }
  }
  return null;
}

/**
 * Gets image metadata including dimensions, aspect ratio, and JPEG EXIF tags.
 */
export async function getImageMetadata(file) {
  const [img, buffer] = await Promise.all([loadImage(file), file.arrayBuffer()]);
  const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(img.naturalWidth, img.naturalHeight);
  const aspect = `${img.naturalWidth / divisor}:${img.naturalHeight / divisor}`;
  const exif = parseJpegExif(buffer);

  return {
    name: file.name,
    size: file.size,
    type: file.type || "image/unknown",
    width: img.naturalWidth,
    height: img.naturalHeight,
    aspectRatio: aspect,
    megapixels: ((img.naturalWidth * img.naturalHeight) / 1000000).toFixed(2) + " MP",
    lastModified: new Date(file.lastModified).toLocaleString(),
    exif,
  };
}

/**
 * Strips all embedded EXIF/XMP/IPTC metadata by re-rendering the image onto a clean canvas.
 */
export async function stripImageMetadata(file, onProgress = () => { }) {
  onProgress(25);
  const img = await loadImage(file);
  onProgress(60);

  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);

  const mimeType =
    file.type === "image/png" || file.type === "image/webp" ? file.type : "image/jpeg";

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        cleanupCanvas(canvas);
        onProgress(100);
        resolve({
          blob,
          url: URL.createObjectURL(blob),
          size: blob.size,
          type: mimeType,
        });
      },
      mimeType,
      0.95
    );
  });
}
