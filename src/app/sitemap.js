import { TOOLS } from "@/lib/tools-registry";
import { BLOG_POSTS } from "@/lib/blog-posts";

const BASE_URL = "https://pdfpadar.com";

// Priority tiers — most-searched tools get higher priority
const HIGH_PRIORITY_SLUGS = [
  "merge-pdf",
  "compress-image",
  "split-pdf",
  "jpg-to-pdf",
  "png-to-pdf",
  "convert-image",
  "resize-image",
  "protect-pdf",
  "image-to-pdf",
];

export default function sitemap() {
  const now = new Date();

  const toolUrls = TOOLS.map((tool) => ({
    url: `${BASE_URL}/tools/${tool.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: HIGH_PRIORITY_SLUGS.includes(tool.slug) ? 0.9 : 0.7,
  }));

  const blogUrls = BLOG_POSTS.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: "monthly",
    priority: 0.75,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    ...toolUrls,
    ...blogUrls,
  ];
}
