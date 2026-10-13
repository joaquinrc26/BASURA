import { describe, expect, it } from "vitest";
import { getInstagramUrl, getWhatsAppContactUrl } from "./social";

describe("social contact links", () => {
  it("uses the confirmed Instagram profile", () => {
    expect(getInstagramUrl()).toBe("https://www.instagram.com/basura_lp/");
  });

  it("creates a WhatsApp link for the confirmed number", () => {
    const url = new URL(getWhatsAppContactUrl("Hola, BASURA.")!);
    expect(url.origin + url.pathname).toBe("https://wa.me/5492215487930");
    expect(url.searchParams.get("text")).toBe("Hola, BASURA.");
  });
});
