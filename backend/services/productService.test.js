import { vi, describe, it, expect } from "vitest";

// Mock dependencies so productService can be imported without side effects
vi.mock("../lib/db.js", () => ({
  default: { query: vi.fn() },
}));

vi.mock("./cloudinaryService.js", () => ({
  uploadProductImage: vi.fn(),
  uploadHeroImage: vi.fn(),
  deleteFile: vi.fn(),
}));

import { extractPublicId } from "./productService.js";

describe("extractPublicId", () => {
  it("extrae el public_id de una URL estándar de Cloudinary", () => {
    const url =
      "https://res.cloudinary.com/demo/image/upload/v123/blackmichi/productos/zapatilla/123-card.webp";
    expect(extractPublicId(url)).toBe(
      "blackmichi/productos/zapatilla/123-card"
    );
  });

  it("funciona sin el segmento de versión (vXXX)", () => {
    const url =
      "https://res.cloudinary.com/demo/image/upload/blackmichi/test/img.jpg";
    expect(extractPublicId(url)).toBe("blackmichi/test/img");
  });

  it("retorna null si la URL es null o undefined", () => {
    expect(extractPublicId(null)).toBeNull();
    expect(extractPublicId(undefined)).toBeNull();
  });

  it("retorna null si la URL es string vacío", () => {
    expect(extractPublicId("")).toBeNull();
  });

  it("retorna null si la URL no es de Cloudinary", () => {
    expect(extractPublicId("https://example.com/image.png")).toBeNull();
  });

  it("maneja URLs con múltiples puntos en extensión", () => {
    const url =
      "https://res.cloudinary.com/demo/image/upload/v1/folder/file.min.webp";
    expect(extractPublicId(url)).toBe("folder/file.min");
  });

  it("maneja extensiones diferentes (png, jpg, webp, avif)", () => {
    const base = "https://res.cloudinary.com/x/image/upload/v1/folder/img";
    expect(extractPublicId(`${base}.png`)).toBe("folder/img");
    expect(extractPublicId(`${base}.jpg`)).toBe("folder/img");
    expect(extractPublicId(`${base}.webp`)).toBe("folder/img");
    expect(extractPublicId(`${base}.avif`)).toBe("folder/img");
  });
});
