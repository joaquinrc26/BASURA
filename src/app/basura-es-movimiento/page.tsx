import type { Metadata } from "next";
import Link from "next/link";
import { getInstagramUrl, getWhatsAppContactUrl } from "@/lib/social";
import { SportsPhotoStrip } from "@/components/sports-photo-strip";
import { getSiteContent } from "@/lib/site-content-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "BASURA es movimiento",
  description: "La historia, el proceso colectivo y las ideas detrás de BASURA.",
};

export default async function MovementPage() {
  const instagramUrl = getInstagramUrl();
  const whatsappUrl = getWhatsAppContactUrl("Hola, BASURA. Quiero conocer más del movimiento.");
  const content = await getSiteContent();
  return (
    <article className="wrap editorial-page">
      <p className="eyebrow">{content.movementEyebrow}</p>
      <h1 className="editorial-lead">{content.movementTitle}</h1>
      <div className="editorial-columns">
        <div>
          <p>{content.movementIntroFirst}</p>
          <p>{content.movementIntroSecond}</p>
        </div>
        <div className="editorial-poster" aria-label="Manifiesto gráfico de BASURA">
          <span>NO ES DESCARTE / ES MATERIAL PARA OTRA COSA</span>
          <strong>HACER<br />DE NUEVO.</strong>
          <span>INTERVENCIÓN COLECTIVA · LA PLATA</span>
        </div>
      </div>
      <section className="editorial-section">
        <p className="eyebrow">{content.processEyebrow}</p>
        <h2>{content.processTitle}</h2>
        <p className="detail-copy">{content.processDescription}</p>
      </section>
      <section className="editorial-section">
        <p className="eyebrow">{content.recognitionEyebrow}</p>
        <h2>{content.recognitionTitle}</h2>
        <p className="detail-copy">{content.recognitionDescription}</p>
        <SportsPhotoStrip />
      </section>
      <section className="editorial-section">
        <p className="eyebrow">{content.movementClosingEyebrow}</p>
        <h2>{content.movementClosingTitle}</h2>
        <p>{content.movementClosingDescription}</p>
        {instagramUrl ? (
          <a className="button button-ink" href={instagramUrl} target="_blank" rel="noreferrer">ENCONTRANOS EN INSTAGRAM ↗</a>
        ) : <p className="whatsapp-note">El enlace a redes oficiales se configura antes de publicar.</p>}
        {whatsappUrl && <a className="button" href={whatsappUrl} target="_blank" rel="noreferrer">ESCRIBINOS POR WHATSAPP ↗</a>}
        <Link className="text-link" href="/emparchadas">EXPLORAR EMPARCHADAS ↗</Link>
      </section>
    </article>
  );
}
