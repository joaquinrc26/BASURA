import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductPurchase } from "@/components/product-purchase";
import { ProductCard } from "@/components/product-card";
import { ProductGallery } from "@/components/product-gallery";
import { getProductBySlug, getPublishedProducts } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Prenda no encontrada" };
  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: `${product.name} — BASURA`,
      description: product.description,
      images: product.images[0] ? [product.images[0].url] : [],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = product.categoryId
    ? (await getPublishedProducts())
        .filter((candidate) => candidate.categoryId === product.categoryId && candidate.id !== product.id)
        .slice(0, 3)
    : [];

  const totalStock = product.variants.length
    ? product.variants.reduce((sum, variant) => sum + variant.stock, 0)
    : product.stock;

  return (
    <div className="wrap">
      <p className="breadcrumbs"><Link href="/emparchadas">EMPARCHADAS</Link> / {product.name.toLocaleUpperCase("es-AR")}</p>
      <section className="product-detail">
        <ProductGallery images={product.images.map(({ url, alt }) => ({ url, alt }))} productName={product.name} />
        <div className="product-info">
          <p className="eyebrow">{product.category?.name ?? "PIEZA RECUPERADA"} / {totalStock === 1 ? "PIEZA ÚNICA" : `${totalStock} DISPONIBLES`}</p>
          <h1>{product.name}</h1>
          <p className="detail-price">{formatPrice(product.priceCents)}</p>
          <p className="detail-copy">{product.description}</p>
          {product.story && <div className="detail-story"><p className="eyebrow">HISTORIA DE ESTA INTERVENCIÓN</p>{product.story}</div>}
          {product.materials && <p className="detail-copy"><strong>MATERIALES:</strong> {product.materials}</p>}
          {product.care && <p className="detail-copy"><strong>CUIDADOS:</strong> {product.care}</p>}
          <ProductPurchase
            product={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              priceCents: product.priceCents,
              stock: product.stock,
              imageUrl: product.images[0]?.url ?? null,
              variants: product.variants.map(({ id, name, stock }) => ({ id, name, stock })),
            }}
          />
          <p className="whatsapp-note">Tu selección no reserva la prenda ni confirma una venta. Disponibilidad, pago, entrega y envío se coordinan por WhatsApp.</p>
        </div>
      </section>
      {related.length > 0 && (
        <section className="related-section">
          <div className="section-heading"><h2>OTRAS VIDAS</h2><span className="eyebrow">MISMA CATEGORÍA</span></div>
          <div className="product-grid">{related.map((item) => <ProductCard key={item.id} product={item} />)}</div>
        </section>
      )}
    </div>
  );
}
