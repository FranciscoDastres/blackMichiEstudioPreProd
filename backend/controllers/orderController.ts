// backend/controllers/orderController.ts
import { Request, Response } from "express";
import * as orderService from "../services/orderService.js";
import logger from "../lib/logger.js";

export async function getOrders(req: Request, res: Response): Promise<void> {
  try {
    const orders = await orderService.getOrders();
    res.json(orders);
  } catch (error) {
    logger.error({ err: error }, "Error en orderController");
    res.status(500).json({ error: "Error al obtener pedidos" });
  }
}

export async function getMyOrders(req: Request, res: Response): Promise<void> {
  try {
    const usuarioId = req.user!.id; // viene del middleware auth
    const orders = await orderService.getMyOrders(usuarioId);
    res.json(orders);
  } catch (error) {
    logger.error({ err: error }, "Error en orderController");
    res.status(500).json({ error: "Error al obtener tus pedidos" });
  }
}

export async function getOrderById(req: Request, res: Response): Promise<void> {
  try {
    const esAdmin = req.user?.rol === "admin";
    const order = await orderService.getOrderById(req.params.id as string, req.user?.id, esAdmin);
    res.json(order);
  } catch (error: any) {
    const status = error.message === "No autorizado" ? 403 : 404;
    res.status(status).json({ error: error.message });
  }
}

export async function updateOrderStatus(req: Request, res: Response): Promise<void> {
  try {
    const { estado } = req.body;
    const order = await orderService.updateOrderStatus(req.params.id as string, estado);
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar pedido" });
  }
}
