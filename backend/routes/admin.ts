// backend/routes/admin.ts
import express from "express";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import * as adminController from "../controllers/adminController.js";
import * as productosController from "../controllers/productosController.js";
import * as cuponesController from "../controllers/cuponesController.js";

const router = express.Router();

// =======================================================
// 📌 PRODUCTOS (Admin) → CRUD real hecho en productosController
// =======================================================

// Obtener productos para el panel Admin
router.get("/productos", requireAuth, requireAdmin, adminController.getAllProducts);

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

router.delete("/productos/:id", requireAuth, requireAdmin, productosController.deleteProduct);

// =======================================================
// 📌 PEDIDOS
// =======================================================

router.get("/pedidos", requireAuth, requireAdmin, adminController.getAllOrders);

router.put("/pedidos/:id/estado", requireAuth, requireAdmin, adminController.updateOrderStatus);

// =======================================================
// 📌 ESTADÍSTICAS
// =======================================================

router.get("/stats", requireAuth, requireAdmin, adminController.getStats);

// =======================================================
// 📌 USUARIOS
// =======================================================

router.get("/usuarios", requireAuth, requireAdmin, adminController.getAllUsers);

router.put("/usuarios/:id/rol", requireAuth, requireAdmin, adminController.updateUserRole);

router.delete("/usuarios/:id", requireAuth, requireAdmin, adminController.deleteUser);

// =======================================================
// 📌 CUPONES (Admin)
// =======================================================

router.get("/cupones", requireAuth, requireAdmin, cuponesController.listar);
router.post("/cupones", requireAuth, requireAdmin, cuponesController.crear);
router.put("/cupones/:id", requireAuth, requireAdmin, cuponesController.actualizar);
router.delete("/cupones/:id", requireAuth, requireAdmin, cuponesController.eliminar);

export default router;
