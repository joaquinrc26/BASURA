"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { saveProduct, type AdminState } from "@/lib/admin-actions";
import type { CatalogProduct } from "@/lib/catalog";

type CategoryOption = { id: string; name: string };
type ImageDraft = { url: string; publicId: string; alt: string };
type VariantDraft = { name: string; stock: number };

const initialState: AdminState = {};
const maxImageSize = 4 * 1024 * 1024;
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

export function AdminProductForm({
  product,
  categories,
}: {
  product: CatalogProduct | null;
  categories: CategoryOption[];
}) {
  const [state, action, pending] = useActionState(saveProduct, initialState);
  const activeProductId = state.productId ?? product?.id ?? "";
  const [images, setImages] = useState<ImageDraft[]>(
    product?.images.map(({ url, publicId, alt }) => ({ url, publicId, alt })) ?? [],
  );
  const existingImageIds = useMemo(
    () => new Set([
      ...(product?.images.map((image) => image.publicId) ?? []),
      ...(state.savedImageIds ?? []),
    ]),
    [product, state.savedImageIds],
  );
  const [variantsText, setVariantsText] = useState(
    product?.variants.map((variant) => `${variant.name}: ${variant.stock}`).join("\n") ?? "",
  );
  const [name, setName] = useState(product?.name ?? "");
  const [price, setPrice] = useState(product ? (product.priceCents / 100).toFixed(2) : "");
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [clientError, setClientError] = useState("");

  const variants = useMemo(() => {
    const lines = variantsText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    const parsed: VariantDraft[] = [];
    for (const line of lines) {
      const match = /^(.{1,40}):\s*(\d{1,6})$/.exec(line);
      if (!match) return null;
      parsed.push({ name: match[1].trim(), stock: Number(match[2]) });
    }
    if (parsed.length > 30) return null;
    const names = parsed.map(({ name }) => name.toLocaleLowerCase("es-AR"));
    if (new Set(names).size !== names.length) return null;
    return parsed;
  }, [variantsText]);

  async function uploadFiles(fileList: FileList | null) {
    if (!fileList?.length) return;
    const selected = Array.from(fileList);
    setClientError("");
    setUploadMessage("");
    if (images.length + selected.length > 5) {
      setClientError("Cada prenda admite hasta cinco fotos.");
      return;
    }
    for (const file of selected) {
      if (!allowedTypes.has(file.type)) {
        setClientError(`${file.name}: elegí una foto JPG, PNG, WebP o AVIF.`);
        return;
      }
      if (file.size > maxImageSize) {
        setClientError(`${file.name}: el máximo por foto es 8 MB.`);
        return;
      }
    }

    setUploading(true);
    try {
      for (const file of selected) {
        const body = new FormData();
        body.append("file", file);
        const response = await fetch("/api/admin/images", { method: "POST", body });
        const result: unknown = await response.json();
        if (!response.ok || !result || typeof result !== "object" || !("url" in result) || !("publicId" in result)) {
          const message = result && typeof result === "object" && "error" in result && typeof result.error === "string"
            ? result.error
            : "No se pudo cargar la foto.";
          setClientError(message);
          break;
        }
        const url = result.url;
        const publicId = result.publicId;
        if (typeof url !== "string" || typeof publicId !== "string") {
          setClientError("Cloudinary devolvió datos de foto inválidos.");
          break;
        }
        setImages((current) => [
          ...current,
          { url, publicId, alt: `Foto de ${product?.name ?? "la prenda"} ${current.length + 1}` },
        ]);
        setUploadMessage("Foto cargada. Guardá la prenda para publicar los cambios.");
      }
    } catch (error) {
      console.error("Unable to upload the selected product images.", error);
      setClientError("No se pudo conectar para cargar las fotos.");
    } finally {
      setUploading(false);
    }
  }

  async function removeImage(index: number) {
    const image = images[index];
    setClientError("");
    if (!existingImageIds.has(image.publicId)) {
      try {
        const response = await fetch("/api/admin/images", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publicId: image.publicId }),
        });
        const result: unknown = await response.json();
        if (!response.ok) {
          const message = result && typeof result === "object" && "error" in result && typeof result.error === "string"
            ? result.error
            : "No se pudo eliminar la foto.";
          setClientError(message);
          return;
        }
      } catch (error) {
        console.error("Unable to delete the newly uploaded image.", error);
        setClientError("No se pudo conectar para eliminar la foto.");
        return;
      }
    }
    setImages((current) => current.filter((_, currentIndex) => currentIndex !== index));
    setUploadMessage("Foto quitada. Guardá la prenda para confirmar los cambios.");
  }

  function moveImage(index: number, offset: number) {
    setImages((current) => {
      const target = index + offset;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  return (
    <form className="admin-form" action={action}>
      <input type="hidden" name="id" value={activeProductId} />
      <input type="hidden" name="variants" value={JSON.stringify(variants ?? [])} />
      <input type="hidden" name="images" value={JSON.stringify(images)} />
      <label>
        NOMBRE DE LA PRENDA
        <input name="name" value={name} onChange={(event) => setName(event.target.value)} required minLength={2} maxLength={100} />
      </label>
      <label>
        SLUG / DIRECCIÓN
        <input name="slug" defaultValue={product?.slug ?? ""} placeholder="Se genera desde el nombre si queda vacío" maxLength={120} />
      </label>
      <label>
        DESCRIPCIÓN
        <textarea name="description" defaultValue={product?.description ?? ""} required minLength={5} maxLength={4000} />
      </label>
      <label>
        HISTORIA DE LA INTERVENCIÓN (OPCIONAL)
        <textarea name="story" defaultValue={product?.story ?? ""} maxLength={4000} />
      </label>
      <label>
        MATERIALES / COMPOSICIÓN (OPCIONAL)
        <textarea name="materials" defaultValue={product?.materials ?? ""} maxLength={1000} />
      </label>
      <label>
        CUIDADOS (OPCIONAL)
        <textarea name="care" defaultValue={product?.care ?? ""} maxLength={1000} />
      </label>
      <div className="admin-inline">
        <label>
          PRECIO (ARS)
          <input name="price" type="number" inputMode="decimal" min="0.01" step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} required />
        </label>
        <label>
          STOCK GENERAL
          <input name="stock" type="number" min="0" max="100000" step="1" defaultValue={product?.stock ?? 1} required />
        </label>
      </div>
      <label>
        CATEGORÍA
        <select name="categoryId" defaultValue={product?.categoryId ?? ""}>
          <option value="">Sin categoría</option>
          {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
        </select>
      </label>
      <label>
        VARIANTES Y STOCK (UNA POR LÍNEA: “TALLE M: 2”)
        <textarea value={variantsText} onChange={(event) => setVariantsText(event.target.value)} placeholder={"S: 1\nM: 2\nL: 0"} />
      </label>
      {variants === null && <p className="admin-message admin-error" role="alert">Usá el formato “Nombre: cantidad”, sin repetir nombres, hasta 30 variantes.</p>}
      <div className="admin-inline">
        <label><input type="checkbox" name="published" defaultChecked={product?.published ?? false} /> PUBLICAR</label>
        <label><input type="checkbox" name="featured" defaultChecked={product?.featured ?? false} /> DESTACAR EN PORTADA</label>
      </div>
      <div>
        <p className="admin-label">FOTOGRAFÍAS ({images.length}/5)</p>
        <div
          className="upload-dropzone"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => { event.preventDefault(); void uploadFiles(event.dataTransfer.files); }}
        >
          <label>
            ELEGIR O ARRASTRAR FOTOS
            <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple disabled={uploading || images.length >= 5} onChange={(event) => { void uploadFiles(event.target.files); event.currentTarget.value = ""; }} />
          </label>
        </div>
        <p className="admin-hint">JPG, PNG, WebP o AVIF · máximo 4 MB cada una. La primera foto es la principal.</p>
        {images.length > 0 && (
          <div className="upload-list">
            {images.map((image, index) => (
              <div className="upload-row" key={image.publicId}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.url} alt="" />
                <input aria-label={`Texto alternativo, foto ${index + 1}`} value={image.alt} onChange={(event) => setImages((current) => current.map((entry, entryIndex) => entryIndex === index ? { ...entry, alt: event.target.value } : entry))} maxLength={160} />
                <button type="button" onClick={() => moveImage(index, -1)} disabled={index === 0} aria-label="Mover foto antes">↑</button>
                <button type="button" onClick={() => moveImage(index, 1)} disabled={index === images.length - 1} aria-label="Mover foto después">↓</button>
                <button type="button" onClick={() => void removeImage(index)} aria-label={`Eliminar foto ${index + 1}`}>✕</button>
              </div>
            ))}
          </div>
        )}
        <div className="admin-preview">
          <p className="eyebrow">VISTA PREVIA / TARJETA EN LA TIENDA</p>
          {images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={images[0].url} alt={images[0].alt} />
          ) : <div className="image-placeholder"><span className="placeholder-mark">B!</span><span>Fotografía pendiente</span></div>}
          <strong>{name || "NOMBRE DE LA PRENDA"}</strong>
          <span>{price ? `$ ${Number(price).toLocaleString("es-AR")}` : "PRECIO"}</span>
        </div>
        {uploadMessage && <p className="admin-message admin-success" role="status">{uploadMessage}</p>}
      </div>
      {(clientError || state.error) && <p className="admin-message admin-error" role="alert">{clientError || state.error}</p>}
      {state.success && <p className="admin-message admin-success" role="status">{state.success}</p>}
      {state.warning && <p className="admin-message admin-error" role="alert">{state.warning}</p>}
      <div className="admin-inline">
        <button className="button button-ink" disabled={pending || uploading || variants === null}>
          {pending ? "GUARDANDO…" : activeProductId ? "GUARDAR CAMBIOS" : "CREAR PRENDA"} <span aria-hidden="true">↗</span>
        </button>
        <Link className="button" href="/admin">VOLVER AL INVENTARIO</Link>
      </div>
    </form>
  );
}
