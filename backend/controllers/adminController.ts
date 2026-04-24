// backend/controllers/adminController.ts
// ✅ SOLO HTTP HANDLING - La lógica está en adminService.ts
import { Request, Response } from "express";
import * as adminService from "../services/adminService.js";
import logger from "../lib/logger.js";
import {
  assertEnum,
  USER_ROLES,
  ORDER_STATES,
} from "../utils/validators.js";

// ✅ Obtener todos los productos (admin)
export async function getAllProducts(req: Request, res: Response): Promise<void> {
  try {
    const products = await adminService.getAllProducts();
    res.json(products);
  } catch (error) {
    logger.error({ err: error }, "Error en adminController");
    res.status(500).json({ error: "Error obteniendo productos" });
  }
}

// ✅ Obtener todos los pedidos
export async function getAllOrders(req: Request, res: Response): Promise<void> {
  try {
    const orders = await adminService.getAllOrders();
    res.json(orders);
  } catch (error) {
    logger.error({ err: error }, "Error en adminController");
    res.status(500).json({ error: "Error obteniendo pedidos" });
  }
}

// ✅ Actualizar estado del pedido
export async function updateOrderStatus(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const { estado, numero_seguimiento } = req.body;

    if (!id) {
      res.status(400).json({ error: "ID requerido" });
      return;
    }
    assertEnum(estado, ORDER_STATES, "estado");

    await adminService.updateOrderStatus(id, estado, numero_seguimiento || null);
    res.json({ ok: true });
  } catch (error: any) {
    logger.error({ err: error }, "Error actualizando pedido");
    res.status(error.status || 500).json({ error: error.message || "Error actualizando pedido" });
  }
}

// ✅ Obtener estadísticas
export async function getStats(req: Request, res: Response): Promise<void> {
  try {
    const stats = await adminService.getStats();
    res.json(stats);
  } catch (error) {
    logger.error({ err: error }, "Error en adminController");
    res.status(500).json({ error: "Error obteniendo estadísticas" });
  }
}

// ✅ Obtener todos los usuarios
export async function getAllUsers(req: Request, res: Response): Promise<void> {
  try {
    const users = await adminService.getAllUsers();
    res.json(users);
  } catch (error) {
    logger.error({ err: error }, "Error en adminController");
    res.status(500).json({ error: "Error obteniendo usuarios" });
  }
}

// ✅ Eliminar usuario
export async function deleteUser(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;

    if (!id) {
      res.status(400).json({ error: "ID de usuario requerido" });
      return;
    }

    await adminService.deleteUser(id);
    res.json({ ok: true, message: "Usuario eliminado" });
  } catch (error) {
    logger.error({ err: error }, "Error en adminController");
    res.status(500).json({ error: "Error eliminando usuario" });
  }
}

// ✅ Actualizar rol de usuario
export async function updateUserRole(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const { rol } = req.body;

    if (!id) {
      res.status(400).json({ error: "ID requerido" });
      return;
    }
    assertEnum(rol, USER_ROLES, "rol");

    const updatedUser = await adminService.updateUserRole(id, rol);
    res.json({ ok: true, user: updatedUser, message: "Rol actualizado" });
  } catch (error: any) {
    logger.error({ err: error }, "Error en adminController");
    res.status(error.status || 500).json({ error: error.message || "Error actualizando rol" });
  }
}
