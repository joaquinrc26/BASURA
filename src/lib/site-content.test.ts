import { describe, expect, it } from "vitest";
import { defaultSiteContent, siteContentSchema } from "./site-content";

describe("editable site content", () => {
  it("provides valid fallback copy for all editable fields", () => {
    expect(siteContentSchema.safeParse(defaultSiteContent).success).toBe(true);
  });

  it("rejects empty or overly long headings", () => {
    expect(siteContentSchema.safeParse({
      ...defaultSiteContent,
      catalogTitle: "",
    }).success).toBe(false);
    expect(siteContentSchema.safeParse({
      ...defaultSiteContent,
      catalogTitle: "x".repeat(101),
    }).success).toBe(false);
  });
});
