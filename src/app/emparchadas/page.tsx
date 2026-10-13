import type { Metadata } from "next";
import { ProductBrowser } from "@/components/product-browser";
import { getPublishedProducts } from "@/lib/catalog";
import { prisma } from "@/lib/db";
import { getSiteContent } from "@/lib/site-content-data";

export const metadata: Metadata = {
  title: "Emparchadas",
  description: "Prendas recuperadas e intervenidas. Cada pieza tiene otra historia.",
};
export const dynamic = "force-dynamic";

export default async function EmparchadasPage() {
  const [products, categories, content] = await Promise.all([
    process.env.DATABASE_URL ? getPublishedProducts() : [],
    process.env.DATABASE_URL
      ? prisma.category.findMany({
          where: { isActive: true },
          select: { id: true, name: true },
          orderBy: { name: "asc" },
        })
      : [],
    getSiteContent(),
  ]);

  return (
    <section className="wrap">
      <header className="page-intro">
        <p className="eyebrow">{content.catalogEyebrow}</p>
        <h1>{content.catalogTitle}</h1>
        <p>{content.catalogDescription}</p>
      </header>
      <ProductBrowser products={products} categories={categories} configured={Boolean(process.env.DATABASE_URL)} />
    </section>
  );
}
