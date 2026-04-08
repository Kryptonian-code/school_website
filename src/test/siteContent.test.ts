import { describe, expect, it } from "vitest";
import { defaultSiteBootstrapData, normalizeSiteBootstrapData } from "@/lib/siteContent";

describe("normalizeSiteBootstrapData", () => {
  it("returns safe defaults for empty input", () => {
    const result = normalizeSiteBootstrapData(undefined);

    expect(result.settings.school_name).toBe(defaultSiteBootstrapData.settings.school_name);
    expect(result.programmes).toEqual([]);
    expect(result.staff).toEqual([]);
    expect(result.faqs).toEqual([]);
    expect(result.posts).toEqual([]);
    expect(result.facilities).toEqual([]);
    expect(result.testimonials).toEqual([]);
    expect(result.galleryItems).toEqual([]);
  });

  it("preserves valid arrays while merging settings defaults", () => {
    const result = normalizeSiteBootstrapData({
      settings: {
        school_name: "Test Academy",
        hero_title: "Custom hero",
      },
      programmes: [{ id: 1, title: "Primary" }],
      staff: [{ id: 2, name: "Jane Doe" }],
      faqs: [{ id: 3, question: "Q", answer: "A" }],
      posts: [{ id: 4, title: "Post" }],
      facilities: [{ id: 5, title: "Library" }],
      testimonials: [{ id: 6, name: "Parent" }],
      galleryItems: [{ id: 7, title: "Gallery Item" }],
    });

    expect(result.settings.school_name).toBe("Test Academy");
    expect(result.settings.tagline).toBe(defaultSiteBootstrapData.settings.tagline);
    expect(result.settings.hero_title).toBe("Custom hero");
    expect(result.programmes).toHaveLength(1);
    expect(result.staff).toHaveLength(1);
    expect(result.faqs).toHaveLength(1);
    expect(result.posts).toHaveLength(1);
    expect(result.facilities).toHaveLength(1);
    expect(result.testimonials).toHaveLength(1);
    expect(result.galleryItems).toHaveLength(1);
  });
});
