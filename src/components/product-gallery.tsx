"use client";

import { useEffect, useRef, useState } from "react";

type GalleryImage = { url: string; alt: string };

export function ProductGallery({ images, productName }: { images: GalleryImage[]; productName: string }) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const lightboxRef = useRef<HTMLDialogElement>(null);
  const image = images[active];

  useEffect(() => {
    const dialog = lightboxRef.current;
    if (zoomed && dialog && !dialog.open) dialog.showModal();
    if (!zoomed && dialog?.open) dialog.close();
  }, [zoomed]);

  function move(delta: number) {
    setActive((current) => (current + delta + images.length) % images.length);
  }

  return (
    <div>
      <div className="gallery-main">
        {image ? (
          <button type="button" className="gallery-zoom" onClick={() => setZoomed(true)} aria-label={`Ampliar foto ${active + 1} de ${productName}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="product-image" src={image.url} alt={image.alt} />
          </button>
        ) : (
          <span className="image-placeholder"><span className="placeholder-mark">B!</span><span>Fotografía pendiente</span></span>
        )}
        {images.length > 1 && (
          <span className="gallery-controls">
            <button type="button" onClick={() => move(-1)} aria-label="Foto anterior">←</button>
            <span>{active + 1} / {images.length}</span>
            <button type="button" onClick={() => move(1)} aria-label="Foto siguiente">→</button>
          </span>
        )}
      </div>
      {images.length > 1 && (
        <div className="gallery-thumbnails" aria-label="Fotos de la prenda">
          {images.map((entry, index) => (
            <button key={entry.url} aria-current={active === index} onClick={() => setActive(index)} aria-label={`Ver foto ${index + 1}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={entry.url} alt="" />
            </button>
          ))}
        </div>
      )}
      {zoomed && image && (
        <dialog
          ref={lightboxRef}
          className="image-lightbox"
          aria-label={`Foto ampliada de ${productName}`}
          onClick={(event) => { if (event.target === event.currentTarget) setZoomed(false); }}
          onClose={() => setZoomed(false)}
        >
          <button className="cart-close lightbox-close" onClick={() => setZoomed(false)} aria-label="Cerrar foto ampliada">✕</button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image.url} alt={image.alt} />
        </dialog>
      )}
    </div>
  );
}
