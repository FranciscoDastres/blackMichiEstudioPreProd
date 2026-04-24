// backend/controllers/productosController.ts
// ✅ SOLO HTTP HANDLING - La lógica está en productService.ts
import { Request, Response } from "express";
import * as productService from "../services/productService.js";
import logger from "../lib/logger.js";
import {
  assertString,
  assertPositiveNumber,
  assertNonNegativeInt,
} from "../utils/validators.js";

// ✅ Crear producto
export async function createProduct(req: Request, res: Response): Promise<void> {
  try {
    const nombre      = assertString(req.body.nombre,      "nombre",      { max: 200 });
    const precio      = assertPositiveNumber(req.body.precio, "precio");
    const stock       = assertNonNegativeInt(req.body.stock,  "stock");
    const categoria   = req.body.categoria   ? assertString(req.body.categoria,   "categoria",   { max: 100 }) : null;
    const descripcion = req.body.descripcion ? assertString(req.body.descripcion, "descripcion", { max: 5000 }) : null;

    await productService.createProduct(
      nombre,
      precio,
      stock,
      categoria,
      descripcion,
      req.files as Express.Multer.File[]
    );

    res.status(201).json({ ok: true, message: "Producto creado correctamente" });
  } catch (err: any) {
    logger.error({ err }, "Error creando producto");
    res.status(err.status || 500).json({ error: err.message || "Error creando producto" });
  }
}

// ✅ Actualizar producto
export async function updateProduct(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    if (!id) {
      res.status(400).json({ error: "ID de producto requerido" });
      return;
    }

    const titulo      = assertString(req.body.titulo, "titulo", { max: 200 });
    const precio      = assertPositiveNumber(req.body.precio, "precio");
    const stock       = assertNonNegativeInt(req.body.stock,  "stock");
    const categoria   = req.body.categoria   ? assertString(req.body.categoria,   "categoria",   { max: 100 }) : null;
    const descripcion = req.body.descripcion ? assertString(req.body.descripcion, "descripcion", { max: 5000 }) : null;

    const result = await productService.updateProduct(
      id,
      titulo,
      precio,
      stock,
      categoria,
      descripcion,
      req.files as Express.Multer.File[]
    );

    res.json({ ok: true, data: result });
  } catch (err: any) {
    logger.error({ err }, "Error actualizando producto");
    const status = err.status || (err.message?.includes("no encontrado") ? 404 : 500);
    res.status(status).json({ error: err.message || "Error actualizando producto" });
  }
}

// ✅ Eliminar producto
export async function deleteProduct(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;

    if (!id) {
      res.status(400).json({ error: "ID de producto requerido" });
      return;
    }

    await productService.deleteProduct(id);
    res.json({ ok: true, message: "Producto eliminado" });
  } catch (err: any) {
    logger.error({ err }, "Error eliminando producto");
    res.status(500).json({ error: err.message || "Error eliminando producto" });
  }
}

// ✅ Obtener todos los productos (con filtros opcionales: q, categoria, min, max, limit)
export async function getAllProducts(req: Request, res: Response): Promise<void> {
  try {
    const { q, categoria, min, max, limit } = req.query as Record<string, string | undefined>;
    const hasFilters = q || categoria || min || max || limit;

    const products = hasFilters
      ? await productService.searchProducts({
          q,
          categoriaId: categoria,
          min,
          max,
          limit,
        })
      : await productService.getAllProducts();

    res.json(products);
  } catch (err: any) {
    logger.error({ err }, "Error obteniendo productos");
    res.status(500).json({ error: err.message || "Error obteniendo productos" });
  }
}

// ✅ Obtener producto por ID
export async function getProductById(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;

    if (!id) {
      res.status(400).json({ error: "ID de producto requerido" });
      return;
    }

    const product = await productService.getProductById(id);
    res.json(product);
  } catch (err: any) {
    logger.error({ err }, "Error obteniendo producto");
    res.status(err.message?.includes("no encontrado") ? 404 : 500).json({
      error: err.message || "Error obteniendo producto",
    });
  }
}
