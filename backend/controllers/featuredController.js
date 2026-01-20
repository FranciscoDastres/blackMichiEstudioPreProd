const db = require("../lib/db");

// GET destacados
const getFeaturedProductos = async (req, res) => {
    try {
        const result = await db.query(`
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

        res.json(result.rows);
    } catch (error) {
        console.error("Error obteniendo productos destacados:", error);
        res.status(500).json({ message: "Error obteniendo productos destacados" });
    }
};

// POST agregar destacado individual
const addFeaturedProducto = async (req, res) => {
    const { producto_id, position } = req.body;

    try {
        await db.query(
            "INSERT INTO featured_productos (producto_id, position) VALUES ($1, $2)",
            [producto_id, position]
        );

        res.json({ message: "Producto destacado agregado" });
    } catch (error) {
        console.error("Error agregando destacado:", error);
        res.status(500).json({ message: "Error agregando producto destacado" });
    }
};

// DELETE destacado
const removeFeaturedProducto = async (req, res) => {
    const { id } = req.params;

    try {
        await db.query("DELETE FROM featured_productos WHERE id = $1", [id]);
        res.json({ message: "Producto destacado eliminado" });
    } catch (error) {
        console.error("Error eliminando destacado:", error);
        res.status(500).json({ message: "Error eliminando producto destacado" });
    }
};

module.exports = {
    getFeaturedProductos,
    addFeaturedProducto,
    removeFeaturedProducto
};
