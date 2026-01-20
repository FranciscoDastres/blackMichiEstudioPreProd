import db from "../db/db.js";

export const getOrders = async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM orders ORDER BY created_at DESC");
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener pedidos" });
    }
};

export const updateOrderStatus = async (req, res) => {
    const { status } = req.body;
    const { id } = req.params;

    try {
        await db.query("UPDATE orders SET status = ? WHERE id = ?", [status, id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar pedido" });
    }
};
