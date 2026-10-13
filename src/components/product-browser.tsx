"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/product-card";
import type { CatalogProduct } from "@/lib/catalog";

type CategoryOption = { id: string; name: string };

export function ProductBrowser({
  products,
  categories,
  configured,
}: {
  products: CatalogProduct[];
  categories: CategoryOption[];
  configured: boolean;
}) {
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [size, setSize] = useState("all");
  const [availability, setAvailability] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("newest");

  const sizes = useMemo(
    () => Array.from(new Set(products.flatMap((product) => product.variants.map((variant) => variant.name)))).sort(),
    [products],
  );

  const filtered = useMemo(() => {
    const result = products.filter((product) => {
      const totalStock = product.variants.length
        ? product.variants.reduce((sum, variant) => sum + variant.stock, 0)
        : product.stock;
      const matchesQuery = `${product.name} ${product.description} ${product.story ?? ""}`
        .toLocaleLowerCase("es-AR").includes(query.toLocaleLowerCase("es-AR"));
      const matchesCategory = categoryId === "all" || product.categoryId === categoryId;
      const matchesSize = size === "all" || product.variants.some((variant) => variant.name === size && variant.stock > 0);
      const matchesAvailability = availability === "all" || (availability === "available" ? totalStock > 0 : totalStock <= 0);
      const matchesMinPrice = !minPrice || product.priceCents >= Number(minPrice) * 100;
      const matchesMaxPrice = !maxPrice || product.priceCents <= Number(maxPrice) * 100;
      return matchesQuery && matchesCategory && matchesSize && matchesAvailability && matchesMinPrice && matchesMaxPrice;
    });

    if (sort === "price-asc") result.sort((a, b) => a.priceCents - b.priceCents);
    if (sort === "price-desc") result.sort((a, b) => b.priceCents - a.priceCents);
    if (sort === "newest") result.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    return result;
  }, [products, query, categoryId, size, availability, minPrice, maxPrice, sort]);

  return (
    <>
      <div className="catalog-tools" aria-label="Filtros del catálogo">
        <label className="filter-label">
          <span className="eyebrow">BUSCAR</span>
          <input className="field-control" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Una prenda, una historia..." />
        </label>
        <label className="filter-label">
          <span className="eyebrow">CATEGORÍA</span>
          <select className="field-control" value={categoryId} onChange={(event) => setCategoryId(event.target.value)}>
            <option value="all">Todas</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </label>
        <label className="filter-label">
          <span className="eyebrow">TALLE</span>
          <select className="field-control" value={size} onChange={(event) => setSize(event.target.value)}>
            <option value="all">Todos</option>
            {sizes.map((entry) => <option key={entry} value={entry}>{entry}</option>)}
          </select>
        </label>
        <label className="filter-label">
          <span className="eyebrow">DISPONIBILIDAD</span>
          <select className="field-control" value={availability} onChange={(event) => setAvailability(event.target.value)}>
            <option value="all">Todas</option>
            <option value="available">Disponibles</option>
            <option value="sold-out">Agotadas</option>
          </select>
        </label>
        <label className="filter-label">
          <span className="eyebrow">PRECIO DESDE ($)</span>
          <input className="field-control" type="number" min="0" step="any" inputMode="decimal" value={minPrice} onChange={(event) => setMinPrice(event.target.value)} placeholder="Sin mínimo" />
        </label>
        <label className="filter-label">
          <span className="eyebrow">PRECIO HASTA ($)</span>
          <input className="field-control" type="number" min="0" step="any" inputMode="decimal" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} placeholder="Sin máximo" />
        </label>
        <label className="filter-label">
          <span className="eyebrow">ORDENAR</span>
          <select className="field-control" value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="newest">Novedades</option>
            <option value="price-asc">Precio: menor a mayor</option>
            <option value="price-desc">Precio: mayor a menor</option>
          </select>
        </label>
      </div>
      {!configured ? (
        <div className="catalog-empty" role="status">
          <p className="eyebrow">CONFIGURACIÓN PENDIENTE</p>
          <h2>EL CATÁLOGO AÚN NO ESTÁ CONECTADO.</h2>
          <p>Configurá Neon y ejecutá la migración para administrar prendas desde /admin. No usamos productos de muestra.</p>
        </div>
      ) : filtered.length ? (
        <div className="product-grid catalog-grid">
          {filtered.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      ) : (
        <div className="catalog-empty" role="status">
          <p className="eyebrow">NO HAY COINCIDENCIAS</p>
          <h2>NO ENCONTRAMOS ESA EMPARCHADA.</h2>
          <p>Probá cambiar la búsqueda o los filtros. Cada prenda aparece acá cuando está publicada.</p>
        </div>
      )}
    </>
  );
}
