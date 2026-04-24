// backend/routes/client.ts
import express from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  getPerfil,
  updatePerfil,
  getPedidos,
  getPedidoById,
  cancelarPedido,
  getMisResenas,
} from "../controllers/clientController.js";
import * as favoritosController from "../controllers/favoritosController.js";

const router = express.Router();

// ===== PERFIL =====
router.get("/perfil",               requireAuth, getPerfil);
router.put("/perfil",               requireAuth, updatePerfil);

// ===== PEDIDOS =====
router.get("/pedidos",              requireAuth, getPedidos);
router.get("/pedidos/:id",          requireAuth, getPedidoById);
router.put("/pedidos/:id/cancelar", requireAuth, cancelarPedido);

// ===== RESEÑAS =====
router.get("/mis-resenas",          requireAuth, getMisResenas);

// ===== FAVORITOS / WISHLIST =====
router.get("/favoritos",                     requireAuth, favoritosController.listar);
router.get("/favoritos/ids",                 requireAuth, favoritosController.listarIds);
router.post("/favoritos/toggle/:productoId", requireAuth, favoritosController.toggle);
router.post("/favoritos/:productoId",        requireAuth, favoritosController.agregar);
router.delete("/favoritos/:productoId",      requireAuth, favoritosController.quitar);

export default router;
