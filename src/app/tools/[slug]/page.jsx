import { notFound } from "next/navigation";
import { TOOLS, getToolBySlug, getRelatedTools } from "@/lib/tools-registry";
import ToolLayout from "@/components/ToolLayout";

const BASE_URL = "https://pdfpadar.com";

// Map tool categories to rich SEO titles
const CATEGORY_LABEL = {
  pdf: "PDF Tool",
  image: "Image Tool",
  file: "File Utility",
};

export async function generateStaticParams() {
  return TOOLS.map((tool) => ({
    slug: tool.slug,
  }));
}

export async function generateMetadata({ params }) {
  const tool = getToolBySlug(params.slug);
  if (!tool) {
    return {
      title: "Tool Not Found",
      description: "The requested tool could not be found on PDFpadar.",
    };
  }

  const catLabel = CATEGORY_LABEL[tool.category] || "Online Tool";
  // Craft unique, intent-driven titles per tool
  const title = `${tool.name} — Free Online ${catLabel} | No Upload Required`;
  const description = `${tool.shortDesc} Works entirely in your browser — no file uploads, no registration, 100% free and private. Use PDFpadar's ${tool.name} instantly.`;
  const url = `${BASE_URL}/tools/${tool.slug}`;

  const formats = tool.accept
    .split(",")
    .map((f) => f.trim().replace(/^\./, "").replace(/^(image|application|text)\//, "").toUpperCase())
    .filter((f) => f && f !== "*")
    .slice(0, 5)
    .join(", ");

  const nameLower = tool.name.toLowerCase();
  const keywords = [
    nameLower,
    `${nameLower} online`,
    `${nameLower} free`,
    `${nameLower} without uploading`,
    `${nameLower} no upload`,
    `client side ${nameLower}`,
    `private ${nameLower} in browser`,
    `zero upload ${nameLower}`,
    `${nameLower} without server`,
    `free ${tool.category} tool no upload`,
    "no upload file tool",
    "100% client-side processing",
    "in browser file converter",
    "private local file processing",
    formats && `${formats} ${tool.category} tool`,
    formats && `${formats} converter without uploading`,
  ].filter(Boolean);

  return {
    title,
    description,
    keywords,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      type: "website",
      url,
      siteName: "PDFpadar",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: `${tool.name} — PDFpadar Free Online Tool`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.png"],
    },
  };
}

export default function ToolPage({ params }) {
  const tool = getToolBySlug(params.slug);
  if (!tool) {
    notFound();
  }

  const related = getRelatedTools(tool.slug);
  const url = `${BASE_URL}/tools/${tool.slug}`;

  const categoryLabel = CATEGORY_LABEL[tool.category] || "Utility Tool";
  const categoryHref = `${BASE_URL}/#all-tools`;

  // HowTo steps from instructions
  const howToSteps = (tool.instructions || []).map((step, i) => ({
    "@type": "HowToStep",
    position: i + 1,
    name: step.split(".")[0] || `Step ${i + 1}`,
    text: step,
  }));

  // JSON-LD: SoftwareApplication + BreadcrumbList + HowTo + FAQPage
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "@id": `${url}/#software`,
        name: tool.name,
        url,
        operatingSystem: "Windows, macOS, Linux, Android, iOS",
        applicationCategory: "UtilitiesApplication",
        applicationSubCategory:
          tool.category === "pdf"
            ? "PDFApplication"
            : tool.category === "image"
              ? "ImageApplication"
              : "FileUtility",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
        },
        description: tool.shortDesc,
        isAccessibleForFree: true,
        keywords: `${tool.name}, no upload, 100% client-side, in-browser, zero server storage, private ${tool.category} tool`,
        featureList: tool.features,
        screenshot: `${BASE_URL}/og-image.png`,
        softwareVersion: "1.0",
        aggregateRating: tool.rating
          ? {
              "@type": "AggregateRating",
              ratingValue: tool.rating,
              ratingCount: tool.ratingCount || 50,
              bestRating: 5,
            }
          : undefined,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: BASE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name:
              tool.category === "pdf"
                ? "PDF Tools"
                : tool.category === "image"
                  ? "Image Tools"
                  : "File Utilities",
            item: categoryHref,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: tool.name,
            item: url,
          },
        ],
      },
      howToSteps.length > 0
        ? {
            "@type": "HowTo",
            name: `How to use ${tool.name}`,
            description: `Step-by-step guide to using the free online ${tool.name} tool on PDFpadar.`,
            tool: { "@type": "HowToTool", name: "PDFpadar" },
            step: howToSteps,
          }
        : null,
      tool.faqs && tool.faqs.length > 0
        ? {
            "@type": "FAQPage",
            mainEntity: tool.faqs.map((faq) => ({
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ToolLayout tool={tool} relatedTools={related} />
    </>
  );
}
