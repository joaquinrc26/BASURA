import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const requestSchema = z.object({
  items: z.array(z.object({
    productId: z.string().min(1),
    variantId: z.string().min(1).nullable(),
    quantity: z.number().int().min(1).max(99),
  })).min(1).max(50),
});

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "El catálogo todavía no está conectado." }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "El carrito no tiene un formato válido." }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Revisá los productos y las cantidades del carrito." }, { status: 400 });
  }

  const keys = parsed.data.items.map((item) => `${item.productId}:${item.variantId ?? "unico"}`);
  if (new Set(keys).size !== keys.length) {
    return NextResponse.json({ error: "El carrito contiene una prenda duplicada." }, { status: 400 });
  }

  try {
    const products = await prisma.product.findMany({
      where: { id: { in: parsed.data.items.map((item) => item.productId) }, published: true },
      include: { variants: true },
    });
    const productsById = new Map(products.map((product) => [product.id, product]));
    const verifiedItems = [];
    for (const item of parsed.data.items) {
      const product = productsById.get(item.productId);
      if (!product) {
        return NextResponse.json({ error: "Una prenda del carrito ya no está publicada." }, { status: 409 });
      }

      const variant = item.variantId
        ? product.variants.find((entry) => entry.id === item.variantId)
        : undefined;
      if (product.variants.length && !variant) {
        return NextResponse.json({ error: `${product.name}: elegí una variante disponible.` }, { status: 409 });
      }
      if (!product.variants.length && item.variantId) {
        return NextResponse.json({ error: `${product.name}: la variante seleccionada ya no existe.` }, { status: 409 });
      }

      const available = variant?.stock ?? product.stock;
      if (available < item.quantity) {
        return NextResponse.json({
          error: `${product.name}: quedan ${available} unidad(es). Actualizá la cantidad antes de continuar.`,
        }, { status: 409 });
      }

      verifiedItems.push({
        name: product.name,
        variantName: variant?.name,
        quantity: item.quantity,
        unitPriceCents: product.priceCents,
      });
    }

    return NextResponse.json({ items: verifiedItems }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Unable to verify the WhatsApp cart.", error);
    return NextResponse.json({ error: "No se pudo verificar el carrito. Intentá más tarde." }, { status: 503 });
  }
}
