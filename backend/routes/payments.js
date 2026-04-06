// backend/routes/payments.js
const express = require('express');
const router = express.Router();
const { createPayment, flowReturn, flowConfirmation, getPedidoStatus } = require('../controllers/paymentController');

router.post('/flow/create',        createPayment);
router.get('/flow/return',         flowReturn);
router.post('/flow/return',        flowReturn);
router.post('/flow/confirmation',  flowConfirmation);
router.get('/pedido/:pedidoId/status', getPedidoStatus);

module.exports = router;
