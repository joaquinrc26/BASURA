const defaultInstagramUrl = "https://www.instagram.com/basura_lp/";
const defaultWhatsAppNumber = "5492215487930";

export function getInstagramUrl() {
  const value = process.env.NEXT_PUBLIC_INSTAGRAM_URL || defaultInstagramUrl;
  if (!value) return null;
  try {
    const url = new URL(value);
    if (
      url.protocol === "https:" &&
      (url.hostname === "instagram.com" || url.hostname === "www.instagram.com")
    ) {
      return url.toString();
    }
  } catch {
    return null;
  }
  return null;
}

export function getWhatsAppNumber() {
  return process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || defaultWhatsAppNumber;
}

export function getWhatsAppContactUrl(message: string) {
  const number = getWhatsAppNumber();
  if (!/^\d{10,15}$/.test(number)) return null;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
