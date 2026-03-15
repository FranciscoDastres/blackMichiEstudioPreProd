// backend/services/orderService.js
const pool = require("../lib/db");

// ✅ Obtener todos los pedidos
async function getOrders(userId = null) {
    try {
        let query = "SELECT * FROM orders";
        const params = [];

        if (userId) {
            query += " WHERE user_id = $1";
            params.push(userId);
        }

        query += " ORDER BY created_at DESC";

        const result = await pool.query(query, params);
        return result.rows;
    } catch (error) {
        throw error;
    }
}

// ✅ Obtener un pedido por ID
async function getOrderById(id) {
    try {
        const result = await pool.query("SELECT * FROM orders WHERE id = $1", [id]);

        if (!result.rows.length) {
            throw new Error("Pedido no encontrado");
        }

        return result.rows[0];
    } catch (error) {
        throw error;
    }
}

// ✅ Actualizar estado del pedido
async function updateOrderStatus(id, status) {
    try {
        const result = await pool.query(
            "UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
            [status, id]
        );

        if (!result.rows.length) {
            throw new Error("Pedido no encontrado");
        }

        return result.rows[0];
    } catch (error) {
        throw error;
    }
}

// ✅ Crear pedido
async function createOrder(userId, items, total, details) {
    try {
        const result = await pool.query(
            `INSERT INTO orders (user_id, items, total, status, details, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING *`,
            [userId, JSON.stringify(items), total, "pendiente", JSON.stringify(details)]
        );

        return result.rows[0];
    } catch (error) {
        throw error;
    }
}

module.exports = {
    getOrders,
    getOrderById,
    updateOrderStatus,
    createOrder,
};
