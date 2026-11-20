import React from "react";
import Link from "next/link";
import { FileCheck2, ShieldCheck, Heart, Sparkles, Lock } from "lucide-react";
import { getToolsByCategory } from "@/lib/tools-registry";

export default function Footer() {
  const pdfTools = getToolsByCategory("pdf").slice(0, 6);
  const imageTools = getToolsByCategory("image").slice(0, 6);
  const fileTools = getToolsByCategory("file").slice(0, 6);

  return (
    <footer className="w-full bg-slate-900 text-slate-300 border-t border-slate-800 pt-16 pb-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Brand & Privacy Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-teal-500 flex items-center justify-center text-white shadow-md">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <span className="font-black text-2xl tracking-tight text-white">
                PDF<span className="text-brand-400">padar</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Fast, privacy-first, in-browser file utility suite. Process PDFs, optimize images, generate hashes, and bundle archives with 100% client-side execution.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300 font-medium">
              <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Zero server storage • Files never leave your device</span>
            </div>
          </div>

          {/* PDF Tools Column */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Popular PDF Tools
            </h3>
            <ul className="space-y-2 text-sm">
              {pdfTools.map((tool) => (
                <li key={tool.slug}>
                  <Link
                    href={`/tools/${tool.slug}`}
                    className="hover:text-brand-400 transition-colors"
                  >
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Image Tools Column */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Image Tools
            </h3>
            <ul className="space-y-2 text-sm">
              {imageTools.map((tool) => (
                <li key={tool.slug}>
                  <Link
                    href={`/tools/${tool.slug}`}
                    className="hover:text-brand-400 transition-colors"
                  >
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* File Tools Column */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              File Utilities
            </h3>
            <ul className="space-y-2 text-sm">
              {fileTools.map((tool) => (
                <li key={tool.slug}>
                  <Link
                    href={`/tools/${tool.slug}`}
                    className="hover:text-brand-400 transition-colors"
                  >
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Credits, Legal Links & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} PDFpadar. Built with privacy and speed in mind.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-slate-300 transition-colors">
              Terms of Service
            </Link>
            <span className="flex items-center gap-1 text-slate-400">
              Powered by WebAssembly &amp; Web Workers <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
