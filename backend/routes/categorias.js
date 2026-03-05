const express = require('express');
const pool = require('../lib/db');

const router = express.Router();

// GET /api/categorias - Obtener todas las categorías
router.get('/', async (req, res) => {
    try {
        console.log('🔍 GET /api/categorias - Iniciando...');

        const result = await pool.query(
            'SELECT id, nombre FROM categorias ORDER BY nombre ASC'
        );

        console.log('✅ Categorías encontradas:', result.rows.length);
        res.json(result.rows);
    } catch (error) {
        console.error('❌ Error en GET /categorias:', error);
        res.status(500).json({
            error: 'Error al obtener categorías',
            message: error.message
        });
    }
});

// GET /api/categorias/:id - Obtener productos de una categoría por ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        console.log('🔍 GET /api/categorias/:id - ID:', id);

        // Validar que sea un número
        if (isNaN(id)) {
            console.warn('⚠️ ID inválido:', id);
            return res.status(400).json({ error: 'ID de categoría inválido' });
        }

        // Obtener productos de esa categoría
        const result = await pool.query(
            `SELECT p.id, p.titulo, p.precio, p.imagen_principal, p.categoria_id, p.promedio_calificacion
       FROM productos p
       WHERE p.categoria_id = $1 AND p.activo = true
       ORDER BY p.created_at DESC`,
            [parseInt(id)]
        );

        console.log('✅ Productos encontrados en categoría', id, ':', result.rows.length);
        res.json(result.rows || []);
    } catch (error) {
        console.error('❌ Error en GET /categorias/:id:', error);
        res.status(500).json({
            error: 'Error al obtener productos de la categoría',
            message: error.message
        });
    }
});

module.exports = router;
