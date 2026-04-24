// backend/controllers/reviewsController.ts
import { Request, Response } from "express";
import * as reviewsService from "../services/reviewsService.js";
import logger from "../lib/logger.js";

export async function getByProducto(req: Request, res: Response): Promise<void> {
  const { producto_id } = req.query as { producto_id?: string };
  if (!producto_id) {
    res.status(400).json({ error: "producto_id requerido" });
    return;
  }
  try {
    const reviews = await reviewsService.getByProducto(producto_id);
    res.json(reviews);
  } catch (err) {
    logger.error({ err }, "Error getByProducto");
    res.status(500).json({ error: "Error al cargar reseñas" });
  }
}

export async function create(req: Request, res: Response): Promise<void> {
  const { producto_id, calificacion, comentario } = req.body;

  if (!producto_id || !calificacion || calificacion < 1 || calificacion > 5) {
    res.status(400).json({ error: "Datos inválidos" });
    return;
  }

  try {
    const review = await reviewsService.create(req.user!.id, { producto_id, calificacion, comentario }) as any;
    res.status(201).json({ id: review.id, producto_id, calificacion, comentario });
  } catch (err: any) {
    logger.error({ err }, "Error create review");
    res.status(err.status || 500).json({ error: err.message || "Error al guardar la reseña" });
  }
}
