import express from "express";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import * as adminController from "../controllers/adminController.js";
import * as productosController from "../controllers/productosController.js";

const router = express.Router();

// =======================================================
// 📌 PRODUCTOS (Admin) → CRUD real hecho en productosController
// =======================================================

// Obtener productos para el panel Admin
router.get(
  "/productos",
  requireAuth,
  requireAdmin,
  adminController.getAllProducts
);

// Crear producto (con imágenes)
router.post(
  "/productos",
  requireAuth,
  requireAdmin,
  upload.array("imagenes", 5),
  productosController.createProduct
);

router.put(
  "/productos/:id",
  requireAuth,
  requireAdmin,
  upload.array("imagenes", 5),
  productosController.updateProduct
);

router.delete(
  "/productos/:id",
  requireAuth,
  requireAdmin,
  productosController.deleteProduct
);

// =======================================================
// 📌 PEDIDOS
// =======================================================

router.get(
  "/pedidos",
  requireAuth,
  requireAdmin,
  adminController.getAllOrders
);

router.put(
  "/pedidos/:id/estado",
  requireAuth,
  requireAdmin,
  adminController.updateOrderStatus
);

// =======================================================
// 📌 ESTADÍSTICAS
// =======================================================

router.get(
  "/stats",
  requireAuth,
  requireAdmin,
  adminController.getStats
);

// =======================================================
// 📌 USUARIOS
// =======================================================

router.get(
  "/usuarios",
  requireAuth,
  requireAdmin,
  adminController.getAllUsers
);

router.put(
  "/usuarios/:id/rol",
  requireAuth,
  requireAdmin,
  adminController.updateUserRole
);

router.delete(
  "/usuarios/:id",
  requireAuth,
  requireAdmin,
  adminController.deleteUser
);

export default router;
