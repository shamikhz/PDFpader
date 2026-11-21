import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "PDFpadar — Fast, Free & 100% Private Online PDF, Image & File Tools",
  description: "Merge, split, compress, convert, rotate, protect, and edit PDF, image, and data files directly in your browser. Zero server uploads. Fast, lightweight, and 100% private.",
  keywords: [
    "PDF tools",
    "merge pdf",
    "compress image",
    "image converter",
    "split pdf",
    "client-side pdf tools",
    "pdf watermark",
    "file hash generator",
    "online pdf editor free",
  ],
  authors: [{ name: "PDFpadar Team" }],
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-icon.png", sizes: "180x180" },
    ],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
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
