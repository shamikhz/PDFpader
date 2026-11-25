import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const BASE_URL = "https://pdfpadar.com";

export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "PDFpadar — Free Online PDF, Image & File Tools (100% Private)",
    template: "%s | PDFpadar",
  },
  description:
    "Merge, split, compress, convert, rotate, protect, and edit PDFs, images, and files entirely in your browser. No uploads. No registration. 100% private and free.",
  keywords: [
    "PDF tools online free",
    "merge PDF online",
    "compress image online",
    "image converter free",
    "split PDF online",
    "client-side PDF tools",
    "PDF watermark online",
    "file hash generator",
    "online PDF editor free",
    "resize image online",
    "convert JPG to PDF",
    "convert PNG to PDF",
    "private PDF tools",
    "no upload PDF tool",
    "in-browser file processing",
    "merge pdf without uploading",
    "split pdf without uploading",
    "compress image without uploading",
    "client side pdf metadata remover",
    "remove exif data without upload",
    "in-browser file hash generator",
    "free pdf tool that doesn't upload files",
    "zero upload pdf editor",
    "offline browser pdf tools",
    "private image converter no server",
    "local browser zip archive",
    "password protect pdf without upload",
    "100% client-side file tools",
  ],
  authors: [{ name: "PDFpadar", url: BASE_URL }],
  creator: "PDFpadar",
  publisher: "PDFpadar",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "PDFpadar",
    title: "PDFpadar — Free Online PDF, Image & File Tools (100% Private)",
    description:
      "Merge, split, compress, convert, rotate, protect, and edit PDFs, images, and files entirely in your browser. No uploads. No registration. 100% private and free.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PDFpadar — Free In-Browser PDF, Image & File Tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PDFpadar — Free Online PDF, Image & File Tools (100% Private)",
    description:
      "Merge, split, compress, convert, and edit PDFs & images in your browser. Zero uploads. Free forever.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
  },
  manifest: "/manifest.json",
  verification: {
    // Add GSC/Bing tokens here when available
    // google: "YOUR_GSC_VERIFICATION_TOKEN",
    // yandex: "YOUR_YANDEX_TOKEN",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#f97316",
};

export default function RootLayout({ children }) {
  // Website-level JSON-LD: Organization + WebSite + SearchAction
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${BASE_URL}/#organization`,
        name: "PDFpadar",
        url: BASE_URL,
        logo: {
          "@type": "ImageObject",
          url: `${BASE_URL}/icon.png`,
          width: 512,
          height: 512,
        },
        description:
          "PDFpadar provides free, private, in-browser PDF, image, and file processing tools. All files are processed locally — nothing is uploaded to servers.",
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer support",
          url: `${BASE_URL}/privacy`,
        },
      },
      {
        "@type": "WebSite",
        "@id": `${BASE_URL}/#website`,
        url: BASE_URL,
        name: "PDFpadar",
        description:
          "Free online PDF, image & file processing tools. 100% client-side. No uploads required.",
        publisher: { "@id": `${BASE_URL}/#organization` },
      },
      {
        "@type": "FAQPage",
        "@id": `${BASE_URL}/#faq`,
        mainEntity: [
          {
            "@type": "Question",
            name: "What is a free PDF tool that doesn't upload my files?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "PDFpadar is a free, 100% client-side PDF, image, and file utility suite. All merging, splitting, watermarking, encryption, image compression, EXIF removal, and SHA-256 hashing run locally in your browser memory—your files are never uploaded to any server.",
            },
          },
          {
            "@type": "Question",
            name: "How does client-side file processing work?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Traditional web tools upload your files to remote cloud servers. PDFpadar executes all PDF manipulation, HTML5 Canvas image processing, ZIP archiving, and Web Crypto hashing locally inside your web browser so your files never leave your device.",
            },
          },
          {
            "@type": "Question",
            name: "Are my confidential legal documents and photos safe?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. Because zero files are transmitted over the internet to any backend server, it is architecturally impossible for PDFpadar or third parties to access, store, or view your documents or photos.",
            },
          },
        ],
      },
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col font-sans antialiased bg-[#fcf0e2] text-[#22140a] dark:bg-[#100804] dark:text-[#fdf2e6] selection:bg-brand-500 selection:text-white">
        <ThemeProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
