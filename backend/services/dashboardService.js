// backend/services/dashboardService.js
const pool = require("../lib/db");

// ✅ Obtener estadísticas del dashboard
async function getDashboardStats() {
    try {
        const [totalUsuarios, ultimosCinco, totalVentas, totalPedidos] = await Promise.all([
            pool.query("SELECT COUNT(*) FROM usuarios"),
            pool.query(
                "SELECT id, nombre, email, created_at FROM usuarios ORDER BY created_at DESC LIMIT 5"
            ),
            pool.query(
                "SELECT COALESCE(SUM(total), 0) AS total FROM pedidos WHERE estado != 'cancelado'"
            ),
            pool.query("SELECT COUNT(*) FROM pedidos"),
        ]);

        return {
            contador: {
                usuarios: parseInt(totalUsuarios.rows[0].count),
                ventas: parseFloat(totalVentas.rows[0].total),
                pedidos: parseInt(totalPedidos.rows[0].count),
                online: Math.floor(Math.random() * 10), // Simulación
            },
            recientes: ultimosCinco.rows,
            graficaData: [12, 19, 3, 5, 2, 3, 15],
        };
    } catch (error) {
        throw error;
    }
}

module.exports = {
    getDashboardStats,
};
