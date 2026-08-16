import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://doctor.169.58.65.43.sslip.io";
  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/booking`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
