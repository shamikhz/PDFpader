import React from "react";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import { BLOG_POSTS } from "@/lib/blog-posts";
import { ArrowRight, BookOpen, Clock, ShieldCheck, Sparkles } from "lucide-react";

const BASE_URL = "https://pdfpadar.com";

export const metadata = {
  title: "Blog — Client-Side PDF, Image & File Privacy Guides",
  description:
    "Practical guides on merging PDFs without uploading, stripping photo EXIF/GPS metadata, verifying SHA-256 checksums, and keeping your files 100% private in your browser.",
  alternates: { canonical: `${BASE_URL}/blog` },
  openGraph: {
    title: "PDFpadar Blog — Privacy-First File Processing Guides",
    description:
      "Learn how to process PDFs, images, and files 100% locally in your browser with zero server uploads and no paywalls.",
    url: `${BASE_URL}/blog`,
    type: "website",
    siteName: "PDFpadar",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PDFpadar Blog — Client-Side File Processing Guides",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PDFpadar Blog — Privacy-First File Processing Guides",
    description:
      "Practical tutorials for client-side PDF, image, and file tools. 100% free, zero uploads.",
    images: ["/og-image.png"],
  },
};

export default function BlogIndexPage() {
  const breadcrumbs = [{ label: "Blog" }];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Blog",
        "@id": `${BASE_URL}/blog/#blog`,
        url: `${BASE_URL}/blog`,
        name: "PDFpadar Blog",
        description:
          "Guides and tutorials on 100% client-side PDF, image, and file processing.",
        publisher: { "@id": `${BASE_URL}/#organization` },
        blogPost: BLOG_POSTS.map((post) => ({
          "@type": "BlogPosting",
          headline: post.title,
          url: `${BASE_URL}/blog/${post.slug}`,
          datePublished: post.publishedAt,
          description: post.description,
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${BASE_URL}/blog` },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-12">
        <div>
          <Breadcrumb items={breadcrumbs} />
        </div>

        <header className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-700 dark:text-brand-300 text-xs font-semibold border border-brand-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% Client-Side • Free Forever</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            PDFpadar Blog &amp; Guides
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Practical tutorials on private PDF editing, image optimization, metadata removal, and browser-based file utilities — with zero server uploads.
          </p>
        </header>

        <section aria-label="Published articles" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {BLOG_POSTS.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-500/60 shadow-sm transition-all flex flex-col justify-between space-y-5"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded-lg bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 font-semibold">
                    {post.category}
                  </span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{post.readTime}</span>
                  </span>
                </div>

                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors leading-snug">
                  {post.title}
                </h2>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {post.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs font-bold text-brand-600 dark:text-brand-400">
                <span>Read Guide</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </section>

        <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-500" />
              <span>Ready to Process Files Privately?</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Try all 29 free, in-browser PDF, image, and file tools with zero uploads.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-sm transition-colors shrink-0"
          >
            <BookOpen className="w-4 h-4" />
            <span>Explore All Tools</span>
          </Link>
        </section>
      </div>
    </>
  );
}
