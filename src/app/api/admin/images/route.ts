import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { configureCloudinary } from "@/lib/cloudinary";

export const runtime = "nodejs";
export const maxDuration = 30;

const maxBytes = 4 * 1024 * 1024;
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

function configured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET,
  );
}

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return origin !== null && origin === new URL(request.url).origin;
}

function validImageSignature(buffer: Buffer, type: string) {
  if (type === "image/jpeg") return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (type === "image/png") return buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (type === "image/webp") return buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP";
  if (type === "image/avif") return buffer.toString("ascii", 4, 8) === "ftyp" && /avif|avis/.test(buffer.toString("ascii", 8, 16));
  return false;
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Origen no permitido." }, { status: 403 });
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Iniciá sesión para cargar fotos." }, { status: 401 });
  if (!configured()) return NextResponse.json({ error: "Cloudinary no está configurado." }, { status: 503 });
  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > maxBytes + 64 * 1024) {
    return NextResponse.json({ error: "Cada foto debe pesar menos de 4 MB." }, { status: 413 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "No se pudo leer el archivo enviado." }, { status: 400 });
  }
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Elegí una imagen." }, { status: 400 });
  if (!allowedTypes.has(file.type)) {
    return NextResponse.json({ error: "Usá una foto JPG, PNG, WebP o AVIF." }, { status: 415 });
  }
  if (file.size < 1 || file.size > maxBytes) {
    return NextResponse.json({ error: "Cada foto debe pesar menos de 4 MB." }, { status: 413 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (!validImageSignature(buffer, file.type)) {
    return NextResponse.json({ error: "El contenido del archivo no coincide con una imagen válida." }, { status: 415 });
  }

  const cloudinary = configureCloudinary();
  try {
    const uploaded = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: "basura/productos",
          public_id: randomUUID(),
          resource_type: "image",
          overwrite: false,
          transformation: [{ width: 1800, height: 2200, crop: "limit", quality: "auto", fetch_format: "auto" }],
        },
        (error, result) => {
          if (error || !result) {
            reject(error ?? new Error("Cloudinary no devolvió una imagen."));
            return;
          }
          resolve({ secure_url: result.secure_url, public_id: result.public_id });
        },
      ).end(buffer);
    });
    return NextResponse.json(
      { url: uploaded.secure_url, publicId: uploaded.public_id },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Cloudinary image upload failed.", error);
    return NextResponse.json({ error: "No se pudo guardar la foto. Intentá de nuevo." }, { status: 502 });
  }
}

export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Origen no permitido." }, { status: 403 });
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Iniciá sesión para eliminar fotos." }, { status: 401 });
  if (!configured()) return NextResponse.json({ error: "Cloudinary no está configurado." }, { status: 503 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "La solicitud no tiene un formato válido." }, { status: 400 });
  }
  const publicId = body && typeof body === "object" && "publicId" in body && typeof body.publicId === "string"
    ? body.publicId
    : "";
  if (!/^basura\/productos\/[a-f0-9-]{36}$/.test(publicId)) {
    return NextResponse.json({ error: "Identificador de imagen inválido." }, { status: 400 });
  }

  const cloudinary = configureCloudinary();
  try {
    const result = await cloudinary.uploader.destroy(publicId, { invalidate: true });
    if (result.result !== "ok" && result.result !== "not found") {
      throw new Error(`Unexpected Cloudinary result: ${result.result}`);
    }
    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("Cloudinary image deletion failed.", error);
    return NextResponse.json({ error: "No se pudo eliminar la foto de Cloudinary." }, { status: 502 });
  }
}
