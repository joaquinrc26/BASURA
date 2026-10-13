"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("A page failed to render.", error);
  }, [error]);

  return (
    <section className="wrap not-found">
      <p className="eyebrow">ALGO SE DESCOSIÓ</p>
      <h1>NO CARGÓ.</h1>
      <p>No pudimos mostrar esta parte del sitio. Probá de nuevo en un momento.</p>
      <button className="button button-ink" onClick={() => reset()}>INTENTAR OTRA VEZ</button>
    </section>
  );
}
