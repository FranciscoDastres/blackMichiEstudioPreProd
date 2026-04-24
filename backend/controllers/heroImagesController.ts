// backend/controllers/heroImagesController.ts
// ✅ SOLO HTTP HANDLING - La lógica está en heroImagesService.ts
import { Request, Response } from "express";
import * as heroImagesService from "../services/heroImagesService.js";
import logger from "../lib/logger.js";

// ✅ Obtener hero images (Admin)
export async function getHeroImages(req: Request, res: Response): Promise<void> {
  try {
    const images = await heroImagesService.getHeroImages();
    res.json(images);
  } catch (error) {
    logger.error({ err: error }, "Error en heroImagesController");
    res.status(500).json({ error: "Error obteniendo imágenes" });
  }
}

// ✅ Obtener hero images públicas
export async function getPublicHeroImages(req: Request, res: Response): Promise<void> {
  try {
    const images = await heroImagesService.getPublicHeroImages();
    res.json(images);
  } catch (error) {
    logger.error({ err: error }, "Error en heroImagesController");
    res.status(500).json({ error: "Error obteniendo imágenes" });
  }
}

// ✅ Obtener SOLO la primera hero image (para preload LCP)
export async function getFirstHeroImage(req: Request, res: Response): Promise<void> {
  try {
    const image = await heroImagesService.getFirstHeroImage();
    // Cache agresivo: la primera imagen cambia poco
    res.set("Cache-Control", "public, max-age=300, stale-while-revalidate=60");
    res.json(image);
  } catch (error) {
    logger.error({ err: error }, "Error en heroImagesController");
    res.status(500).json({ error: "Error obteniendo imagen" });
  }
}

// ✅ Subir/actualizar hero image
export async function uploadHeroImage(req: Request, res: Response): Promise<void> {
  try {
    const { section, title, subtitle, buttonText, categoria } = req.body;

    if (!section || !title) {
      res.status(400).json({ error: "Se requieren section y título" });
      return;
    }

    // Si no viene imagen, solo actualizar los campos de texto
    const buffer = req.file ? req.file.buffer : null;

    const result = await heroImagesService.uploadHeroImage(
      buffer,
      section,
      title,
      subtitle,
      buttonText,
      categoria
    );

    res.json({
      ok: true,
      message: `${section} actualizado correctamente`,
      data: result,
    });
  } catch (error: any) {
    logger.error({ err: error }, "Error en heroImagesController");
    res.status(400).json({ error: error.message || "Error subiendo imagen" });
  }
}

// ✅ Eliminar hero image
export async function deleteHeroImage(req: Request, res: Response): Promise<void> {
  try {
    const section = req.params.section as string;

    if (!section) {
      res.status(400).json({ error: "Section requerido" });
      return;
    }

    await heroImagesService.deleteHeroImage(section);
    res.json({ ok: true, message: `${section} eliminado correctamente` });
  } catch (error: any) {
    logger.error({ err: error }, "Error en heroImagesController");
    res.status(400).json({ error: error.message });
  }
}
