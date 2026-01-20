const pool = require("../lib/db");

// =======================================================
// 📌 ADMIN - OBTENER TODOS LOS PRODUCTOS (Dashboard)
// =======================================================

exports.getAllProducts = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT p.*, c.nombre AS categoria_nombre
            FROM productos p
            LEFT JOIN categorias c ON p.categoria_id = c.id
            ORDER BY p.created_at DESC
        `);

        res.json(result.rows);
    } catch (error) {
        console.error("❌ Error obteniendo productos:", error);
        res.status(500).json({ error: "Error obteniendo productos" });
    }
};

// =======================================================
// 📌 ADMIN - PEDIDOS
// =======================================================

exports.getAllOrders = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT p.*, u.nombre AS usuario_nombre, u.email AS usuario_email
            FROM pedidos p
            LEFT JOIN usuarios u ON p.usuario_id = u.id
            ORDER BY p.created_at DESC
        `);

        res.json(result.rows);
    } catch (error) {
        console.error("❌ Error obteniendo pedidos:", error);
        res.status(500).json({ error: "Error obteniendo pedidos" });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;

        await pool.query(
            `UPDATE pedidos SET estado = $1 WHERE id = $2`,
            [estado, id]
        );

        res.json({ ok: true });
    } catch (error) {
        console.error("❌ Error actualizando estado del pedido:", error);
        res.status(500).json({ error: "Error actualizando pedido" });
    }
};

// =======================================================
// 📌 ADMIN - ESTADÍSTICAS
// =======================================================

exports.getStats = async (req, res) => {
    try {
        const ventasResult = await pool.query(`
            SELECT COALESCE(SUM(total), 0) AS total_ventas
            FROM pedidos
            WHERE estado != 'cancelado'
        `);

        const pedidosResult = await pool.query(`SELECT COUNT(*) AS total_pedidos FROM pedidos`);
        const usuariosResult = await pool.query(`SELECT COUNT(*) AS total_usuarios FROM usuarios`);
        const productosResult = await pool.query(`SELECT COUNT(*) AS total_productos FROM productos`);

        res.json({
            totalVentas: parseFloat(ventasResult.rows[0].total_ventas),
            totalPedidos: parseInt(pedidosResult.rows[0].total_pedidos),
            totalUsuarios: parseInt(usuariosResult.rows[0].total_usuarios),
            totalProductos: parseInt(productosResult.rows[0].total_productos)
        });

    } catch (error) {
        console.error("❌ Error obteniendo estadísticas:", error);
        res.status(500).json({ error: "Error obteniendo estadísticas" });
    }
};

// =======================================================
// 📌 ADMIN - USUARIOS
// =======================================================

exports.getAllUsers = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id, nombre, email, rol, created_at
            FROM usuarios
            ORDER BY created_at DESC
        `);

        res.json(result.rows);

    } catch (error) {
        console.error("❌ Error obteniendo usuarios:", error);
        res.status(500).json({ error: "Error obteniendo usuarios" });
    }
};

exports.updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { rol } = req.body;

        await pool.query(
            `UPDATE usuarios SET rol = $1 WHERE id = $2`,
            [rol, id]
        );

        res.json({ ok: true });

    } catch (error) {
        console.error("❌ Error actualizando rol del usuario:", error);
        res.status(500).json({ error: "Error actualizando usuario" });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        await pool.query(`DELETE FROM usuarios WHERE id = $1`, [id]);

        res.json({ ok: true });

    } catch (error) {
        console.error("❌ Error eliminando usuario:", error);
        res.status(500).json({ error: "Error eliminando usuario" });
    }
};
