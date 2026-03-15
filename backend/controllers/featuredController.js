// backend/controllers/featuredController.js
// ✅ SOLO HTTP HANDLING - La lógica está en featuredService.js
const featuredService = require("../services/featuredService");

// ✅ Obtener productos destacados
async function getFeaturedProducts(req, res) {
  try {
    const products = await featuredService.getFeaturedProducts();
    res.json(products);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Error obteniendo productos destacados" });
  }
}

// ✅ Agregar producto destacado
async function addFeaturedProduct(req, res) {
  try {
    const { producto_id, position } = req.body;

    if (!producto_id) {
      return res.status(400).json({ message: "producto_id requerido" });
    }

    await featuredService.addFeaturedProduct(producto_id, position);
    res.status(201).json({ message: "Producto destacado agregado" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Error agregando producto destacado" });
  }
}

// ✅ Eliminar producto destacado
async function removeFeaturedProduct(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "ID requerido" });
    }

    await featuredService.removeFeaturedProduct(id);
    res.json({ message: "Producto destacado eliminado" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Error eliminando producto destacado" });
  }
}

module.exports = {
  getFeaturedProductos: getFeaturedProducts,
  addFeaturedProducto: addFeaturedProduct,
  removeFeaturedProducto: removeFeaturedProduct,
};
