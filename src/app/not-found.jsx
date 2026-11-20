import Link from "next/link";
import { FileQuestion, ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 flex items-center justify-center">
        <FileQuestion className="w-8 h-8" />
      </div>
      <div className="space-y-2 max-w-md">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">
          Tool Not Found
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          The processing tool you are looking for doesn&apos;t exist or may have been moved. Explore our suite of 28+ in-browser tools on the homepage.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-md transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Browse All Tools</span>
        </Link>
      </div>
    </div>
  );
}
