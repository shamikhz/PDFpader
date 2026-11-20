"use client";

import React, { useState } from "react";
import FileDropzone from "./FileDropzone";
import DynamicIcon from "./DynamicIcon";
import {
  mergePdf,
  splitPdf,
  rotatePdf,
  deletePdfPages,
  extractPdfPages,
  organizePdf,
  addWatermark,
  addPageNumbers,
  protectPdf,
  unlockPdf,
  getPdfMetadata,
  updatePdfMetadata,
  convertPdfPageSize,
  imagesToPdf,
  countPdfPages,
} from "@/lib/pdf-engine";
import {
  compressImage,
  resizeImage,
  convertImage,
  cropImage,
  rotateAndFlipImage,
  calculatePrintDimensions,
  getImageMetadata,
} from "@/lib/image-engine";
import {
  createZip,
  extractZip,
  calculateFileHashes,
  compareTextFiles,
  analyzeFiles,
  batchRenameFiles,
} from "@/lib/file-engine";
import {
  Download,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  FileCheck,
  Sparkles,
  Lock,
} from "lucide-react";

export default function ToolView({ tool }) {
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  // Tool specific options state
  const [pdfRange, setPdfRange] = useState("1-3");
  const [splitMode, setSplitMode] = useState("range");
  const [rotationAngle, setRotationAngle] = useState(90);
  const [rotationSelection, setRotationSelection] = useState("all");
  const [customRotateRange, setCustomRotateRange] = useState("");
  const [deletePagesInput, setDeletePagesInput] = useState("1");
  const [extractPagesInput, setExtractPagesInput] = useState("1-2");
  const [organizeOrderInput, setOrganizeOrderInput] = useState("");
  const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL");
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.3);
  const [watermarkFontSize, setWatermarkFontSize] = useState(48);
  const [pageNumberFormat, setPageNumberFormat] = useState("Page {n} of {total}");
  const [pageNumberPos, setPageNumberPos] = useState("bottom-center");
  const [pdfPassword, setPdfPassword] = useState("");
  const [pdfPageSize, setPdfPageSize] = useState("A4");
  const [pdfMeta, setPdfMeta] = useState({ title: "", author: "", subject: "", keywords: "" });

  // Image tool options
  const [imageQuality, setImageQuality] = useState(80);
  const [resizeWidth, setResizeWidth] = useState(1200);
  const [resizeHeight, setResizeHeight] = useState("");
  const [maintainAspect, setMaintainAspect] = useState(true);
  const [convertFormat, setConvertFormat] = useState("image/webp");
  const [cropWidth, setCropWidth] = useState(800);
  const [cropHeight, setCropHeight] = useState(800);
  const [imageDpi, setImageDpi] = useState(300);

  // File tool options
  const [zipName, setZipName] = useState("bundle.zip");
  const [renameRule, setRenameRule] = useState("prefix");
  const [renamePrefix, setRenamePrefix] = useState("doc_");
  const [renameSuffix, setRenameSuffix] = useState("");
  const [renameFind, setRenameFind] = useState("");
  const [renameReplace, setRenameReplace] = useState("");

  const triggerDownload = (url, filename) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleReset = () => {
    setFiles([]);
    setResult(null);
    setError("");
    setProgress(0);
    setProcessing(false);
  };

  const executeProcess = async () => {
    if (files.length === 0) {
      setError("Please select or drop at least one file first.");
      return;
    }

    setProcessing(true);
    setProgress(10);
    setError("");
    setResult(null);

    try {
      const slug = tool.slug;

      // --- PDF TOOLS ---
      if (slug === "merge-pdf") {
        if (files.length < 2) {
          throw new Error("Please upload at least 2 PDF files to merge.");
        }
        const bytes = await mergePdf(files, setProgress);
        const blob = new Blob([bytes], { type: "application/pdf" });
        setResult({
          type: "download",
          blob,
          url: URL.createObjectURL(blob),
          filename: "merged_document.pdf",
          message: `Successfully merged ${files.length} PDF documents into one!`,
        });
      } else if (slug === "split-pdf") {
        const splitRes = await splitPdf(files[0], splitMode, pdfRange, setProgress);
        if (Array.isArray(splitRes)) {
          // Array of single pages: bundle into ZIP
          const zip = await createZip(
            splitRes.map((r) => new File([r.bytes], r.name, { type: "application/pdf" })),
            "split_pages.zip"
          );
          setResult({
            type: "download",
            blob: zip.blob,
            url: zip.url,
            filename: zip.fileName,
            message: `Extracted ${splitRes.length} individual pages into a ZIP archive!`,
          });
        } else {
          const blob = new Blob([splitRes], { type: "application/pdf" });
          setResult({
            type: "download",
            blob,
            url: URL.createObjectURL(blob),
            filename: `split_${files[0].name}`,
            message: `Successfully extracted page range (${pdfRange})!`,
          });
        }
      } else if (slug === "rotate-pdf") {
        const bytes = await rotatePdf(
          files[0],
          Number(rotationAngle),
          rotationSelection,
          customRotateRange,
          setProgress
        );
        const blob = new Blob([bytes], { type: "application/pdf" });
        setResult({
          type: "download",
          blob,
          url: URL.createObjectURL(blob),
          filename: `rotated_${files[0].name}`,
          message: `Rotated pages by ${rotationAngle}° successfully!`,
        });
      } else if (slug === "delete-pdf-pages") {
        const bytes = await deletePdfPages(files[0], deletePagesInput, setProgress);
        const blob = new Blob([bytes], { type: "application/pdf" });
        setResult({
          type: "download",
          blob,
          url: URL.createObjectURL(blob),
          filename: `trimmed_${files[0].name}`,
          message: `Removed pages (${deletePagesInput}) successfully!`,
        });
      } else if (slug === "extract-pdf-pages") {
        const bytes = await extractPdfPages(files[0], extractPagesInput, setProgress);
        const blob = new Blob([bytes], { type: "application/pdf" });
        setResult({
          type: "download",
          blob,
          url: URL.createObjectURL(blob),
          filename: `extracted_${files[0].name}`,
          message: `Extracted pages (${extractPagesInput}) into new PDF!`,
        });
      } else if (slug === "organize-pdf") {
        const bytes = await organizePdf(files[0], organizeOrderInput, setProgress);
        const blob = new Blob([bytes], { type: "application/pdf" });
        setResult({
          type: "download",
          blob,
          url: URL.createObjectURL(blob),
          filename: `reorganized_${files[0].name}`,
          message: "Pages reorganized successfully!",
        });
      } else if (slug === "add-watermark") {
        const bytes = await addWatermark(
          files[0],
          watermarkText,
          {
            opacity: parseFloat(watermarkOpacity),
            fontSize: parseInt(watermarkFontSize, 10),
          },
          setProgress
        );
        const blob = new Blob([bytes], { type: "application/pdf" });
        setResult({
          type: "download",
          blob,
          url: URL.createObjectURL(blob),
          filename: `watermarked_${files[0].name}`,
          message: `Watermark "${watermarkText}" stamped across all pages!`,
        });
      } else if (slug === "add-page-numbers") {
        const bytes = await addPageNumbers(
          files[0],
          {
            format: pageNumberFormat,
            position: pageNumberPos,
          },
          setProgress
        );
        const blob = new Blob([bytes], { type: "application/pdf" });
        setResult({
          type: "download",
          blob,
          url: URL.createObjectURL(blob),
          filename: `numbered_${files[0].name}`,
          message: "Page numbers inserted successfully!",
        });
      } else if (slug === "protect-pdf") {
        const bytes = await protectPdf(files[0], pdfPassword, setProgress);
        const blob = new Blob([bytes], { type: "application/pdf" });
        setResult({
          type: "download",
          blob,
          url: URL.createObjectURL(blob),
          filename: `protected_${files[0].name}`,
          message: "PDF encrypted and password-protected successfully!",
        });
      } else if (slug === "unlock-pdf") {
        const bytes = await unlockPdf(files[0], pdfPassword, setProgress);
        const blob = new Blob([bytes], { type: "application/pdf" });
        setResult({
          type: "download",
          blob,
          url: URL.createObjectURL(blob),
          filename: `unlocked_${files[0].name}`,
          message: "PDF unlocked and password removed successfully!",
        });
      } else if (slug === "pdf-metadata") {
        const bytes = await updatePdfMetadata(files[0], pdfMeta, setProgress);
        const blob = new Blob([bytes], { type: "application/pdf" });
        setResult({
          type: "download",
          blob,
          url: URL.createObjectURL(blob),
          filename: `updated_${files[0].name}`,
          message: "PDF metadata saved successfully!",
        });
      } else if (slug === "pdf-page-size") {
        const bytes = await convertPdfPageSize(files[0], pdfPageSize, setProgress);
        const blob = new Blob([bytes], { type: "application/pdf" });
        setResult({
          type: "download",
          blob,
          url: URL.createObjectURL(blob),
          filename: `${pdfPageSize}_${files[0].name}`,
          message: `Pages standardized to ${pdfPageSize} dimensions!`,
        });
      } else if (slug === "jpg-to-pdf" || slug === "png-to-pdf" || slug === "image-to-pdf") {
        const bytes = await imagesToPdf(files, setProgress);
        const blob = new Blob([bytes], { type: "application/pdf" });
        setResult({
          type: "download",
          blob,
          url: URL.createObjectURL(blob),
          filename: "images_converted.pdf",
          message: `Converted ${files.length} image(s) into a unified PDF!`,
        });
      }

      // --- IMAGE TOOLS ---
      else if (slug === "compress-image") {
        const comp = await compressImage(files[0], imageQuality / 100, setProgress);
        setResult({
          type: "compress",
          ...comp,
          filename: `compressed_${files[0].name}`,
        });
      } else if (slug === "resize-image") {
        const resized = await resizeImage(
          files[0],
          {
            width: parseInt(resizeWidth, 10) || null,
            height: parseInt(resizeHeight, 10) || null,
            maintainAspect,
          },
          setProgress
        );
        setResult({
          type: "download",
          blob: resized.blob,
          url: resized.url,
          filename: `resized_${resized.width}x${resized.height}_${files[0].name}`,
          message: `Image resized to ${resized.width} × ${resized.height} px!`,
        });
      } else if (slug === "convert-image") {
        const ext = convertFormat === "image/webp" ? ".webp" : convertFormat === "image/jpeg" ? ".jpg" : ".png";
        const converted = await convertImage(files[0], convertFormat, 0.9, setProgress);
        const base = files[0].name.replace(/\.[^/.]+$/, "");
        setResult({
          type: "download",
          blob: converted.blob,
          url: converted.url,
          filename: `${base}${ext}`,
          message: `Converted to ${convertFormat.replace("image/", "").toUpperCase()}!`,
        });
      } else if (slug === "crop-image") {
        const cropped = await cropImage(
          files[0],
          { x: 0, y: 0, width: parseInt(cropWidth, 10), height: parseInt(cropHeight, 10) },
          setProgress
        );
        setResult({
          type: "download",
          blob: cropped.blob,
          url: cropped.url,
          filename: `cropped_${files[0].name}`,
          message: `Image cropped to ${cropped.width} × ${cropped.height} px!`,
        });
      } else if (slug === "rotate-image") {
        const rot = await rotateAndFlipImage(files[0], Number(rotationAngle), false, false, setProgress);
        setResult({
          type: "download",
          blob: rot.blob,
          url: rot.url,
          filename: `rotated_${files[0].name}`,
          message: `Rotated image by ${rotationAngle}°!`,
        });
      } else if (slug === "image-dpi-calculator") {
        const meta = await getImageMetadata(files[0]);
        const calc = calculatePrintDimensions(meta.width, meta.height, Number(imageDpi));
        setProgress(100);
        setResult({
          type: "dpi-calc",
          meta,
          calc,
        });
      } else if (slug === "image-metadata") {
        const meta = await getImageMetadata(files[0]);
        setProgress(100);
        setResult({
          type: "image-meta",
          meta,
        });
      }

      // --- FILE PROCESSING TOOLS ---
      else if (slug === "create-zip") {
        const zip = await createZip(files, zipName, setProgress);
        setResult({
          type: "download",
          blob: zip.blob,
          url: zip.url,
          filename: zip.fileName,
          message: `Packaged ${files.length} files into ZIP archive!`,
        });
      } else if (slug === "extract-zip") {
        const entries = await extractZip(files[0], setProgress);
        setResult({
          type: "zip-entries",
          entries,
          zipFileName: files[0].name,
        });
      } else if (slug === "file-hash-generator") {
        const hashData = await calculateFileHashes(files[0], setProgress);
        setResult({
          type: "hashes",
          hashData,
        });
      } else if (slug === "file-comparison") {
        if (files.length < 2) {
          throw new Error("Please upload 2 text or code files to compare.");
        }
        const diff = await compareTextFiles(files[0], files[1]);
        setProgress(100);
        setResult({
          type: "diff",
          diff,
        });
      } else if (slug === "file-size-analyzer") {
        const analysis = analyzeFiles(files);
        setProgress(100);
        setResult({
          type: "file-analysis",
          analysis,
        });
      } else if (slug === "batch-file-renaming") {
        const renamed = await batchRenameFiles(
          files,
          {
            rule: renameRule,
            prefix: renamePrefix,
            suffix: renameSuffix,
            findText: renameFind,
            replaceText: renameReplace,
          },
          setProgress
        );
        setResult({
          type: "download",
          blob: renamed.blob,
          url: renamed.url,
          filename: renamed.fileName,
          message: `Renamed ${files.length} files and packaged into ZIP!`,
          details: renamed.renamedList,
        });
      } else if (slug === "document-page-counter") {
        const counts = [];
        let total = 0;
        for (let i = 0; i < files.length; i++) {
          const f = files[i];
          const count = await countPdfPages(f);
          counts.push({ name: f.name, pages: count });
          total += count;
          setProgress(Math.round(((i + 1) / files.length) * 100));
        }
        setResult({
          type: "page-count",
          counts,
          total,
        });
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during processing.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
      {/* Tool Processing Controls */}
      <div className="space-y-6">
        {/* Upload Dropzone */}
        <FileDropzone
          accept={tool.accept}
          multiple={tool.multiple}
          maxSizeMB={tool.maxSizeMB}
          files={files}
          onFilesChange={(newFiles) => {
            setFiles(newFiles);
            setResult(null);
            setError("");
          }}
          title={tool.multiple ? `Drop ${tool.name} files here` : `Drop your ${tool.name} file here`}
        />

        {/* Dynamic Tool Settings Configuration */}
        {files.length > 0 && (
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <Sparkles className="w-4 h-4 text-brand-500" />
              <span>Tool Options & Parameters</span>
            </div>

            {/* Split PDF settings */}
            {tool.slug === "split-pdf" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Split Mode
                  </label>
                  <select
                    value={splitMode}
                    onChange={(e) => setSplitMode(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  >
                    <option value="range">Extract Page Range</option>
                    <option value="single">Split into Individual Single Pages (ZIP)</option>
                  </select>
                </div>
                {splitMode === "range" && (
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Page Ranges (e.g. 1-3, 5)
                    </label>
                    <input
                      type="text"
                      value={pdfRange}
                      onChange={(e) => setPdfRange(e.target.value)}
                      placeholder="1-3, 5"
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Rotate PDF settings */}
            {tool.slug === "rotate-pdf" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Rotation Angle
                  </label>
                  <select
                    value={rotationAngle}
                    onChange={(e) => setRotationAngle(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  >
                    <option value={90}>90° Clockwise</option>
                    <option value={180}>180° Flip</option>
                    <option value={270}>270° Counter-Clockwise</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Apply To
                  </label>
                  <select
                    value={rotationSelection}
                    onChange={(e) => setRotationSelection(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  >
                    <option value="all">All Pages</option>
                    <option value="odd">Odd Pages Only</option>
                    <option value="even">Even Pages Only</option>
                  </select>
                </div>
              </div>
            )}

            {/* Delete PDF Pages settings */}
            {tool.slug === "delete-pdf-pages" && (
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Pages to Remove (e.g. 1, 3, 5-7)
                </label>
                <input
                  type="text"
                  value={deletePagesInput}
                  onChange={(e) => setDeletePagesInput(e.target.value)}
                  placeholder="2, 4-6"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>
            )}

            {/* Extract PDF Pages settings */}
            {tool.slug === "extract-pdf-pages" && (
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Pages to Extract (e.g. 1, 3-5)
                </label>
                <input
                  type="text"
                  value={extractPagesInput}
                  onChange={(e) => setExtractPagesInput(e.target.value)}
                  placeholder="1, 3-5"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>
            )}

            {/* Organize PDF settings */}
            {tool.slug === "organize-pdf" && (
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Desired Page Order Sequence (e.g. 3, 1, 2)
                </label>
                <input
                  type="text"
                  value={organizeOrderInput}
                  onChange={(e) => setOrganizeOrderInput(e.target.value)}
                  placeholder="3, 1, 2"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>
            )}

            {/* Add Watermark settings */}
            {tool.slug === "add-watermark" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Watermark Text
                  </label>
                  <input
                    type="text"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    placeholder="CONFIDENTIAL"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Opacity ({Math.round(watermarkOpacity * 100)}%)
                  </label>
                  <input
                    type="range"
                    min="0.05"
                    max="0.8"
                    step="0.05"
                    value={watermarkOpacity}
                    onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value))}
                    className="w-full mt-2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Font Size ({watermarkFontSize}px)
                  </label>
                  <input
                    type="number"
                    value={watermarkFontSize}
                    onChange={(e) => setWatermarkFontSize(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
              </div>
            )}

            {/* Add Page Numbers settings */}
            {tool.slug === "add-page-numbers" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Numbering Format
                  </label>
                  <select
                    value={pageNumberFormat}
                    onChange={(e) => setPageNumberFormat(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  >
                    <option value="Page {n} of {total}">Page X of Y</option>
                    <option value="{n}">Page number only (X)</option>
                    <option value="- {n} -">- X -</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Position on Page
                  </label>
                  <select
                    value={pageNumberPos}
                    onChange={(e) => setPageNumberPos(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  >
                    <option value="bottom-center">Bottom Center</option>
                    <option value="bottom-right">Bottom Right</option>
                    <option value="bottom-left">Bottom Left</option>
                    <option value="top-center">Top Center</option>
                    <option value="top-right">Top Right</option>
                  </select>
                </div>
              </div>
            )}

            {/* Protect / Unlock PDF settings */}
            {(tool.slug === "protect-pdf" || tool.slug === "unlock-pdf") && (
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {tool.slug === "protect-pdf" ? "Set Document Password" : "Enter Document Password"}
                </label>
                <input
                  type="password"
                  value={pdfPassword}
                  onChange={(e) => setPdfPassword(e.target.value)}
                  placeholder="Enter secure password"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>
            )}

            {/* PDF Metadata Editor */}
            {tool.slug === "pdf-metadata" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Document Title
                  </label>
                  <input
                    type="text"
                    value={pdfMeta.title}
                    onChange={(e) => setPdfMeta({ ...pdfMeta, title: e.target.value })}
                    placeholder="New Title"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Author
                  </label>
                  <input
                    type="text"
                    value={pdfMeta.author}
                    onChange={(e) => setPdfMeta({ ...pdfMeta, author: e.target.value })}
                    placeholder="Author Name"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
              </div>
            )}

            {/* PDF Page Size settings */}
            {tool.slug === "pdf-page-size" && (
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Target Standard Dimensions
                </label>
                <select
                  value={pdfPageSize}
                  onChange={(e) => setPdfPageSize(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                >
                  <option value="A4">A4 (210 × 297 mm)</option>
                  <option value="Letter">US Letter (8.5 × 11 in)</option>
                  <option value="Legal">US Legal (8.5 × 14 in)</option>
                </select>
              </div>
            )}

            {/* Compress Image settings */}
            {tool.slug === "compress-image" && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Compression Quality
                  </label>
                  <span className="text-xs font-bold text-brand-600 dark:text-brand-400">
                    {imageQuality}%
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="95"
                  value={imageQuality}
                  onChange={(e) => setImageQuality(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                  <span>Smaller Size (More compressed)</span>
                  <span>Higher Quality</span>
                </div>
              </div>
            )}

            {/* Resize Image settings */}
            {tool.slug === "resize-image" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Target Width (px)
                  </label>
                  <input
                    type="number"
                    value={resizeWidth}
                    onChange={(e) => setResizeWidth(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Target Height (px)
                  </label>
                  <input
                    type="number"
                    value={resizeHeight}
                    placeholder="Auto (proportional)"
                    onChange={(e) => setResizeHeight(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
              </div>
            )}

            {/* Convert Image settings */}
            {tool.slug === "convert-image" && (
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Target Output Format
                </label>
                <select
                  value={convertFormat}
                  onChange={(e) => setConvertFormat(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                >
                  <option value="image/webp">WebP (Modern, highly compressed)</option>
                  <option value="image/jpeg">JPG / JPEG (Standard photo format)</option>
                  <option value="image/png">PNG (Lossless with transparency)</option>
                </select>
              </div>
            )}

            {/* Image DPI calculator settings */}
            {tool.slug === "image-dpi-calculator" && (
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Target Print DPI (Dots Per Inch)
                </label>
                <select
                  value={imageDpi}
                  onChange={(e) => setImageDpi(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                >
                  <option value={300}>300 DPI — Fine Art & Professional Print</option>
                  <option value={150}>150 DPI — Good Office / Brochure Print</option>
                  <option value={72}>72 DPI — Standard Web Screen</option>
                </select>
              </div>
            )}

            {/* Create ZIP settings */}
            {tool.slug === "create-zip" && (
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  ZIP Archive Name
                </label>
                <input
                  type="text"
                  value={zipName}
                  onChange={(e) => setZipName(e.target.value)}
                  placeholder="archive.zip"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>
            )}

            {/* Batch Renamer settings */}
            {tool.slug === "batch-file-renaming" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Renaming Strategy
                  </label>
                  <select
                    value={renameRule}
                    onChange={(e) => setRenameRule(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  >
                    <option value="prefix">Add Prefix</option>
                    <option value="suffix">Add Suffix</option>
                    <option value="numbering">Sequential Numbering</option>
                    <option value="replace">Find & Replace</option>
                  </select>
                </div>
                {renameRule === "prefix" && (
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Prefix to Prepend
                    </label>
                    <input
                      type="text"
                      value={renamePrefix}
                      onChange={(e) => setRenamePrefix(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>
                )}
                {renameRule === "replace" && (
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={renameFind}
                      onChange={(e) => setRenameFind(e.target.value)}
                      placeholder="Find"
                      className="w-full px-2 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                    <input
                      type="text"
                      value={renameReplace}
                      onChange={(e) => setRenameReplace(e.target.value)}
                      placeholder="Replace with"
                      className="w-full px-2 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 rounded-2xl text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Progress Bar */}
        {processing && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-brand-500 animate-ping" />
                Processing directly in browser memory...
              </span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-500 to-indigo-500 rounded-full transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={executeProcess}
            disabled={files.length === 0 || processing}
            className="flex-1 min-w-[200px] flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl font-semibold text-white bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-500/25 transition-all text-sm"
          >
            <DynamicIcon name={tool.icon} className="w-5 h-5" />
            <span>{processing ? "Processing File..." : `Run ${tool.name}`}</span>
          </button>

          {files.length > 0 && (
            <button
              type="button"
              onClick={handleReset}
              disabled={processing}
              className="py-3.5 px-5 rounded-2xl font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* --- RESULTS SECTION --- */}
      {result && (
        <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800 animate-in fade-in duration-300 space-y-6">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
            <CheckCircle2 className="w-5 h-5" />
            <span>Processing Complete!</span>
          </div>

          {/* Standard Download Result */}
          {result.type === "download" && (
            <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 space-y-4">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {result.message}
              </p>
              <button
                type="button"
                onClick={() => triggerDownload(result.url, result.filename)}
                className="inline-flex items-center gap-2 py-3 px-6 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition-all text-sm"
              >
                <Download className="w-4 h-4" />
                <span>Download {result.filename}</span>
              </button>
            </div>
          )}

          {/* Image Compression Result */}
          {result.type === "compress" && (
            <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-xs text-slate-400 block">Original Size</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">
                    {(result.originalSize / 1024).toFixed(1)} KB
                  </span>
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-xs text-slate-400 block">Compressed Size</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {(result.compressedSize / 1024).toFixed(1)} KB
                  </span>
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-xs text-slate-400 block">Space Saved</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {result.savedPercentage}%
                  </span>
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-xs text-slate-400 block">Format</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">
                    {result.type.replace("image/", "").toUpperCase()}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => triggerDownload(result.url, result.filename)}
                className="inline-flex items-center gap-2 py-3 px-6 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition-all text-sm"
              >
                <Download className="w-4 h-4" />
                <span>Download Optimized Image</span>
              </button>
            </div>
          )}

          {/* Cryptographic Hashes Result */}
          {result.type === "hashes" && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Calculated Checksums for &quot;{result.hashData.fileName}&quot;
              </h4>
              <div className="space-y-2">
                {Object.entries(result.hashData.hashes).map(([algo, hash]) => (
                  <div
                    key={algo}
                    className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <span className="text-xs font-bold text-brand-600 dark:text-brand-400 block">
                        {algo}
                      </span>
                      <span className="font-mono text-xs text-slate-700 dark:text-slate-300 break-all select-all">
                        {hash}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(hash, algo)}
                      className="self-end sm:self-center p-2 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 text-slate-600 dark:text-slate-200 text-xs flex items-center gap-1 shrink-0"
                    >
                      {copiedKey === algo ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Extracted ZIP Entries */}
          {result.type === "zip-entries" && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Extracted Files ({result.entries.length})
                </h4>
              </div>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {result.entries.map((entry, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm"
                  >
                    <div className="truncate mr-2">
                      <span className="font-medium text-slate-800 dark:text-slate-200 block truncate">
                        {entry.name}
                      </span>
                      <span className="text-xs text-slate-400">
                        {(entry.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => triggerDownload(entry.url, entry.name)}
                      className="p-2 rounded-lg bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 shrink-0"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Text Diff Result */}
          {result.type === "diff" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
                <span>File Comparison Diff Report</span>
                <span className={result.diff.identical ? "text-emerald-500" : "text-amber-500"}>
                  {result.diff.identical ? "Files are Identical" : `${result.diff.differencesCount} line differences found`}
                </span>
              </div>
              <div className="max-h-80 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-xs divide-y divide-slate-100 dark:divide-slate-800">
                {result.diff.diffLines.map((line, idx) => (
                  <div
                    key={idx}
                    className={`grid grid-cols-2 p-2 gap-2 ${
                      line.type === "diff"
                        ? "bg-amber-500/10 text-amber-900 dark:text-amber-200"
                        : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <div className="truncate">
                      <span className="text-slate-400 mr-2">{line.lineNum}</span>
                      <span>{line.left ?? "—"}</span>
                    </div>
                    <div className="truncate border-l border-slate-200 dark:border-slate-700 pl-2">
                      <span className="text-slate-400 mr-2">{line.lineNum}</span>
                      <span>{line.right ?? "—"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* File Analysis Result */}
          {result.type === "file-analysis" && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <span className="text-xs text-slate-400 block">Total Files</span>
                  <span className="font-bold text-slate-800 dark:text-white">
                    {result.analysis.totalFiles}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <span className="text-xs text-slate-400 block">Total Volume</span>
                  <span className="font-bold text-brand-600 dark:text-brand-400">
                    {result.analysis.totalFormattedSize}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <span className="text-xs text-slate-400 block">Average File</span>
                  <span className="font-bold text-slate-800 dark:text-white">
                    {result.analysis.averageSize}
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase">
                    <tr>
                      <th className="p-2.5 rounded-l-lg">File Name</th>
                      <th className="p-2.5">Size</th>
                      <th className="p-2.5">Share</th>
                      <th className="p-2.5 rounded-r-lg">Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {result.analysis.fileStats.map((f, i) => (
                      <tr key={i}>
                        <td className="p-2.5 font-medium truncate max-w-xs">{f.name}</td>
                        <td className="p-2.5">{f.formattedSize}</td>
                        <td className="p-2.5 font-semibold text-brand-500">{f.percentageOfTotal}</td>
                        <td className="p-2.5 text-slate-400">{f.type}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Image DPI Calculation Result */}
          {result.type === "dpi-calc" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <span className="text-xs text-slate-400 block">Pixels</span>
                  <span className="font-bold text-slate-800 dark:text-white">
                    {result.meta.width} × {result.meta.height}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <span className="text-xs text-slate-400 block">Print (Inches)</span>
                  <span className="font-bold text-brand-600 dark:text-brand-400">
                    {result.calc.inches}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <span className="text-xs text-slate-400 block">Print (Centimeters)</span>
                  <span className="font-bold text-brand-600 dark:text-brand-400">
                    {result.calc.cm}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <span className="text-xs text-slate-400 block">Print Rating</span>
                  <span className="font-bold text-emerald-500">
                    {result.calc.printQuality}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Document Page Count Result */}
          {result.type === "page-count" && (
            <div className="space-y-4">
              <div className="p-4 bg-brand-50 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-900/40 rounded-2xl flex items-center justify-between">
                <span className="text-sm font-semibold text-brand-900 dark:text-brand-200">
                  Total Aggregate Page Count:
                </span>
                <span className="text-2xl font-extrabold text-brand-600 dark:text-brand-400">
                  {result.total} Pages
                </span>
              </div>
              <div className="space-y-2">
                {result.counts.map((doc, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm"
                  >
                    <span className="font-medium truncate mr-2">{doc.name}</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {doc.pages} pages
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
