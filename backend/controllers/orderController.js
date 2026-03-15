// backend/controllers/orderController.js
// ✅ SOLO HTTP HANDLING - La lógica está en orderService.js
const orderService = require("../services/orderService");

// ✅ Obtener pedidos
async function getOrders(req, res) {
  try {
    const { userId } = req.query;
    const orders = await orderService.getOrders(userId);
    res.json(orders);
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: "Error al obtener pedidos" });
  }
}

// ✅ Obtener pedido por ID
async function getOrderById(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "ID de pedido requerido" });
    }

    const order = await orderService.getOrderById(id);
    res.json(order);
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(error.message?.includes("no encontrado") ? 404 : 500).json({
      error: error.message || "Error al obtener pedido",
    });
  }
}

// ✅ Actualizar estado del pedido
async function updateOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || !status) {
      return res.status(400).json({ error: "ID y status requeridos" });
    }

    const order = await orderService.updateOrderStatus(id, status);
    res.json({ success: true, data: order });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: "Error al actualizar pedido" });
  }
}

// ✅ Crear pedido
async function createOrder(req, res) {
  try {
    const { userId, items, total, details } = req.body;

    if (!userId || !items || !total) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    const order = await orderService.createOrder(userId, items, total, details);
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: "Error al crear pedido" });
  }
}

module.exports = {
  getOrders,
  getOrderById,
  updateOrderStatus,
  createOrder,
};
