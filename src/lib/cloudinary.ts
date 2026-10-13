import { v2 as cloudinary } from "cloudinary";

export function configureCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary no está configurado.");
  }
  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });
  return cloudinary;
}

export async function deleteCloudinaryImages(publicIds: string[]) {
  if (!publicIds.length) return;
  const client = configureCloudinary();
  const results = await Promise.all(
    publicIds.map((publicId) => client.uploader.destroy(publicId, { invalidate: true })),
  );
  if (results.some((result) => result.result !== "ok" && result.result !== "not found")) {
    throw new Error("Cloudinary no confirmó la eliminación de todas las imágenes.");
  }
}
