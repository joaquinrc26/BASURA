import { describe, expect, it } from "vitest";
import { formatPrice, slugify } from "./format";

describe("formatPrice", () => {
  it("formats Argentine peso amounts from integer cents", () => {
    expect(formatPrice(350000)).toContain("3.500");
    expect(formatPrice(350000)).toContain("$");
    expect(formatPrice(350050)).toContain(",50");
  });
});

describe("slugify", () => {
  it("normalizes accents, case, whitespace, and punctuation", () => {
    expect(slugify("  Campera Única / BASURA! ")).toBe("campera-unica-basura");
  });
});
