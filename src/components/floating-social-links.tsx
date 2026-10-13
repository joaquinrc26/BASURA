import { getInstagramUrl, getWhatsAppContactUrl } from "@/lib/social";

export function FloatingSocialLinks() {
  const instagramUrl = getInstagramUrl();
  const whatsappUrl = getWhatsAppContactUrl("Hola, BASURA. Vi la tienda y quiero consultar.");

  return (
    <nav className="floating-social" aria-label="Contacto directo">
      {instagramUrl && (
        <a
          className="floating-social-link floating-social-instagram"
          href={instagramUrl}
          target="_blank"
          rel="noreferrer"
          aria-label="Instagram de BASURA, abre en una pestaña nueva"
          title="Instagram @basura_lp"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle className="social-icon-dot" cx="17.5" cy="6.5" r="1" />
          </svg>
        </a>
      )}
      {whatsappUrl && (
        <a
          className="floating-social-link floating-social-whatsapp"
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          aria-label="Escribir a BASURA por WhatsApp, abre en una pestaña nueva"
          title="Escribinos por WhatsApp"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20.5 11.7a8.5 8.5 0 0 1-12.6 7.4L3 20l1-4.7a8.5 8.5 0 1 1 16.5-3.6Z" />
            <path d="M9 8.5c.2-.5.4-.5.7-.5h.5c.2 0 .4.1.5.4l.8 1.8c.1.2.1.4-.1.6l-.6.7c-.2.2-.2.4-.1.6.5.9 1.2 1.5 2.1 2 .2.1.4.1.6-.1l.7-.8c.2-.2.4-.2.6-.1l1.7.8c.3.1.4.3.4.5 0 .3-.2 1.1-.7 1.6-.5.5-1.2.7-1.9.6-1-.1-2.3-.7-3.8-2-1.5-1.3-2.5-3-2.7-4.1-.2-.8 0-1.5.3-2Z" />
          </svg>
        </a>
      )}
    </nav>
  );
}
