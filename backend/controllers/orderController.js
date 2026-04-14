import * as orderService from "../services/orderService.js";

export async function getOrders(req, res) {
  try {
    const orders = await orderService.getOrders();
    res.json(orders);
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: "Error al obtener pedidos" });
  }
}

export async function getMyOrders(req, res) {
  try {
    const usuarioId = req.user.id; // viene del middleware auth
    const orders = await orderService.getMyOrders(usuarioId);
    res.json(orders);
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: "Error al obtener tus pedidos" });
  }
}

export async function getOrderById(req, res) {
  try {
    const esAdmin = req.user?.rol === 'admin';
    const order = await orderService.getOrderById(req.params.id, req.user?.id, esAdmin);
    res.json(order);
  } catch (error) {
    const status = error.message === "No autorizado" ? 403 : 404;
    res.status(status).json({ error: error.message });
  }
}

export async function updateOrderStatus(req, res) {
  try {
    const { estado } = req.body;
    const order = await orderService.updateOrderStatus(req.params.id, estado);
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar pedido" });
  }
}
