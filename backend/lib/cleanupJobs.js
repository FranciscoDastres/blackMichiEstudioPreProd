import db from "./db.js";

async function cancelarPedidosAbandonados() {
    try {
        const result = await db.query(
            `SELECT id FROM pedidos
             WHERE estado = 'pendiente'
             AND created_at < NOW() - INTERVAL '24 hours'`
        );

        if (result.rows.length === 0) return;

        console.log(`🧹 Cancelando ${result.rows.length} pedido(s) abandonado(s)...`);

        for (const { id } of result.rows) {
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
    cancelarPedidosAbandonados();
    setInterval(cancelarPedidosAbandonados, 60 * 60 * 1000);
    console.log("🧹 Job de limpieza de pedidos activo (cada 1h)");
}

export { start };
export default { start };
