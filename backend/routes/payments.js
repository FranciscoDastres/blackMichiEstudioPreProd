const express = require('express');
const router = express.Router();
const flowService = require('../services/flowService');
const db = require('../lib/db');
const emailService = require('../services/emailService');
const { invalidateCache } = require('../services/productService');

router.post('/flow/create', async (req, res) => {
    const { items, email, nombre, notas, telefono, direccion } = req.body;

    if (!process.env.BACKEND_URL) {
        console.error('❌ BACKEND_URL environment variable is not set');
        return res.status(500).json({
            success: false,
            message: 'Error de configuración del servidor. BACKEND_URL no está definido.'
        });
    }

    try {
        if (!email || !email.includes('@')) {
            return res.status(400).json({ success: false, message: 'Email inválido.' });
        }
        if (!nombre || nombre.trim().length < 2) {
            return res.status(400).json({ success: false, message: 'Nombre inválido.' });
        }
        if (!items || items.length === 0) {
            return res.status(400).json({ success: false, message: 'El carrito está vacío.' });
        }
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
        const commerceOrder = `BMS-${timestamp}-${randomSuffix}`;

        await db.query('BEGIN');

        try {
            // ── Recalcular total desde precios reales en DB ──────────────────
            const productIds = items.map(item => item.id);
            const productosDB = await db.query(
                'SELECT id, precio, stock, activo FROM productos WHERE id = ANY($1)',
                [productIds]
            );

            const preciosMap = Object.fromEntries(productosDB.rows.map(p => [p.id, p]));
            let totalCalculado = 0;

            for (const item of items) {
                const prod = preciosMap[item.id];
                if (!prod) {
                    await db.query('ROLLBACK');
                    return res.status(400).json({ success: false, message: `Producto ${item.id} no encontrado.` });
                }
                if (!prod.activo) {
                    await db.query('ROLLBACK');
                    return res.status(400).json({ success: false, message: `El producto ya no está disponible.` });
                }
                totalCalculado += Number(prod.precio) * item.quantity;
            }

            // Leer costo de envío desde configuracion
            const configResult = await db.query(
                `SELECT valor FROM configuracion WHERE clave = 'costo_envio'`
            );
            const costoEnvio = configResult.rows.length > 0 ? Number(configResult.rows[0].valor) : 3500;
            totalCalculado += costoEnvio;

            const userResult = await db.query(
                'SELECT id FROM usuarios WHERE email = $1',
                [email.trim().toLowerCase()]
            );
            const usuarioId = userResult.rows.length > 0 ? userResult.rows[0].id : null;

            const pedidoResult = await db.query(
                `INSERT INTO pedidos (
                    usuario_id, comprador_nombre, comprador_email, comprador_telefono,
                    direccion_envio, total, costo_envio, notas, estado, commerce_order, metodo_pago
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pendiente', $9, 'flow')
                RETURNING id`,
                [
                    usuarioId,
                    nombre.trim(),
                    email.trim().toLowerCase(),
                    telefono?.trim() || null,
                    direccion?.trim() || 'Por coordinar',
                    totalCalculado,
                    costoEnvio,
                    notas?.trim() || null,
                    commerceOrder
                ]
            );

            const pedidoId = pedidoResult.rows[0].id;

            // Validar stock usando preciosMap ya cargado arriba
            const stockInsuficiente = [];
            for (const item of items) {
                const prod = preciosMap[item.id];
                if (prod && prod.stock < item.quantity) {
                    stockInsuficiente.push({
                        id: item.id,
                        nombre: item.nombre || item.titulo,
                        disponible: prod.stock,
                        solicitado: item.quantity
                    });
                }
            }
            if (stockInsuficiente.length > 0) {
                await db.query('ROLLBACK');
                return res.status(400).json({
                    success: false,
                    message: 'Stock insuficiente para algunos productos',
                    productos_sin_stock: stockInsuficiente
                });
            }

            for (const item of items) {
                await db.query(
                    `INSERT INTO pedido_items (
                        pedido_id, producto_id, producto_titulo, producto_imagen,
                        cantidad, precio_unitario, subtotal
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                    [
                        pedidoId,
                        item.id,
                        item.nombre || item.titulo,
                        item.imagen || item.imagen_principal,
                        item.quantity,
                        preciosMap[item.id].precio,
                        preciosMap[item.id].precio * item.quantity
                    ]
                );
            }

            const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
            const subject = `Pedido #${pedidoId} - ${itemCount} producto${itemCount > 1 ? 's' : ''}`;

            const flowResponse = await flowService.createPayment({
                commerceOrder,
                subject,
                amount: totalCalculado,
                email: email.trim().toLowerCase(),
                urlConfirmation: `${process.env.BACKEND_URL}/api/payments/flow/confirmation`,
                urlReturn: `${process.env.BACKEND_URL}/api/payments/flow/return`
            });

            await db.query(
                'UPDATE pedidos SET flow_token = $1 WHERE id = $2',
                [flowResponse.token, pedidoId]
            );

            await db.query('COMMIT');

            res.json({
                success: true,
                paymentUrl: `${flowResponse.url}?token=${flowResponse.token}`,
                flowOrder: flowResponse.flowOrder,
                pedidoId,
                commerceOrder,
                total: totalCalculado
            });

        } catch (error) {
            await db.query('ROLLBACK');
            throw error;
        }

    } catch (error) {
        console.error('❌ Error creando pago:', error);
        let message = 'Error al procesar el pago. Por favor intenta nuevamente.';
        if (error.message?.includes('Flow')) {
            message = 'Error al conectar con Flow. Verifica tu conexión.';
        } else if (error.message?.includes('database')) {
            message = 'Error de base de datos. Por favor intenta más tarde.';
        }
        res.status(500).json({
            success: false,
            message,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

router.get('/flow/return', async (req, res) => {
    const token = req.query.token;
    console.log('🔙 Usuario retornó de Flow (GET) con token:', token);

    try {
        const result = await db.query(
            'SELECT id FROM pedidos WHERE flow_token = $1',
            [token]
        );
        const pedidoId = result.rows.length > 0 ? result.rows[0].id : null;

        if (pedidoId) {
            return res.redirect(
                `${process.env.FRONTEND_URL}/payment/return?token=${token}&pedidoId=${pedidoId}`
            );
        }
        res.redirect(
            `${process.env.FRONTEND_URL}/payment/return?token=${token}&error=not_found`
        );
    } catch (error) {
        console.error('❌ Error en flow/return GET:', error);
        res.redirect(`${process.env.FRONTEND_URL}/payment/return?token=${token}&error=server`);
    }
});

router.post('/flow/return', async (req, res) => {
    const token = req.body.token || req.query.token;
    console.log('🔙 Usuario retornó de Flow (POST) con token:', token);

    try {
        const result = await db.query(
            'SELECT id FROM pedidos WHERE flow_token = $1',
            [token]
        );
        const pedidoId = result.rows.length > 0 ? result.rows[0].id : null;

        if (pedidoId) {
            return res.redirect(
                `${process.env.FRONTEND_URL}/payment/return?token=${token}&pedidoId=${pedidoId}`
            );
        }
        res.redirect(
            `${process.env.FRONTEND_URL}/payment/return?token=${token}&error=not_found`
        );
    } catch (error) {
        console.error('❌ Error en flow/return POST:', error);
        res.redirect(`${process.env.FRONTEND_URL}/payment/return?token=${token}&error=server`);
    }
});

router.post('/flow/confirmation', async (req, res) => {
    const token = req.body.token;
    console.log('📥 Webhook Flow recibido:', { token, timestamp: new Date().toISOString() });

    try {
        if (!token) {
            console.error('❌ Token no recibido en webhook');
            return res.status(400).send('Token required');
        }

        const webhookResult = await db.query(
            `INSERT INTO flow_webhooks (
                token, request_body, request_headers, ip_origen
            ) VALUES ($1, $2, $3, $4)
            RETURNING id`,
            [
                token,
                JSON.stringify(req.body),
                JSON.stringify(req.headers),
                req.ip || req.connection.remoteAddress
            ]
        );

        const webhookId = webhookResult.rows[0].id;

        if (process.env.FLOW_ENV === 'production' && !flowService.validateCallback(req.body)) {
            console.error('❌ Firma inválida en webhook');
            await db.query(
                'UPDATE flow_webhooks SET processing_error = $1 WHERE id = $2',
                ['Invalid signature', webhookId]
            );
            return res.status(400).send('Invalid signature');
        }

        const payment = await flowService.getPaymentStatus(token);

        console.log('💳 Estado del pago:', {
            flowOrder: payment.flowOrder,
            commerceOrder: payment.commerceOrder,
            status: payment.status,
            amount: payment.amount
        });

        const statusMap = { 1: 'pendiente', 2: 'pagado', 3: 'rechazado', 4: 'cancelado' };
        const nuevoEstado = statusMap[payment.status] || 'pendiente';

        const updateResult = await db.query(
            `UPDATE pedidos 
            SET 
                flow_order = $1,
                flow_status = $2,
                estado = $3,
                flow_payment_data = $4,
                fecha_pago = CASE WHEN $5 = 'pagado' THEN NOW() ELSE fecha_pago END,
                updated_at = NOW()
            WHERE commerce_order = $6
            RETURNING id, comprador_email, comprador_nombre, total`,
            [
                String(payment.flowOrder),
                parseInt(payment.status),
                nuevoEstado,
                JSON.stringify(payment),
                nuevoEstado,
                String(payment.commerceOrder)
            ]
        );

        if (updateResult.rows.length === 0) {
            console.error('❌ Pedido no encontrado para commerceOrder:', payment.commerceOrder);
            await db.query(
                'UPDATE flow_webhooks SET processing_error = $1, flow_order = $2 WHERE id = $3',
                ['Order not found', payment.flowOrder, webhookId]
            );
            return res.status(404).send('Order not found');
        }

        const pedido = updateResult.rows[0];

        if (payment.status === 2) {
            console.log('✅ Pago confirmado - Descontando stock del Pedido #' + pedido.id);

            const itemsResult = await db.query(
                `SELECT producto_id, cantidad FROM pedido_items WHERE pedido_id = $1`,
                [pedido.id]
            );

            for (const item of itemsResult.rows) {
                try {
                    const updateStock = await db.query(
                        `UPDATE productos 
                         SET stock = stock - $1, updated_at = NOW() 
                         WHERE id = $2 AND stock >= $3
                         RETURNING id, titulo, stock`,
                        [item.cantidad, item.producto_id, item.cantidad]
                    );

                    if (updateStock.rows.length === 0) {
                        console.warn(`⚠️ Stock insuficiente para producto ID ${item.producto_id}`);
                    } else {
                        console.log(`📦 Stock actualizado: "${updateStock.rows[0].titulo}" | Nuevo stock: ${updateStock.rows[0].stock}`);
                    }
                } catch (stockError) {
                    console.error(`❌ Error descontando stock producto ${item.producto_id}:`, stockError);
                }
            }

            // Invalidar cache de productos para que el siguiente GET devuelva stock actualizado
            invalidateCache();
        }

        await db.query(
            `UPDATE flow_webhooks 
            SET processed = true, pedido_id = $1, flow_order = $2, flow_status = $3
            WHERE id = $4`,
            [pedido.id, payment.flowOrder, payment.status, webhookId]
        );

        // Pagos rechazados/cancelados: el stock nunca fue decrementado (solo se decrementa
        // en status 2), así que no hay nada que reponer.

        // Emails
        if (payment.status === 2) {
            console.log('✅ Pago confirmado - Pedido #', pedido.id);
            const itemsResult = await db.query(
                `SELECT producto_titulo, cantidad, precio_unitario FROM pedido_items WHERE pedido_id = $1`,
                [pedido.id]
            );
            const pedidoCompleto = await db.query(
                `SELECT * FROM pedidos WHERE id = $1`, [pedido.id]
            );
            emailService.emailConfirmacionPago(pedidoCompleto.rows[0], itemsResult.rows);
            emailService.emailNuevoPedidoAdmin(pedidoCompleto.rows[0], itemsResult.rows);
        } else if (payment.status === 3) {
            console.log('❌ Pago rechazado - Pedido #', pedido.id);
        } else if (payment.status === 4) {
            console.log('🚫 Pago cancelado - Pedido #', pedido.id);
        }

        res.sendStatus(200);

    } catch (error) {
        console.error('❌ Error procesando webhook:', error);
        try {
            await db.query(
                'UPDATE flow_webhooks SET processing_error = $1 WHERE token = $2',
                [error.message, token]
            );
        } catch (dbError) {
            console.error('❌ Error guardando error en DB:', dbError);
        }
        res.sendStatus(500);
    }
});

router.get('/pedido/:pedidoId/status', async (req, res) => {
    try {
        const result = await db.query(
            `SELECT 
                p.*,
                json_agg(
                    json_build_object(
                        'titulo', pi.producto_titulo,
                        'imagen', pi.producto_imagen,
                        'cantidad', pi.cantidad,
                        'precio_unitario', pi.precio_unitario,
                        'subtotal', pi.subtotal
                    )
                ) as items
            FROM pedidos p
            LEFT JOIN pedido_items pi ON p.id = pi.pedido_id
            WHERE p.id = $1
            GROUP BY p.id`,
            [req.params.pedidoId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Pedido no encontrado' });
        }

        const pedido = result.rows[0];

        res.json({
            success: true,
            pedido: {
                id: pedido.id,
                commerceOrder: pedido.commerce_order,
                flowOrder: pedido.flow_order,
                estado: pedido.estado,
                total: pedido.total,
                costoEnvio: pedido.costo_envio,
                comprador: {
                    nombre: pedido.comprador_nombre,
                    email: pedido.comprador_email,
                    telefono: pedido.comprador_telefono
                },
                direccionEnvio: pedido.direccion_envio,
                notas: pedido.notas,
                items: pedido.items,
                fechaCreacion: pedido.created_at,
                fechaPago: pedido.fecha_pago
            }
        });
    } catch (error) {
        console.error('❌ Error obteniendo pedido:', error);
        res.status(500).json({ success: false, error: 'Error al obtener el pedido' });
    }
});

module.exports = router;