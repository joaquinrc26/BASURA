import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { SportsPhotoStrip } from "@/components/sports-photo-strip";
import { getPublishedProducts } from "@/lib/catalog";
import { getSiteContent } from "@/lib/site-content-data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [products, content] = await Promise.all([
    process.env.DATABASE_URL ? getPublishedProducts() : [],
    getSiteContent(),
  ]);
  const featured = products.filter((product) => product.featured).slice(0, 3);

  return (
    <>
      <section className="hero wrap" aria-labelledby="hero-title">
        <div className="hero-kicker">
          <span>LA PLATA, ARGENTINA</span>
          <span>HECHO A MANO / HECHO EN COMUNIDAD</span>
          <span className="issue-stamp">N.º 001 — EN MOVIMIENTO</span>
        </div>
        <p className="hero-overline">{content.homeOverline}</p>
        <h1 id="hero-title" className="hero-wordmark">
          BASURA<span className="hero-period">.</span>
        </h1>
        <div className="hero-bottom">
          <p className="hero-note">
            {content.homeTagline}
          </p>
          <Link className="button button-ink" href="/emparchadas">
            {content.homeButton} <span aria-hidden="true">↗</span>
          </Link>
          <p className="hero-issue">UN PROYECTO<br />INDEPENDIENTE</p>
        </div>
        <div className="hero-scribble" aria-hidden="true">TODO SE<br />TRANSFORMA</div>
      </section>

      <section className="manifesto-strip" aria-label="Manifiesto BASURA">
        <div className="wrap manifesto-inner">
          <p className="eyebrow">{content.manifestoEyebrow}</p>
          <p className="manifesto-text">{content.manifestoText}</p>
          <span className="manifesto-mark" aria-hidden="true">B!</span>
        </div>
      </section>

      <section className="wrap featured-section" id="prendas">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{content.featuredEyebrow}</p>
            <h2>{content.featuredTitle}<span>—</span></h2>
          </div>
          <Link className="text-link" href="/emparchadas">VER TODAS ↗</Link>
        </div>
        {featured.length > 0 ? (
          <div className="product-grid product-grid-featured">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="empty-editorial">
            <span className="empty-cross" aria-hidden="true">✳</span>
            <p className="empty-title">
              {process.env.DATABASE_URL
                ? "LAS PRÓXIMAS EMPARCHADAS ESTÁN EN CAMINO."
                : "EL CATÁLOGO ESTÁ ESPERANDO SU PRIMERA PRENDA."}
            </p>
            <p>
              {process.env.DATABASE_URL
                ? "Todavía no hay prendas destacadas. Volvé pronto."
                : "La tienda se conecta a Neon cuando configures la base de datos. No mostramos prendas inventadas."}
            </p>
            <Link className="text-link" href="/emparchadas">IR AL CATÁLOGO ↗</Link>
          </div>
        )}
      </section>

      <section className="sports-band" aria-labelledby="sports-title">
        <div className="wrap sports-content">
          <p className="eyebrow">{content.sportsEyebrow}</p>
          <h2 id="sports-title">{content.sportsTitle}</h2>
          <div className="sports-copy">
            <span className="winner-stamp">1.er<br />PUESTO</span>
            <p>{content.sportsDescription}</p>
            <Link className="text-link" href="/basura-es-movimiento">
              {content.sportsButton} ↗
            </Link>
          </div>
        </div>
        <SportsPhotoStrip />
      </section>

      <section className="wrap manifesto-close">
        <p className="eyebrow">{content.closingEyebrow}</p>
        <h2>{content.closingTitle}</h2>
        <Link className="button button-acid" href="/basura-es-movimiento">
          {content.closingButton} ↗
        </Link>
      </section>
    </>
  );
}
