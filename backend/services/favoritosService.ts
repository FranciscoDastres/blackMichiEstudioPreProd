import db from "../lib/db.js";

export async function listar(usuarioId: number): Promise<unknown[]> {
    const result = await db.query(
        `SELECT f.id, f.created_at, p.*
           FROM favoritos f
           JOIN productos p ON p.id = f.producto_id
          WHERE f.usuario_id = $1
          ORDER BY f.created_at DESC`,
        [usuarioId]
    );
    return result.rows;
}

export async function listarIds(usuarioId: number): Promise<(number | string)[]> {
    const result = await db.query(
        `SELECT producto_id FROM favoritos WHERE usuario_id = $1`,
        [usuarioId]
    );
    return result.rows.map((r) => r.producto_id);
}

export async function agregar(
    usuarioId: number,
    productoId: number | string
): Promise<{ success: boolean; alreadyExists: boolean }> {
    const prod = await db.query(`SELECT id FROM productos WHERE id = $1`, [productoId]);
    if (!prod.rows.length) {
        throw Object.assign(new Error("Producto no encontrado"), { status: 404 });
    }
    const result = await db.query(
        `INSERT INTO favoritos (usuario_id, producto_id)
         VALUES ($1, $2)
         ON CONFLICT (usuario_id, producto_id) DO NOTHING
         RETURNING id`,
        [usuarioId, productoId]
    );
    return { success: true, alreadyExists: result.rows.length === 0 };
}

export async function quitar(
    usuarioId: number,
    productoId: number | string
): Promise<{ success: boolean; removed: boolean }> {
    const result = await db.query(
        `DELETE FROM favoritos WHERE usuario_id = $1 AND producto_id = $2 RETURNING id`,
        [usuarioId, productoId]
    );
    return { success: true, removed: result.rows.length > 0 };
}

export async function toggle(
    usuarioId: number,
    productoId: number | string
): Promise<{ isFavorite: boolean }> {
    const existing = await db.query(
        `SELECT id FROM favoritos WHERE usuario_id = $1 AND producto_id = $2`,
        [usuarioId, productoId]
    );
    if (existing.rows.length) {
        await db.query(`DELETE FROM favoritos WHERE id = $1`, [existing.rows[0].id]);
        return { isFavorite: false };
    }
    await db.query(
        `INSERT INTO favoritos (usuario_id, producto_id) VALUES ($1, $2)`,
        [usuarioId, productoId]
    );
    return { isFavorite: true };
}
