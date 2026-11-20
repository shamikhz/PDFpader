import React from "react";
import Breadcrumb from "@/components/Breadcrumb";
import { FileText } from "lucide-react";

export const metadata = {
  title: "Terms of Service | PDFpadar",
  description: "Terms and conditions for utilizing the PDFpadar in-browser file utility platform.",
};

export default function TermsPage() {
  const breadcrumbs = [{ label: "Terms of Service" }];

  return (
    <article className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-10">
      <div>
        <Breadcrumb items={breadcrumbs} />
      </div>

      <header className="space-y-3">
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Terms of Service
        </h1>
        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400">
          Last updated: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </p>
      </header>

      <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 space-y-6 text-sm sm:text-base leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing and using PDFpadar, you agree to comply with and be bound by these terms. If you do not agree, you should not access or use the platform.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            2. Permitted Use &amp; Compliance
          </h2>
          <p>
            You agree to use PDFpadar solely for lawful purposes. You may only unlock or decrypt files for which you are the rightful owner or have obtained explicit authorization.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            3. Disclaimer of Warranties
          </h2>
          <p>
            The software and processing tools are provided &quot;as is&quot; without warranties of any kind. While we rigorously test our client-side algorithms, you are encouraged to retain original copies of important documents prior to running any destructive operations (such as page deletion).
          </p>
        </section>
      </div>
    </article>
  );
}
