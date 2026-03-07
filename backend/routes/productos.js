// backend/routes/productos.js

const express = require("express");
const router = express.Router();

const productosController = require("../controllers/productosController");
const { requireAuth, requireAdmin } = require("../middleware/auth");
const uploadMiddleware = require("../middleware/upload");

// =====================
// RUTAS PÚBLICAS
// =====================

router.get("/", productosController.getAllProducts);
router.get("/:id", productosController.getProductById);

// =====================
// RUTAS ADMIN
// =====================

router.post(
    "/",
    requireAuth,
    requireAdmin,
    uploadMiddleware.array("images", 10),
    productosController.createProduct
);

router.put(
    "/:id",
    requireAuth,
    requireAdmin,
    uploadMiddleware.array("images", 10),
    productosController.updateProduct
);

router.delete(
    "/:id",
    requireAuth,
    requireAdmin,
    productosController.deleteProduct
);

module.exports = router;