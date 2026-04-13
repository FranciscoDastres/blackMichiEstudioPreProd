// backend/controllers/adminController.js
// ✅ SOLO HTTP HANDLING - La lógica está en adminService.js
import * as adminService from "../services/adminService.js";
import {
  assertEnum,
  USER_ROLES,
  ORDER_STATES,
} from "../utils/validators.js";

// ✅ Obtener todos los productos (admin)
export async function getAllProducts(req, res) {
  try {
    const products = await adminService.getAllProducts();
    res.json(products);
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: "Error obteniendo productos" });
  }
}

// ✅ Obtener todos los pedidos
export async function getAllOrders(req, res) {
  try {
    const orders = await adminService.getAllOrders();
    res.json(orders);
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: "Error obteniendo pedidos" });
  }
}

// ✅ Actualizar estado del pedido
export async function updateOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const { estado, numero_seguimiento } = req.body;

    if (!id) return res.status(400).json({ error: "ID requerido" });
    assertEnum(estado, ORDER_STATES, "estado");

    await adminService.updateOrderStatus(id, estado, numero_seguimiento || null);
    res.json({ ok: true });
  } catch (error) {
    console.error("❌ Error actualizando pedido:", error);
    res.status(error.status || 500).json({ error: error.message || "Error actualizando pedido" });
  }
}

// ✅ Obtener estadísticas
export async function getStats(req, res) {
  try {
    const stats = await adminService.getStats();
    res.json(stats);
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: "Error obteniendo estadísticas" });
  }
}

// ✅ Obtener todos los usuarios
export async function getAllUsers(req, res) {
  try {
    const users = await adminService.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: "Error obteniendo usuarios" });
  }
}

// ✅ Eliminar usuario
export async function deleteUser(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "ID de usuario requerido" });
    }

    await adminService.deleteUser(id);
    res.json({ ok: true, message: "Usuario eliminado" });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: "Error eliminando usuario" });
  }
}

// ✅ Actualizar rol de usuario
export async function updateUserRole(req, res) {
  try {
    const { id } = req.params;
    const { rol } = req.body;

    if (!id) return res.status(400).json({ error: "ID requerido" });
    assertEnum(rol, USER_ROLES, "rol");

    const updatedUser = await adminService.updateUserRole(id, rol);
    res.json({ ok: true, user: updatedUser, message: "Rol actualizado" });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(error.status || 500).json({ error: error.message || "Error actualizando rol" });
  }
}
