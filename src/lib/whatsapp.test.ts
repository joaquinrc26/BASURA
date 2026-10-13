import { describe, expect, it } from "vitest";
import { createWhatsAppOrderUrl, type OrderLine } from "./whatsapp";

const formatter = (cents: number) => `$${(cents / 100).toFixed(2)}`;

describe("createWhatsAppOrderUrl", () => {
  it("includes every item, selected variants, quantities, subtotals, and total", () => {
    const items: OrderLine[] = [
      { name: "Campera intervenida", variant: "Talle M", quantity: 2, unitPriceCents: 120000 },
      { name: "Bolso recuperado", quantity: 1, unitPriceCents: 45000 },
    ];
    const url = new URL(createWhatsAppOrderUrl("5492215487930", items, formatter));
    const message = url.searchParams.get("text") ?? "";

    expect(url.origin + url.pathname).toBe("https://wa.me/5492215487930");
    expect(message).toContain("Campera intervenida / Talle M");
    expect(message).toContain("Cantidad: 2");
    expect(message).toContain("Subtotal: $2400.00");
    expect(message).toContain("Bolso recuperado");
    expect(message).toContain("Total estimado: $2850.00");
    expect(message).toContain("coordinar disponibilidad, pago y entrega");
    expect(message).not.toMatch(/venta confirmada|pedido confirmado/i);
  });

  it("rejects empty carts and malformed commercial numbers", () => {
    expect(() => createWhatsAppOrderUrl("5492215487930", [], formatter)).toThrow(/Agregá/);
    expect(() => createWhatsAppOrderUrl("221 5487930", [{ name: "Prenda", quantity: 1, unitPriceCents: 100 }], formatter)).toThrow(/formato/);
  });

  it("rejects invalid quantities and prices", () => {
    expect(() => createWhatsAppOrderUrl("5492215487930", [{ name: "Prenda", quantity: 0, unitPriceCents: 100 }], formatter)).toThrow(/datos/);
    expect(() => createWhatsAppOrderUrl("5492215487930", [{ name: "Prenda", quantity: 1, unitPriceCents: -1 }], formatter)).toThrow(/datos/);
  });
});
