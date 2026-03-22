const express = require('express');
const router = express.Router();
const { getOrders, getMyOrders, getOrderById, updateOrderStatus } = require('../controllers/orderController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.get('/my-orders', requireAuth, getMyOrders);         // ← usuario ve sus pedidos
router.get('/', requireAuth, requireAdmin, getOrders);       // ← admin ve todos
router.get('/:id', requireAuth, getOrderById);
router.put('/:id/estado', requireAuth, requireAdmin, updateOrderStatus);

module.exports = router;