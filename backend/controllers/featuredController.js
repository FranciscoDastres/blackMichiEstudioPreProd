// backend/controllers/featuredController.js
// ✅ SOLO HTTP HANDLING - La lógica está en featuredService.js
import * as featuredService from "../services/featuredService.js";
import logger from "../lib/logger.js";

// ✅ Obtener productos destacados
export async function getFeaturedProducts(req, res) {
  try {
    const products = await featuredService.getFeaturedProducts();
    res.json(products);
  } catch (error) {
    logger.error({ err: error }, "Error en featuredController");
    res.status(500).json({ message: "Error obteniendo productos destacados" });
  }
}

// ✅ Agregar producto destacado
export async function addFeaturedProduct(req, res) {
  try {
    const { producto_id, position } = req.body;

    if (!producto_id) {
      return res.status(400).json({ message: "producto_id requerido" });
    }

    await featuredService.addFeaturedProduct(producto_id, position);
    res.status(201).json({ message: "Producto destacado agregado" });
  } catch (error) {
    logger.error({ err: error }, "Error en featuredController");
    res.status(500).json({ message: "Error agregando producto destacado" });
  }
}

// ✅ Eliminar producto destacado
export async function removeFeaturedProduct(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "ID requerido" });
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
