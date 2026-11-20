"use client";

import React, { useState } from "react";
import Link from "next/link";
import DynamicIcon from "./DynamicIcon";
import ToolView from "./ToolView";
import Breadcrumb from "./Breadcrumb";
import {
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  ChevronDown,
  ArrowRight,
  Layers,
  Sparkles,
  Lock,
  FileCheck2,
} from "lucide-react";

export default function ToolLayout({ tool, relatedTools = [] }) {
  const [openFaq, setOpenFaq] = useState(0);

  const categoryName =
    tool.category === "pdf"
      ? "PDF Tools"
      : tool.category === "image"
      ? "Image Tools"
      : "File Utilities";

  const breadcrumbs = [
    { label: categoryName, href: `/#${tool.category}-tools` },
    { label: tool.name },
  ];

  return (
    <article className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      {/* 1. Breadcrumb Navigation */}
      <div>
        <Breadcrumb items={breadcrumbs} />
      </div>

      {/* 2 & 3. Header: Clear H1 & Short Description */}
      <header className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <DynamicIcon name={tool.icon} className="w-3.5 h-3.5 text-brand-500" />
          <span>{categoryName}</span>
          <span>•</span>
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% Client-Side</span>
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          {tool.name}
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
          {tool.shortDesc}
        </p>

        {/* 5. Supported Formats & Limitations */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs text-slate-500 dark:text-slate-400">
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-mono text-[11px]">
            Formats: {tool.accept.replace(/application\/[a-z0-9-]+,?/gi, "").replace(/image\/[a-z0-9*-,]+/gi, "Images")}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-mono text-[11px]">
            Max Limit: {tool.maxSizeMB} MB
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-medium text-[11px]">
            Zero Uploads • Pure Privacy
          </span>
        </div>
      </header>

      {/* 4, 6, 7, 8, 9, 10. Main Upload, Settings, Process, Progress, Preview, Download (ToolView) */}
      <section className="max-w-4xl mx-auto" aria-label="Tool processing interface">
        <ToolView tool={tool} />
      </section>

      {/* 11 & 12. How-To-Use Instructions & Key Features */}
      <section className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
        {/* Instructions */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <h2 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-brand-500" />
            <span>How to Use {tool.name}</span>
          </h2>
          <ol className="space-y-3">
            {tool.instructions.map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                <span className="w-5 h-5 rounded-full bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-brand-200/50 dark:border-brand-800/40">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Features & Benefits */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <h2 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-500" />
            <span>Features &amp; Benefits</span>
          </h2>
          <ul className="space-y-3">
            {tool.features.map((feat, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{feat}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 13. Frequently Asked Questions */}
      {tool.faqs && tool.faqs.length > 0 && (
        <section className="max-w-3xl mx-auto space-y-6 pt-4" aria-label="Frequently Asked Questions">
          <div className="text-center space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2">
              <HelpCircle className="w-5 h-5 text-brand-500" />
              <span>Frequently Asked Questions</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Common questions about using {tool.name}.
            </p>
          </div>

          <div className="space-y-3">
            {tool.faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-5 text-left font-semibold text-xs sm:text-sm text-slate-900 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
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
      )}

      {/* 14. Related Tools */}
      {relatedTools.length > 0 && (
        <section className="max-w-4xl mx-auto space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800" aria-label="Related tools">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            Related Utility Tools
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedTools.map((rel) => (
              <Link
                key={rel.slug}
                href={`/tools/${rel.slug}`}
                className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-400 dark:hover:border-brand-500 shadow-sm transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <DynamicIcon name={rel.icon} className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400">
                    {rel.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {rel.shortDesc}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-brand-600 dark:text-brand-400 pt-3">
                  <span>Open Tool</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
