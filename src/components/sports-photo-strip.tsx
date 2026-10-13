const photographs = [
  {
    src: "/images/editorial/la-plata-sports-01.webp",
    alt: "Registro de una prenda BASURA durante el desfile La Plata Sports.",
  },
  {
    src: "/images/editorial/la-plata-sports-02.webp",
    alt: "Diseño intervenido en pasarela, desfile La Plata Sports.",
  },
  {
    src: "/images/editorial/la-plata-sports-03.webp",
    alt: "Una de las piezas presentadas por BASURA en La Plata Sports.",
  },
];

export function SportsPhotoStrip() {
  return (
    <div className="sports-photo-strip" role="group" aria-label="Archivo fotográfico de La Plata Sports">
      {photographs.map((photo, index) => (
        <figure key={photo.src}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo.src} alt={photo.alt} loading="lazy" />
          <figcaption>LA PLATA SPORTS / ARCHIVO {String(index + 1).padStart(2, "0")}</figcaption>
        </figure>
      ))}
    </div>
  );
}
