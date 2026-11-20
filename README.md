# PDFpadar — All-in-One Online PDF, Image & File Processing Platform

**PDFpadar** is a fast, lightweight, and completely private online utility platform where users can process, optimize, convert, edit, and manage PDF documents, images, and files without installing desktop software.

---

## 🔒 100% Client-Side Privacy Guarantee
Unlike traditional cloud conversion platforms that require you to upload confidential personal or business files to external servers:
- **Zero Server Storage**: 100% of PDF manipulation, image rendering, hashing, and archiving runs directly in your local browser memory using WebAssembly, `pdf-lib`, HTML5 Canvas, and the native Web Crypto API.
- **Your Files Never Leave Your Device**: No bytes are transmitted over external networks.

---

## 🚀 Fully Implemented & Tested Tools (28 Live Tools)

### A. PDF Tools (`/tools/[slug]`)
1. **Merge PDF** (`/tools/merge-pdf`): Combine multiple PDFs into a single document with interactive drag re-ordering.
2. **Split PDF** (`/tools/split-pdf`): Extract specific page ranges (e.g. `1-3, 5`) or split every page into separate files packaged in a ZIP archive.
3. **Rotate PDF** (`/tools/rotate-pdf`): Permanently rotate pages (90°, 180°, 270°) across all, odd, or even pages.
4. **Delete PDF Pages** (`/tools/delete-pdf-pages`): Remove unwanted pages or ranges with precision.
5. **Extract PDF Pages** (`/tools/extract-pdf-pages`): Select and extract exact pages into a new compact PDF.
6. **Organize PDF** (`/tools/organize-pdf`): Reorder, duplicate, or sequence pages into any custom arrangement.
7. **Add Watermark** (`/tools/add-watermark`): Stamp diagonal text watermarks with customizable opacity, font size, and rotation.
8. **Add Page Numbers** (`/tools/add-page-numbers`): Overlaid vector page numbers in standard formats (`Page X of Y`, `X`) at bottom/top margins.
9. **Protect PDF** (`/tools/protect-pdf`): Encrypt PDF documents with secure password protection using AES/RC4.
10. **Unlock PDF** (`/tools/unlock-pdf`): Remove password protection from authorized PDFs for unrestricted access.
11. **PDF Metadata Editor** (`/tools/pdf-metadata`): Inspect and edit Title, Author, Subject, Keywords, and Creator properties or wipe them for privacy.
12. **PDF Page Size Converter** (`/tools/pdf-page-size`): Standardize document dimensions to A4, US Letter, or US Legal.
13. **JPG to PDF** (`/tools/jpg-to-pdf`): Convert single or multiple JPG/JPEG images into an organized PDF.
14. **PNG to PDF** (`/tools/png-to-pdf`): Convert high-resolution transparent or graphic PNGs to PDF.

### B. Image Tools (`/tools/[slug]`)
15. **Image Compressor** (`/tools/compress-image`): Real-time canvas compression with quality slider (1-100%), live file size savings, and percentage calculations.
16. **Image Resizer** (`/tools/resize-image`): Resize image dimensions by exact pixels or proportional aspect ratio.
17. **Image Converter** (`/tools/convert-image`): Convert seamlessly between WebP (next-gen web format), JPEG, and PNG.
18. **Image Cropper** (`/tools/crop-image`): Crop images to custom rectangular dimensions.
19. **Image Rotator & Flip** (`/tools/rotate-image`): Rotate images (90°, 180°, 270°) or mirror horizontally and vertically.
20. **Image to PDF** (`/tools/image-to-pdf`): Combine mixed image types into a multi-page PDF.
21. **Image DPI & Print Calculator** (`/tools/image-dpi-calculator`): Calculate physical print dimensions in inches, cm, mm, and megapixels for target DPI (300 DPI, 150 DPI, 72 DPI).
22. **Image Metadata & EXIF Viewer** (`/tools/image-metadata`): Inspect image dimensions, aspect ratio, file size, and download metadata-stripped rasters.

### C. File Utilities (`/tools/[slug]`)
23. **ZIP File Creator** (`/tools/create-zip`): Package multiple files of any type into compressed `.zip` archives.
24. **ZIP File Extractor** (`/tools/extract-zip`): Inspect and unpack `.zip` archives directly in the browser with individual downloads.
25. **File Hash Generator** (`/tools/file-hash-generator`): Compute hardware-accelerated SHA-256, SHA-1, SHA-384, and SHA-512 checksums via Web Crypto API with one-click copy.
26. **File Comparison Utility** (`/tools/file-comparison`): Side-by-side line-by-line diff comparison highlighting additions, deletions, and line counts.
27. **File Size & Format Analyzer** (`/tools/file-size-analyzer`): Breakdown byte sizes, human-readable units (KB, MB, GB), and storage share rankings.
28. **Batch File Renamer** (`/tools/batch-file-renaming`): Batch rename files with prefixes, suffixes, sequential numbering, or find-and-replace, and bundle into a ZIP archive.
29. **Document Page Counter** (`/tools/document-page-counter`): Scan and sum total pages across multiple PDF documents in milliseconds.

---

## 🛠️ Tech Stack
- **Framework**: Next.js 14 (App Router)
- **UI & Styling**: Tailwind CSS, Lucide Icons, Custom Inter typography
- **Themes**: Dark and Light theme system with persistent storage
- **PDF Engine**: `pdf-lib`, `@pdfsmaller/pdf-encrypt`, `@pdfsmaller/pdf-decrypt`
- **Archive Engine**: `jszip`
- **Image Processing**: HTML5 Canvas, Blob APIs, Web Workers
- **Hashing**: Browser Native `crypto.subtle` (Web Crypto API)
- **SEO**: Static Site Generation (SSG for all 28 tool routes), dynamic `sitemap.xml`, `robots.txt`, OpenGraph metadata, and JSON-LD (`SoftwareApplication` & `FAQPage` schemas).

---

## 💻 Development & Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Run engine verification tests
node scripts/verify-engines.mjs

# 3. Start development server
npm run dev

# 4. Create production build
npm run build
npm run start
```
