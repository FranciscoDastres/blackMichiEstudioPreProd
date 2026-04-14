import express from 'express';
import { getOrders, getMyOrders, getOrderById, updateOrderStatus } from '../controllers/orderController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/my-orders', requireAuth, getMyOrders);         // ← usuario ve sus pedidos
router.get('/', requireAuth, requireAdmin, getOrders);       // ← admin ve todos
router.get('/:id', requireAuth, getOrderById);
router.put('/:id/estado', requireAuth, requireAdmin, updateOrderStatus);

export default router;
