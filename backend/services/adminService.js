// backend/services/adminService.js
const pool = require("../lib/db");

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
async function updateOrderStatus(id, estado) {
    try {
        await pool.query(
            `UPDATE pedidos SET estado = $1, updated_at = NOW() WHERE id = $2`,
            [estado, id]
        );
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
      SELECT id, nombre, email, rol, created_at
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

module.exports = {
    getAllProducts,
    getAllOrders,
    updateOrderStatus,
    getStats,
    getAllUsers,
    deleteUser,
};
