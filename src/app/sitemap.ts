import type { MetadataRoute } from "next";
import { getPublishedProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/emparchadas`, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/basura-es-movimiento`, changeFrequency: "monthly", priority: 0.7 },
  ];
  if (!process.env.DATABASE_URL) return staticPages;
  const products = await getPublishedProducts();
  return [
    ...staticPages,
    ...products.map((product) => ({
      url: `${baseUrl}/emparchadas/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
