import db from "../lib/db.js";

export async function getFeaturedProducts(): Promise<unknown[]> {
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
    return result.rows;
}

export async function addFeaturedProduct(
    producto_id: number | string,
    position: number
): Promise<{ success: boolean }> {
    await db.query(
        "INSERT INTO featured_productos (producto_id, position) VALUES ($1, $2)",
        [producto_id, position]
    );
    return { success: true };
}

export async function removeFeaturedProduct(id: number | string): Promise<{ success: boolean }> {
    await db.query("DELETE FROM featured_productos WHERE id = $1", [id]);
    return { success: true };
}
