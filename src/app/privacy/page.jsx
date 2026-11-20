import React from "react";
import Breadcrumb from "@/components/Breadcrumb";
import { ShieldCheck, Lock, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | PDFpadar — 100% Client-Side File Processing",
  description: "Learn how PDFpadar protects your privacy. All PDF and file processing happens directly on your device with zero server storage.",
};

export default function PrivacyPage() {
  const breadcrumbs = [{ label: "Privacy Policy" }];

  return (
    <article className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-10">
      <div>
        <Breadcrumb items={breadcrumbs} />
      </div>

      <header className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>Zero Server Uploads</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400">
          Last updated: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </p>
      </header>

      <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 space-y-6 text-sm sm:text-base leading-relaxed">
        <section className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-500" />
            <span>The Core Guarantee: Your Files Never Leave Your Device</span>
          </h2>
          <p>
            Unlike traditional file conversion services, PDFpadar is architected to perform <strong>100% of all computations directly in your local browser memory</strong> using WebAssembly, JavaScript, and HTML5 Canvas APIs.
          </p>
          <ul className="space-y-2 pt-2 text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>We do NOT upload your files to any remote server or third-party cloud.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>We do NOT store, log, read, or retain your documents, images, or metadata.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>No user registration or account creation is required to use any tool.</span>
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            1. Information We Do Not Collect
          </h2>
          <p>
            Because file processing takes place entirely in the client execution runtime, PDFpadar never has access to the contents of uploaded PDFs, images, archives, or text files. No file data is ever transmitted across an external network connection.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            2. Local Browser Storage
          </h2>
          <p>
            We use browser <code>localStorage</code> strictly for non-sensitive interface preferences, such as retaining your choice of Dark or Light theme. No tracking identifiers or cookies are utilized.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            3. Contact
          </h2>
          <p>
            If you have questions regarding this privacy architecture, please contact our development team via GitHub or email at privacy@pdfpadar.com.
          </p>
        </section>
      </div>
    </article>
  );
}
