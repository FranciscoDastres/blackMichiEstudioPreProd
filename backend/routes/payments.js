// backend/routes/payments.js
import express from 'express';
import { createPayment, flowReturn, flowConfirmation, getPedidoStatus } from '../controllers/paymentController.js';

const router = express.Router();

router.post('/flow/create',        createPayment);
router.get('/flow/return',         flowReturn);
router.post('/flow/return',        flowReturn);
router.post('/flow/confirmation',  flowConfirmation);
router.get('/pedido/:pedidoId/status', getPedidoStatus);

export default router;
