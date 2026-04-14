import db from "./db.js";
import logger from "./logger.js";

async function cancelarPedidosAbandonados() {
    try {
        const result = await db.query(
            `SELECT id FROM pedidos
             WHERE estado = 'pendiente'
             AND created_at < NOW() - INTERVAL '24 hours'`
        );

        if (result.rows.length === 0) return;

        logger.info({ count: result.rows.length }, "Cancelando pedidos abandonados");

        for (const { id } of result.rows) {
            await db.query(
                `UPDATE pedidos SET estado = 'cancelado', updated_at = NOW() WHERE id = $1`,
                [id]
            );
            logger.info({ pedidoId: id }, "Pedido cancelado por abandono");
        }
    } catch (error) {
        logger.error({ err: error }, "Error en cleanup de pedidos");
    }
}

function start() {
    cancelarPedidosAbandonados();
    setInterval(cancelarPedidosAbandonados, 60 * 60 * 1000);
    logger.info("Job de limpieza de pedidos activo (cada 1h)");
}

export { start };
export default { start };
