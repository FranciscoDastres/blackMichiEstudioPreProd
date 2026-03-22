const orderService = require("../services/orderService");

async function getOrders(req, res) {
  try {
    const orders = await orderService.getOrders();
    res.json(orders);
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: "Error al obtener pedidos" });
  }
}

async function getMyOrders(req, res) {
  try {
    const usuarioId = req.user.id; // viene del middleware auth
    const orders = await orderService.getMyOrders(usuarioId);
    res.json(orders);
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: "Error al obtener tus pedidos" });
  }
}

async function getOrderById(req, res) {
  try {
    const order = await orderService.getOrderById(req.params.id);
    res.json(order);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
}

async function updateOrderStatus(req, res) {
  try {
    const { estado } = req.body;
    const order = await orderService.updateOrderStatus(req.params.id, estado);
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar pedido" });
  }
}

module.exports = { getOrders, getMyOrders, getOrderById, updateOrderStatus };