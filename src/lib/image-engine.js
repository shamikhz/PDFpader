/**
 * Loads a File or Blob into an HTMLImageElement for Canvas rendering.
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
 * Compresses an image with a specified quality level (0.01 to 1.0).
 */
export async function compressImage(file, quality = 0.75, onProgress = () => {}) {
  onProgress(20);
  const img = await loadImage(file);
  onProgress(50);

  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);

  onProgress(80);
  // Default to webp or jpeg for lossy compression
  const targetType = file.type === "image/png" ? "image/webp" : file.type || "image/jpeg";

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
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
export async function resizeImage(file, { width, height, maintainAspect = true }, onProgress = () => {}) {
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
export async function convertImage(file, targetMimeType = "image/webp", quality = 0.9, onProgress = () => {}) {
  onProgress(20);
  const img = await loadImage(file);
  onProgress(50);

  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;

  const ctx = canvas.getContext("2d");
  // If converting to JPEG, fill with white background first for transparency
  if (targetMimeType === "image/jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(img, 0, 0);

  onProgress(80);
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
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
export async function cropImage(file, { x, y, width, height }, onProgress = () => {}) {
  onProgress(20);
  const img = await loadImage(file);
  onProgress(50);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, x, y, width, height, 0, 0, width, height);

  onProgress(80);
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      onProgress(100);
      resolve({
        blob,
        url: URL.createObjectURL(blob),
        width,
        height,
      });
    }, file.type || "image/png");
  });
}

/**
 * Rotates and/or flips an image.
 */
export async function rotateAndFlipImage(file, angle = 90, flipH = false, flipV = false, onProgress = () => {}) {
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
 * Gets image metadata including dimensions and aspect ratio.
 */
export async function getImageMetadata(file) {
  const img = await loadImage(file);
  const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(img.naturalWidth, img.naturalHeight);
  const aspect = `${img.naturalWidth / divisor}:${img.naturalHeight / divisor}`;

  return {
    name: file.name,
    size: file.size,
    type: file.type || "image/unknown",
    width: img.naturalWidth,
    height: img.naturalHeight,
    aspectRatio: aspect,
    megapixels: ((img.naturalWidth * img.naturalHeight) / 1000000).toFixed(2) + " MP",
    lastModified: new Date(file.lastModified).toLocaleString(),
  };
}
