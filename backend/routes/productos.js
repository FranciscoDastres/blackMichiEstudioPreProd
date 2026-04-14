// backend/routes/productos.js — solo rutas públicas de lectura
// El CRUD admin está en routes/admin.js bajo /api/admin/productos

import express from "express";
import * as productosController from "../controllers/productosController.js";

const router = express.Router();

router.get("/", productosController.getAllProducts);
router.get("/:id", productosController.getProductById);

export default router;
