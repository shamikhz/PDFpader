export const TOOL_CATEGORIES = [
  { id: "pdf", name: "PDF Tools", description: "Merge, split, rotate, watermark, protect, and edit PDF documents locally." },
  { id: "image", name: "Image Tools", description: "Compress, resize, convert, crop, rotate, and optimize images directly in your browser." },
  { id: "file", name: "File Utilities", description: "Archive ZIPs, calculate hashes, compare files, analyze sizes, and batch rename files." },
];

export const TOOLS = [
  // --- PDF TOOLS ---
  {
    slug: "merge-pdf",
    category: "pdf",
    name: "Merge PDF",
    shortDesc: "Combine multiple PDF files into a single unified document in any order.",
    icon: "Layers",
    badge: "100% Client-Side",
    accept: ".pdf,application/pdf",
    multiple: true,
    maxSizeMB: 100,
    features: [
      "Merge unlimited PDF documents",
      "Interactive page-order reordering",
      "Maintains original document fidelity",
      "No file upload — 100% private in browser",
    ],
    instructions: [
      "Select or drag & drop two or more PDF files into the upload box.",
      "Re-order the files using the move up/down controls as needed.",
      "Click 'Merge PDFs' to combine them into one document.",
      "Download your merged PDF file instantly.",
    ],
    faqs: [
      {
        q: "Is there a limit on how many PDFs I can merge?",
        a: "Because processing runs entirely in your local browser memory, you can merge dozens of files at once. Performance depends on your device's available RAM."
      },
      {
        q: "Are my sensitive PDF documents uploaded to your servers?",
        a: "No! PDFpadar operates 100% in your browser using WebAssembly and client-side JavaScript. Your files never leave your computer or smartphone."
      },
      {
        q: "Does merging affect the quality or hyperlinks in my PDFs?",
        a: "No, PDFpadar merges vector graphics, fonts, embedded images, and document structures without re-compressing or degrading resolution."
      }
    ],
    related: ["split-pdf", "organize-pdf", "rotate-pdf", "add-page-numbers"]
  },
  {
    slug: "split-pdf",
    category: "pdf",
    name: "Split PDF",
    shortDesc: "Extract specific page ranges or split a PDF into separate single-page documents.",
    icon: "Scissors",
    badge: "100% Client-Side",
    accept: ".pdf,application/pdf",
    multiple: false,
    maxSizeMB: 100,
    features: [
      "Split by custom page ranges (e.g., 1-3, 5, 8-10)",
      "Extract every page into individual separate PDFs",
      "Instant ZIP download option for batch extracted pages",
      "No quality loss or metadata corruption"
    ],
    instructions: [
      "Upload the PDF document you want to split.",
      "Choose to extract specific page ranges (e.g. '1-3, 5') or split into individual single pages.",
      "Click 'Split PDF' to process the document.",
      "Download your split PDF or a ZIP archive containing all extracted pages."
    ],
    faqs: [
      {
        q: "How do I specify page ranges?",
        a: "Enter comma-separated numbers and ranges, such as '1-4, 7, 9-12'. Pages will be extracted exactly as specified."
      },
      {
        q: "Can I extract all pages as a ZIP file?",
        a: "Yes! Select the 'Extract all pages individually' option, and PDFpadar will generate a download containing all separate pages in a single ZIP."
      }
    ],
    related: ["merge-pdf", "delete-pdf-pages", "extract-pdf-pages", "organize-pdf"]
  },
  {
    slug: "rotate-pdf",
    category: "pdf",
    name: "Rotate PDF",
    shortDesc: "Permanently rotate all or specific pages of your PDF by 90, 180, or 270 degrees.",
    icon: "RotateCw",
    badge: "100% Client-Side",
    accept: ".pdf,application/pdf",
    multiple: false,
    maxSizeMB: 100,
    features: [
      "Rotate 90° clockwise, 180°, or 90° counter-clockwise",
      "Apply rotation to all pages or specific page indices",
      "Permanent orientation adjustment without rasterization",
      "Ultra-fast local processing"
    ],
    instructions: [
      "Upload your PDF file.",
      "Select the rotation angle (90° Clockwise, 180°, or 270° / 90° Counter-Clockwise).",
      "Choose whether to rotate all pages or only odd, even, or specific pages.",
      "Click 'Rotate & Download' to save your updated PDF."
    ],
    faqs: [
      {
        q: "Will rotating a PDF blur or reduce image quality?",
        a: "No. PDF rotation merely modifies the internal orientation matrix of the pages. Text and images remain sharp vectors and pristine rasters."
      }
    ],
    related: ["organize-pdf", "merge-pdf", "split-pdf", "delete-pdf-pages"]
  },
  {
    slug: "delete-pdf-pages",
    category: "pdf",
    name: "Delete PDF Pages",
    shortDesc: "Remove unwanted or blank pages from your PDF documents with precision.",
    icon: "Trash2",
    badge: "100% Client-Side",
    accept: ".pdf,application/pdf",
    multiple: false,
    maxSizeMB: 100,
    features: [
      "Target specific pages or page ranges to delete (e.g. 2, 4-6)",
      "Preview total remaining page count",
      "Preserves all annotations and intact links",
      "Zero server uploads"
    ],
    instructions: [
      "Upload your PDF.",
      "Enter the page numbers you wish to remove (e.g., '1, 3, 5-7').",
      "Click 'Delete Pages & Save'.",
      "Download your trimmed document."
    ],
    faqs: [
      {
        q: "Can I delete multiple non-consecutive pages?",
        a: "Yes, you can specify individual numbers separated by commas, such as '2, 5, 9, 14'."
      }
    ],
    related: ["extract-pdf-pages", "organize-pdf", "split-pdf", "rotate-pdf"]
  },
  {
    slug: "extract-pdf-pages",
    category: "pdf",
    name: "Extract PDF Pages",
    shortDesc: "Select and extract exact pages from a PDF to create a new compact document.",
    icon: "FileOutput",
    badge: "100% Client-Side",
    accept: ".pdf,application/pdf",
    multiple: false,
    maxSizeMB: 100,
    features: [
      "Select only the pages you need",
      "Combine selected pages into a single new PDF",
      "High speed in-browser processing",
      "Completely private"
    ],
    instructions: [
      "Upload your PDF document.",
      "Specify the pages you want to keep (e.g., '1, 3, 5-10').",
      "Click 'Extract Selected Pages'.",
      "Download your new, focused PDF."
    ],
    faqs: [
      {
        q: "How does Extract differ from Split?",
        a: "Extract allows you to pick a subset of pages and combine them into a single new output document, while Split can also generate individual 1-page documents."
      }
    ],
    related: ["delete-pdf-pages", "split-pdf", "organize-pdf", "merge-pdf"]
  },
  {
    slug: "organize-pdf",
    category: "pdf",
    name: "Organize PDF Pages",
    shortDesc: "Reorder, duplicate, or rearrange pages in your PDF document into any sequence.",
    icon: "ArrowUpDown",
    badge: "100% Client-Side",
    accept: ".pdf,application/pdf",
    multiple: false,
    maxSizeMB: 100,
    features: [
      "Custom page sequencing (e.g., 5, 2, 1, 3, 4)",
      "Duplicate pages if needed",
      "Fast client-side reconstruction",
      "No quality loss"
    ],
    instructions: [
      "Upload your PDF.",
      "Enter the new desired page order sequence (e.g., '3, 1, 2, 4').",
      "Click 'Reorganize Pages'.",
      "Download your newly structured PDF document."
    ],
    faqs: [
      {
        q: "Can I repeat a page multiple times?",
        a: "Yes! If you enter '1, 1, 2, 3', page 1 will be duplicated at the beginning."
      }
    ],
    related: ["rotate-pdf", "merge-pdf", "split-pdf", "delete-pdf-pages"]
  },
  {
    slug: "add-watermark",
    category: "pdf",
    name: "Add Watermark to PDF",
    shortDesc: "Stamp custom text watermarks across every page of your PDF with custom opacity and rotation.",
    icon: "Stamp",
    badge: "100% Client-Side",
    accept: ".pdf,application/pdf",
    multiple: false,
    maxSizeMB: 100,
    features: [
      "Custom text stamping (e.g. CONFIDENTIAL, DRAFT, SAMPLE)",
      "Configurable opacity, font size, and diagonal rotation angle",
      "Applies across all pages automatically",
      "No server processing required"
    ],
    instructions: [
      "Upload your PDF.",
      "Enter your watermark text and configure font size, opacity, and rotation.",
      "Click 'Apply Watermark'.",
      "Download your stamped PDF."
    ],
    faqs: [
      {
        q: "Can I adjust the transparency so the text behind it is readable?",
        a: "Yes! The opacity slider lets you select subtle 10% to 50% transparency so the underlying content remains clear."
      }
    ],
    related: ["add-page-numbers", "protect-pdf", "pdf-metadata", "merge-pdf"]
  },
  {
    slug: "add-page-numbers",
    category: "pdf",
    name: "Add Page Numbers",
    shortDesc: "Insert professional page numbering (e.g., Page 1 of N) into your PDF pages.",
    icon: "Hash",
    badge: "100% Client-Side",
    accept: ".pdf,application/pdf",
    multiple: false,
    maxSizeMB: 100,
    features: [
      "Multiple formats: 'Page X of Y' or 'X'",
      "Positions: Bottom-Center, Bottom-Right, Top-Center, Top-Right",
      "Custom starting number and font sizing",
      "Vector text injection without altering existing layers"
    ],
    instructions: [
      "Upload your PDF.",
      "Select your preferred numbering format and position on the page.",
      "Click 'Add Page Numbers'.",
      "Download your numbered document."
    ],
    faqs: [
      {
        q: "Does this overwrite existing text on the page?",
        a: "No, page numbers are placed in the page margins and overlaid cleanly."
      }
    ],
    related: ["add-watermark", "merge-pdf", "pdf-page-size", "organize-pdf"]
  },
  {
    slug: "protect-pdf",
    category: "pdf",
    name: "Protect PDF with Password",
    shortDesc: "Encrypt your PDF document with a password to prevent unauthorized viewing and copying.",
    icon: "Lock",
    badge: "100% Client-Side",
    accept: ".pdf,application/pdf",
    multiple: false,
    maxSizeMB: 100,
    features: [
      "Standard PDF password encryption",
      "Protects against unauthorized opening and printing",
      "Encrypted locally before saving",
      "Zero server transmission"
    ],
    instructions: [
      "Upload your PDF.",
      "Enter a strong password of your choice.",
      "Click 'Encrypt & Protect PDF'.",
      "Download your secure password-protected file."
    ],
    faqs: [
      {
        q: "Do you store my password on your servers?",
        a: "Never. Encryption happens entirely within your web browser using Web Crypto and pdf-lib. We never see or store your password or file."
      }
    ],
    related: ["unlock-pdf", "pdf-metadata", "add-watermark", "merge-pdf"]
  },
  {
    slug: "unlock-pdf",
    category: "pdf",
    name: "Unlock PDF",
    shortDesc: "Remove password protection from authorized PDFs so you don't have to enter the password repeatedly.",
    icon: "Unlock",
    badge: "100% Client-Side",
    accept: ".pdf,application/pdf",
    multiple: false,
    maxSizeMB: 100,
    features: [
      "Remove password restriction from authorized documents",
      "Produces an unencrypted, open PDF",
      "100% in-browser decryption",
      "Private and compliant"
    ],
    instructions: [
      "Upload your password-protected PDF.",
      "Enter the existing valid document password.",
      "Click 'Unlock & Remove Password'.",
      "Download your decrypted, password-free PDF."
    ],
    faqs: [
      {
        q: "Can this crack an unknown password?",
        a: "No. For legal and ethical compliance, you must provide the authorized password to decrypt and re-save the document without protection."
      }
    ],
    related: ["protect-pdf", "pdf-metadata", "merge-pdf", "split-pdf"]
  },
  {
    slug: "pdf-metadata",
    category: "pdf",
    name: "PDF Metadata Editor",
    shortDesc: "View and edit PDF Title, Author, Subject, Keywords, Creator, and Producer properties.",
    icon: "FileText",
    badge: "100% Client-Side",
    accept: ".pdf,application/pdf",
    multiple: false,
    maxSizeMB: 100,
    features: [
      "Inspect embedded document metadata",
      "Modify or wipe Title, Author, Subject, and Keywords",
      "Strip sensitive personal identifying metadata",
      "Instant client-side update"
    ],
    instructions: [
      "Upload your PDF file.",
      "Review the detected metadata fields.",
      "Edit the values or click 'Clear All Metadata' to wipe them for privacy.",
      "Click 'Save Updated PDF' and download."
    ],
    faqs: [
      {
        q: "Why should I edit or clear PDF metadata?",
        a: "PDF files often contain hidden information such as author names, software versions, and local file paths. Clearing it protects your privacy before sharing files publicly."
      }
    ],
    related: ["protect-pdf", "add-watermark", "document-page-counter", "merge-pdf"]
  },
  {
    slug: "pdf-page-size",
    category: "pdf",
    name: "PDF Page Size Converter",
    shortDesc: "Resize PDF page dimensions to standard A4, US Letter, or Legal formats with content scaling.",
    icon: "Maximize2",
    badge: "100% Client-Side",
    accept: ".pdf,application/pdf",
    multiple: false,
    maxSizeMB: 100,
    features: [
      "Convert to A4 (210 x 297 mm)",
      "Convert to US Letter (8.5 x 11 in)",
      "Convert to US Legal (8.5 x 14 in)",
      "Uniform page dimension standardization"
    ],
    instructions: [
      "Upload your PDF.",
      "Select your target page size (A4, Letter, Legal).",
      "Click 'Resize Pages'.",
      "Download your standardized PDF."
    ],
    faqs: [
      {
        q: "Will this fix PDFs with mismatched page sizes?",
        a: "Yes! If your PDF has mixed landscape and portrait or irregular scan dimensions, this tool standardizes all pages to your selected size."
      }
    ],
    related: ["rotate-pdf", "add-page-numbers", "merge-pdf", "organize-pdf"]
  },
  {
    slug: "jpg-to-pdf",
    category: "pdf",
    name: "JPG to PDF Converter",
    shortDesc: "Convert JPG and JPEG images into a clean, professional multi-page PDF document.",
    icon: "FileImage",
    badge: "100% Client-Side",
    accept: ".jpg,.jpeg,image/jpeg",
    multiple: true,
    maxSizeMB: 50,
    features: [
      "Convert multiple JPGs into one PDF",
      "Maintains original photo resolution",
      "Auto page sizing to match photo aspect ratios",
      "Completely local browser conversion"
    ],
    instructions: [
      "Upload or drag & drop one or more JPG files.",
      "Re-order photos if you uploaded multiple files.",
      "Click 'Convert to PDF'.",
      "Download your newly created PDF."
    ],
    faqs: [
      {
        q: "Can I combine multiple photos into a single PDF book?",
        a: "Yes! Upload all your photos, order them, and they will be stitched into a sequential multi-page PDF."
      }
    ],
    related: ["png-to-pdf", "merge-pdf", "image-to-pdf", "compress-image"]
  },
  {
    slug: "png-to-pdf",
    category: "pdf",
    name: "PNG to PDF Converter",
    shortDesc: "Convert high-quality PNG graphics and transparent images into a crisp PDF document.",
    icon: "FileImage",
    badge: "100% Client-Side",
    accept: ".png,image/png",
    multiple: true,
    maxSizeMB: 50,
    features: [
      "Convert PNGs to crisp vector-wrapped PDF pages",
      "Preserves sharpness of graphics and diagrams",
      "Batch multiple PNGs into one PDF",
      "Fast in-browser conversion"
    ],
    instructions: [
      "Upload one or more PNG files.",
      "Organize the page order.",
      "Click 'Convert to PDF'.",
      "Download your generated PDF."
    ],
    faqs: [
      {
        q: "Does it support transparent PNGs?",
        a: "Yes! Transparent PNG backgrounds are rendered cleanly onto white PDF canvas pages."
      }
    ],
    related: ["jpg-to-pdf", "image-to-pdf", "convert-image", "merge-pdf"]
  },

  // --- IMAGE TOOLS ---
  {
    slug: "compress-image",
    category: "image",
    name: "Image Compressor",
    shortDesc: "Compress JPG, PNG, and WebP images to drastically reduce file size with optimal visual quality.",
    icon: "Minimize2",
    badge: "100% Client-Side",
    accept: "image/jpeg,image/png,image/webp",
    multiple: false,
    maxSizeMB: 50,
    features: [
      "Adjustable compression quality slider (1% to 100%)",
      "Side-by-side original vs compressed file size preview",
      "Percentage savings calculation",
      "Zero server uploads — 100% private"
    ],
    instructions: [
      "Upload your image (JPEG, PNG, or WebP).",
      "Adjust the quality slider to find your desired balance between file size and sharpness.",
      "Review the estimated savings in real-time.",
      "Click 'Download Compressed Image'."
    ],
    faqs: [
      {
        q: "How does browser-side image compression work?",
        a: "Your browser's HTML5 Canvas engine and native hardware-accelerated image decoders re-encode the image at your specified quality level directly in memory."
      },
      {
        q: "What is the recommended quality setting?",
        a: "A quality setting between 70% and 80% typically reduces file size by 60-80% with virtually indistinguishable visual difference."
      }
    ],
    related: ["resize-image", "convert-image", "crop-image", "image-to-pdf"]
  },
  {
    slug: "resize-image",
    category: "image",
    name: "Image Resizer",
    shortDesc: "Resize image dimensions by exact pixels, percentage, or target width and height.",
    icon: "Scaling",
    badge: "100% Client-Side",
    accept: "image/*",
    multiple: false,
    maxSizeMB: 50,
    features: [
      "Resize by exact width and height in pixels",
      "Maintain aspect ratio lock",
      "Preset percentage scaling (25%, 50%, 75%)",
      "High-quality bicubic canvas resampling"
    ],
    instructions: [
      "Upload your image.",
      "Enter your desired width or height, or select a scale percentage.",
      "Keep the aspect ratio lock checked to avoid distortion.",
      "Click 'Resize & Download'."
    ],
    faqs: [
      {
        q: "Does resizing distort my image?",
        a: "Not if the aspect ratio lock is enabled. Changing the width automatically adjusts the height proportionately."
      }
    ],
    related: ["compress-image", "crop-image", "rotate-image", "image-dpi-calculator"]
  },
  {
    slug: "convert-image",
    category: "image",
    name: "Image Converter",
    shortDesc: "Convert images seamlessly between PNG, JPG, and WebP formats.",
    icon: "RefreshCw",
    badge: "100% Client-Side",
    accept: "image/*",
    multiple: false,
    maxSizeMB: 50,
    features: [
      "Convert any image to WebP (next-gen web format)",
      "Convert PNG to JPG or JPG to PNG",
      "Quality selection for lossy formats",
      "Instant download without waiting in cloud queues"
    ],
    instructions: [
      "Upload your image.",
      "Choose your desired output format (PNG, JPEG, WebP).",
      "Click 'Convert Image'.",
      "Download your converted file."
    ],
    faqs: [
      {
        q: "Why should I convert images to WebP?",
        a: "WebP provides superior compression and quality compared to legacy JPG and PNG, making websites load up to 30% faster."
      }
    ],
    related: ["compress-image", "resize-image", "jpg-to-pdf", "image-to-pdf"]
  },
  {
    slug: "crop-image",
    category: "image",
    name: "Image Cropper",
    shortDesc: "Crop images to custom rectangular dimensions or popular aspect ratios (1:1, 16:9, 4:3).",
    icon: "Crop",
    badge: "100% Client-Side",
    accept: "image/*",
    multiple: false,
    maxSizeMB: 50,
    features: [
      "Preset aspect ratios: Square (1:1), 16:9, 4:3, 3:2",
      "Custom pixel coordinate cropping",
      "Live dimension feedback",
      "Preserves original pixel clarity"
    ],
    instructions: [
      "Upload your image.",
      "Set your crop coordinates or select an aspect ratio preset.",
      "Click 'Crop & Download'.",
      "Download your framed image."
    ],
    faqs: [
      {
        q: "Can I crop for Instagram or YouTube thumbnails?",
        a: "Yes! Use 1:1 for social profile pictures/Instagram posts and 16:9 for YouTube thumbnails or banner graphics."
      }
    ],
    related: ["resize-image", "rotate-image", "compress-image", "convert-image"]
  },
  {
    slug: "rotate-image",
    category: "image",
    name: "Image Rotator & Flip",
    shortDesc: "Rotate images 90°, 180°, 270° or flip horizontally and vertically.",
    icon: "RotateCcw",
    badge: "100% Client-Side",
    accept: "image/*",
    multiple: false,
    maxSizeMB: 50,
    features: [
      "Rotate 90° Clockwise or Counter-Clockwise",
      "Rotate 180° upside down",
      "Horizontal flip (mirror) & Vertical flip",
      "Instant canvas render"
    ],
    instructions: [
      "Upload your image.",
      "Click the rotate or flip buttons to adjust the orientation.",
      "Click 'Save Rotated Image'.",
      "Download your corrected file."
    ],
    faqs: [
      {
        q: "Can I fix upside-down smartphone photos?",
        a: "Yes! Simply upload your photo, click rotate 180° or 90°, and download the corrected orientation."
      }
    ],
    related: ["crop-image", "resize-image", "convert-image", "compress-image"]
  },
  {
    slug: "image-to-pdf",
    category: "image",
    name: "Image to PDF",
    shortDesc: "Convert single or multiple images (JPG, PNG, WebP) into an organized PDF.",
    icon: "Images",
    badge: "100% Client-Side",
    accept: "image/jpeg,image/png,image/webp",
    multiple: true,
    maxSizeMB: 50,
    features: [
      "Supports JPG, PNG, and WebP images",
      "Re-order uploaded images before PDF generation",
      "Custom page fit: Fit to Page or Original Size",
      "Completely local client-side processing"
    ],
    instructions: [
      "Upload one or multiple images.",
      "Re-arrange order if necessary.",
      "Click 'Generate PDF'.",
      "Download your new PDF document."
    ],
    faqs: [
      {
        q: "Can I merge different image formats like JPG and PNG together?",
        a: "Yes! You can upload mixed JPGs and PNGs, and PDFpadar combines them into a seamless single document."
      }
    ],
    related: ["jpg-to-pdf", "png-to-pdf", "merge-pdf", "convert-image"]
  },
  {
    slug: "image-dpi-calculator",
    category: "image",
    name: "Image DPI & Print Calculator",
    shortDesc: "Calculate print dimensions in inches and centimeters based on pixel resolution and DPI.",
    icon: "Calculator",
    badge: "Interactive Tool",
    accept: "image/*",
    multiple: false,
    maxSizeMB: 50,
    features: [
      "Upload an image to auto-detect pixel dimensions",
      "Calculate print size at 300 DPI (high-res), 150 DPI, 72 DPI (screen)",
      "Reverse calculation: compute required pixels for target print size",
      "Inches, Centimeters, and Millimeters conversion"
    ],
    instructions: [
      "Upload an image or enter pixel dimensions manually.",
      "Select your desired print DPI (e.g. 300 DPI for standard printing).",
      "View the exact physical print dimensions in inches and centimeters.",
      "Use the recommendations to verify if your image meets print quality guidelines."
    ],
    faqs: [
      {
        q: "What DPI is recommended for high-quality printing?",
        a: "300 DPI (dots per inch) is the industry standard for commercial books, magazines, and crisp photography prints."
      }
    ],
    related: ["resize-image", "compress-image", "image-metadata", "convert-image"]
  },
  {
    slug: "image-metadata",
    category: "image",
    name: "Image Metadata & EXIF Viewer",
    shortDesc: "Inspect image properties, resolution, MIME type, file size, and strip metadata for privacy.",
    icon: "Info",
    badge: "100% Client-Side",
    accept: "image/*",
    multiple: false,
    maxSizeMB: 50,
    features: [
      "Inspect width, height, aspect ratio, and color depth",
      "View file size in Bytes, KB, and MB",
      "Strip all embedded EXIF/metadata by re-exporting clean raster",
      "Total privacy guaranteed"
    ],
    instructions: [
      "Upload your photo or image file.",
      "Review the comprehensive technical metadata table.",
      "Click 'Download Clean Image' to save a version stripped of tracking data."
    ],
    faqs: [
      {
        q: "Why should I strip metadata before sharing photos online?",
        a: "Photos taken on smartphones can contain embedded GPS coordinates, device serial numbers, and camera timestamps. Stripping it protects your location and privacy."
      }
    ],
    related: ["file-size-analyzer", "compress-image", "convert-image", "pdf-metadata"]
  },

  // --- FILE PROCESSING TOOLS ---
  {
    slug: "create-zip",
    category: "file",
    name: "ZIP File Creator",
    shortDesc: "Package multiple files of any type into a compressed .zip archive right in your browser.",
    icon: "Archive",
    badge: "100% Client-Side",
    accept: "*/*",
    multiple: true,
    maxSizeMB: 200,
    features: [
      "Compress any file types (documents, images, videos, audio)",
      "Custom archive naming",
      "Standard DEFLATE compression algorithm",
      "Zero server upload — 100% private"
    ],
    instructions: [
      "Select or drag & drop multiple files into the box.",
      "Specify your preferred ZIP archive name.",
      "Click 'Create ZIP Archive'.",
      "Download your bundled .zip file instantly."
    ],
    faqs: [
      {
        q: "Is there a limit on file types?",
        a: "No! You can include any combination of files: PDFs, images, docs, code files, spreadsheets, or music."
      }
    ],
    related: ["extract-zip", "file-size-analyzer", "batch-file-renaming", "file-hash-generator"]
  },
  {
    slug: "extract-zip",
    category: "file",
    name: "ZIP File Extractor",
    shortDesc: "Unpack and explore the contents of .zip files without installing desktop software.",
    icon: "FolderArchive",
    badge: "100% Client-Side",
    accept: ".zip,application/zip,application/x-zip-compressed",
    multiple: false,
    maxSizeMB: 200,
    features: [
      "Inspect ZIP file structure and file list",
      "View individual uncompressed file sizes",
      "Download extracted files individually or together",
      "Runs locally in browser memory"
    ],
    instructions: [
      "Upload your .zip file.",
      "View the list of all files and folders contained in the archive.",
      "Click on any file to download it individually, or click 'Extract All'."
    ],
    faqs: [
      {
        q: "Are password-protected ZIP archives supported?",
        a: "Standard unencrypted ZIP archives are fully supported directly in the browser."
      }
    ],
    related: ["create-zip", "file-size-analyzer", "file-hash-generator", "file-comparison"]
  },
  {
    slug: "file-hash-generator",
    category: "file",
    name: "File Hash Generator",
    shortDesc: "Calculate SHA-256, SHA-1, SHA-384, and SHA-512 cryptographic checksums for any file.",
    icon: "Fingerprint",
    badge: "Web Crypto API",
    accept: "*/*",
    multiple: false,
    maxSizeMB: 500,
    features: [
      "Computes SHA-256, SHA-1, SHA-384, and SHA-512",
      "Native hardware-accelerated Web Crypto API",
      "One-click copy to clipboard",
      "Verify file integrity and detect tampering"
    ],
    instructions: [
      "Upload any file from your computer.",
      "The tool calculates the cryptographic hash fingerprints automatically.",
      "Click the copy icon next to any hash to copy it to your clipboard.",
      "Compare with the expected hash to verify file authenticity."
    ],
    faqs: [
      {
        q: "What is a file hash used for?",
        a: "A file hash is a unique digital fingerprint. If a file is modified by even one byte, its hash changes completely. It is commonly used to verify downloads and detect corruption."
      }
    ],
    related: ["file-comparison", "file-size-analyzer", "create-zip", "image-metadata"]
  },
  {
    slug: "file-comparison",
    category: "file",
    name: "File Comparison Utility",
    shortDesc: "Compare two text, code, or data files side-by-side to highlight additions, deletions, and differences.",
    icon: "GitCompare",
    badge: "100% Client-Side",
    accept: "text/*,.txt,.json,.csv,.js,.html,.css,.md,.xml,.py",
    multiple: true,
    maxSizeMB: 10,
    features: [
      "Side-by-side line difference comparison",
      "Highlights additions in green and removals in red",
      "Line count and difference summary statistics",
      "Ideal for code, JSON, CSV, and text drafts"
    ],
    instructions: [
      "Upload File A (Original) and File B (Modified), or paste text directly.",
      "Click 'Compare Files'.",
      "Review the visual diff report highlighting changes and line counts."
    ],
    faqs: [
      {
        q: "Can I compare code files like JSON, JavaScript, or Markdown?",
        a: "Yes! Any plain-text based format (JSON, CSV, MD, JS, HTML, TXT, XML) can be compared instantly."
      }
    ],
    related: ["file-hash-generator", "file-size-analyzer", "batch-file-renaming", "extract-zip"]
  },
  {
    slug: "file-size-analyzer",
    category: "file",
    name: "File Size & Format Analyzer",
    shortDesc: "Analyze file properties, byte sizes, human-readable breakdown, MIME types, and storage usage.",
    icon: "PieChart",
    badge: "100% Client-Side",
    accept: "*/*",
    multiple: true,
    maxSizeMB: 500,
    features: [
      "Detailed byte count, KB, MB, and GB calculations",
      "MIME type and file signature detection",
      "Last modified timestamp inspection",
      "Batch summary comparison across multiple files"
    ],
    instructions: [
      "Upload one or more files of any format.",
      "View the breakdown of file sizes, formats, and proportions.",
      "Export or copy the file summary."
    ],
    faqs: [
      {
        q: "Can I inspect multiple files to see which is taking up the most space?",
        a: "Yes! Upload multiple files and PDFpadar will display an interactive table ranking them by size."
      }
    ],
    related: ["file-hash-generator", "create-zip", "document-page-counter", "compress-image"]
  },
  {
    slug: "batch-file-renaming",
    category: "file",
    name: "Batch File Renamer",
    shortDesc: "Rename multiple files at once with custom prefixes, suffixes, numbering, or find-and-replace.",
    icon: "Tag",
    badge: "100% Client-Side",
    accept: "*/*",
    multiple: true,
    maxSizeMB: 100,
    features: [
      "Add prefix or suffix to file names",
      "Sequential numbering (e.g., photo_01, photo_02)",
      "Find and replace text in file names",
      "Download all renamed files bundled in a convenient ZIP"
    ],
    instructions: [
      "Upload the batch of files you want to rename.",
      "Choose your renaming rule (prefix, suffix, numbering pattern, or find/replace).",
      "Preview the before-and-after file names in real-time.",
      "Click 'Rename & Download ZIP'."
    ],
    faqs: [
      {
        q: "Does renaming change the content inside my files?",
        a: "No. The file contents remain 100% untouched and identical; only the filenames in the ZIP bundle are updated."
      }
    ],
    related: ["create-zip", "extract-zip", "file-size-analyzer", "file-comparison"]
  },
  {
    slug: "document-page-counter",
    category: "file",
    name: "Document Page Counter",
    shortDesc: "Count total pages across multiple PDF documents instantly without uploading.",
    icon: "BookOpen",
    badge: "100% Client-Side",
    accept: ".pdf,application/pdf",
    multiple: true,
    maxSizeMB: 100,
    features: [
      "Instant page count detection per document",
      "Total aggregate page count sum across all files",
      "Fast header inspection without full document rendering",
      "100% private in browser"
    ],
    instructions: [
      "Upload one or several PDF files.",
      "View the individual page counts and total combined pages immediately.",
      "Export or copy the document count summary."
    ],
    faqs: [
      {
        q: "Can this count pages in hundreds of documents at once?",
        a: "Yes! PDFpadar parses only the page-tree catalog headers of your PDFs, making page counting virtually instantaneous even for large batches."
      }
    ],
    related: ["merge-pdf", "split-pdf", "pdf-metadata", "file-size-analyzer"]
  }
];

export const getToolBySlug = (slug) => TOOLS.find((t) => t.slug === slug);
export const getToolsByCategory = (cat) => TOOLS.filter((t) => t.category === cat);
export const getRelatedTools = (slug) => {
  const tool = getToolBySlug(slug);
  if (!tool || !tool.related) return [];
  return tool.related.map((s) => getToolBySlug(s)).filter(Boolean);
};
