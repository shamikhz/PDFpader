"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TOOLS, getToolsByCategory } from "@/lib/tools-registry";
import DynamicIcon from "./DynamicIcon";
import {
  ShieldCheck,
  Menu,
  X,
  FileCheck2,
  ChevronDown,
  ArrowRight,
  Sparkles,
  Zap,
} from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const [activeDropdown, setActiveDropdown] = useState(null); // 'pdf' | 'image' | 'file' | null
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navRef = useRef(null);

  const pdfTools = getToolsByCategory("pdf");
  const imageTools = getToolsByCategory("image");
  const fileTools = getToolsByCategory("file");

  // Handle Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setActiveDropdown(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectTool = (slug) => {
    setActiveDropdown(null);
    setMobileMenuOpen(false);
    router.push(`/tools/${slug}`);
  };

  return (
    <>
      <header
        ref={navRef}
        className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/95 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 transition-colors"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand Name */}
          <Link
            href="/"
            onClick={() => setActiveDropdown(null)}
            className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-lg"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-orange-500 to-amber-500 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div className="flex items-baseline">
              <span className="font-black text-xl tracking-tight text-slate-900 dark:text-white">
                PDF<span className="text-brand-600 dark:text-brand-400">padar</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-500/10 text-brand-700 dark:text-brand-300 border border-brand-500/20">
                100% Client-Side
              </span>
            </div>
          </Link>

          {/* Center Navigation Dropdowns */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-600 dark:text-slate-300">
            {/* PDF Tools Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === "pdf" ? null : "pdf")}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                  activeDropdown === "pdf"
                    ? "bg-slate-100 dark:bg-slate-800 text-brand-600 dark:text-brand-400"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                }`}
                aria-expanded={activeDropdown === "pdf"}
              >
                <span>PDF Tools</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${activeDropdown === "pdf" ? "rotate-180" : ""}`}
                />
              </button>

              {activeDropdown === "pdf" && (
                <div className="absolute left-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in duration-150">
                  <div className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                    PDF Manipulation Suite
                  </div>
                  <div className="space-y-0.5 max-h-96 overflow-y-auto">
                    {pdfTools.map((tool) => (
                      <Link
                        key={tool.slug}
                        href={`/tools/${tool.slug}`}
                        onClick={() => setActiveDropdown(null)}
                        className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors group"
                      >
                        <div className="p-1.5 rounded-lg bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400">
                          <DynamicIcon name={tool.icon} className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-xs text-slate-800 dark:text-slate-200 group-hover:text-brand-600 dark:group-hover:text-brand-400">
                            {tool.name}
                          </p>
                          <p className="text-xs text-slate-400 line-clamp-1">{tool.shortDesc}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Image Tools Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === "image" ? null : "image")}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                  activeDropdown === "image"
                    ? "bg-slate-100 dark:bg-slate-800 text-brand-600 dark:text-brand-400"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                }`}
                aria-expanded={activeDropdown === "image"}
              >
                <span>Image Tools</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${activeDropdown === "image" ? "rotate-180" : ""}`}
                />
              </button>

              {activeDropdown === "image" && (
                <div className="absolute left-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in duration-150">
                  <div className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Image Optimization &amp; Canvas
                  </div>
                  <div className="space-y-0.5 max-h-96 overflow-y-auto">
                    {imageTools.map((tool) => (
                      <Link
                        key={tool.slug}
                        href={`/tools/${tool.slug}`}
                        onClick={() => setActiveDropdown(null)}
                        className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors group"
                      >
                        <div className="p-1.5 rounded-lg bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400">
                          <DynamicIcon name={tool.icon} className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-xs text-slate-800 dark:text-slate-200 group-hover:text-brand-600 dark:group-hover:text-brand-400">
                            {tool.name}
                          </p>
                          <p className="text-xs text-slate-400 line-clamp-1">{tool.shortDesc}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* File Tools Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === "file" ? null : "file")}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                  activeDropdown === "file"
                    ? "bg-slate-100 dark:bg-slate-800 text-brand-600 dark:text-brand-400"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                }`}
                aria-expanded={activeDropdown === "file"}
              >
                <span>File Utilities</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${activeDropdown === "file" ? "rotate-180" : ""}`}
                />
              </button>

              {activeDropdown === "file" && (
                <div className="absolute left-0 mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in duration-150">
                  <div className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Archiving &amp; Cryptographic Tools
                  </div>
                  <div className="space-y-0.5 max-h-96 overflow-y-auto">
                    {fileTools.map((tool) => (
                      <Link
                        key={tool.slug}
                        href={`/tools/${tool.slug}`}
                        onClick={() => setActiveDropdown(null)}
                        className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors group"
                      >
                        <div className="p-1.5 rounded-lg bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400">
                          <DynamicIcon name={tool.icon} className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-xs text-slate-800 dark:text-slate-200 group-hover:text-brand-600 dark:group-hover:text-brand-400">
                            {tool.name}
                          </p>
                          <p className="text-xs text-slate-400 line-clamp-1">{tool.shortDesc}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Blog Link */}
            <Link
              href="/blog"
              onClick={() => setActiveDropdown(null)}
              className="px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              Blog
            </Link>
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2.5">
            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden px-4 pt-3 pb-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 px-3">
                PDF Tools
              </p>
              <div className="grid grid-cols-2 gap-1">
                {pdfTools.slice(0, 8).map((tool) => (
                  <Link
                    key={tool.slug}
                    href={`/tools/${tool.slug}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 truncate"
                  >
                    {tool.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 px-3">
                Image Tools
              </p>
              <div className="grid grid-cols-2 gap-1">
                {imageTools.slice(0, 6).map((tool) => (
                  <Link
                    key={tool.slug}
                    href={`/tools/${tool.slug}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 truncate"
                  >
                    {tool.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 px-3">
                File Utilities
              </p>
              <div className="grid grid-cols-2 gap-1">
                {fileTools.slice(0, 6).map((tool) => (
                  <Link
                    key={tool.slug}
                    href={`/tools/${tool.slug}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 truncate"
                  >
                    {tool.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <Link
                href="/blog"
                onClick={() => setMobileMenuOpen(false)}
                className="block p-2.5 rounded-lg text-sm font-semibold text-brand-600 dark:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Blog &amp; Guides
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
