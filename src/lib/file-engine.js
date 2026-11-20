import JSZip from "jszip";

/**
 * Creates a ZIP archive containing multiple files using JSZip.
 */
export async function createZip(files, zipName = "archive.zip", onProgress = () => {}) {
  const zip = new JSZip();
  const total = files.length;

  for (let i = 0; i < total; i++) {
    const f = files[i];
    zip.file(f.name, f);
    onProgress(Math.round(((i + 1) / total) * 50));
  }

  const content = await zip.generateAsync(
    {
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    },
    (metadata) => {
      onProgress(50 + Math.round(metadata.percent / 2));
    }
  );

  return {
    blob: content,
    url: URL.createObjectURL(content),
    fileName: zipName.endsWith(".zip") ? zipName : `${zipName}.zip`,
    size: content.size,
  };
}

/**
 * Extracts all files from a ZIP archive.
 */
export async function extractZip(zipFile, onProgress = () => {}) {
  const zip = new JSZip();
  onProgress(20);
  const loadedZip = await zip.loadAsync(zipFile);
  onProgress(50);

  const fileEntries = [];
  const keys = Object.keys(loadedZip.files);
  const total = keys.length;

  for (let i = 0; i < total; i++) {
    const key = keys[i];
    const zipEntry = loadedZip.files[key];
    if (!zipEntry.dir) {
      const blob = await zipEntry.async("blob");
      fileEntries.push({
        name: key,
        size: blob.size,
        blob,
        url: URL.createObjectURL(blob),
      });
    }
    onProgress(50 + Math.round(((i + 1) / total) * 50));
  }

  return fileEntries;
}

/**
 * Computes cryptographic hashes (SHA-256, SHA-1, SHA-384, SHA-512) for a file.
 */
export async function calculateFileHashes(file, onProgress = () => {}) {
  onProgress(20);
  const buffer = await file.arrayBuffer();
  onProgress(40);

  const algorithms = ["SHA-256", "SHA-1", "SHA-384", "SHA-512"];
  const hashes = {};

  for (let i = 0; i < algorithms.length; i++) {
    const algo = algorithms[i];
    const hashBuffer = await crypto.subtle.digest(algo, buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    hashes[algo] = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    onProgress(40 + Math.round(((i + 1) / algorithms.length) * 60));
  }

  return {
    fileName: file.name,
    fileSize: file.size,
    hashes,
  };
}

/**
 * Compares two text files and produces a line-by-line diff.
 */
export async function compareTextFiles(fileA, fileB) {
  const textA = await fileA.text();
  const textB = await fileB.text();

  const linesA = textA.split(/\r?\n/);
  const linesB = textB.split(/\r?\n/);

  const maxLines = Math.max(linesA.length, linesB.length);
  const diffLines = [];
  let differencesCount = 0;

  for (let i = 0; i < maxLines; i++) {
    const lineA = linesA[i] !== undefined ? linesA[i] : null;
    const lineB = linesB[i] !== undefined ? linesB[i] : null;

    if (lineA === lineB) {
      diffLines.push({ type: "same", lineNum: i + 1, left: lineA, right: lineB });
    } else {
      differencesCount++;
      diffLines.push({
        type: "diff",
        lineNum: i + 1,
        left: lineA,
        right: lineB,
      });
    }
  }

  return {
    fileAName: fileA.name,
    fileBName: fileB.name,
    totalLinesA: linesA.length,
    totalLinesB: linesB.length,
    differencesCount,
    identical: differencesCount === 0,
    diffLines,
  };
}

/**
 * Analyzes sizes and MIME types of files.
 */
export function analyzeFiles(files) {
  const totalSize = files.reduce((acc, f) => acc + f.size, 0);

  const formatBytes = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const fileStats = files.map((f) => ({
    name: f.name,
    type: f.type || "unknown/binary",
    sizeBytes: f.size,
    formattedSize: formatBytes(f.size),
    percentageOfTotal: totalSize > 0 ? ((f.size / totalSize) * 100).toFixed(1) + "%" : "0%",
    lastModified: new Date(f.lastModified).toLocaleString(),
  }));

  // Sort descending by size
  fileStats.sort((a, b) => b.sizeBytes - a.sizeBytes);

  return {
    totalFiles: files.length,
    totalSizeBytes: totalSize,
    totalFormattedSize: formatBytes(totalSize),
    averageSize: files.length > 0 ? formatBytes(Math.round(totalSize / files.length)) : "0 Bytes",
    fileStats,
  };
}

/**
 * Batch renames uploaded files and packages them into a ZIP download.
 */
export async function batchRenameFiles(
  files,
  { rule = "prefix", prefix = "", suffix = "", findText = "", replaceText = "", startNum = 1, padDigits = 2 },
  onProgress = () => {}
) {
  const zip = new JSZip();
  const total = files.length;
  const renamedList = [];

  for (let i = 0; i < total; i++) {
    const f = files[i];
    const extIndex = f.name.lastIndexOf(".");
    const baseName = extIndex !== -1 ? f.name.slice(0, extIndex) : f.name;
    const ext = extIndex !== -1 ? f.name.slice(extIndex) : "";

    let newBaseName = baseName;

    if (rule === "prefix") {
      newBaseName = `${prefix}${baseName}`;
    } else if (rule === "suffix") {
      newBaseName = `${baseName}${suffix}`;
    } else if (rule === "numbering") {
      const numStr = String(startNum + i).padStart(padDigits, "0");
      newBaseName = `${prefix}${numStr}${suffix}`;
    } else if (rule === "replace") {
      newBaseName = baseName.replaceAll(findText, replaceText);
    }

    const finalName = `${newBaseName}${ext}`;
    renamedList.push({ original: f.name, renamed: finalName });
    zip.file(finalName, f);
    onProgress(Math.round(((i + 1) / total) * 50));
  }

  const content = await zip.generateAsync(
    { type: "blob", compression: "DEFLATE" },
    (meta) => onProgress(50 + Math.round(meta.percent / 2))
  );

  return {
    blob: content,
    url: URL.createObjectURL(content),
    fileName: "renamed_files.zip",
    renamedList,
  };
}
