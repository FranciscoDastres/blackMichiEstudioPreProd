// backend/controllers/productosController.js
// ✅ SOLO HTTP HANDLING - La lógica está en productService.js
const productService = require("../services/productService");

// ✅ Crear producto
async function createProduct(req, res) {
  try {
    const { nombre, precio, stock, categoria, descripcion } = req.body;

    if (!nombre || !precio || stock === undefined) {
      return res.status(400).json({ error: "Faltan datos requeridos (nombre, precio, stock)" });
    }

    await productService.createProduct(
      nombre,
      precio,
      stock,
      categoria,
      descripcion,
      req.files
    );

    res.status(201).json({ ok: true, message: "Producto creado correctamente" });
  } catch (err) {
    console.error("❌ Error creando producto:", err);
    res.status(500).json({ error: err.message || "Error creando producto" });
  }
}

// ✅ Actualizar producto
async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const { titulo, precio, stock, categoria, descripcion } = req.body;

    if (!id || !titulo || !precio || stock === undefined) {
      return res.status(400).json({ error: "Faltan datos requeridos" });
    }

    const result = await productService.updateProduct(
      id,
      titulo,
      precio,
      stock,
      categoria,
      descripcion,
      req.files
    );

    res.json({ ok: true, data: result });
  } catch (err) {
    console.error("❌ Error actualizando producto:", err);
    res.status(err.message?.includes("no encontrado") ? 404 : 500).json({
      error: err.message || "Error actualizando producto",
    });
  }
}

// ✅ Eliminar producto
async function deleteProduct(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "ID de producto requerido" });
    }

    await productService.deleteProduct(id);
    res.json({ ok: true, message: "Producto eliminado" });
  } catch (err) {
    console.error("❌ Error eliminando producto:", err);
    res.status(500).json({ error: err.message || "Error eliminando producto" });
  }
}

// ✅ Obtener todos los productos
async function getAllProducts(req, res) {
  try {
    const products = await productService.getAllProducts();
    res.json(products);
  } catch (err) {
    console.error("❌ Error obteniendo productos:", err);
    res.status(500).json({ error: err.message || "Error obteniendo productos" });
  }
}

// ✅ Obtener producto por ID
async function getProductById(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "ID de producto requerido" });
    }

    const product = await productService.getProductById(id);
    res.json(product);
  } catch (err) {
    console.error("❌ Error obteniendo producto:", err);
    res.status(err.message?.includes("no encontrado") ? 404 : 500).json({
      error: err.message || "Error obteniendo producto",
    });
  }
}

module.exports = {
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
};
