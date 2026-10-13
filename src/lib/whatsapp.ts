export type OrderLine = {
  name: string;
  variant?: string;
  quantity: number;
  unitPriceCents: number;
};

export function createWhatsAppOrderUrl(
  number: string,
  items: OrderLine[],
  formatPrice: (cents: number) => string,
) {
  if (!/^\d{10,15}$/.test(number)) {
    throw new Error("El número de WhatsApp no tiene un formato válido.");
  }
  if (items.length === 0) throw new Error("Agregá una prenda antes de continuar.");
  if (items.some((item) =>
    !item.name.trim() ||
    !Number.isSafeInteger(item.quantity) ||
    item.quantity < 1 ||
    !Number.isSafeInteger(item.unitPriceCents) ||
    item.unitPriceCents < 0
  )) {
    throw new Error("El pedido contiene datos de prenda no válidos.");
  }

  const total = items.reduce(
    (sum, item) => sum + item.unitPriceCents * item.quantity,
    0,
  );
  if (!Number.isSafeInteger(total)) throw new Error("El total del pedido supera el límite permitido.");
  const lines = items.flatMap((item) => [
    `- ${item.name}${item.variant ? ` / ${item.variant}` : ""}`,
    `  Cantidad: ${item.quantity} | Unitario: ${formatPrice(item.unitPriceCents)} | Subtotal: ${formatPrice(item.unitPriceCents * item.quantity)}`,
  ]);
  const message = [
    "Hola, BASURA. Quiero consultar por este pedido:",
    "",
    ...lines,
    "",
    `Total estimado: ${formatPrice(total)}`,
    "",
    "¿Podemos coordinar disponibilidad, pago y entrega?",
  ].join("\n");

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
