import { notFound } from "next/navigation";
import { TOOLS, getToolBySlug, getRelatedTools } from "@/lib/tools-registry";
import ToolLayout from "@/components/ToolLayout";

export async function generateStaticParams() {
  return TOOLS.map((tool) => ({
    slug: tool.slug,
  }));
}

export async function generateMetadata({ params }) {
  const tool = getToolBySlug(params.slug);
  if (!tool) {
    return {
      title: "Tool Not Found | PDFpadar",
    };
  }

  const title = `${tool.name} — Free Online Tool (100% Private) | PDFpadar`;
  const description = `${tool.shortDesc} Fast, secure, zero file uploads. Free in-browser file utility.`;

  return {
    title,
    description,
    keywords: [tool.name, `${tool.name} online`, "free pdf tools", "in browser file converter", "client side pdf tool"],
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "PDFpadar",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default function ToolPage({ params }) {
  const tool = getToolBySlug(params.slug);
  if (!tool) {
    notFound();
  }

  const related = getRelatedTools(tool.slug);

  // JSON-LD structured data for SEO (SoftwareApplication + HowTo + FAQPage)
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "name": tool.name,
        "operatingSystem": "All",
        "applicationCategory": "UtilitiesApplication",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "description": tool.shortDesc
      },
      {
        "@type": "FAQPage",
        "mainEntity": (tool.faqs || []).map((faq) => ({
          "@type": "Question",
          "name": faq.q,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.a
          }
        }))
      }
    ]
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
