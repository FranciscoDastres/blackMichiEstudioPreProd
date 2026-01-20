const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Cuando el frontend pida GET /api/dashboard, se ejecuta la función del controlador
router.get('/', dashboardController.obtenerEstadisticas);

module.exports = router;