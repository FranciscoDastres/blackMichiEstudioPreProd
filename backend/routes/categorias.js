const express = require('express');
const pool = require('../db/db');
const router = express.Router();

// GET /api/categorias - Obtener todas las categorías
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM categorias ORDER BY nombre ASC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching categorias:', error);
        res.status(500).json({ error: error.message });
    }
});

// ✅ NUEVO ENDPOINT: GET /api/categorias/:id - Obtener productos de una categoría por ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Validar que sea un número
        if (isNaN(id)) {
            return res.status(400).json({ error: 'ID de categoría inválido' });
        }

        // Obtener todos los productos de esa categoría
        const result = await pool.query(
            `SELECT * FROM productos 
       WHERE categoria_id = $1 
       ORDER BY created_at DESC`,
            [id]
        );

        // Devolver array vacío si no hay productos (sin error 404)
        res.json(result.rows || []);
    } catch (error) {
        console.error('Error en GET /categorias/:id:', error);
        res.status(500).json({
            error: 'Error al obtener productos de la categoría',
            details: error.message
        });
    }
});

module.exports = router;
