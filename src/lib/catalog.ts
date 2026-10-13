import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

export const productDetails = {
  images: { orderBy: { position: "asc" as const } },
  variants: { orderBy: { name: "asc" as const } },
  category: true,
} satisfies Prisma.ProductInclude;

export type CatalogProduct = Prisma.ProductGetPayload<{
  include: typeof productDetails;
}>;

export async function getPublishedProducts() {
  if (!process.env.DATABASE_URL) return [];

  try {
    return await prisma.product.findMany({
      where: { published: true },
      include: productDetails,
      orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
    });
  } catch (error) {
    console.error("Unable to load the public product catalog.", error);
    throw new Error("No se pudo cargar el catálogo. Intentá de nuevo más tarde.");
  }
}

export async function getProductBySlug(slug: string, includeHidden = false) {
  if (!process.env.DATABASE_URL) return null;

  try {
    return await prisma.product.findFirst({
      where: { slug, ...(includeHidden ? {} : { published: true }) },
      include: productDetails,
    });
  } catch (error) {
    console.error("Unable to load the requested product.", error);
    throw new Error("No se pudo cargar la prenda. Intentá de nuevo más tarde.");
  }
}
