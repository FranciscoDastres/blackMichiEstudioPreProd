import db from "../lib/db.js";
import * as emailService from "./emailService.js";
import logger from "../lib/logger.js";

export async function getAllProducts() {
    const result = await db.query(`
      SELECT p.*, c.nombre AS categoria_nombre
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      ORDER BY p.created_at DESC
    `);
    return result.rows;
}

export async function getAllOrders() {
    const result = await db.query(`
      SELECT p.*, u.nombre AS usuario_nombre, u.email AS usuario_email
      FROM pedidos p
      LEFT JOIN usuarios u ON p.usuario_id = u.id
      ORDER BY p.created_at DESC
    `);
    return result.rows;
}

export async function updateOrderStatus(id, estado, numero_seguimiento = null) {
    const estadoAnterior = await db.query(
        `SELECT estado FROM pedidos WHERE id = $1`, [id]
    );

    const ahora = new Date();
    await db.query(
        `UPDATE pedidos
         SET estado = $1,
             numero_seguimiento = COALESCE($2, numero_seguimiento),
             fecha_envio    = COALESCE($4, fecha_envio),
             fecha_entrega  = COALESCE($5, fecha_entrega),
             updated_at = NOW()
         WHERE id = $3`,
        [
            estado,
            numero_seguimiento,
            id,
            estado === 'enviado'    ? ahora : null,
            estado === 'entregado'  ? ahora : null,
        ]
    );

    if (estado === 'cancelado' && estadoAnterior.rows.length > 0) {
        const estadosPagados = ['pagado', 'confirmado', 'en_proceso', 'enviado', 'entregado'];
        if (estadosPagados.includes(estadoAnterior.rows[0].estado)) {
            const items = await db.query(
                `SELECT producto_id, cantidad FROM pedido_items WHERE pedido_id = $1`, [id]
            );
            for (const item of items.rows) {
                await db.query(
                    `UPDATE productos SET stock = stock + $1 WHERE id = $2`,
                    [item.cantidad, item.producto_id]
                );
            }
        }
    }

    if (estado === 'enviado' || estado === 'entregado') {
        const result = await db.query(`SELECT * FROM pedidos WHERE id = $1`, [id]);
        if (result.rows.length > 0) {
            try {
                if (estado === 'enviado') await emailService.emailPedidoEnviado(result.rows[0]);
                if (estado === 'entregado') await emailService.emailPedidoEntregado(result.rows[0]);
            } catch (err) {
                logger.error({ err, pedidoId: id, estado }, "Falló email de cambio de estado");
            }
        }
    }

    return { success: true };
}

export async function getStats() {
    const ventasResult = await db.query(`
      SELECT COALESCE(SUM(total), 0) AS total_ventas
      FROM pedidos
      WHERE estado != 'cancelado'
    `);

    const pedidosResult = await db.query(
        `SELECT COUNT(*) AS total_pedidos FROM pedidos`
    );
    const usuariosResult = await db.query(
        `SELECT COUNT(*) AS total_usuarios FROM usuarios`
    );
    const productosResult = await db.query(
        `SELECT COUNT(*) AS total_productos FROM productos`
    );

    return {
        totalVentas: parseFloat(ventasResult.rows[0].total_ventas),
        totalPedidos: parseInt(pedidosResult.rows[0].total_pedidos),
        totalUsuarios: parseInt(usuariosResult.rows[0].total_usuarios),
        totalProductos: parseInt(productosResult.rows[0].total_productos),
    };
}

export async function getAllUsers() {
    const result = await db.query(`
      SELECT id, nombre, email, rol, telefono, activo, created_at
      FROM usuarios
      ORDER BY created_at DESC
    `);
    return result.rows;
}

export async function deleteUser(id) {
    await db.query(`DELETE FROM usuarios WHERE id = $1`, [id]);
    return { success: true };
}

export async function updateUserRole(id, rol) {
    if (!['cliente', 'admin'].includes(rol)) {
        throw new Error("Rol inválido. Debe ser 'cliente' o 'admin'");
    }

    const result = await db.query(
        `UPDATE usuarios SET rol = $1, updated_at = NOW() WHERE id = $2 RETURNING id, nombre, email, rol`,
        [rol, id]
    );

    if (!result.rows.length) {
        throw new Error("Usuario no encontrado");
    }

    return result.rows[0];
}
