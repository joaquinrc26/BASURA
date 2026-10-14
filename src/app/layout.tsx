import type { Metadata } from "next";
import { Archivo, Permanent_Marker, Special_Elite } from "next/font/google";
import type { ReactNode } from "react";
import Link from "next/link";
import { CartProvider } from "@/components/cart-provider";
import { FloatingSocialLinks } from "@/components/floating-social-links";
import { SiteHeader } from "@/components/site-header";
import { getInstagramUrl } from "@/lib/social";
import "./globals.css";

const display = Permanent_Marker({ weight: "400", subsets: ["latin"], variable: "--font-display", display: "swap" });
const mono = Special_Elite({ weight: "400", subsets: ["latin"], variable: "--font-mono", display: "swap" });
const body = Archivo({ subsets: ["latin"], variable: "--font-body", display: "swap" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "BASURA — Prohibido arrojar",
    template: "%s — BASURA",
  },
  description:
    "Recuperamos prendas, las intervenimos en comunidad y encontramos nuevas formas de habitar el mundo. Esto es BASURA.",
  openGraph: {
    title: "BASURA — Prohibido arrojar",
    description: "Emparchamos, creamos y encontramos nuevas formas de habitar el mundo.",
    locale: "es_AR",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const instagramUrl = getInstagramUrl();
  return (
    <html lang="es-AR" className={`${display.variable} ${mono.variable} ${body.variable}`}>
      <body>
        <CartProvider>
          <SiteHeader />
          <main>{children}</main>
          <FloatingSocialLinks />
          <footer className="site-footer">
            <div className="wrap footer-inner">
              <Link href="/" className="footer-mark" aria-label="BASURA, inicio">B!</Link>
              <p>RECUPERAR · INTERVENIR · COMPARTIR</p>
              <div className="footer-links">
                <Link href="/emparchadas">EMPARCHADAS</Link>
                <Link href="/basura-es-movimiento">EL MOVIMIENTO</Link>
                {instagramUrl ? (
                  <a href={instagramUrl} target="_blank" rel="noreferrer">INSTAGRAM ↗</a>
                ) : <span>REDES OFICIALES / EN CONFIGURACIÓN</span>}
              </div>
              <span>LA PLATA, ARGENTINA / 2026</span>
            </div>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
