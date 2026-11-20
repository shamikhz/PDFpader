/**
 * Formats a byte number into a human-readable string (e.g. 1.5 MB).
 */
export function formatBytes(bytes, decimals = 1) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Sanitizes a filename to prevent path traversal and remove dangerous characters.
 */
export function sanitizeFilename(filename, fallback = "download") {
  if (!filename || typeof filename !== "string") return fallback;
  // Strip control characters, path separators, and illegal filesystem chars
  const sanitized = filename
    .replace(/[/\\?%*:|"<>]/g, "_")
    .replace(/[\x00-\x1f\x80-\x9f]/g, "")
    .trim();
  return sanitized.length > 0 ? sanitized : fallback;
}

/**
 * Helper to safely revoke an Object URL to prevent memory leaks.
 */
export function revokeUrl(url) {
  if (url && typeof url === "string" && url.startsWith("blob:")) {
    try {
      URL.revokeObjectURL(url);
    } catch {
      // Ignore cleanup error if already revoked
    }
  }
}
