// backend/services/featuredService.js
const pool = require("../lib/db");

// ✅ Obtener productos destacados
async function getFeaturedProducts() {
    try {
        const result = await pool.query(`
      SELECT 
        p.id,
        p.titulo,
        p.precio,
        p.imagen_principal,
        f.position
      FROM featured_productos f
      JOIN productos p ON p.id = f.producto_id
      ORDER BY f.position ASC
    `);
        return result.rows;
    } catch (error) {
        throw error;
    }
}

// ✅ Agregar producto destacado
async function addFeaturedProduct(producto_id, position) {
    try {
        await pool.query(
            "INSERT INTO featured_productos (producto_id, position) VALUES ($1, $2)",
            [producto_id, position]
        );
        return { success: true };
    } catch (error) {
        throw error;
    }
}

// ✅ Eliminar producto destacado
async function removeFeaturedProduct(id) {
    try {
        await pool.query("DELETE FROM featured_productos WHERE id = $1", [id]);
        return { success: true };
    } catch (error) {
        throw error;
    }
}

module.exports = {
    getFeaturedProducts,
    addFeaturedProduct,
    removeFeaturedProduct,
};
