"use client";

import React, { useState, useEffect, useRef } from "react";
import FileDropzone from "./FileDropzone";
import DynamicIcon from "./DynamicIcon";
import { formatBytes, sanitizeFilename, revokeUrl } from "@/lib/utils";
// Lazy dynamic engine loaders for code splitting & zero initial page footprint
const getPdfEngine = () => import("@/lib/pdf-engine");
const getImageEngine = () => import("@/lib/image-engine");
const getFileEngine = () => import("@/lib/file-engine");
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
  Eye,
  Sliders,
  FileText,
} from "lucide-react";

export default function ToolView({ tool }) {
  // State machine: 'empty' | 'ready' | 'processing' | 'completed' | 'error'
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  // Track created blob URLs for memory cleanup
  const createdUrls = useRef([]);
  const resultRef = useRef(null);

  // Smoothly scroll to result when processing completes
  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [result]);

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

  // Memory cleanup on unmount
  useEffect(() => {
    return () => {
      createdUrls.current.forEach((url) => revokeUrl(url));
      createdUrls.current = [];
    };
  }, []);

  const registerUrl = (url) => {
    if (url) createdUrls.current.push(url);
    return url;
  };

  const triggerDownload = (url, rawFilename) => {
    const filename = sanitizeFilename(rawFilename, "download");
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
    createdUrls.current.forEach((url) => revokeUrl(url));
    createdUrls.current = [];
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

      // Lazy dynamic engine instances
      let _pdf = null;
      let _img = null;
      let _file = null;
      const getPdf = async () => (_pdf ||= await getPdfEngine());
      const getImg = async () => (_img ||= await getImageEngine());
      const getFile = async () => (_file ||= await getFileEngine());

      // --- PDF TOOLS ---
      if (slug === "merge-pdf") {
        if (files.length < 2) {
          throw new Error("Please upload at least 2 PDF files to merge.");
        }
        const { mergePdf } = await getPdf();
        const bytes = await mergePdf(files, setProgress);
        const blob = new Blob([bytes], { type: "application/pdf" });
        const url = registerUrl(URL.createObjectURL(blob));
        setResult({
          type: "download",
          blob,
          url,
          filename: "merged_document.pdf",
          size: blob.size,
          message: `Successfully merged ${files.length} PDF documents into one unified file.`,
        });
      } else if (slug === "split-pdf") {
        const { splitPdf } = await getPdf();
        const splitRes = await splitPdf(files[0], splitMode, pdfRange, setProgress);
        if (Array.isArray(splitRes)) {
          const { createZip } = await getFile();
          const zip = await createZip(
            splitRes.map((r) => new File([r.bytes], r.name, { type: "application/pdf" })),
            "split_pages.zip"
          );
          const url = registerUrl(zip.url);
          setResult({
            type: "download",
            blob: zip.blob,
            url,
            filename: zip.fileName,
            size: zip.size,
            message: `Extracted ${splitRes.length} individual pages into a ZIP archive.`,
          });
        } else {
          const blob = new Blob([splitRes], { type: "application/pdf" });
          const url = registerUrl(URL.createObjectURL(blob));
          setResult({
            type: "download",
            blob,
            url,
            filename: `split_${files[0].name}`,
            size: blob.size,
            message: `Extracted page range (${pdfRange}) successfully.`,
          });
        }
      } else if (slug === "rotate-pdf") {
        const { rotatePdf } = await getPdf();
        const bytes = await rotatePdf(
          files[0],
          Number(rotationAngle),
          rotationSelection,
          customRotateRange,
          setProgress
        );
        const blob = new Blob([bytes], { type: "application/pdf" });
        const url = registerUrl(URL.createObjectURL(blob));
        setResult({
          type: "download",
          blob,
          url,
          filename: `rotated_${files[0].name}`,
          size: blob.size,
          message: `Rotated pages by ${rotationAngle}° successfully.`,
        });
      } else if (slug === "delete-pdf-pages") {
        const { deletePdfPages } = await getPdf();
        const bytes = await deletePdfPages(files[0], deletePagesInput, setProgress);
        const blob = new Blob([bytes], { type: "application/pdf" });
        const url = registerUrl(URL.createObjectURL(blob));
        setResult({
          type: "download",
          blob,
          url,
          filename: `trimmed_${files[0].name}`,
          size: blob.size,
          message: `Removed pages (${deletePagesInput}) successfully.`,
        });
      } else if (slug === "extract-pdf-pages") {
        const { extractPdfPages } = await getPdf();
        const bytes = await extractPdfPages(files[0], extractPagesInput, setProgress);
        const blob = new Blob([bytes], { type: "application/pdf" });
        const url = registerUrl(URL.createObjectURL(blob));
        setResult({
          type: "download",
          blob,
          url,
          filename: `extracted_${files[0].name}`,
          size: blob.size,
          message: `Extracted pages (${extractPagesInput}) into new PDF.`,
        });
      } else if (slug === "organize-pdf") {
        const { organizePdf } = await getPdf();
        const bytes = await organizePdf(files[0], organizeOrderInput, setProgress);
        const blob = new Blob([bytes], { type: "application/pdf" });
        const url = registerUrl(URL.createObjectURL(blob));
        setResult({
          type: "download",
          blob,
          url,
          filename: `reorganized_${files[0].name}`,
          size: blob.size,
          message: "Pages reorganized according to custom sequence.",
        });
      } else if (slug === "add-watermark") {
        const { addWatermark } = await getPdf();
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
        const url = registerUrl(URL.createObjectURL(blob));
        setResult({
          type: "download",
          blob,
          url,
          filename: `watermarked_${files[0].name}`,
          size: blob.size,
          message: `Watermark "${watermarkText}" stamped on all pages.`,
        });
      } else if (slug === "add-page-numbers") {
        const { addPageNumbers } = await getPdf();
        const bytes = await addPageNumbers(
          files[0],
          {
            format: pageNumberFormat,
            position: pageNumberPos,
          },
          setProgress
        );
        const blob = new Blob([bytes], { type: "application/pdf" });
        const url = registerUrl(URL.createObjectURL(blob));
        setResult({
          type: "download",
          blob,
          url,
          filename: `numbered_${files[0].name}`,
          size: blob.size,
          message: "Page numbers inserted into document margins.",
        });
      } else if (slug === "protect-pdf") {
        const { protectPdf } = await getPdf();
        const bytes = await protectPdf(files[0], pdfPassword, setProgress);
        const blob = new Blob([bytes], { type: "application/pdf" });
        const url = registerUrl(URL.createObjectURL(blob));
        setResult({
          type: "download",
          blob,
          url,
          filename: `protected_${files[0].name}`,
          size: blob.size,
          message: "PDF encrypted with secure password protection.",
        });
      } else if (slug === "unlock-pdf") {
        const { unlockPdf } = await getPdf();
        const bytes = await unlockPdf(files[0], pdfPassword, setProgress);
        const blob = new Blob([bytes], { type: "application/pdf" });
        const url = registerUrl(URL.createObjectURL(blob));
        setResult({
          type: "download",
          blob,
          url,
          filename: `unlocked_${files[0].name}`,
          size: blob.size,
          message: "Password restrictions removed. PDF is now unlocked.",
        });
      } else if (slug === "pdf-metadata") {
        const { updatePdfMetadata } = await getPdf();
        const bytes = await updatePdfMetadata(files[0], pdfMeta, setProgress);
        const blob = new Blob([bytes], { type: "application/pdf" });
        const url = registerUrl(URL.createObjectURL(blob));
        setResult({
          type: "download",
          blob,
          url,
          filename: `updated_${files[0].name}`,
          size: blob.size,
          message: "PDF metadata updated successfully.",
        });
      } else if (slug === "pdf-page-size") {
        const { convertPdfPageSize } = await getPdf();
        const bytes = await convertPdfPageSize(files[0], pdfPageSize, setProgress);
        const blob = new Blob([bytes], { type: "application/pdf" });
        const url = registerUrl(URL.createObjectURL(blob));
        setResult({
          type: "download",
          blob,
          url,
          filename: `${pdfPageSize}_${files[0].name}`,
          size: blob.size,
          message: `Document page dimensions standardized to ${pdfPageSize}.`,
        });
      } else if (slug === "jpg-to-pdf" || slug === "png-to-pdf" || slug === "image-to-pdf") {
        const { imagesToPdf } = await getPdf();
        const bytes = await imagesToPdf(files, setProgress);
        const blob = new Blob([bytes], { type: "application/pdf" });
        const url = registerUrl(URL.createObjectURL(blob));
        setResult({
          type: "download",
          blob,
          url,
          filename: "images_converted.pdf",
          size: blob.size,
          message: `Converted ${files.length} image(s) into a multi-page PDF.`,
        });
      }

      // --- IMAGE TOOLS ---
      else if (slug === "compress-image") {
        const { compressImage } = await getImg();
        if (files.length === 1) {
          const comp = await compressImage(files[0], imageQuality / 100, setProgress);
          const url = registerUrl(comp.url);
          const targetExt = comp.type === "image/webp" ? ".webp" : comp.type === "image/png" ? ".png" : ".jpg";
          const baseName = files[0].name.replace(/\.[^/.]+$/, "");
          const filename = `compressed_${baseName}${targetExt}`;
          setResult({
            type: "compress",
            ...comp,
            url,
            filename,
            previewUrl: url,
            size: comp.compressedSize,
            message: `Successfully compressed ${files[0].name} (${comp.savedPercentage}% saved).`,
          });
        } else {
          const { default: JSZip } = await import("jszip");
          const zip = new JSZip();
          const items = [];
          for (let i = 0; i < files.length; i++) {
            const f = files[i];
            const comp = await compressImage(f, imageQuality / 100, (p) => {
              setProgress(Math.round(((i + p / 100) / files.length) * 100));
            });
            const targetExt = comp.type === "image/webp" ? ".webp" : comp.type === "image/png" ? ".png" : ".jpg";
            const baseName = f.name.replace(/\.[^/.]+$/, "");
            const outName = `compressed_${baseName}${targetExt}`;
            const itemUrl = registerUrl(comp.url);
            zip.file(outName, comp.blob);
            items.push({
              filename: outName,
              originalName: f.name,
              originalSize: f.size,
              compressedSize: comp.compressedSize,
              size: comp.compressedSize,
              savedPercentage: comp.savedPercentage,
              url: itemUrl,
              previewUrl: itemUrl,
            });
          }
          const zipBlob = await zip.generateAsync({ type: "blob" });
          const zipUrl = registerUrl(URL.createObjectURL(zipBlob));
          setResult({
            type: "batch-images",
            items,
            url: zipUrl,
            filename: "compressed_images.zip",
            size: zipBlob.size,
            message: `Successfully compressed ${files.length} images!`,
          });
        }
      } else if (slug === "resize-image") {
        const { resizeImage } = await getImg();
        if (files.length === 1) {
          const resized = await resizeImage(
            files[0],
            {
              width: parseInt(resizeWidth, 10) || null,
              height: parseInt(resizeHeight, 10) || null,
              maintainAspect,
            },
            setProgress
          );
          const url = registerUrl(resized.url);
          setResult({
            type: "download",
            blob: resized.blob,
            url,
            filename: `resized_${resized.width}x${resized.height}_${files[0].name}`,
            size: resized.blob.size,
            previewUrl: url,
            message: `Image resized to ${resized.width} × ${resized.height} px.`,
          });
        } else {
          const { default: JSZip } = await import("jszip");
          const zip = new JSZip();
          const items = [];
          for (let i = 0; i < files.length; i++) {
            const f = files[i];
            const resized = await resizeImage(
              f,
              {
                width: parseInt(resizeWidth, 10) || null,
                height: parseInt(resizeHeight, 10) || null,
                maintainAspect,
              },
              (p) => setProgress(Math.round(((i + p / 100) / files.length) * 100))
            );
            const outName = `resized_${resized.width}x${resized.height}_${f.name}`;
            const itemUrl = registerUrl(resized.url);
            zip.file(outName, resized.blob);
            items.push({
              filename: outName,
              originalName: f.name,
              size: resized.blob.size,
              url: itemUrl,
              previewUrl: itemUrl,
            });
          }
          const zipBlob = await zip.generateAsync({ type: "blob" });
          const zipUrl = registerUrl(URL.createObjectURL(zipBlob));
          setResult({
            type: "batch-images",
            items,
            url: zipUrl,
            filename: "resized_images.zip",
            size: zipBlob.size,
            message: `Successfully resized ${files.length} images!`,
          });
        }
      } else if (slug === "convert-image") {
        const ext = convertFormat === "image/webp" ? ".webp" : convertFormat === "image/jpeg" ? ".jpg" : ".png";
        const { convertImage } = await getImg();
        if (files.length === 1) {
          const converted = await convertImage(files[0], convertFormat, 0.9, setProgress);
          const base = files[0].name.replace(/\.[^/.]+$/, "");
          const url = registerUrl(converted.url);
          setResult({
            type: "download",
            blob: converted.blob,
            url,
            filename: `${base}${ext}`,
            size: converted.blob.size,
            previewUrl: url,
            message: `Image converted to ${convertFormat.replace("image/", "").toUpperCase()}.`,
          });
        } else {
          const { default: JSZip } = await import("jszip");
          const zip = new JSZip();
          const items = [];
          for (let i = 0; i < files.length; i++) {
            const f = files[i];
            const converted = await convertImage(f, convertFormat, 0.9, (p) => {
              setProgress(Math.round(((i + p / 100) / files.length) * 100));
            });
            const base = f.name.replace(/\.[^/.]+$/, "");
            const outName = `${base}${ext}`;
            const itemUrl = registerUrl(converted.url);
            zip.file(outName, converted.blob);
            items.push({
              filename: outName,
              originalName: f.name,
              size: converted.blob.size,
              url: itemUrl,
              previewUrl: itemUrl,
            });
          }
          const zipBlob = await zip.generateAsync({ type: "blob" });
          const zipUrl = registerUrl(URL.createObjectURL(zipBlob));
          setResult({
            type: "batch-images",
            items,
            url: zipUrl,
            filename: `converted_images_${convertFormat.replace("image/", "")}.zip`,
            size: zipBlob.size,
            message: `Successfully converted ${files.length} images to ${convertFormat.replace("image/", "").toUpperCase()}!`,
          });
        }
      } else if (slug === "crop-image") {
        const { cropImage } = await getImg();
        const cropped = await cropImage(
          files[0],
          { x: 0, y: 0, width: parseInt(cropWidth, 10), height: parseInt(cropHeight, 10) },
          setProgress
        );
        const url = registerUrl(cropped.url);
        setResult({
          type: "download",
          blob: cropped.blob,
          url,
          filename: `cropped_${files[0].name}`,
          size: cropped.blob.size,
          previewUrl: url,
          message: `Image cropped to ${cropped.width} × ${cropped.height} px.`,
        });
      } else if (slug === "rotate-image") {
        const { rotateAndFlipImage } = await getImg();
        if (files.length === 1) {
          const rot = await rotateAndFlipImage(files[0], Number(rotationAngle), false, false, setProgress);
          const url = registerUrl(rot.url);
          setResult({
            type: "download",
            blob: rot.blob,
            url,
            filename: `rotated_${files[0].name}`,
            size: rot.blob.size,
            previewUrl: url,
            message: `Image rotated by ${rotationAngle}°.`,
          });
        } else {
          const { default: JSZip } = await import("jszip");
          const zip = new JSZip();
          const items = [];
          for (let i = 0; i < files.length; i++) {
            const f = files[i];
            const rot = await rotateAndFlipImage(f, Number(rotationAngle), false, false, (p) => {
              setProgress(Math.round(((i + p / 100) / files.length) * 100));
            });
            const outName = `rotated_${f.name}`;
            const itemUrl = registerUrl(rot.url);
            zip.file(outName, rot.blob);
            items.push({
              filename: outName,
              originalName: f.name,
              size: rot.blob.size,
              url: itemUrl,
              previewUrl: itemUrl,
            });
          }
          const zipBlob = await zip.generateAsync({ type: "blob" });
          const zipUrl = registerUrl(URL.createObjectURL(zipBlob));
          setResult({
            type: "batch-images",
            items,
            url: zipUrl,
            filename: `rotated_images.zip`,
            size: zipBlob.size,
            message: `Successfully rotated ${files.length} images!`,
          });
        }
      } else if (slug === "image-dpi-calculator") {
        const { getImageMetadata, calculatePrintDimensions } = await getImg();
        const meta = await getImageMetadata(files[0]);
        const calc = calculatePrintDimensions(meta.width, meta.height, Number(imageDpi));
        setProgress(100);
        const reportText = `PDFpadar — Image DPI & Print Dimensions Calculation Report
File: ${files[0].name}
Resolution: ${meta.width} × ${meta.height} px (${calc.megapixels})
Target DPI: ${imageDpi} DPI
Print Dimensions (Inches): ${calc.inches}
Print Dimensions (Centimeters): ${calc.cm}
Print Dimensions (Millimeters): ${calc.mm}
Print Quality Rating: ${calc.printQuality}
Calculated at: ${new Date().toLocaleString()}
`;
        const blob = new Blob([reportText], { type: "text/plain" });
        const url = registerUrl(URL.createObjectURL(blob));
        setResult({
          type: "dpi-calc",
          meta,
          calc,
          url,
          filename: `${files[0].name.replace(/\.[^/.]+$/, "")}_dpi_${imageDpi}.txt`,
          size: blob.size,
          message: `Calculated print dimensions at ${imageDpi} DPI.`,
        });
      } else if (slug === "image-metadata") {
        const { getImageMetadata } = await getImg();
        const meta = await getImageMetadata(files[0]);
        setProgress(100);
        const jsonText = JSON.stringify(meta, null, 2);
        const blob = new Blob([jsonText], { type: "application/json" });
        const url = registerUrl(URL.createObjectURL(blob));
        setResult({
          type: "image-meta",
          meta,
          url,
          filename: `${files[0].name.replace(/\.[^/.]+$/, "")}_metadata.json`,
          size: blob.size,
          message: `Extracted properties and metadata for ${files[0].name}.`,
        });
      }

      // --- FILE PROCESSING TOOLS ---
      else if (slug === "create-zip") {
        const { createZip } = await getFile();
        const zip = await createZip(files, zipName, setProgress);
        const url = registerUrl(zip.url);
        setResult({
          type: "download",
          blob: zip.blob,
          url,
          filename: zip.fileName,
          size: zip.size,
          message: `Packaged ${files.length} file(s) into ZIP archive.`,
        });
      } else if (slug === "extract-zip") {
        const { extractZip } = await getFile();
        const entries = await extractZip(files[0], setProgress);
        entries.forEach((e) => registerUrl(e.url));
        setResult({
          type: "zip-entries",
          entries,
          zipFileName: files[0].name,
        });
      } else if (slug === "file-hash-generator") {
        const { calculateFileHashes } = await getFile();
        const hashData = await calculateFileHashes(files[0], setProgress);
        setResult({
          type: "hashes",
          hashData,
        });
      } else if (slug === "file-comparison") {
        if (files.length < 2) {
          throw new Error("Please upload 2 text or code files to compare.");
        }
        const { compareTextFiles } = await getFile();
        const diff = await compareTextFiles(files[0], files[1]);
        setProgress(100);
        setResult({
          type: "diff",
          diff,
        });
      } else if (slug === "file-size-analyzer") {
        const { analyzeFiles } = await getFile();
        const analysis = analyzeFiles(files);
        setProgress(100);
        setResult({
          type: "file-analysis",
          analysis,
        });
      } else if (slug === "batch-file-renaming") {
        const { batchRenameFiles } = await getFile();
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
        const url = registerUrl(renamed.url);
        setResult({
          type: "download",
          blob: renamed.blob,
          url,
          filename: renamed.fileName,
          size: renamed.blob.size,
          message: `Renamed ${files.length} file(s) and packaged into ZIP.`,
          details: renamed.renamedList,
        });
      } else if (slug === "document-page-counter") {
        const { countPdfPages } = await getPdf();
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
      console.error("Processing error:", err);
      setError(err.message || "An unexpected error occurred during processing.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="space-y-6">
        {/* Upload Area */}
        <FileDropzone
          accept={tool.accept}
          multiple={tool.multiple}
          maxSizeMB={tool.maxSizeMB}
          files={files}
          onFilesChange={(newFiles) => {
            // Revoke any previous blob URLs to prevent memory leaks
            createdUrls.current.forEach((url) => revokeUrl(url));
            createdUrls.current = [];
            setFiles(newFiles);
            setResult(null);
            setError("");
          }}
          title={tool.multiple ? `Drop ${tool.name} files here` : `Drop your ${tool.name} file here`}
        />

        {/* Configuration State (When files are selected) */}
        {files.length > 0 && !result && (
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
              <Sliders className="w-4 h-4 text-brand-500" />
              <span>Processing Settings</span>
            </div>

            {/* Split PDF settings */}
            {tool.slug === "split-pdf" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Split Mode
                  </label>
                  <select
                    value={splitMode}
                    onChange={(e) => setSplitMode(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="range">Extract Custom Page Range</option>
                    <option value="single">Split Every Page into Individual Files (ZIP)</option>
                  </select>
                </div>
                {splitMode === "range" && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Page Ranges (e.g. 1-3, 5)
                    </label>
                    <input
                      type="text"
                      value={pdfRange}
                      onChange={(e) => setPdfRange(e.target.value)}
                      placeholder="1-3, 5"
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Rotate PDF settings */}
            {tool.slug === "rotate-pdf" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Rotation Angle
                  </label>
                  <select
                    value={rotationAngle}
                    onChange={(e) => setRotationAngle(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-brand-500"
                  >
                    <option value={90}>90° Clockwise</option>
                    <option value={180}>180° Flip</option>
                    <option value={270}>270° Counter-Clockwise</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Apply To
                  </label>
                  <select
                    value={rotationSelection}
                    onChange={(e) => setRotationSelection(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-brand-500"
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
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Pages to Remove (e.g., 2, 4-6)
                </label>
                <input
                  type="text"
                  value={deletePagesInput}
                  onChange={(e) => setDeletePagesInput(e.target.value)}
                  placeholder="2, 4-6"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-brand-500"
                />
              </div>
            )}

            {/* Extract PDF Pages settings */}
            {tool.slug === "extract-pdf-pages" && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Pages to Extract (e.g., 1, 3-5)
                </label>
                <input
                  type="text"
                  value={extractPagesInput}
                  onChange={(e) => setExtractPagesInput(e.target.value)}
                  placeholder="1, 3-5"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-brand-500"
                />
              </div>
            )}

            {/* Organize PDF settings */}
            {tool.slug === "organize-pdf" && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  New Desired Page Sequence (e.g. 3, 1, 2)
                </label>
                <input
                  type="text"
                  value={organizeOrderInput}
                  onChange={(e) => setOrganizeOrderInput(e.target.value)}
                  placeholder="3, 1, 2"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-brand-500"
                />
              </div>
            )}

            {/* Watermark settings */}
            {tool.slug === "add-watermark" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Watermark Text
                  </label>
                  <input
                    type="text"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    placeholder="CONFIDENTIAL"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
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
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Font Size ({watermarkFontSize}px)
                  </label>
                  <input
                    type="number"
                    value={watermarkFontSize}
                    onChange={(e) => setWatermarkFontSize(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
            )}

            {/* Page Numbers settings */}
            {tool.slug === "add-page-numbers" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Numbering Format
                  </label>
                  <select
                    value={pageNumberFormat}
                    onChange={(e) => setPageNumberFormat(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="Page {n} of {total}">Page X of Y</option>
                    <option value="{n}">Page number only (X)</option>
                    <option value="- {n} -">- X -</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Position on Page
                  </label>
                  <select
                    value={pageNumberPos}
                    onChange={(e) => setPageNumberPos(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-brand-500"
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
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {tool.slug === "protect-pdf" ? "Set Document Password" : "Enter Existing Document Password"}
                </label>
                <input
                  type="password"
                  value={pdfPassword}
                  onChange={(e) => setPdfPassword(e.target.value)}
                  placeholder="Enter secure password"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-brand-500"
                />
              </div>
            )}

            {/* PDF Metadata Editor */}
            {tool.slug === "pdf-metadata" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
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
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
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
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Dimensions
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
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Compression Quality: {imageQuality}%
                  </label>
                  <span className="text-xs font-bold text-brand-600 dark:text-brand-400">
                    {imageQuality < 50 ? "Aggressive (Smallest)" : imageQuality < 80 ? "Balanced (Recommended)" : "High Fidelity"}
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
              </div>
            )}

            {/* Resize Image settings */}
            {tool.slug === "resize-image" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
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
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
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
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Output Format
                </label>
                <select
                  value={convertFormat}
                  onChange={(e) => setConvertFormat(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                >
                  <option value="image/webp">WebP (Modern, highly efficient)</option>
                  <option value="image/jpeg">JPG / JPEG (Standard photo format)</option>
                  <option value="image/png">PNG (Lossless with transparency)</option>
                </select>
              </div>
            )}

            {/* Image DPI calculator settings */}
            {tool.slug === "image-dpi-calculator" && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Print DPI
                </label>
                <select
                  value={imageDpi}
                  onChange={(e) => setImageDpi(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                >
                  <option value={300}>300 DPI — Photo Quality &amp; Commercial Print</option>
                  <option value={150}>150 DPI — Good Office / Flyer Print</option>
                  <option value={72}>72 DPI — Standard Web Screen</option>
                </select>
              </div>
            )}

            {/* Create ZIP settings */}
            {tool.slug === "create-zip" && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Archive Name
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
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
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
                    <option value="replace">Find &amp; Replace</option>
                  </select>
                </div>
                {renameRule === "prefix" && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Prefix String
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
                      placeholder="Replace"
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
          <div
            role="alert"
            className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 rounded-2xl text-xs sm:text-sm"
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Processing State (Real Measurable Progress) */}
        {processing && (
          <div className="space-y-2 py-2">
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-500 animate-ping" />
                <span>Processing in local browser memory...</span>
              </span>
              <span className="font-mono">{progress}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-600 rounded-full transition-all duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Button Bar */}
        {!result ? (
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={executeProcess}
              disabled={files.length === 0 || processing}
              className="flex-1 min-w-[200px] flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl font-black text-white bg-brand-600 hover:bg-brand-500 disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-brand-600/20 transition-all text-base focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30"
            >
              <DynamicIcon name={tool.icon} className="w-5 h-5" />
              <span>
                {processing
                  ? "Processing..."
                  : files.length > 1
                  ? `Process & Download All (${files.length} Files)`
                  : `Process & Download Output`}
              </span>
            </button>

            {files.length > 0 && !processing && (
              <button
                type="button"
                onClick={handleReset}
                className="py-4 px-5 rounded-2xl font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {result.url && (
              <a
                href={result.url}
                download={result.filename || "output"}
                onClick={() => triggerDownload(result.url, result.filename)}
                className="flex-1 min-w-[240px] flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl font-black text-white bg-brand-600 hover:bg-brand-500 shadow-lg shadow-brand-600/30 hover:scale-[1.01] active:scale-[0.99] transition-all text-base focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30"
              >
                <Download className="w-5 h-5" />
                <span>Download {result.filename || "Processed Output"}</span>
              </a>
            )}
            <button
              type="button"
              onClick={handleReset}
              className="py-4 px-5 rounded-2xl font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Process Another File</span>
            </button>
          </div>
        )}
      </div>

      {/* --- RESULT EXPERIENCE --- */}
      {result && (
        <div ref={resultRef} className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800 animate-in fade-in duration-300 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5" />
              <span>Processing Complete! Download Ready</span>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Process another file</span>
            </button>
          </div>

          {/* Visual In-Browser Preview for Images with Direct Download Controls */}
          {result.previewUrl && (
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <Eye className="w-4 h-4 text-brand-500" />
                  <span>Visual Result Preview</span>
                </div>
                {result.url && (
                  <a
                    href={result.url}
                    download={result.filename || "image"}
                    onClick={() => triggerDownload(result.url, result.filename)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-sm transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Image</span>
                  </a>
                )}
              </div>
              <div className="flex justify-center max-h-80 overflow-hidden rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={result.previewUrl}
                  alt="Processed preview"
                  className="max-h-72 object-contain rounded-lg"
                />
              </div>
              {result.filename && (
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-xs">{result.filename}</span>
                  {result.size && <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px]">{formatBytes(result.size)}</span>}
                </div>
              )}
            </div>
          )}

          {/* Standard Download Box */}
          {result.type === "download" && (
            <div className="p-6 rounded-2xl bg-brand-50/80 dark:bg-brand-950/30 border border-brand-200/80 dark:border-brand-900/50 space-y-4">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {result.message}
                </p>
                {result.size && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Output size: {formatBytes(result.size)}
                  </p>
                )}
              </div>
              <a
                href={result.url}
                download={result.filename}
                onClick={() => triggerDownload(result.url, result.filename)}
                className="inline-flex items-center gap-2 py-4 px-6 rounded-xl font-extrabold text-white bg-brand-600 hover:bg-brand-500 shadow-md shadow-brand-600/20 hover:scale-[1.01] active:scale-[0.99] transition-all text-sm"
              >
                <Download className="w-4 h-4" />
                <span>Download {result.filename}</span>
              </a>
            </div>
          )}

          {/* Image Compression Results with Savings Metrics */}
          {result.type === "compress" && (
            <div className="p-6 rounded-2xl bg-brand-50/80 dark:bg-brand-950/30 border border-brand-200/80 dark:border-brand-900/50 space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-medium text-slate-400 block">Original</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                    {formatBytes(result.originalSize)}
                  </span>
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-medium text-slate-400 block">Compressed</span>
                  <span className="font-bold text-brand-600 dark:text-brand-400 text-sm">
                    {formatBytes(result.compressedSize)}
                  </span>
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-medium text-slate-400 block">Saved</span>
                  <span className="font-bold text-brand-600 dark:text-brand-400 text-sm">
                    {result.savedPercentage}%
                  </span>
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-medium text-slate-400 block">Format</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                    {(result.type && result.type !== "compress" ? result.type : result.filename.split('.').pop()).toUpperCase()}
                  </span>
                </div>
              </div>
              <a
                href={result.url}
                download={result.filename}
                onClick={() => triggerDownload(result.url, result.filename)}
                className="inline-flex items-center gap-2 py-4 px-6 rounded-xl font-extrabold text-white bg-brand-600 hover:bg-brand-500 shadow-md shadow-brand-600/20 hover:scale-[1.01] active:scale-[0.99] transition-all text-sm"
              >
                <Download className="w-4 h-4" />
                <span>Download Compressed Image ({formatBytes(result.compressedSize)})</span>
              </a>
            </div>
          )}

          {/* Multiple Images Batch Result */}
          {result.type === "batch-images" && (
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-brand-50/80 dark:bg-brand-950/30 border border-brand-200/80 dark:border-brand-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">
                    {result.message}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    ZIP Archive size: {formatBytes(result.size)} • {result.items.length} images processed
                  </p>
                </div>
                <a
                  href={result.url}
                  download={result.filename}
                  onClick={() => triggerDownload(result.url, result.filename)}
                  className="inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-md transition-all text-sm shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>Download All as ZIP</span>
                </a>
              </div>

              {/* Individual image download cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {result.items.map((item, idx) => (
                  <div key={idx} className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shadow-sm">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {item.previewUrl && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={item.previewUrl} alt={item.filename} className="w-10 h-10 object-cover rounded-lg shrink-0 border border-slate-200 dark:border-slate-800" />
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{item.filename}</p>
                        <p className="text-[11px] text-slate-400">{formatBytes(item.size || item.compressedSize)}</p>
                      </div>
                    </div>
                    <a
                      href={item.url}
                      download={item.filename}
                      onClick={() => triggerDownload(item.url, item.filename)}
                      className="p-2 rounded-lg bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 hover:bg-brand-100 transition-colors shrink-0"
                      title={`Download ${item.filename}`}
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Image Metadata / EXIF Output */}
          {result.type === "image-meta" && (
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-base">
                      Image Properties &amp; EXIF Metadata
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">{result.meta.name}</p>
                  </div>
                  <a
                    href={result.url}
                    download={result.filename}
                    onClick={() => triggerDownload(result.url, result.filename)}
                    className="inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-500 shadow transition-all text-xs shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Metadata (.json)</span>
                  </a>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                    <span className="text-xs text-slate-400 block">Dimensions</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{result.meta.width} × {result.meta.height} px</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                    <span className="text-xs text-slate-400 block">Aspect Ratio</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{result.meta.aspectRatio}</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                    <span className="text-xs text-slate-400 block">Megapixels</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{result.meta.megapixels}</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                    <span className="text-xs text-slate-400 block">File Size</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{formatBytes(result.meta.size)}</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                    <span className="text-xs text-slate-400 block">MIME Type</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{result.meta.type}</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                    <span className="text-xs text-slate-400 block">Last Modified</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">{result.meta.lastModified}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Cryptographic Hashes Output */}
                    {result.type === "hashes" && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Calculated Fingerprints for &quot;{result.hashData.fileName}&quot;
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
                                    <Check className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
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
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Extracted Files from &quot;{result.zipFileName}&quot; ({result.entries.length})
                        </h4>
                        <div className="space-y-2 max-h-72 overflow-y-auto">
                          {result.entries.map((entry, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm"
                            >
                              <div className="truncate mr-2">
                                <span className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-200 block truncate">
                                  {entry.name}
                                </span>
                                <span className="text-xs text-slate-400">
                                  {formatBytes(entry.size)}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => triggerDownload(entry.url, entry.name)}
                                className="p-2 rounded-lg bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 shrink-0"
                                title="Download file"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* File Comparison Diff Output */}
                    {result.type === "diff" && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
                          <span>Side-by-Side Diff Report</span>
                          <span className={result.diff.identical ? "text-brand-600 dark:text-brand-400 font-semibold" : "text-amber-600 font-semibold"}>
                            {result.diff.identical ? "Files are Identical" : `${result.diff.differencesCount} line difference(s) detected`}
                          </span>
                        </div>
                        <div className="max-h-80 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-xs divide-y divide-slate-100 dark:divide-slate-800">
                          {result.diff.diffLines.map((line, idx) => (
                            <div
                              key={idx}
                              className={`grid grid-cols-2 p-2 gap-2 ${line.type === "diff"
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

                    {/* File Storage Analysis */}
                    {result.type === "file-analysis" && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-3 text-center">
                          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                            <span className="text-xs text-slate-400 block">Total Files</span>
                            <span className="font-bold text-slate-800 dark:text-white text-sm">
                              {result.analysis.totalFiles}
                            </span>
                          </div>
                          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                            <span className="text-xs text-slate-400 block">Total Storage</span>
                            <span className="font-bold text-brand-600 dark:text-brand-400 text-sm">
                              {result.analysis.totalFormattedSize}
                            </span>
                          </div>
                          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                            <span className="text-xs text-slate-400 block">Average File</span>
                            <span className="font-bold text-slate-800 dark:text-white text-sm">
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

                    {/* Image DPI Calculations */}
                    {result.type === "dpi-calc" && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                            <span className="text-xs text-slate-400 block">Pixels</span>
                            <span className="font-bold text-slate-800 dark:text-white text-xs sm:text-sm">
                              {result.meta.width} × {result.meta.height}
                            </span>
                          </div>
                          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                            <span className="text-xs text-slate-400 block">Print (Inches)</span>
                            <span className="font-bold text-brand-600 dark:text-brand-400 text-xs sm:text-sm">
                              {result.calc.inches}
                            </span>
                          </div>
                          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                            <span className="text-xs text-slate-400 block">Print (Centimeters)</span>
                            <span className="font-bold text-brand-600 dark:text-brand-400 text-xs sm:text-sm">
                              {result.calc.cm}
                            </span>
                          </div>
                          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                            <span className="text-xs text-slate-400 block">Print Rating</span>
                            <span className="font-bold text-brand-600 dark:text-brand-400 text-xs sm:text-sm">
                              {result.calc.printQuality}
                            </span>
                          </div>
                        </div>
                        {result.url && (
                          <div className="flex justify-end pt-2">
                            <a
                              href={result.url}
                              download={result.filename}
                              onClick={() => triggerDownload(result.url, result.filename)}
                              className="inline-flex items-center gap-2 py-3 px-5 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-sm transition-all text-xs"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download Print Spec Report (.txt)</span>
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Document Page Counts */}
                    {result.type === "page-count" && (
                      <div className="space-y-4">
                        <div className="p-4 bg-brand-50 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-900/40 rounded-2xl flex items-center justify-between">
                          <span className="text-sm font-semibold text-brand-900 dark:text-brand-200">
                            Total Aggregate Page Count:
                          </span>
                          <span className="text-2xl font-black text-brand-600 dark:text-brand-400">
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
