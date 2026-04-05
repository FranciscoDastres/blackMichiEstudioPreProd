// backend/routes/productos.js — solo rutas públicas de lectura
// El CRUD admin está en routes/admin.js bajo /api/admin/productos

const express = require("express");
const router = express.Router();
const productosController = require("../controllers/productosController");

router.get("/", productosController.getAllProducts);
router.get("/:id", productosController.getProductById);

module.exports = router;