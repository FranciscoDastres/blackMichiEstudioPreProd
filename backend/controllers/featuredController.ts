// backend/controllers/featuredController.ts
// ✅ SOLO HTTP HANDLING - La lógica está en featuredService.ts
import { Request, Response } from "express";
import * as featuredService from "../services/featuredService.js";
import logger from "../lib/logger.js";

// ✅ Obtener productos destacados
export async function getFeaturedProducts(req: Request, res: Response): Promise<void> {
  try {
    const products = await featuredService.getFeaturedProducts();
    res.json(products);
  } catch (error) {
    logger.error({ err: error }, "Error en featuredController");
    res.status(500).json({ message: "Error obteniendo productos destacados" });
  }
}

// ✅ Agregar producto destacado
export async function addFeaturedProduct(req: Request, res: Response): Promise<void> {
  try {
    const { producto_id, position } = req.body;

    if (!producto_id) {
      res.status(400).json({ message: "producto_id requerido" });
      return;
    }

    await featuredService.addFeaturedProduct(producto_id, position);
    res.status(201).json({ message: "Producto destacado agregado" });
  } catch (error) {
    logger.error({ err: error }, "Error en featuredController");
    res.status(500).json({ message: "Error agregando producto destacado" });
  }
}

// ✅ Eliminar producto destacado
export async function removeFeaturedProduct(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;

    if (!id) {
      res.status(400).json({ message: "ID requerido" });
      return;
    }

    await featuredService.removeFeaturedProduct(id);
    res.json({ message: "Producto destacado eliminado" });
  } catch (error) {
    logger.error({ err: error }, "Error en featuredController");
    res.status(500).json({ message: "Error eliminando producto destacado" });
  }
}

// Aliases para compatibilidad con routes
export {
  getFeaturedProducts as getFeaturedProductos,
  addFeaturedProduct as addFeaturedProducto,
  removeFeaturedProduct as removeFeaturedProducto,
};
