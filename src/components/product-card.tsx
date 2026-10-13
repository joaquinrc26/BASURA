import Link from "next/link";
import type { CatalogProduct } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";

function availableStock(product: CatalogProduct) {
  return product.variants.length
    ? product.variants.reduce((sum, variant) => sum + variant.stock, 0)
    : product.stock;
}

export function ProductCard({ product }: { product: CatalogProduct }) {
  const image = product.images[0];
  const stock = availableStock(product);

  return (
    <article className="product-card">
      <Link href={`/emparchadas/${product.slug}`} aria-label={`Ver ${product.name}`}>
        <div className="product-image-wrap">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="product-image" src={image.url} alt={image.alt} loading="lazy" />
          ) : (
            <div className="image-placeholder" aria-label="Fotografía pendiente de cargar">
              <span className="placeholder-mark">B!</span>
              <span>Fotografía pendiente</span>
            </div>
          )}
          {stock <= 0 && <span className="product-sticker">AGOTADA</span>}
          {product.featured && stock > 0 && <span className="product-sticker">ÚNICA / DESTACADA</span>}
        </div>
        <div className="product-meta">
          <p>{product.name}</p>
          <p className="product-price">{formatPrice(product.priceCents)}</p>
        </div>
      </Link>
      <p className={`availability ${stock <= 0 ? "sold-out" : ""}`}>
        {stock <= 0 ? "SIN STOCK" : stock === 1 ? "1 DISPONIBLE · PIEZA ÚNICA" : `${stock} DISPONIBLES`}
      </p>
    </article>
  );
}
