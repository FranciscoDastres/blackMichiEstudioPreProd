// backend/routes/client.js
const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const {
    getPerfil,
    updatePerfil,
    getPedidos,
    getPedidoById,
    cancelarPedido,
    getMisResenas,
} = require('../controllers/clientController');

// ===== PERFIL =====
router.get('/perfil',              requireAuth, getPerfil);
router.put('/perfil',              requireAuth, updatePerfil);

// ===== PEDIDOS =====
router.get('/pedidos',             requireAuth, getPedidos);
router.get('/pedidos/:id',         requireAuth, getPedidoById);
router.put('/pedidos/:id/cancelar',requireAuth, cancelarPedido);

// ===== RESEÑAS =====
router.get('/mis-resenas',         requireAuth, getMisResenas);

module.exports = router;
