import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "@/lib/api";

describe("api client", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("normalizes bootstrap responses with missing sections", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        settings: {
          school_name: "Test Academy",
        },
      }),
    } as Response);

    const result = await api.getSiteBootstrap();

    expect(result.settings.school_name).toBe("Test Academy");
    expect(result.programmes).toEqual([]);
    expect(result.galleryItems).toEqual([]);
  });

  it("uploads media using form data", async () => {
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        url: "/uploads/gallery/photo.jpg",
        filename: "photo.jpg",
      }),
    } as Response);

    const file = new File(["image"], "photo.jpg", { type: "image/jpeg" });
    const result = await api.uploadMedia(file, "gallery");

    expect(result.url).toBe("/uploads/gallery/photo.jpg");
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [, options] = fetchSpy.mock.calls[0];
    expect(options?.method).toBe("POST");
    expect(options?.body).toBeInstanceOf(FormData);
  });

  it("throws readable errors from failed requests", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: false,
      json: async () => ({
        message: "Invalid credentials",
      }),
    } as Response);

    await expect(api.login("test@example.com", "bad-password")).rejects.toThrow("Invalid credentials");
  });

  it("stores csrf tokens from session responses and sends them on authenticated writes", async () => {
    const fetchSpy = vi.spyOn(global, "fetch")
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          user: null,
          csrf_token: "secure-token",
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
        }),
      } as Response);

    await api.getSession();
    await api.saveSettings({ school_name: "Prestige Academy" });

    const [, options] = fetchSpy.mock.calls[1];
    expect((options?.headers as Headers).get("X-CSRF-Token")).toBe("secure-token");
  });
});
