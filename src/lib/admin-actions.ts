"use server";

import bcrypt from "bcryptjs";
import { createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { clearAdminSession, createAdminSession, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/format";
import { deleteCloudinaryImages } from "@/lib/cloudinary";
import { siteContentSchema } from "@/lib/site-content";

export type LoginState = { error?: string };
export type AdminState = {
  error?: string;
  success?: string;
  warning?: string;
  productId?: string;
  savedImageIds?: string[];
};

const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2).max(100),
  slug: z.string().trim().min(2).max(120),
  description: z.string().trim().min(5).max(4000),
  story: z.string().trim().max(4000).optional(),
  materials: z.string().trim().max(1000).optional(),
  care: z.string().trim().max(1000).optional(),
  priceCents: z.number().int().positive().max(100_000_000),
  stock: z.number().int().nonnegative().max(100_000),
  categoryId: z.string().optional(),
  published: z.boolean(),
  featured: z.boolean(),
  variants: z.array(z.object({
    name: z.string().trim().min(1).max(40),
    stock: z.number().int().nonnegative().max(100_000),
  })).max(30),
  images: z.array(z.object({
    url: z.string().url(),
    publicId: z.string().regex(/^basura\/productos\/[a-f0-9-]{36}$/),
    alt: z.string().trim().min(2).max(160),
  })).max(5),
});

function formString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function signIn(_: LoginState, formData: FormData): Promise<LoginState> {
  const username = formString(formData, "username");
  const password = formString(formData, "password");
  const credentials = z.object({
    username: z.string().min(1).max(100),
    password: z.string().min(8).max(200),
  }).safeParse({ username, password });
  if (!credentials.success) return { error: "Ingresá el usuario y una contraseña válida." };
  const configuredUsername = process.env.ADMIN_USERNAME;
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;

  if (!configuredUsername || !passwordHash || !process.env.DATABASE_URL) {
    return { error: "Falta configurar la cuenta administrativa o la base de datos." };
  }

  const requestHeaders = await headers();
  const clientAddress =
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    requestHeaders.get("x-real-ip") ??
    "unknown";
  const identifier = createHash("sha256")
    .update(`${clientAddress}:${process.env.AUTH_SECRET ?? ""}`)
    .digest("hex");

  let validPassword = false;
  try {
    const attempt = await prisma.loginAttempt.findUnique({ where: { identifier } });
    if (attempt?.lockedUntil && attempt.lockedUntil > new Date()) {
      return { error: "Demasiados intentos. Esperá 15 minutos antes de volver a probar." };
    }
    validPassword = await bcrypt.compare(password, passwordHash);
    if (username !== configuredUsername || !validPassword) {
      await prisma.$executeRaw`
        INSERT INTO "LoginAttempt" ("identifier", "failures", "windowStart", "lockedUntil", "updatedAt")
        VALUES (${identifier}, 1, NOW(), NULL, NOW())
        ON CONFLICT ("identifier") DO UPDATE SET
          "failures" = CASE
            WHEN "LoginAttempt"."windowStart" < NOW() - INTERVAL '15 minutes' THEN 1
            ELSE "LoginAttempt"."failures" + 1
          END,
          "windowStart" = CASE
            WHEN "LoginAttempt"."windowStart" < NOW() - INTERVAL '15 minutes' THEN NOW()
            ELSE "LoginAttempt"."windowStart"
          END,
          "lockedUntil" = CASE
            WHEN "LoginAttempt"."windowStart" >= NOW() - INTERVAL '15 minutes'
              AND "LoginAttempt"."failures" >= 4 THEN NOW() + INTERVAL '15 minutes'
            ELSE NULL
          END,
          "updatedAt" = NOW()
      `;
      return { error: "Usuario o contraseña incorrectos." };
    }
    await prisma.loginAttempt.deleteMany({ where: { identifier } });
    await createAdminSession(configuredUsername);
  } catch (error) {
    console.error("Unable to create the admin session.", error);
    return { error: "No se pudo validar el acceso. Revisá la configuración de seguridad y la conexión." };
  }
  redirect("/admin");
}

export async function signOut() {
  await clearAdminSession();
  redirect("/admin");
}

export async function saveProduct(_: AdminState, formData: FormData): Promise<AdminState> {
  await requireAdmin();

  const name = formString(formData, "name");
  const slugInput = formString(formData, "slug");
  const rawPrice = Number(formString(formData, "price"));
  let parsedVariants: unknown;
  let parsedImages: unknown;
  try {
    parsedVariants = JSON.parse(formString(formData, "variants") || "[]") as unknown;
    parsedImages = JSON.parse(formString(formData, "images") || "[]") as unknown;
  } catch {
    return { error: "No se pudieron leer las variantes o las fotos. Revisá el formulario." };
  }
  const parsed = productSchema.safeParse({
    id: formString(formData, "id") || undefined,
    name,
    slug: slugify(slugInput || name),
    description: formString(formData, "description"),
    story: formString(formData, "story") || undefined,
    materials: formString(formData, "materials") || undefined,
    care: formString(formData, "care") || undefined,
    priceCents: Math.round(rawPrice * 100),
    stock: Number(formString(formData, "stock")),
    categoryId: formString(formData, "categoryId") || undefined,
    published: formData.get("published") === "on",
    featured: formData.get("featured") === "on",
    variants: parsedVariants,
    images: parsedImages,
  });

  if (!parsed.success) {
    return { error: "Revisá los campos: nombre, descripción, precio, stock, variantes e imágenes." };
  }
  const { id, variants, images, ...product } = parsed.data;
  const duplicate = await prisma.product.findFirst({
    where: { slug: product.slug, ...(id ? { NOT: { id } } : {}) },
    select: { id: true },
  });
  if (duplicate) return { error: "Ya existe una prenda con esa dirección (slug)." };
  if (images.some((image) => {
    try {
      const url = new URL(image.url);
      return (
        url.hostname !== "res.cloudinary.com" ||
        !url.pathname.startsWith(`/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/`)
      );
    } catch {
      return true;
    }
  })) {
    return { error: "Las fotos deben pertenecer a la cuenta de Cloudinary configurada." };
  }

  const previousImages = id
    ? await prisma.productImage.findMany({ where: { productId: id }, select: { publicId: true } })
    : [];
  let savedId = id;
  try {
    await prisma.$transaction(async (tx) => {
      const saved = id
        ? await tx.product.update({ where: { id }, data: product })
        : await tx.product.create({ data: product });
      savedId = saved.id;

      await tx.productVariant.deleteMany({ where: { productId: saved.id } });
      if (variants.length) {
        await tx.productVariant.createMany({
          data: variants.map((variant) => ({ ...variant, productId: saved.id })),
        });
      }

      await tx.productImage.deleteMany({ where: { productId: saved.id } });
      if (images.length) {
        await tx.productImage.createMany({
          data: images.map((image, position) => ({
            ...image,
            productId: saved.id,
            position,
          })),
        });
      }
    });
  } catch (error) {
    console.error("Unable to save the product.", error);
    return { error: "No se pudo guardar la prenda. Revisá que la categoría exista y el slug esté disponible." };
  }

  const retainedIds = new Set(images.map((image) => image.publicId));
  const removedIds = previousImages
    .map((image) => image.publicId)
    .filter((publicId) => !retainedIds.has(publicId));
  let warning: string | undefined;
  try {
    await deleteCloudinaryImages(removedIds);
  } catch (error) {
    console.error("Product saved, but removed Cloudinary images could not be cleaned up.", error);
    warning = "La prenda se guardó, pero una o más fotos anteriores no pudieron eliminarse de Cloudinary. Revisá el almacenamiento.";
  }

  revalidatePath("/");
  revalidatePath("/emparchadas");
  revalidatePath(`/emparchadas/${product.slug}`);
  revalidatePath("/admin");
  return {
    success: "Prenda guardada.",
    warning,
    productId: savedId,
    savedImageIds: images.map((image) => image.publicId),
  };
}

export async function deleteProduct(_: AdminState, formData: FormData): Promise<AdminState> {
  await requireAdmin();
  const id = formString(formData, "id");
  if (!id) return { error: "Falta el identificador de la prenda." };

  const product = await prisma.product.findUnique({
    where: { id },
    select: { id: true, slug: true, images: { select: { publicId: true } } },
  });
  if (!product) return { error: "No encontramos esa prenda." };
  try {
    await prisma.product.delete({ where: { id } });
  } catch (error) {
    console.error("Unable to delete the product.", error);
    return { error: "No se pudo eliminar la prenda." };
  }
  let warning: string | undefined;
  try {
    await deleteCloudinaryImages(product.images.map((image) => image.publicId));
  } catch (error) {
    console.error("Product deleted, but its Cloudinary images could not be cleaned up.", error);
    warning = "La prenda se eliminó, pero una o más fotos no pudieron borrarse de Cloudinary.";
  }
  revalidatePath("/");
  revalidatePath("/emparchadas");
  revalidatePath("/admin");
  revalidatePath(`/emparchadas/${product.slug}`);
  return { success: "Prenda eliminada.", warning };
}

export async function toggleProductPublication(_: AdminState, formData: FormData): Promise<AdminState> {
  await requireAdmin();
  const id = formString(formData, "id");
  const published = formString(formData, "published") === "true";
  if (!id) return { error: "Falta el identificador de la prenda." };
  try {
    await prisma.product.update({ where: { id }, data: { published } });
  } catch (error) {
    console.error("Unable to change product publication state.", error);
    return { error: "No se pudo actualizar el estado de publicación." };
  }
  revalidatePath("/");
  revalidatePath("/emparchadas");
  revalidatePath("/admin");
  return { success: published ? "Prenda publicada." : "Prenda ocultada." };
}

export async function saveCategory(_: AdminState, formData: FormData): Promise<AdminState> {
  await requireAdmin();
  const name = formString(formData, "name").trim();
  const slug = slugify(name);
  if (name.length < 2 || name.length > 60 || !slug) {
    return { error: "Ingresá un nombre de categoría válido." };
  }
  try {
    await prisma.category.create({ data: { name, slug } });
  } catch (error) {
    console.error("Unable to create category.", error);
    return { error: "No se pudo crear la categoría. Quizás ya existe." };
  }
  revalidatePath("/admin");
  revalidatePath("/emparchadas");
  return { success: "Categoría agregada." };
}

export async function saveSiteContent(_: AdminState, formData: FormData): Promise<AdminState> {
  await requireAdmin();

  const values = Object.fromEntries(
    Object.keys(siteContentSchema.shape).map((key) => [key, formString(formData, key)]),
  );
  const parsed = siteContentSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Revisá los textos: todos los campos son obligatorios y deben respetar el largo indicado." };
  }

  try {
    await prisma.siteContent.upsert({
      where: { id: "main" },
      create: { id: "main", content: parsed.data },
      update: { content: parsed.data },
    });
  } catch (error) {
    console.error("Unable to save site content.", error);
    return { error: "No se pudieron guardar los textos. Revisá la conexión y que las migraciones estén aplicadas." };
  }

  for (const path of ["/", "/emparchadas", "/basura-es-movimiento", "/admin"]) {
    revalidatePath(path);
  }
  return { success: "Textos guardados. Ya están actualizados en el sitio." };
}

export async function deleteCategory(formData: FormData) {
  await requireAdmin();
  const id = formString(formData, "id");
  if (!id) throw new Error("Falta el identificador de la categoría.");
  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin");
  revalidatePath("/emparchadas");
}
