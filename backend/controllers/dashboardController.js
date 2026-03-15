// backend/controllers/dashboardController.js
// ✅ SOLO HTTP HANDLING - La lógica está en dashboardService.js
const dashboardService = require("../services/dashboardService");

async function obtenerEstadisticas(req, res) {
  try {
    const stats = await dashboardService.getDashboardStats();

    res.status(200).json({
      ok: true,
      msg: "Estadísticas cargadas correctamente",
      data: stats,
    });
  } catch (error) {
    console.error("❌ Error en el Dashboard:", error);
    res.status(500).json({
      ok: false,
      msg: "Error al consultar la base de datos",
    });
  }
}

module.exports = {
  obtenerEstadisticas,
};
