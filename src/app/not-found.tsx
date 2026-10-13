import Link from "next/link";

export default function NotFound() {
  return (
    <section className="wrap not-found">
      <p className="eyebrow">ESTA PRENDA YA NO ESTÁ ACÁ</p>
      <h1>404 / NADA</h1>
      <p>Puede que se haya vendido, cambiado de lugar o nunca haya existido.</p>
      <Link className="button button-ink" href="/emparchadas">VOLVER AL CATÁLOGO ↗</Link>
    </section>
  );
}
