import type { Metadata } from "next";
import Link from "next/link";
import { isAdminAuthenticated } from "@/lib/auth";
import { AdminCategoryForm } from "@/components/admin-category-form";
import { AdminLoginForm } from "@/components/admin-login-form";
import { AdminProductForm } from "@/components/admin-product-form";
import { CategoryDeleteButton, ProductDeleteButton } from "@/components/product-delete-button";
import { ProductListActions } from "@/components/product-list-actions";
import { AdminSiteContentForm } from "@/components/admin-site-content-form";
import { signOut } from "@/lib/admin-actions";
import { productDetails } from "@/lib/catalog";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { getSiteContent } from "@/lib/site-content-data";

export const metadata: Metadata = {
  title: "Administración",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ edit?: string }> };

export default async function AdminPage({ searchParams }: Props) {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) {
    return (
      <section className="wrap admin-shell">
        <div className="admin-panel">
          <p className="eyebrow">ACCESO PRIVADO / SOLO EQUIPO BASURA</p>
          <h1>ENTRÁ AL TALLER.</h1>
          <p>La administración del catálogo está reservada para las responsables del proyecto.</p>
          {!process.env.ADMIN_PASSWORD_HASH ||
          !process.env.ADMIN_USERNAME ||
          !process.env.AUTH_SECRET ||
          process.env.AUTH_SECRET.length < 32 ? (
            <div className="admin-error-box">
              <strong>Falta configurar el acceso.</strong>
              <p>Definí ADMIN_USERNAME, ADMIN_PASSWORD_HASH y un AUTH_SECRET de al menos 32 caracteres. Consultá el README.</p>
            </div>
          ) : !process.env.DATABASE_URL ? (
            <div className="admin-error-box">Conectá Neon con DATABASE_URL y aplicá las migraciones antes de iniciar sesión.</div>
          ) : (
            <AdminLoginForm />
          )}
        </div>
      </section>
    );
  }

  if (!process.env.DATABASE_URL) {
    return <section className="wrap admin-shell"><div className="admin-error-box">La sesión está activa, pero falta configurar Neon con DATABASE_URL.</div></section>;
  }

  const [{ edit }, products, categories, siteContent] = await Promise.all([
    searchParams,
    prisma.product.findMany({ include: productDetails, orderBy: { updatedAt: "desc" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    getSiteContent(),
  ]);
  const selected = edit ? products.find((product) => product.id === edit) ?? null : null;
  const publishedCount = products.filter((product) => product.published).length;
  const soldOutCount = products.filter((product) =>
    product.variants.length
      ? product.variants.every((variant) => variant.stock === 0)
      : product.stock === 0,
  ).length;

  return (
    <section className="wrap admin-shell">
      <div className="admin-panel">
        <div className="admin-inline" style={{ justifyContent: "space-between", alignItems: "start" }}>
          <div>
            <p className="eyebrow">PANEL PRIVADO / BASURA</p>
            <h1>EL TALLER.</h1>
            <p>Gestioná prendas, categorías, fotos y los textos que aparecen en la tienda.</p>
          </div>
          <form action={signOut}><button className="admin-logout">CERRAR SESIÓN</button></form>
        </div>
        <div className="admin-stats">
          <div className="admin-stat"><strong>{publishedCount}</strong><span>PRENDAS PUBLICADAS</span></div>
          <div className="admin-stat"><strong>{soldOutCount}</strong><span>PRENDAS AGOTADAS</span></div>
          <div className="admin-stat"><strong>{products.length}</strong><span>EN EL INVENTARIO</span></div>
        </div>

        <nav className="admin-shortcuts" aria-label="Secciones de administración">
          <a href="#product-form"><strong>01 / PRENDAS</strong><span>Crear o editar una pieza</span></a>
          <a href="#inventory"><strong>02 / INVENTARIO</strong><span>Publicar, ocultar o revisar stock</span></a>
          <a href="#categories"><strong>03 / CATEGORÍAS</strong><span>Ordenar el catálogo</span></a>
          <a href="#site-copy"><strong>04 / TEXTOS DEL SITIO</strong><span>Editar títulos y descripciones</span></a>
        </nav>

        <section id="product-form" className="admin-section">
          <p className="eyebrow">{selected ? "EDICIÓN DE PRENDA" : "NUEVA PIEZA"}</p>
          <h2>{selected ? selected.name : "SUMAR UNA EMPARCHADA."}</h2>
          {edit && !selected && <p className="admin-message admin-error">No encontramos esa prenda. Elegí una del inventario.</p>}
          <AdminProductForm key={selected?.id ?? "new"} product={selected} categories={categories} />
          {selected && <ProductDeleteButton id={selected.id} />}
        </section>

        <section className="admin-list" id="inventory">
          <p className="eyebrow">INVENTARIO / MODIFICADAS RECIENTEMENTE</p>
          {products.length === 0 ? (
            <p className="admin-hint">Todavía no hay prendas. Creá la primera desde el formulario.</p>
          ) : products.map((product) => (
            <article className="admin-product-row" key={product.id}>
              <div>
                <strong>{product.name}</strong>
                <p>{formatPrice(product.priceCents)} · {product.published ? "PUBLICADA" : "OCULTA"} · {product.variants.length ? `${product.variants.length} VARIANTES` : `${product.stock} EN STOCK`}</p>
                <p>Modificada {product.updatedAt.toLocaleDateString("es-AR")}</p>
              </div>
              <ProductListActions id={product.id} published={product.published} />
            </article>
          ))}
        </section>

        <section className="admin-list" id="categories">
          <p className="eyebrow">ORDENAR EL CATÁLOGO</p>
          <h2>CATEGORÍAS</h2>
          <AdminCategoryForm />
          {categories.map((category) => (
            <div className="admin-product-row" key={category.id}>
              <div><strong>{category.name}</strong><p>/{category.slug}</p></div>
              <CategoryDeleteButton id={category.id} />
            </div>
          ))}
        </section>
        <section className="admin-list" id="site-copy">
          <p className="eyebrow">CONTENIDO / SIN TOCAR EL CÓDIGO</p>
          <h2>TEXTOS DEL SITIO.</h2>
          <p className="admin-hint">Cambiá títulos, bajadas y descripciones de cada página desde un solo lugar.</p>
          <AdminSiteContentForm content={siteContent} />
        </section>
        <p className="admin-hint">Los pedidos se coordinan por WhatsApp. Este panel no procesa pagos ni reserva stock.</p>
        <Link href="/" className="text-link">VOLVER A LA TIENDA ↗</Link>
      </div>
    </section>
  );
}
