// backend/controllers/paymentController.js
const flowService = require('../services/flowService');
const paymentService = require('../services/paymentService');

async function createPayment(req, res) {
    const { items, email, nombre, notas, telefono, direccion } = req.body;

    if (!process.env.BACKEND_URL) {
        return res.status(500).json({ success: false, message: 'BACKEND_URL no está configurado.' });
    }
    if (!email || !email.includes('@')) {
        return res.status(400).json({ success: false, message: 'Email inválido.' });
    }
    if (!nombre || nombre.trim().length < 2) {
        return res.status(400).json({ success: false, message: 'Nombre inválido.' });
    }
    if (!items || items.length === 0) {
        return res.status(400).json({ success: false, message: 'El carrito está vacío.' });
    }

    try {
        const result = await paymentService.crearPago({ items, email, nombre, notas, telefono, direccion });
        res.json({ success: true, ...result });
    } catch (err) {
        console.error('❌ Error creando pago:', err);
        let message = 'Error al procesar el pago. Por favor intenta nuevamente.';
        if (err.message?.includes('Flow')) message = 'Error al conectar con Flow. Verifica tu conexión.';
        else if (err.message?.includes('database')) message = 'Error de base de datos. Por favor intenta más tarde.';
        else if (err.status === 400) message = err.message;

        res.status(err.status || 500).json({
            success: false,
            message,
            ...(err.productos_sin_stock && { productos_sin_stock: err.productos_sin_stock }),
            ...(process.env.NODE_ENV === 'development' && { error: err.message }),
        });
    }
}

async function flowReturn(req, res) {
    const token = req.body?.token || req.query?.token;
    console.log('🔙 Usuario retornó de Flow');
    try {
        const pedidoId = await paymentService.getPedidoByFlowToken(token);
        if (pedidoId) {
            return res.redirect(`${process.env.FRONTEND_URL}/payment/return?token=${token}&pedidoId=${pedidoId}`);
        }
        res.redirect(`${process.env.FRONTEND_URL}/payment/return?token=${token}&error=not_found`);
    } catch (err) {
        console.error('❌ Error en flow/return:', err);
        res.redirect(`${process.env.FRONTEND_URL}/payment/return?token=${token}&error=server`);
    }
}

async function flowConfirmation(req, res) {
    const token = req.body.token;
    console.log('📥 Webhook Flow recibido:', { timestamp: new Date().toISOString() });

    if (!token || typeof token !== 'string' || token.length < 8) {
        console.error('❌ Token inválido en webhook');
        return res.status(400).send('Token required');
    }

    if (!flowService.validateCallback(req.body)) {
        console.error('❌ Firma inválida en webhook Flow');
        return res.status(400).send('Invalid signature');
    }

    try {
        await paymentService.procesarWebhook(token, req.body, req.headers, req.ip || req.connection?.remoteAddress);
        res.sendStatus(200);
    } catch (err) {
        console.error('❌ Error procesando webhook:', err);
        res.sendStatus(err.status === 404 ? 404 : 500);
    }
}

async function getPedidoStatus(req, res) {
    try {
        const flowToken = req.query.token;
        if (!flowToken) {
            return res.status(401).json({ success: false, message: 'Token de pago requerido' });
        }

        const pedido = await paymentService.getEstadoPedido(req.params.pedidoId, flowToken);
        if (!pedido) {
            // Respuesta genérica: no distinguimos entre "no existe" y "token inválido"
            // para no filtrar existencia de pedidos a atacantes
            return res.status(404).json({ success: false, message: 'Pedido no encontrado' });
        }

        res.json({
            success: true,
            pedido: {
                id: pedido.id,
                commerceOrder:  pedido.commerce_order,
                flowOrder:      pedido.flow_order,
                estado:         pedido.estado,
                total:          pedido.total,
                costoEnvio:     pedido.costo_envio,
                comprador: {
                    nombre:    pedido.comprador_nombre,
                    email:     pedido.comprador_email,
                    telefono:  pedido.comprador_telefono,
                },
                direccionEnvio: pedido.direccion_envio,
                notas:          pedido.notas,
                items:          pedido.items,
                fechaCreacion:  pedido.created_at,
                fechaPago:      pedido.fecha_pago,
            },
        });
    } catch (err) {
        console.error('❌ Error obteniendo pedido:', err);
        res.status(500).json({ success: false, error: 'Error al obtener el pedido' });
    }
}

module.exports = { createPayment, flowReturn, flowConfirmation, getPedidoStatus };
