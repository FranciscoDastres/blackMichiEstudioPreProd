// backend/services/paymentService.js
const db = require('../lib/db');
const flowService = require('./flowService');
const emailService = require('./emailService');
const { invalidateCache } = require('./productService');

// ── Crear pago Flow ──────────────────────────────────────────────────────────

async function crearPago({ items, email, nombre, notas, telefono, direccion }) {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const commerceOrder = `BMS-${timestamp}-${randomSuffix}`;

    await db.query('BEGIN');
    try {
        // Recalcular precios desde DB (nunca confiar en el cliente)
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
                throw Object.assign(new Error(`Producto ${item.id} no encontrado.`), { status: 400 });
            }
            if (!prod.activo) {
                await db.query('ROLLBACK');
                throw Object.assign(new Error('El producto ya no está disponible.'), { status: 400 });
            }
            totalCalculado += Number(prod.precio) * item.quantity;
        }

        // Costo de envío desde configuración
        const configResult = await db.query(
            `SELECT valor FROM configuracion WHERE clave = 'costo_envio'`
        );
        const costoEnvio = configResult.rows.length > 0 ? Number(configResult.rows[0].valor) : 3500;
        totalCalculado += costoEnvio;

        // Buscar usuario por email (puede no estar registrado)
        const userResult = await db.query(
            'SELECT id FROM usuarios WHERE email = $1',
            [email.trim().toLowerCase()]
        );
        const usuarioId = userResult.rows.length > 0 ? userResult.rows[0].id : null;

        // Crear pedido
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
                commerceOrder,
            ]
        );
        const pedidoId = pedidoResult.rows[0].id;

        // Validar stock antes de insertar items
        const stockInsuficiente = items
            .filter(item => preciosMap[item.id]?.stock < item.quantity)
            .map(item => ({
                id: item.id,
                nombre: item.nombre || item.titulo,
                disponible: preciosMap[item.id].stock,
                solicitado: item.quantity,
            }));

        if (stockInsuficiente.length > 0) {
            await db.query('ROLLBACK');
            throw Object.assign(
                new Error('Stock insuficiente para algunos productos'),
                { status: 400, productos_sin_stock: stockInsuficiente }
            );
        }

        // Insertar items del pedido
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
                    preciosMap[item.id].precio * item.quantity,
                ]
            );
        }

        // Crear pago en Flow
        const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
        const flowResponse = await flowService.createPayment({
            commerceOrder,
            subject: `Pedido #${pedidoId} - ${itemCount} producto${itemCount > 1 ? 's' : ''}`,
            amount: totalCalculado,
            email: email.trim().toLowerCase(),
            urlConfirmation: `${process.env.BACKEND_URL}/api/payments/flow/confirmation`,
            urlReturn: `${process.env.BACKEND_URL}/api/payments/flow/return`,
        });

        await db.query('UPDATE pedidos SET flow_token = $1 WHERE id = $2', [flowResponse.token, pedidoId]);
        await db.query('COMMIT');

        return {
            paymentUrl: `${flowResponse.url}?token=${flowResponse.token}`,
            flowOrder: flowResponse.flowOrder,
            pedidoId,
            commerceOrder,
            total: totalCalculado,
        };
    } catch (err) {
        await db.query('ROLLBACK');
        throw err;
    }
}

// ── Buscar pedido por flow_token (para redirects) ────────────────────────────

async function getPedidoByFlowToken(token) {
    const result = await db.query(
        'SELECT id FROM pedidos WHERE flow_token = $1',
        [token]
    );
    return result.rows[0]?.id || null;
}

// ── Procesar webhook de confirmación ─────────────────────────────────────────

async function procesarWebhook(token, rawBody, rawHeaders, ip) {
    // Registrar webhook recibido
    const webhookResult = await db.query(
        `INSERT INTO flow_webhooks (token, request_body, request_headers, ip_origen)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [token, JSON.stringify(rawBody), JSON.stringify(rawHeaders), ip]
    );
    const webhookId = webhookResult.rows[0].id;

    // Obtener estado del pago desde Flow
    const payment = await flowService.getPaymentStatus(token);
    console.log('💳 Estado del pago:', {
        flowOrder: payment.flowOrder,
        commerceOrder: payment.commerceOrder,
        status: payment.status,
        amount: payment.amount,
    });

    const statusMap = { 1: 'pendiente', 2: 'pagado', 3: 'rechazado', 4: 'cancelado' };
    const nuevoEstado = statusMap[payment.status] || 'pendiente';

    const updateResult = await db.query(
        `UPDATE pedidos
         SET flow_order = $1, flow_status = $2, estado = $3, flow_payment_data = $4,
             fecha_pago = CASE WHEN $5::text = 'pagado' THEN NOW() ELSE fecha_pago END,
             updated_at = NOW()
         WHERE commerce_order = $6
         RETURNING id, comprador_email, comprador_nombre, total`,
        [
            String(payment.flowOrder),
            parseInt(payment.status),
            nuevoEstado,
            JSON.stringify(payment),
            nuevoEstado,
            String(payment.commerceOrder),
        ]
    );

    if (updateResult.rows.length === 0) {
        await db.query(
            'UPDATE flow_webhooks SET processing_error = $1, flow_order = $2 WHERE id = $3',
            ['Order not found', payment.flowOrder, webhookId]
        );
        throw Object.assign(new Error('Pedido no encontrado'), { status: 404 });
    }

    const pedido = updateResult.rows[0];

    // Descontar stock si el pago fue confirmado
    if (payment.status === 2) {
        console.log('✅ Pago confirmado — descontando stock, Pedido #' + pedido.id);
        const itemsResult = await db.query(
            'SELECT producto_id, cantidad FROM pedido_items WHERE pedido_id = $1',
            [pedido.id]
        );
        for (const item of itemsResult.rows) {
            const updated = await db.query(
                `UPDATE productos SET stock = stock - $1, updated_at = NOW()
                 WHERE id = $2 AND stock >= $3
                 RETURNING titulo, stock`,
                [item.cantidad, item.producto_id, item.cantidad]
            );
            if (updated.rows.length === 0) {
                console.warn(`⚠️ Stock insuficiente para producto ${item.producto_id}`);
            }
        }
        invalidateCache();
    }

    // Marcar webhook como procesado
    await db.query(
        `UPDATE flow_webhooks SET processed = true, pedido_id = $1, flow_order = $2, flow_status = $3
         WHERE id = $4`,
        [pedido.id, payment.flowOrder, payment.status, webhookId]
    );

    // Enviar emails según estado
    if (payment.status === 2) {
        const [itemsResult, pedidoCompleto] = await Promise.all([
            db.query('SELECT producto_titulo, cantidad, precio_unitario FROM pedido_items WHERE pedido_id = $1', [pedido.id]),
            db.query('SELECT * FROM pedidos WHERE id = $1', [pedido.id]),
        ]);
        emailService.emailConfirmacionPago(pedidoCompleto.rows[0], itemsResult.rows);
        emailService.emailNuevoPedidoAdmin(pedidoCompleto.rows[0], itemsResult.rows);
    }

    return { pedidoId: pedido.id, estado: nuevoEstado };
}

// ── Estado de pedido (para página de retorno) ─────────────────────────────────

async function getEstadoPedido(pedidoId) {
    const result = await db.query(
        `SELECT p.*,
                json_agg(json_build_object(
                    'titulo',           pi.producto_titulo,
                    'imagen',           pi.producto_imagen,
                    'cantidad',         pi.cantidad,
                    'precio_unitario',  pi.precio_unitario,
                    'subtotal',         pi.subtotal
                )) AS items
         FROM pedidos p
         LEFT JOIN pedido_items pi ON p.id = pi.pedido_id
         WHERE p.id = $1
         GROUP BY p.id`,
        [pedidoId]
    );
    return result.rows[0] || null;
}

module.exports = { crearPago, getPedidoByFlowToken, procesarWebhook, getEstadoPedido };
