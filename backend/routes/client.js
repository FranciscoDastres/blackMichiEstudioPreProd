// backend/routes/client.js
import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
    getPerfil,
    updatePerfil,
    getPedidos,
    getPedidoById,
    cancelarPedido,
    getMisResenas,
} from '../controllers/clientController.js';

const router = express.Router();

// ===== PERFIL =====
router.get('/perfil',              requireAuth, getPerfil);
router.put('/perfil',              requireAuth, updatePerfil);

// ===== PEDIDOS =====
router.get('/pedidos',             requireAuth, getPedidos);
router.get('/pedidos/:id',         requireAuth, getPedidoById);
router.put('/pedidos/:id/cancelar',requireAuth, cancelarPedido);

// ===== RESEÑAS =====
router.get('/mis-resenas',         requireAuth, getMisResenas);

export default router;
