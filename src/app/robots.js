export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/", "/static/"],
      },
    ],
    sitemap: "https://pdfpadar.com/sitemap.xml",
    host: "https://pdfpadar.com",
  };
}
