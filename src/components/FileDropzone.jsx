"use client";

import React, { useState, useRef } from "react";
import { formatBytes } from "@/lib/utils";
import {
  UploadCloud,
  File,
  Trash2,
  ArrowUp,
  ArrowDown,
  Plus,
  AlertCircle,
  FileCheck2,
  CheckCircle,
} from "lucide-react";

export default function FileDropzone({
  accept = "*/*",
  multiple = false,
  maxSizeMB = 100,
  files = [],
  onFilesChange,
  title,
  subtitle = "Drag & drop files here, or click to browse",
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const inputRef = useRef(null);

  const defaultTitle = multiple ? "Choose multiple files to process" : "Choose a file to process";
  const displayTitle = title || defaultTitle;

  const handleFiles = (incomingFileList) => {
    setErrorMessage("");
    const incoming = Array.from(incomingFileList);

    if (incoming.length === 0) return;

    // Validate size limit
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    for (const file of incoming) {
      if (file.size > maxSizeBytes) {
        setErrorMessage(
          `File "${file.name}" (${formatBytes(file.size)}) exceeds the maximum allowed limit of ${maxSizeMB} MB.`
        );
        return;
      }
    }

    // Check duplicate file names in multiple upload
    if (multiple) {
      const existingNames = new Set(files.map((f) => f.name));
      const duplicates = incoming.filter((f) => existingNames.has(f.name));
      if (duplicates.length > 0 && files.length > 0) {
        // Just inform or append
      }
      onFilesChange([...files, ...incoming]);
    } else {
      onFilesChange([incoming[0]]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (index) => {
    const updated = files.filter((_, i) => i !== index);
    onFilesChange(updated);
  };

  const moveFile = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= files.length) return;
    const updated = [...files];
    const item = updated.splice(fromIndex, 1)[0];
    updated.splice(toIndex, 0, item);
    onFilesChange(updated);
  };

  return (
    <div className="w-full space-y-4">
      {/* Upload Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        aria-label="Upload file drop area"
        className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20 ${isDragging
            ? "border-brand-500 bg-brand-50/60 dark:bg-brand-950/30 scale-[0.99]"
            : "border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 hover:border-brand-400 dark:hover:border-brand-500 hover:bg-slate-50 dark:hover:bg-slate-800/40"
          }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
          aria-hidden="true"
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 text-brand-600 dark:text-brand-400 flex items-center justify-center">
            <UploadCloud className="w-8 h-8" />
          </div>

          <div>
            <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
              {displayTitle}
            </p>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {subtitle}
            </p>
          </div>

          {/* Explicit Choose Files Button */}
          <div className="pt-2">
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-sm transition-all">
              <FileCheck2 className="w-4 h-4" />
              <span>Browse Files</span>
            </span>
          </div>

          {/* Formats & Size Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="px-2 py-0.5 rounded-md bg-slate-200/60 dark:bg-slate-800 font-mono">
              Max {maxSizeMB} MB
            </span>
            <span>•</span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
              100% Client-Side
            </span>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div
          role="alert"
          className="flex items-center gap-2.5 p-4 text-xs sm:text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-2xl"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      {/* Uploaded Files Queue */}
      {files.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
            <span>
              Selected Files ({files.length})
            </span>
            {files.length > 1 && (
              <button
                type="button"
                onClick={() => onFilesChange([])}
                className="text-red-500 hover:text-red-600 font-semibold transition-colors focus:outline-none focus:underline"
              >
                Clear All
              </button>
            )}
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {files.map((file, idx) => (
              <div
                key={`${file.name}-${idx}`}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-sm group"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700/70 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
                    <File className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {formatBytes(file.size)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-2">
                  {multiple && files.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={() => moveFile(idx, idx - 1)}
                        disabled={idx === 0}
                        title="Move Up"
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        aria-label={`Move ${file.name} up`}
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveFile(idx, idx + 1)}
                        disabled={idx === files.length - 1}
                        title="Move Down"
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        aria-label={`Move ${file.name} down`}
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => removeFile(idx)}
                    title="Remove file"
                    className="p-1.5 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                    aria-label={`Remove ${file.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {multiple && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add More Files</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
