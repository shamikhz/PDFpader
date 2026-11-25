import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumb";
import DynamicIcon from "@/components/DynamicIcon";
import { BLOG_POSTS, getBlogPostBySlug } from "@/lib/blog-posts";
import { getToolBySlug } from "@/lib/tools-registry";
import { ArrowLeft, ArrowRight, Calendar, CheckCircle, Clock, HelpCircle, ShieldCheck } from "lucide-react";

const BASE_URL = "https://pdfpadar.com";

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }) {
  const post = getBlogPostBySlug(params.slug);
  if (!post) {
    return {
      title: "Article Not Found",
      description: "The requested blog article could not be found on PDFpadar.",
    };
  }

  const url = `${BASE_URL}/blog/${post.slug}`;

  return {
    title: post.shortTitle || post.title,
    description: post.description,
    keywords: [
      post.primaryKeyword,
      "100% client-side",
      "no upload pdf tool",
      "free browser file tools",
      post.category.toLowerCase(),
    ],
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.publishedAt,
      url,
      siteName: "PDFpadar",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: ["/og-image.png"],
    },
  };
}

export default function BlogPostPage({ params }) {
  const post = getBlogPostBySlug(params.slug);
  if (!post) {
    notFound();
  }

  const relatedTools = (post.relatedTools || [])
    .map((slug) => getToolBySlug(slug))
    .filter(Boolean);

  const otherPosts = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 3);
  const url = `${BASE_URL}/blog/${post.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${url}/#article`,
        headline: post.title,
        description: post.description,
        datePublished: post.publishedAt,
        dateModified: post.publishedAt,
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        author: { "@type": "Organization", name: "PDFpadar", url: BASE_URL },
        publisher: { "@id": `${BASE_URL}/#organization` },
        image: `${BASE_URL}/og-image.png`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: BASE_URL },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${BASE_URL}/blog` },
          { "@type": "ListItem", position: 3, name: post.shortTitle || post.title, item: url },
        ],
      },
      post.faqs && post.faqs.length > 0
        ? {
            "@type": "FAQPage",
            mainEntity: post.faqs.map((faq) => ({
              "@type": "Question",
              name: faq.q,
              acceptedAnswer: {
                "@type": "Answer",
                text: faq.a,
              },
            })),
          }
        : null,
    ].filter(Boolean),
  };

  const breadcrumbs = [
    { label: "Blog", href: "/blog" },
    { label: post.shortTitle || post.title },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-10">
        <div>
          <Breadcrumb items={breadcrumbs} />
        </div>

        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-3 py-1 rounded-full bg-brand-500/10 text-brand-700 dark:text-brand-300 font-semibold border border-brand-500/20">
              {post.category}
            </span>
            <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 px-2 py-1">
              <Calendar className="w-3.5 h-3.5" />
              <time dateTime={post.publishedAt}>{post.publishedAt}</time>
            </span>
            <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 px-2 py-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{post.readTime}</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
              <span>100% Client-Side</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            {post.title}
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            {post.description}
          </p>
        </header>

        <div className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
          {post.sections.map((section, idx) => (
            <section key={idx} className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {section.heading}
              </h2>
              {section.paragraphs &&
                section.paragraphs.map((p, pIdx) => (
                  <p
                    key={pIdx}
                    className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed"
                  >
                    {p}
                  </p>
                ))}
              {section.bullets && section.bullets.length > 0 && (
                <ul className="space-y-2.5 pt-1">
                  {section.bullets.map((b, bIdx) => (
                    <li
                      key={bIdx}
                      className="flex items-start gap-2.5 text-sm sm:text-base text-slate-700 dark:text-slate-300"
                    >
                      <CheckCircle className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0 mt-1" />
                      <span className="leading-relaxed">{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        {/* FAQs */}
        {post.faqs && post.faqs.length > 0 && (
          <section aria-label="Frequently Asked Questions" className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-brand-500" />
              <span>Frequently Asked Questions</span>
            </h2>
            <div className="space-y-3">
              {post.faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2"
                >
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                    {faq.q}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Related Tools */}
        {relatedTools.length > 0 && (
          <section aria-label="Try these free tools" className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Try These Free 100% Client-Side Tools
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedTools.map((tool) => (
                <Link
                  key={tool.slug}
                  href={`/tools/${tool.slug}`}
                  className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-400 shadow-sm transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                      <DynamicIcon name={tool.icon} className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-brand-600">
                      {tool.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {tool.shortDesc}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-brand-600 pt-3">
                    <span>Open Tool</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* More Articles */}
        {otherPosts.length > 0 && (
          <section aria-label="More guides" className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                More Privacy &amp; File Guides
              </h2>
              <Link
                href="/blog"
                className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:underline"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>All Articles</span>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {otherPosts.map((other) => (
                <Link
                  key={other.slug}
                  href={`/blog/${other.slug}`}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-400 transition-all space-y-2"
                >
                  <span className="text-xs font-semibold text-brand-600">{other.category}</span>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2">
                    {other.shortTitle || other.title}
                  </h3>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </>
  );
}
