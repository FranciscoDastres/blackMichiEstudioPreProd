// lib/cleanupJobs.js
// Cancela pedidos pendientes con más de 24h (sin tocar stock — nunca fue decrementado)
const db = require("./db");

async function cancelarPedidosAbandonados() {
    try {
        // Buscar pedidos pendientes con más de 24h
        const result = await db.query(
            `SELECT id FROM pedidos
             WHERE estado = 'pendiente'
             AND created_at < NOW() - INTERVAL '24 hours'`
        );

        if (result.rows.length === 0) return;

        console.log(`🧹 Cancelando ${result.rows.length} pedido(s) abandonado(s)...`);

        for (const { id } of result.rows) {
            // Cancelar el pedido (sin reponer stock — estos pedidos nunca fueron pagados,
            // por lo tanto el stock nunca fue decrementado)
            await db.query(
                `UPDATE pedidos SET estado = 'cancelado', updated_at = NOW() WHERE id = $1`,
                [id]
            );

            console.log(`✅ Pedido #${id} cancelado`);
        }
    } catch (error) {
        console.error("❌ Error en cleanup de pedidos:", error.message);
    }
}

function start() {
    // Ejecutar al arrancar y luego cada hora
    cancelarPedidosAbandonados();
    setInterval(cancelarPedidosAbandonados, 60 * 60 * 1000);
    console.log("🧹 Job de limpieza de pedidos activo (cada 1h)");
}

module.exports = { start };
