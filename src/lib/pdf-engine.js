import { PDFDocument, rgb, degrees, StandardFonts, PageSizes } from "pdf-lib";
import { encryptPDF } from "@pdfsmaller/pdf-encrypt";
import { decryptPDF } from "@pdfsmaller/pdf-decrypt";

/**
 * Parses user range string like "1-3, 5, 8-10" into 1-based page numbers array.
 */
export function parsePageRange(rangeStr, totalPages) {
  const pages = new Set();
  const parts = rangeStr.split(",").map((s) => s.trim()).filter(Boolean);

  for (const part of parts) {
    if (part.includes("-")) {
      const [startStr, endStr] = part.split("-").map((s) => s.trim());
      const start = Math.max(1, parseInt(startStr, 10) || 1);
      const end = Math.min(totalPages, parseInt(endStr, 10) || totalPages);
      for (let i = start; i <= end; i++) {
        pages.add(i);
      }
    } else {
      const p = parseInt(part, 10);
      if (p >= 1 && p <= totalPages) {
        pages.add(p);
      }
    }
  }

  return Array.from(pages).sort((a, b) => a - b);
}

/**
 * Merges multiple PDF files into a single Uint8Array blob.
 */
export async function mergePdf(files, onProgress = () => {}) {
  const mergedPdf = await PDFDocument.create();
  const total = files.length;

  for (let i = 0; i < total; i++) {
    onProgress(Math.round(((i + 1) / total) * 100));
    await new Promise((r) => setTimeout(r, 0));
    const fileBytes = await files[i].arrayBuffer();
    const doc = await PDFDocument.load(fileBytes, { ignoreEncryption: true });
    const copiedPages = await mergedPdf.copyPages(doc, doc.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  return await mergedPdf.save();
}

/**
 * Splits a PDF by page ranges or splits every page into separate documents.
 */
export async function splitPdf(file, mode = "range", rangeStr = "1", onProgress = () => {}) {
  const fileBytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(fileBytes);
  const totalPages = doc.getPageCount();

  if (mode === "single") {
    // Return an array of { name, bytes }
    const results = [];
    for (let i = 0; i < totalPages; i++) {
      onProgress(Math.round(((i + 1) / totalPages) * 100));
      await new Promise((r) => setTimeout(r, 0));
      const singleDoc = await PDFDocument.create();
      const [page] = await singleDoc.copyPages(doc, [i]);
      singleDoc.addPage(page);
      const bytes = await singleDoc.save();
      results.push({
        name: `${file.name.replace(/\.[^/.]+$/, "")}_page_${i + 1}.pdf`,
        bytes,
      });
    }
    return results;
  } else {
    // Extract specified ranges into one PDF
    const targetPages = parsePageRange(rangeStr, totalPages);
    if (targetPages.length === 0) {
      throw new Error(`Invalid page range. Document has ${totalPages} pages.`);
    }

    const splitDoc = await PDFDocument.create();
    const indices = targetPages.map((p) => p - 1);
    const copiedPages = await splitDoc.copyPages(doc, indices);
    copiedPages.forEach((p) => splitDoc.addPage(p));
    onProgress(100);
    return await splitDoc.save();
  }
}

/**
 * Rotates pages of a PDF by a specified angle (90, 180, 270).
 */
export async function rotatePdf(file, rotationAngle = 90, selection = "all", customRange = "", onProgress = () => {}) {
  const fileBytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(fileBytes);
  const pages = doc.getPages();
  const total = pages.length;

  let targetIndices = [];
  if (selection === "all") {
    targetIndices = pages.map((_, i) => i);
  } else if (selection === "odd") {
    targetIndices = pages.map((_, i) => i).filter((i) => (i + 1) % 2 !== 0);
  } else if (selection === "even") {
    targetIndices = pages.map((_, i) => i).filter((i) => (i + 1) % 2 === 0);
  } else if (selection === "custom") {
    targetIndices = parsePageRange(customRange, total).map((p) => p - 1);
  }

  for (let i = 0; i < targetIndices.length; i++) {
    const idx = targetIndices[i];
    const page = pages[idx];
    const currentRotation = page.getRotation().angle;
    page.setRotation(degrees((currentRotation + rotationAngle) % 360));
    onProgress(Math.round(((i + 1) / targetIndices.length) * 100));
  }

  return await doc.save();
}

/**
 * Deletes specified pages from a PDF.
 */
export async function deletePdfPages(file, pagesToDeleteStr, onProgress = () => {}) {
  const fileBytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(fileBytes);
  const totalPages = doc.getPageCount();

  const toDelete = new Set(parsePageRange(pagesToDeleteStr, totalPages).map((p) => p - 1));
  if (toDelete.size === 0) {
    throw new Error("No valid pages specified for deletion.");
  }
  if (toDelete.size >= totalPages) {
    throw new Error("Cannot delete all pages in the document.");
  }

  const remainingDoc = await PDFDocument.create();
  const keepIndices = [];
  for (let i = 0; i < totalPages; i++) {
    if (!toDelete.has(i)) {
      keepIndices.push(i);
    }
  }

  const copied = await remainingDoc.copyPages(doc, keepIndices);
  copied.forEach((p) => remainingDoc.addPage(p));
  onProgress(100);
  return await remainingDoc.save();
}

/**
 * Extracts specified pages into a new PDF.
 */
export async function extractPdfPages(file, pagesToExtractStr, onProgress = () => {}) {
  const fileBytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(fileBytes);
  const totalPages = doc.getPageCount();

  const toExtract = parsePageRange(pagesToExtractStr, totalPages).map((p) => p - 1);
  if (toExtract.length === 0) {
    throw new Error("No valid pages specified for extraction.");
  }

  const newDoc = await PDFDocument.create();
  const copied = await newDoc.copyPages(doc, toExtract);
  copied.forEach((p) => newDoc.addPage(p));
  onProgress(100);
  return await newDoc.save();
}

/**
 * Reorders pages in custom sequence.
 */
export async function organizePdf(file, orderString, onProgress = () => {}) {
  const fileBytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(fileBytes);
  const totalPages = doc.getPageCount();

  const order = orderString
    .split(",")
    .map((s) => parseInt(s.trim(), 10) - 1)
    .filter((idx) => !isNaN(idx) && idx >= 0 && idx < totalPages);

  if (order.length === 0) {
    throw new Error("Invalid page order sequence.");
  }

  const organizedDoc = await PDFDocument.create();
  const copied = await organizedDoc.copyPages(doc, order);
  copied.forEach((p) => organizedDoc.addPage(p));
  onProgress(100);
  return await organizedDoc.save();
}

/**
 * Stamps a diagonal watermark text across all pages.
 */
export async function addWatermark(
  file,
  watermarkText = "CONFIDENTIAL",
  { opacity = 0.25, fontSize = 50, rotation = -45, color = [0.5, 0.5, 0.5] } = {},
  onProgress = () => {}
) {
  const fileBytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(fileBytes);
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  const pages = doc.getPages();
  const total = pages.length;

  for (let i = 0; i < total; i++) {
    const page = pages[i];
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
    const textHeight = font.heightAtSize(fontSize);

    page.drawText(watermarkText, {
      x: width / 2 - (textWidth / 2) * Math.cos((rotation * Math.PI) / 180),
      y: height / 2 - (textHeight / 2) * Math.sin((rotation * Math.PI) / 180),
      size: fontSize,
      font,
      color: rgb(color[0], color[1], color[2]),
      opacity,
      rotate: degrees(rotation),
    });

    onProgress(Math.round(((i + 1) / total) * 100));
  }

  return await doc.save();
}

/**
 * Adds page numbers to pages.
 */
export async function addPageNumbers(
  file,
  { format = "Page {n} of {total}", position = "bottom-center", fontSize = 10, startFrom = 1 } = {},
  onProgress = () => {}
) {
  const fileBytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(fileBytes);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const pages = doc.getPages();
  const total = pages.length;

  for (let i = 0; i < total; i++) {
    const page = pages[i];
    const { width, height } = page.getSize();
    const currentNum = startFrom + i;
    const text = format.replace("{n}", currentNum).replace("{total}", total);
    const textWidth = font.widthOfTextAtSize(text, fontSize);

    let x = width / 2 - textWidth / 2;
    let y = 25;

    if (position === "bottom-right") {
      x = width - textWidth - 30;
      y = 25;
    } else if (position === "bottom-left") {
      x = 30;
      y = 25;
    } else if (position === "top-center") {
      x = width / 2 - textWidth / 2;
      y = height - 30;
    } else if (position === "top-right") {
      x = width - textWidth - 30;
      y = height - 30;
    }

    page.drawText(text, {
      x,
      y,
      size: fontSize,
      font,
      color: rgb(0.2, 0.2, 0.2),
    });

    onProgress(Math.round(((i + 1) / total) * 100));
  }

  return await doc.save();
}

/**
 * Protects a PDF with a password.
 */
export async function protectPdf(file, password, onProgress = () => {}) {
  if (!password || password.length < 1) {
    throw new Error("Password must not be empty.");
  }
  const fileBytes = await file.arrayBuffer();
  onProgress(40);
  const encryptedBytes = await encryptPDF(new Uint8Array(fileBytes), password);
  onProgress(100);
  return encryptedBytes;
}

/**
 * Unlocks a password-protected PDF given the valid password.
 */
export async function unlockPdf(file, password, onProgress = () => {}) {
  const fileBytes = await file.arrayBuffer();
  onProgress(30);
  try {
    const decryptedBytes = await decryptPDF(new Uint8Array(fileBytes), password);
    onProgress(100);
    return decryptedBytes;
  } catch (err) {
    throw new Error("Incorrect password or corrupted PDF: " + err.message);
  }
}

/**
 * Reads metadata from a PDF.
 */
export async function getPdfMetadata(file) {
  const fileBytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(fileBytes, { ignoreEncryption: true });
  return {
    title: doc.getTitle() || "",
    author: doc.getAuthor() || "",
    subject: doc.getSubject() || "",
    keywords: doc.getKeywords() || "",
    creator: doc.getCreator() || "",
    producer: doc.getProducer() || "",
    creationDate: doc.getCreationDate() ? doc.getCreationDate().toISOString() : "",
    modificationDate: doc.getModificationDate() ? doc.getModificationDate().toISOString() : "",
    pageCount: doc.getPageCount(),
  };
}

/**
 * Updates or clears metadata of a PDF.
 */
export async function updatePdfMetadata(file, metadata, onProgress = () => {}) {
  const fileBytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(fileBytes);
  onProgress(30);

  if (metadata.title !== undefined) doc.setTitle(metadata.title);
  if (metadata.author !== undefined) doc.setAuthor(metadata.author);
  if (metadata.subject !== undefined) doc.setSubject(metadata.subject);
  if (metadata.keywords !== undefined) {
    const kwList = metadata.keywords
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    doc.setKeywords(kwList);
  }
  if (metadata.creator !== undefined) doc.setCreator(metadata.creator);
  if (metadata.producer !== undefined) doc.setProducer(metadata.producer);

  onProgress(80);
  const updated = await doc.save();
  onProgress(100);
  return updated;
}

/**
 * Resizes pages of a PDF to standard A4, Letter, or Legal, scaling and centering content to fit.
 */
export async function convertPdfPageSize(file, targetSizeName = "A4", onProgress = () => {}) {
  const fileBytes = await file.arrayBuffer();
  const srcDoc = await PDFDocument.load(fileBytes);
  const outDoc = await PDFDocument.create();
  const srcPages = srcDoc.getPages();
  const total = srcPages.length;

  let targetDims = PageSizes.A4;
  if (targetSizeName === "Letter") targetDims = PageSizes.Letter;
  if (targetSizeName === "Legal") targetDims = PageSizes.Legal;

  const [targetWidth, targetHeight] = targetDims;

  for (let i = 0; i < total; i++) {
    const srcPage = srcPages[i];
    const { width: origW, height: origH } = srcPage.getSize();
    const newPage = outDoc.addPage([targetWidth, targetHeight]);

    // pdf-lib's embedPage throws MissingPageContentsEmbeddingError on completely blank pages
    if (srcPage.node.Contents()) {
      const embeddedPage = await outDoc.embedPage(srcPage);
      const scale = Math.min(targetWidth / origW, targetHeight / origH);
      const drawW = origW * scale;
      const drawH = origH * scale;
      const x = (targetWidth - drawW) / 2;
      const y = (targetHeight - drawH) / 2;
      newPage.drawPage(embeddedPage, { x, y, width: drawW, height: drawH });
    }

    onProgress(Math.round(((i + 1) / total) * 100));
  }

  return await outDoc.save();
}

/**
 * Rasterizes a non-JPG/PNG image (e.g. WebP) to PNG bytes in the browser via Canvas.
 */
async function rasterizeImageToPngBytes(imgFile) {
  const url = URL.createObjectURL(imgFile);
  try {
    const img = await new Promise((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error(`Failed to decode image: ${imgFile.name}`));
      el.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Canvas PNG export failed"))), "image/png");
    });
    canvas.width = 0;
    canvas.height = 0;
    return await blob.arrayBuffer();
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Converts multiple image files (JPG, PNG, or WebP) into a single PDF.
 */
export async function imagesToPdf(imageFiles, onProgress = () => {}) {
  const pdfDoc = await PDFDocument.create();
  const total = imageFiles.length;

  for (let i = 0; i < total; i++) {
    await new Promise((r) => setTimeout(r, 0));
    const imgFile = imageFiles[i];
    const lowerName = imgFile.name.toLowerCase();
    const isJpg = imgFile.type === "image/jpeg" || lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg");
    const isPng = imgFile.type === "image/png" || lowerName.endsWith(".png");

    let embeddedImg;
    if (isJpg) {
      const imgBytes = await imgFile.arrayBuffer();
      embeddedImg = await pdfDoc.embedJpg(imgBytes);
    } else if (isPng) {
      const imgBytes = await imgFile.arrayBuffer();
      embeddedImg = await pdfDoc.embedPng(imgBytes);
    } else {
      const pngBytes = await rasterizeImageToPngBytes(imgFile);
      embeddedImg = await pdfDoc.embedPng(pngBytes);
    }

    const { width, height } = embeddedImg;
    const page = pdfDoc.addPage([width, height]);
    page.drawImage(embeddedImg, {
      x: 0,
      y: 0,
      width,
      height,
    });

    onProgress(Math.round(((i + 1) / total) * 100));
  }

  return await pdfDoc.save();
}

/**
 * Counts total pages of a PDF document quickly.
 */
export async function countPdfPages(file) {
  const fileBytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(fileBytes, { ignoreEncryption: true });
  return doc.getPageCount();
}
