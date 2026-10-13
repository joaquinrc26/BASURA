"use client";

import { useMemo, useState } from "react";
import { AddToCartButton } from "@/components/add-to-cart-button";
import type { CartItem } from "@/components/cart-provider";

type PurchaseProduct = {
  id: string;
  slug: string;
  name: string;
  priceCents: number;
  stock: number;
  imageUrl: string | null;
  variants: Array<{ id: string; name: string; stock: number }>;
};

export function ProductPurchase({ product }: { product: PurchaseProduct }) {
  const [variantId, setVariantId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const variant = product.variants.find((entry) => entry.id === variantId);
  const stock = product.variants.length ? (variant?.stock ?? 0) : product.stock;

  const item = useMemo<CartItem | null>(() => {
    if (product.variants.length && !variant) return null;
    return {
      productId: product.id,
      slug: product.slug,
      name: product.name,
      imageUrl: product.imageUrl,
      variantId: variant?.id ?? null,
      variantName: variant?.name ?? null,
      quantity,
      stock,
      unitPriceCents: product.priceCents,
    };
  }, [product, variant, quantity, stock]);

  return (
    <div>
      {product.variants.length > 0 && (
        <label className="detail-field">
          ELEGÍ UNA VARIANTE
          <select
            className="field-control"
            value={variantId}
            onChange={(event) => { setVariantId(event.target.value); setQuantity(1); }}
            required
          >
            <option value="">Seleccionar talle</option>
            {product.variants.map((entry) => (
              <option key={entry.id} value={entry.id} disabled={entry.stock < 1}>
                {entry.name}{entry.stock < 1 ? " — agotado" : ""}
              </option>
            ))}
          </select>
          {variant && <span className="variant-available">{variant.stock} disponible(s)</span>}
        </label>
      )}
      {!product.variants.length && stock > 1 && (
        <label className="detail-field">
          CANTIDAD
          <input
            className="field-control"
            type="number"
            min="1"
            max={Math.min(stock, 99)}
            value={quantity}
            onChange={(event) => setQuantity(Math.max(1, Math.min(Number(event.target.value) || 1, stock, 99)))}
          />
        </label>
      )}
      {stock <= 0 && <p className="availability sold-out" role="status">ESTA PRENDA ESTÁ AGOTADA.</p>}
      <AddToCartButton
        item={item}
        disabled={stock <= 0 || (product.variants.length > 0 && !variant)}
        label={stock <= 0 ? "PRENDA AGOTADA" : "SUMAR A LA BOLSA"}
      />
    </div>
  );
}
