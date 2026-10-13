"use client";

import { useActionState } from "react";
import { saveSiteContent, type AdminState } from "@/lib/admin-actions";
import type { SiteContent } from "@/lib/site-content";

type Field = {
  key: keyof SiteContent;
  label: string;
  multiline?: boolean;
  maxLength?: number;
};

const sections: { title: string; description: string; fields: Field[] }[] = [
  {
    title: "Portada",
    description: "La primera impresión, el manifiesto y los textos destacados del inicio.",
    fields: [
      { key: "homeOverline", label: "Frase sobre el nombre BASURA" },
      { key: "homeTagline", label: "Bajada principal (podés separar líneas)", multiline: true, maxLength: 250 },
      { key: "homeButton", label: "Botón para ir al catálogo" },
      { key: "manifestoEyebrow", label: "Rótulo del manifiesto" },
      { key: "manifestoText", label: "Manifiesto", multiline: true, maxLength: 2000 },
      { key: "featuredEyebrow", label: "Rótulo de prendas destacadas" },
      { key: "featuredTitle", label: "Título de prendas destacadas" },
      { key: "sportsEyebrow", label: "Rótulo de La Plata Sports" },
      { key: "sportsTitle", label: "Título de La Plata Sports (podés separar líneas)", multiline: true, maxLength: 100 },
      { key: "sportsDescription", label: "Historia destacada", multiline: true },
      { key: "sportsButton", label: "Botón para conocer la historia" },
      { key: "closingEyebrow", label: "Rótulo del cierre" },
      { key: "closingTitle", label: "Frase de cierre (podés separar líneas)", multiline: true },
      { key: "closingButton", label: "Botón del cierre" },
    ],
  },
  {
    title: "Catálogo",
    description: "El título y la presentación que aparecen arriba de las prendas.",
    fields: [
      { key: "catalogEyebrow", label: "Rótulo del catálogo" },
      { key: "catalogTitle", label: "Título del catálogo" },
      { key: "catalogDescription", label: "Descripción del catálogo", multiline: true, maxLength: 500 },
    ],
  },
  {
    title: "El movimiento",
    description: "La historia, el proceso y el reconocimiento colectivo de BASURA.",
    fields: [
      { key: "movementEyebrow", label: "Rótulo de la página" },
      { key: "movementTitle", label: "Título principal", multiline: true, maxLength: 200 },
      { key: "movementIntroFirst", label: "Historia (primer párrafo)", multiline: true },
      { key: "movementIntroSecond", label: "Historia (segundo párrafo)", multiline: true },
      { key: "processEyebrow", label: "Rótulo del proceso" },
      { key: "processTitle", label: "Título del proceso" },
      { key: "processDescription", label: "Descripción del proceso", multiline: true },
      { key: "recognitionEyebrow", label: "Rótulo del reconocimiento" },
      { key: "recognitionTitle", label: "Título del reconocimiento" },
      { key: "recognitionDescription", label: "Descripción del reconocimiento", multiline: true },
      { key: "movementClosingEyebrow", label: "Rótulo del cierre" },
      { key: "movementClosingTitle", label: "Título del cierre" },
      { key: "movementClosingDescription", label: "Descripción del cierre", multiline: true },
    ],
  },
];

export function AdminSiteContentForm({ content }: { content: SiteContent }) {
  const [state, action, pending] = useActionState(saveSiteContent, {} satisfies AdminState);

  return (
    <form className="admin-form admin-content-form" action={action}>
      {sections.map((section, index) => (
        <details className="admin-content-group" key={section.title} open={index === 0}>
          <summary>{section.title}</summary>
          <p className="admin-hint">{section.description}</p>
          {section.fields.map((field) => (
            <label key={field.key}>
              {field.label}
              {field.multiline ? (
                <textarea
                  name={field.key}
                  defaultValue={content[field.key]}
                  required
                  minLength={2}
                  maxLength={field.maxLength ?? 1200}
                />
              ) : (
                <input
                  name={field.key}
                  defaultValue={content[field.key]}
                  required
                  minLength={2}
                  maxLength={field.maxLength ?? 160}
                />
              )}
            </label>
          ))}
        </details>
      ))}
      {state.error && <p className="admin-message admin-error" role="alert">{state.error}</p>}
      {state.success && <p className="admin-message admin-success" role="status">{state.success}</p>}
      <p className="admin-hint">Los cambios se guardan para todo el sitio y no modifican prendas ni fotos.</p>
      <button className="button button-ink" disabled={pending}>
        {pending ? "GUARDANDO TEXTOS…" : "GUARDAR TEXTOS DEL SITIO"}
      </button>
    </form>
  );
}
