// backend/services/adminService.js
const pool = require("../lib/db");
const emailService = require("./emailService");

// ✅ Obtener todos los productos (para admin)
async function getAllProducts() {
    try {
        const result = await pool.query(`
      SELECT p.*, c.nombre AS categoria_nombre
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      ORDER BY p.created_at DESC
    `);
        return result.rows;
    } catch (error) {
        throw error;
    }
}

// ✅ Obtener todos los pedidos
async function getAllOrders() {
    try {
        const result = await pool.query(`
      SELECT p.*, u.nombre AS usuario_nombre, u.email AS usuario_email
      FROM pedidos p
      LEFT JOIN usuarios u ON p.usuario_id = u.id
      ORDER BY p.created_at DESC
    `);
        return result.rows;
    } catch (error) {
        throw error;
    }
}

// ✅ Actualizar estado del pedido
async function updateOrderStatus(id, estado, numero_seguimiento = null) {
    try {
        // Obtener estado actual antes de actualizar (para decidir si reponer stock)
        const estadoAnterior = await pool.query(
            `SELECT estado FROM pedidos WHERE id = $1`, [id]
        );

        const ahora = new Date();
        await pool.query(
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

        // Reponer stock solo si el pedido ya fue pagado (stock fue decrementado al confirmar pago)
        if (estado === 'cancelado' && estadoAnterior.rows.length > 0) {
            const estadosPagados = ['pagado', 'confirmado', 'en_proceso', 'enviado', 'entregado'];
            if (estadosPagados.includes(estadoAnterior.rows[0].estado)) {
                const items = await pool.query(
                    `SELECT producto_id, cantidad FROM pedido_items WHERE pedido_id = $1`, [id]
                );
                for (const item of items.rows) {
                    await pool.query(
                        `UPDATE productos SET stock = stock + $1 WHERE id = $2`,
                        [item.cantidad, item.producto_id]
                    );
                }
            }
        }

        // Email al comprador cuando se marca como enviado
        if (estado === 'enviado') {
            const result = await pool.query(`SELECT * FROM pedidos WHERE id = $1`, [id]);
            if (result.rows.length > 0) {
                emailService.emailPedidoEnviado(result.rows[0]);
            }
        }

        return { success: true };
    } catch (error) {
        throw error;
    }
}

// ✅ Obtener estadísticas
async function getStats() {
    try {
        const ventasResult = await pool.query(`
      SELECT COALESCE(SUM(total), 0) AS total_ventas
      FROM pedidos
      WHERE estado != 'cancelado'
    `);

        const pedidosResult = await pool.query(
            `SELECT COUNT(*) AS total_pedidos FROM pedidos`
        );
        const usuariosResult = await pool.query(
            `SELECT COUNT(*) AS total_usuarios FROM usuarios`
        );
        const productosResult = await pool.query(
            `SELECT COUNT(*) AS total_productos FROM productos`
        );

        return {
            totalVentas: parseFloat(ventasResult.rows[0].total_ventas),
            totalPedidos: parseInt(pedidosResult.rows[0].total_pedidos),
            totalUsuarios: parseInt(usuariosResult.rows[0].total_usuarios),
            totalProductos: parseInt(productosResult.rows[0].total_productos),
        };
    } catch (error) {
        throw error;
    }
}

// ✅ Obtener todos los usuarios
async function getAllUsers() {
    try {
        const result = await pool.query(`
      SELECT id, nombre, email, rol, telefono, activo, created_at
      FROM usuarios
      ORDER BY created_at DESC
    `);
        return result.rows;
    } catch (error) {
        throw error;
    }
}

// ✅ Eliminar usuario
async function deleteUser(id) {
    try {
        await pool.query(`DELETE FROM usuarios WHERE id = $1`, [id]);
        return { success: true };
    } catch (error) {
        throw error;
    }
}

// ✅ Actualizar rol de usuario
async function updateUserRole(id, rol) {
    try {
        if (!['cliente', 'admin'].includes(rol)) {
            throw new Error("Rol inválido. Debe ser 'cliente' o 'admin'");
        }

        const result = await pool.query(
            `UPDATE usuarios SET rol = $1, updated_at = NOW() WHERE id = $2 RETURNING id, nombre, email, rol`,
            [rol, id]
        );

        if (!result.rows.length) {
            throw new Error("Usuario no encontrado");
        }

        return result.rows[0];
    } catch (error) {
        throw error;
    }
}

module.exports = {
    getAllProducts,
    getAllOrders,
    updateOrderStatus,
    getStats,
    getAllUsers,
    deleteUser,
    updateUserRole,
};
