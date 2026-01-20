// backend/routes/productos.js
const express = require("express");
const router = express.Router();
const productosController = require("../controllers/productosController");
const { requireAuth, requireAdmin } = require("../middleware/auth");
const uploadMiddleware = require("../middleware/upload"); // ← IMPORT CORRECTO

// Rutas públicas
router.get("/", productosController.getAllProducts);
router.get("/categoria/:categoria", productosController.getProductsByCategory);
router.get("/buscar", productosController.buscarProductos);
router.get("/sugerencias", productosController.getSugerencias);
router.get("/:id", productosController.getProductById);

// Admin - CON MIDDLEWARE DE SUBIDA
router.post("/", requireAuth, requireAdmin, uploadMiddleware.array("images", 10), productosController.createProduct);
router.put("/:id", requireAuth, requireAdmin, uploadMiddleware.array("images", 10), productosController.updateProduct);
router.delete("/:id", requireAuth, requireAdmin, productosController.deleteProduct);

module.exports = router;