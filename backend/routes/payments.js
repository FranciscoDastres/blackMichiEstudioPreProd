const express = require('express');
const router = express.Router();
const flowService = require('../services/flowService');
const db = require('../lib/db');

/**
 * POST /flow/create
 * Crea un nuevo pedido y genera el pago en Flow
 */
router.post('/flow/create', async (req, res) => {
    const { items, total, email, nombre, notas, telefono, direccion } = req.body;

    // ✅ VALIDATE ENVIRONMENT VARIABLES
    if (!process.env.BACKEND_URL) {
        console.error('❌ BACKEND_URL environment variable is not set');
        return res.status(500).json({
            success: false,
            message: 'Error de configuración del servidor. BACKEND_URL no está definido.'
        });
    }

    try {
        // Validaciones básicas
        if (!email || !email.includes('@')) {
            return res.status(400).json({
                success: false,
                message: 'Email inválido.'
            });
        }

        if (!nombre || nombre.trim().length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Nombre inválido.'
            });
        }

        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'El carrito está vacío.'
            });
        }

        if (!total || total <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Total inválido.'
            });
        }

        // Generar commerce_order único
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
        const commerceOrder = `BMS-${timestamp}-${randomSuffix}`;

        // Iniciar transacción
        await db.query('BEGIN');

        try {
            // Buscar usuario existente
            const userResult = await db.query(
                'SELECT id FROM usuarios WHERE email = $1',
                [email.trim().toLowerCase()]
            );
            const usuarioId = userResult.rows.length > 0 ? userResult.rows[0].id : null;

            // Crear pedido
            const pedidoResult = await db.query(
                `INSERT INTO pedidos (
                    usuario_id,
                    comprador_nombre,
                    comprador_email,
                    comprador_telefono,
                    direccion_envio,
                    total,
                    costo_envio,
                    notas,
                    estado,
                    commerce_order,
                    metodo_pago
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pendiente', $9, 'flow')
                RETURNING id`,
                [
                    usuarioId,
                    nombre.trim(),
                    email.trim().toLowerCase(),
                    telefono?.trim() || null,
                    direccion?.trim() || 'Por coordinar',
                    total,
                    3500,
                    notas?.trim() || null,
                    commerceOrder
                ]
            );

            const pedidoId = pedidoResult.rows[0].id;

            // ✅ VALIDAR QUE TODOS LOS PRODUCTOS EXISTAN Y TENGAN STOCK
            const productIds = items.map(item => item.id);

            const existingProducts = await db.query(
                'SELECT id, titulo, stock FROM productos WHERE id = ANY($1)',
                [productIds]
            );

            // Verificar productos faltantes
            const existingIds = existingProducts.rows.map(p => p.id);
            const missingIds = productIds.filter(id => !existingIds.includes(id));

            if (missingIds.length > 0) {
                await db.query('ROLLBACK');
                return res.status(400).json({
                    success: false,
                    message: `Algunos productos ya no están disponibles: ${missingIds.join(', ')}`,
                    productos_no_disponibles: missingIds
                });
            }

            // ✅ VALIDAR STOCK SUFICIENTE
            const stockInsuficiente = [];
            for (const item of items) {
                const producto = existingProducts.rows.find(p => p.id === item.id);
                if (producto && producto.stock < item.quantity) {
                    stockInsuficiente.push({
                        id: item.id,
                        nombre: item.nombre || item.titulo || producto.titulo,
                        disponible: producto.stock,
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

            // ✅ TODO VALIDADO - Insertar items del pedido
            for (const item of items) {
                await db.query(
                    `INSERT INTO pedido_items (
                        pedido_id,
                        producto_id,
                        producto_titulo,
                        producto_imagen,
                        cantidad,
                        precio_unitario,
                        subtotal
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                    [
                        pedidoId,
                        item.id,
                        item.nombre || item.titulo,
                        item.imagen || item.imagen_principal,
                        item.quantity,
                        item.precio,
                        item.precio * item.quantity
                    ]
                );
            }

            // Generar subject para Flow
            const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
            const subject = `Pedido #${pedidoId} - ${itemCount} producto${itemCount > 1 ? 's' : ''}`;

            // Crear pago en Flow
            const flowResponse = await flowService.createPayment({
                commerceOrder,
                subject,
                amount: total,
                email: email.trim().toLowerCase(),
                urlConfirmation: `${process.env.BACKEND_URL}/api/payments/flow/confirmation`,
                urlReturn: `${process.env.BACKEND_URL}/api/payments/flow/return`
            });

            // Guardar token de Flow
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
                commerceOrder
            });

        } catch (error) {
            await db.query('ROLLBACK');
            throw error;
        }

    } catch (error) {
        console.error('❌ Error creando pago:', error);
        console.error('📋 Error details:', {
            message: error.message,
            code: error.code,
            stack: error.stack?.split('\n')[0]
        });

        let message = 'Error al procesar el pago. Por favor intenta nuevamente.';
        let statusCode = 500;

        if (error.message?.includes('Flow')) {
            message = 'Error al conectar con Flow. Verifica tu conexión.';
        } else if (error.message?.includes('BACKEND_URL')) {
            message = 'Error de configuración del servidor.';
        } else if (error.message?.includes('database')) {
            message = 'Error de base de datos. Por favor intenta más tarde.';
        }

        res.status(statusCode).json({
            success: false,
            message,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * GET /flow/return
 * Ruta cuando el usuario vuelve desde Flow
 */
router.get('/flow/return', async (req, res) => {
    const token = req.query.token;
    console.log('🔙 Usuario retornó de Flow con token:', token);

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
        console.error('❌ Error en flow/return:', error);
        res.redirect(`${process.env.FRONTEND_URL}/payment/return?token=${token}&error=server`);
    }
});

router.post('/flow/return', async (req, res) => {
    const token = req.body.token || req.query.token;
    console.log('🔙 Flow POST return con token:', token);

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

/**
 * POST /flow/return
 * Ruta alternativa por si Flow usa POST
 */
router.post('/flow/return', async (req, res) => {
    const token = req.body.token || req.query.token;
    console.log('🔙 Usuario retornó de Flow (POST) con token:', token);

    try {
        const result = await db.query(
            'SELECT id FROM pedidos WHERE flow_token = $1',
            [token]
        );

        const pedidoId = result.rows.length > 0 ? result.rows[0].id : null;
        const redirectUrl = pedidoId
            ? `${process.env.FRONTEND_URL}/payment/return?token=${token}&pedidoId=${pedidoId}`
            : `${process.env.FRONTEND_URL}/payment/return?token=${token}`;

        res.redirect(redirectUrl);
    } catch (error) {
        console.error('❌ Error buscando pedido:', error);
        res.redirect(`${process.env.FRONTEND_URL}/payment/return?token=${token}`);
    }
});

/**
 * POST /flow/confirmation
 * Webhook de Flow para confirmar el pago
 */
router.post('/flow/confirmation', async (req, res) => {
    const token = req.body.token;
    console.log('📥 Webhook Flow recibido:', { token, timestamp: new Date().toISOString() });

    try {
        if (!token) {
            console.error('❌ Token no recibido');
            return res.status(400).send('Token required');
        }

        // Registrar webhook
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

        // Validar firma solo en producción
        if (process.env.FLOW_ENV === 'production' && !flowService.validateCallback(req.body)) {
            console.error('❌ Firma inválida');
            await db.query(
                'UPDATE flow_webhooks SET processing_error = $1 WHERE id = $2',
                ['Invalid signature', webhookId]
            );
            return res.status(400).send('Invalid signature');
        }

        // Obtener estado del pago desde Flow
        const payment = await flowService.getPaymentStatus(token);

        console.log('💳 Estado del pago:', {
            flowOrder: payment.flowOrder,
            commerceOrder: payment.commerceOrder,
            status: payment.status,
            amount: payment.amount
        });

        // Mapear estado de Flow a estado interno
        const statusMap = {
            1: 'pendiente',
            2: 'pagado',
            3: 'rechazado',
            4: 'cancelado'
        };

        const nuevoEstado = statusMap[payment.status] || 'pendiente';

        // Actualizar pedido con datos de Flow
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
            console.error('❌ Pedido no encontrado:', payment.commerceOrder);
            await db.query(
                'UPDATE flow_webhooks SET processing_error = $1, flow_order = $2 WHERE id = $3',
                ['Order not found', payment.flowOrder, webhookId]
            );
            return res.status(404).send('Order not found');
        }

        const pedido = updateResult.rows[0];

        // ✅ DESCONTAR STOCK SI EL PAGO FUE EXITOSO
        if (payment.status === 2) {
            console.log('✅ Pago confirmado - Descontando stock del Pedido #' + pedido.id);

            // Obtener items del pedido
            const itemsResult = await db.query(
                `SELECT producto_id, cantidad FROM pedido_items WHERE pedido_id = $1`,
                [pedido.id]
            );

            // Descontar stock de cada producto
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
                        console.warn(`⚠️ Stock insuficiente para producto ID ${item.producto_id} (puede haber sido vendido antes)`);
                    } else {
                        console.log(`📦 Stock actualizado: "${updateStock.rows[0].titulo}" | Nuevo stock: ${updateStock.rows[0].stock}`);
                    }
                } catch (stockError) {
                    console.error(`❌ Error descontando stock producto ${item.producto_id}:`, stockError);
                }
            }
        }

        // Actualizar webhook como procesado
        await db.query(
            `UPDATE flow_webhooks 
            SET processed = true, pedido_id = $1, flow_order = $2, flow_status = $3
            WHERE id = $4`,
            [pedido.id, payment.flowOrder, payment.status, webhookId]
        );

        // Log según estado
        if (payment.status === 2) {
            console.log('✅ Pago confirmado - Pedido #', pedido.id);
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

/**
 * GET /pedido/:pedidoId/status
 * Obtiene el estado completo de un pedido
 */
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
            return res.status(404).json({
                success: false,
                message: 'Pedido no encontrado'
            });
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
        res.status(500).json({
            success: false,
            error: 'Error al obtener el pedido'
        });
    }
});

module.exports = router;
