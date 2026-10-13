"use client";

import Link from "next/link";
import { useCart } from "@/components/cart-provider";

export function SiteHeader() {
  const { items, setOpen } = useCart();
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="site-header">
      <div className="topline">RECUPERAR ES UNA FORMA DE RESISTIR — LA PLATA, ARGENTINA</div>
      <div className="nav-row">
        <nav className="nav-links" aria-label="Navegación principal">
          <Link href="/emparchadas">EMPARCHADAS</Link>
          <Link href="/basura-es-movimiento">EL MOVIMIENTO</Link>
        </nav>
        <Link href="/" className="nav-logo" aria-label="BASURA, inicio">BASURA<span>.</span></Link>
        <div className="nav-actions">
          <button type="button" onClick={() => setOpen(true)} aria-label={`Abrir carrito, ${count} productos`}>
            BOLSA <span className="cart-count">{count}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
