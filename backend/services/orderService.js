const pool = require("../lib/db");

async function getOrders(userId = null) {
    let query = `
        SELECT p.*, 
               json_agg(pi.*) as items
        FROM pedidos p
        LEFT JOIN pedido_items pi ON pi.pedido_id = p.id
    `;
    const params = [];
    if (userId) {
        query += " WHERE p.usuario_id = $1";
        params.push(userId);
    }
    query += " GROUP BY p.id ORDER BY p.created_at DESC";
    const result = await pool.query(query, params);
    return result.rows;
}

async function getMyOrders(usuarioId) {
    const result = await pool.query(
        `SELECT p.*, 
                json_agg(pi.*) as items
         FROM pedidos p
         LEFT JOIN pedido_items pi ON pi.pedido_id = p.id
         WHERE p.usuario_id = $1
         GROUP BY p.id
         ORDER BY p.created_at DESC`,
        [usuarioId]
    );
    return result.rows;
}

async function getOrderById(id, usuarioId = null, esAdmin = false) {
    const result = await pool.query(
        `SELECT p.*,
                json_agg(pi.*) as items
         FROM pedidos p
         LEFT JOIN pedido_items pi ON pi.pedido_id = p.id
         WHERE p.id = $1
         GROUP BY p.id`,
        [id]
    );
    if (!result.rows.length) throw new Error("Pedido no encontrado");
    const pedido = result.rows[0];
    if (!esAdmin && usuarioId && pedido.usuario_id !== usuarioId) {
        throw new Error("No autorizado");
    }
    return pedido;
}

async function updateOrderStatus(id, status) {
    const result = await pool.query(
        "UPDATE pedidos SET estado = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
        [status, id]
    );
    if (!result.rows.length) throw new Error("Pedido no encontrado");
    return result.rows[0];
}

module.exports = { getOrders, getMyOrders, getOrderById, updateOrderStatus };