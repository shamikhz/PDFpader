"use client";

import React, { useState } from "react";
import Link from "next/link";
import { TOOLS, TOOL_CATEGORIES, getToolsByCategory } from "@/lib/tools-registry";
import DynamicIcon from "@/components/DynamicIcon";
import {
  Zap,
  Lock,
  Sparkles,
  ArrowRight,
  ChevronDown,
  HelpCircle,
  Cpu,
  Layers,
  HeartHandshake,
  CheckCircle,
} from "lucide-react";

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [openFaq, setOpenFaq] = useState(0);

  // Popular tools selection
  const popularSlugs = ["merge-pdf", "compress-image", "split-pdf", "convert-image", "create-zip", "file-hash-generator"];
  const popularTools = popularSlugs.map((s) => TOOLS.find((t) => t.slug === s)).filter(Boolean);

  const pdfTools = getToolsByCategory("pdf");
  const imageTools = getToolsByCategory("image");
  const fileTools = getToolsByCategory("file");

  const filteredTools =
    selectedCategory === "all"
      ? TOOLS
      : TOOLS.filter((tool) => tool.category === selectedCategory);

  const globalFaqs = [
    {
      q: "How does client-side file processing work?",
      a: "Traditional web tools require you to upload your files to remote cloud servers to process them. PDFpadar compiles high-performance engines directly into JavaScript and WebAssembly, executing all PDF parsing, image canvas resizing, and cryptographic hashing locally inside your web browser. Your files never leave your device."
    },
    {
      q: "Is PDFpadar completely free?",
      a: "Yes! There are no daily conversion caps, no forced registrations, and no watermarks stamped onto your output documents. Because we don't have massive cloud processing server bills, we pass those savings directly on to you."
    },
    {
      q: "Are my confidential legal documents and photos safe?",
      a: "100% yes. Because no files are uploaded over the internet to our servers, it is architecturally impossible for us or third parties to access, store, or view your documents, financial records, or photos."
    },
    {
      q: "What is the maximum file size I can process?",
      a: "Standard file limits range between 50 MB to 500 MB depending on the tool. Because processing uses your computer's RAM rather than a shared server queue, modern smartphones and laptops can easily process large documents."
    }
  ];

  return (
    <div className="space-y-12 pb-16">
      {/* 1. Hero Section - Tightened spacing, clean without blank space */}
      <section className="relative pt-2 pb-4 sm:pt-4 sm:pb-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-5">
        <div className="space-y-3 max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15]">
            Online PDF, Image &amp; File Processing Platform
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Fast, lightweight, and private. Merge, compress, convert, split, and edit files directly in your browser without software installations or cloud uploads.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              selectedCategory === "all"
                ? "bg-brand-600 text-white shadow-sm"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/60"
            }`}
          >
            All Tools ({TOOLS.length})
          </button>
          {TOOL_CATEGORIES.map((cat) => {
            const count = TOOLS.filter((t) => t.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  selectedCategory === cat.id
                    ? "bg-brand-600 text-white shadow-sm"
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/60"
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Popular Tools Section (Shown when viewing all tools) */}
      {selectedCategory === "all" && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6" aria-label="Popular Tools">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-500" />
              <span>Most Popular Tools</span>
            </h2>
            <span className="text-xs text-slate-400">Essential Utilities</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {popularTools.map((tool) => (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className="group p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-500/60 shadow-sm transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                      <DynamicIcon name={tool.icon} className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                      {tool.category}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {tool.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {tool.shortDesc}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs font-semibold text-brand-600 dark:text-brand-400">
                  <span>Open Tool</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 4. Filtered / All Tools Grid Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-brand-500" />
            <span>
              {selectedCategory === "all"
                ? "All Processing Tools"
                : TOOL_CATEGORIES.find((c) => c.id === selectedCategory)?.name}
            </span>
          </h2>
          <span className="text-xs text-slate-500">
            {filteredTools.length} tools available
          </span>
        </div>

        {filteredTools.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-3">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No tools found in this category.
            </p>
            <button
              onClick={() => setSelectedCategory("all")}
              className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
            >
              View All Tools
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredTools.map((tool) => (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 hover:border-brand-500/60 shadow-sm transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                      <DynamicIcon name={tool.icon} className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                      {tool.category}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {tool.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {tool.shortDesc}
                    </p>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs font-semibold text-brand-600 dark:text-brand-400">
                  <span>Open Tool</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 5. How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-50 dark:bg-slate-900/60 rounded-3xl p-8 sm:p-12 border border-slate-200 dark:border-slate-800 text-center space-y-8">
          <div className="max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              How It Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Transform your files instantly without cumbersome software installations or accounts.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            {[
              { step: "01", title: "Select Tool", desc: "Choose from 28+ specialized PDF, image, or archive tools." },
              { step: "02", title: "Drag & Drop", desc: "Drop your files into the workspace. Bytes stay securely on your computer." },
              { step: "03", title: "Configure", desc: "Customize parameters, page ranges, rotation, or compression quality." },
              { step: "04", title: "Download", desc: "Download processed files or bundled ZIP archives immediately." },
            ].map((s, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 space-y-2"
              >
                <span className="text-2xl font-black text-brand-600/30 dark:text-brand-400/30 font-mono">
                  {s.step}
                </span>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">{s.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Privacy & Security Information */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Security by Architecture
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Why client-side in-browser execution offers superior privacy over cloud services.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Zero Server Uploads
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Your files never leave your computer or smartphone. All operations execute purely inside your browser memory.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Hardware-Accelerated Speed
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              No uploading gigabytes over slow internet or waiting in cloud queues. Processing runs immediately using your device&apos;s CPU and memory.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 flex items-center justify-center">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Unlimited &amp; Free
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              No daily conversion caps, no credit cards, no logins, and zero watermarks applied to your output documents.
            </p>
          </div>
        </div>
      </section>

      {/* 7. Global FAQs Section */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6" aria-label="Frequently Asked Questions">
        <div className="text-center space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2">
            <HelpCircle className="w-5 h-5 text-brand-500" />
            <span>Frequently Asked Questions</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Answers to common questions about PDFpadar.
          </p>
        </div>

        <div className="space-y-3">
          {globalFaqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left font-semibold text-xs sm:text-sm text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                      isOpen ? "rotate-180 text-brand-500" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
