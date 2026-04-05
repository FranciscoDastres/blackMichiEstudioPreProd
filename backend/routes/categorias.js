const express = require('express');
const pool = require('../lib/db');

const router = express.Router();

// GET /api/categorias
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, nombre FROM categorias ORDER BY nombre ASC'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('❌ Error en GET /categorias:', error);
        res.status(500).json({ error: 'Error al obtener categorías' });
    }
});

// GET /api/categorias/:id — productos activos de esa categoría
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) {
            return res.status(400).json({ error: 'ID de categoría inválido' });
        }

        const result = await pool.query(
            `SELECT p.id, p.titulo, p.precio, p.imagen_principal, p.categoria_id, p.promedio_calificacion
             FROM productos p
             WHERE p.categoria_id = $1 AND p.activo = true
             ORDER BY p.created_at DESC`,
            [parseInt(id)]
        );

        res.json(result.rows);
    } catch (error) {
        console.error('❌ Error en GET /categorias/:id:', error);
        res.status(500).json({ error: 'Error al obtener productos de la categoría' });
    }
});

module.exports = router;
