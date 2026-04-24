// backend/routes/categorias.ts
import express, { Request, Response } from "express";
import db from "../lib/db.js";
import logger from "../lib/logger.js";

const router = express.Router();

// GET /api/categorias
router.get("/", async (req: Request, res: Response) => {
  try {
    const result = await db.query("SELECT id, nombre FROM categorias ORDER BY nombre ASC");
    res.json(result.rows);
  } catch (error) {
    logger.error({ err: error }, "Error en GET /categorias");
    res.status(500).json({ error: "Error al obtener categorías" });
  }
});

// GET /api/categorias/:id — productos activos de esa categoría
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    if (isNaN(Number(id))) {
      res.status(400).json({ error: "ID de categoría inválido" });
      return;
    }

    const result = await db.query(
      `SELECT p.id, p.titulo, p.precio, p.imagen_principal, p.categoria_id, p.promedio_calificacion
       FROM productos p
       WHERE p.categoria_id = $1 AND p.activo = true
       ORDER BY p.created_at DESC`,
      [parseInt(id)]
    );

    res.json(result.rows);
  } catch (error) {
    logger.error({ err: error }, "Error en GET /categorias/:id");
    res.status(500).json({ error: "Error al obtener productos de la categoría" });
  }
});

export default router;
