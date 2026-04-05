// backend/controllers/adminController.js
// ✅ SOLO HTTP HANDLING - La lógica está en adminService.js
const adminService = require("../services/adminService");

// ✅ Obtener todos los productos (admin)
async function getAllProducts(req, res) {
  try {
    const products = await adminService.getAllProducts();
    res.json(products);
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: "Error obteniendo productos" });
  }
}

// ✅ Obtener todos los pedidos
async function getAllOrders(req, res) {
  try {
    const orders = await adminService.getAllOrders();
    res.json(orders);
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: "Error obteniendo pedidos" });
  }
}

// ✅ Actualizar estado del pedido
async function updateOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const { estado, numero_seguimiento } = req.body;

    if (!id || !estado) {
      return res.status(400).json({ error: "ID y estado requeridos" });
    }

    await adminService.updateOrderStatus(id, estado, numero_seguimiento || null);
    res.json({ ok: true });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: "Error actualizando pedido" });
  }
}

// ✅ Obtener estadísticas
async function getStats(req, res) {
  try {
    const stats = await adminService.getStats();
    res.json(stats);
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: "Error obteniendo estadísticas" });
  }
}

// ✅ Obtener todos los usuarios
async function getAllUsers(req, res) {
  try {
    const users = await adminService.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: "Error obteniendo usuarios" });
  }
}

// ✅ Eliminar usuario
async function deleteUser(req, res) {
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
async function updateUserRole(req, res) {
  try {
    const { id } = req.params;
    const { rol } = req.body;

    if (!id || !rol) {
      return res.status(400).json({ error: "ID y rol requeridos" });
    }

    const updatedUser = await adminService.updateUserRole(id, rol);
    res.json({ ok: true, user: updatedUser, message: "Rol actualizado" });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: error.message || "Error actualizando rol" });
  }
}

module.exports = {
  getAllProducts,
  getAllOrders,
  updateOrderStatus,
  getStats,
  getAllUsers,
  deleteUser,
  updateUserRole,
};
