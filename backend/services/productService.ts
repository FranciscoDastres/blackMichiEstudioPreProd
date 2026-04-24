import db from "../lib/db.js";
import * as cloudinaryService from "./cloudinaryService.js";
import logger from "../lib/logger.js";

// ===============================
// CACHE SIMPLE (30 segundos)
// ===============================
interface ProductCache {
    products: unknown[] | null;
    timestamp: number;
    ttl: number;
}

const cache: ProductCache = {
    products: null,
    timestamp: 0,
    ttl: 30 * 1000,
};

export const invalidateCache = (): void => {
    cache.products = null;
    cache.timestamp = 0;
};

// ===============================
// HELPER: Extraer public_id de URL de Cloudinary
// ===============================
export const extractPublicId = (url: string | null | undefined): string | null => {
    if (!url || !url.includes("cloudinary.com")) return null;
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/);
    return match ? match[1] : null;
};

// ===============================
// HELPER: Borrar lista de URLs de Cloudinary (silencioso)
// ===============================
const deleteCloudinaryImages = async (urls: (string | null | undefined)[] = []): Promise<void> => {
    const validUrls = urls.filter(Boolean) as string[];
    if (!validUrls.length) return;

    await Promise.allSettled(
        validUrls.map((url) => {
            const publicId = extractPublicId(url);
            if (!publicId) return Promise.resolve();
            return cloudinaryService.deleteFile(publicId).catch((err) =>
                logger.warn({ publicId, err }, "No se pudo eliminar de Cloudinary")
            );
        })
    );
};

export async function createProduct(
    nombre: string,
    precio: number | string,
    stock: number | string,
    categoria: string | null,
    descripcion: string | null,
    files: Express.Multer.File[] | undefined
): Promise<{ success: boolean }> {
    let imagenPrincipal: string | null = null;
    let imagenesAdicionales: string[] = [];

    if (files?.length) {
        const productSlug = nombre.toLowerCase().replace(/\s+/g, "-");

        const main = await cloudinaryService.uploadProductImage(
            files[0].buffer,
            productSlug
        );
        imagenPrincipal = main.images.card;

        if (files.length > 1) {
            const uploads = await Promise.all(
                files.slice(1).map((file) =>
                    cloudinaryService.uploadProductImage(file.buffer, productSlug)
                )
            );
            imagenesAdicionales = uploads.map((u) => u.images.card);
        }
    }

    const slug = nombre
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

    let categoriaId: number | null = null;
    if (categoria) {
        const result = await db.query(
            `INSERT INTO categorias(nombre)
                 VALUES($1)
                 ON CONFLICT(nombre)
                 DO UPDATE SET nombre = EXCLUDED.nombre
                 RETURNING id`,
            [categoria]
        );
        categoriaId = result.rows[0].id;
    }

    await db.query(
        `INSERT INTO productos
             (titulo, slug, precio, descripcion, imagen_principal, imagenes_adicionales, categoria_id, stock, activo)
             VALUES($1, $2, $3, $4, $5, $6, $7, $8, true)`,
        [
            nombre,
            slug,
            Number(precio),
            descripcion || null,
            imagenPrincipal,
            imagenesAdicionales.length ? imagenesAdicionales : null,
            categoriaId,
            Number(stock),
        ]
    );

    invalidateCache();
    return { success: true };
}

export async function updateProduct(
    id: number | string,
    titulo: string,
    precio: number | string,
    stock: number | string,
    categoria: string | null,
    descripcion: string | null,
    files: Express.Multer.File[] | undefined
): Promise<unknown> {
    const productResult = await db.query(
        "SELECT * FROM productos WHERE id=$1",
        [id]
    );

    if (!productResult.rows.length) {
        throw new Error("Producto no encontrado");
    }

    const existing = productResult.rows[0];
    let imagenPrincipal: string = existing.imagen_principal;
    let imagenesAdicionales: string[] = existing.imagenes_adicionales || [];

    if (files?.length) {
        const productSlug = titulo.toLowerCase().replace(/\s+/g, "-");

        const oldUrls: (string | null)[] = [
            existing.imagen_principal,
            ...(existing.imagenes_adicionales || []),
        ];

        const main = await cloudinaryService.uploadProductImage(
            files[0].buffer,
            productSlug
        );
        imagenPrincipal = main.images.card;

        imagenesAdicionales = [];
        if (files.length > 1) {
            const uploads = await Promise.all(
                files.slice(1).map((file) =>
                    cloudinaryService.uploadProductImage(file.buffer, productSlug)
                )
            );
            imagenesAdicionales = uploads.map((u) => u.images.card);
        }

        await deleteCloudinaryImages(oldUrls);
    }

    const slug = titulo
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

    let categoriaId: number | null = null;
    if (categoria) {
        const result = await db.query(
            `INSERT INTO categorias(nombre)
                 VALUES($1)
                 ON CONFLICT(nombre)
                 DO UPDATE SET nombre = EXCLUDED.nombre
                 RETURNING id`,
            [categoria]
        );
        categoriaId = result.rows[0].id;
    }

    const result = await db.query(
        `UPDATE productos
             SET titulo=$1,
                 slug=$2,
                 precio=$3,
                 descripcion=$4,
                 imagen_principal=$5,
                 imagenes_adicionales=$6,
                 categoria_id=$7,
                 stock=$8,
                 updated_at=NOW()
             WHERE id=$9
             RETURNING *`,
        [
            titulo,
            slug,
            Number(precio),
            descripcion || null,
            imagenPrincipal,
            imagenesAdicionales.length ? imagenesAdicionales : null,
            categoriaId,
            Number(stock),
            id,
        ]
    );

    invalidateCache();
    return result.rows[0];
}

export async function deleteProduct(id: number | string): Promise<{ success: boolean }> {
    const productResult = await db.query(
        "SELECT imagen_principal, imagenes_adicionales, categoria_id FROM productos WHERE id=$1",
        [id]
    );

    if (!productResult.rows.length) {
        throw new Error("Producto no encontrado");
    }

    const { imagen_principal, imagenes_adicionales, categoria_id } = productResult.rows[0];

    const allUrls: (string | null)[] = [imagen_principal, ...(imagenes_adicionales || [])];
    await deleteCloudinaryImages(allUrls);

    await db.query("DELETE FROM productos WHERE id=$1", [id]);

    if (categoria_id) {
        const remaining = await db.query(
            "SELECT COUNT(*) FROM productos WHERE categoria_id=$1",
            [categoria_id]
        );
        if (parseInt(remaining.rows[0].count) === 0) {
            await db.query("DELETE FROM categorias WHERE id=$1", [categoria_id]);
            logger.info({ categoriaId: categoria_id }, "Categoría eliminada por quedar sin productos");
        }
    }

    invalidateCache();
    return { success: true };
}

export async function getAllProducts(): Promise<unknown[]> {
    const now = Date.now();

    if (cache.products && now - cache.timestamp < cache.ttl) {
        return cache.products;
    }

    const result = await db.query(`
            SELECT p.*, c.nombre categoria_nombre
            FROM productos p
            LEFT JOIN categorias c ON p.categoria_id = c.id
            WHERE p.activo = true
            ORDER BY p.created_at DESC
        `);

    cache.products = result.rows;
    cache.timestamp = now;

    return result.rows;
}

export interface SearchProductsParams {
    q?: string;
    categoriaId?: number | string;
    min?: number | string;
    max?: number | string;
    limit?: number | string;
}

export async function searchProducts({
    q,
    categoriaId,
    min,
    max,
    limit,
}: SearchProductsParams = {}): Promise<unknown[]> {
    const conditions = ["p.activo = true"];
    const values: unknown[] = [];
    let i = 1;

    if (q && typeof q === "string" && q.trim().length) {
        values.push(`%${q.trim().toLowerCase()}%`);
        conditions.push(`(LOWER(p.titulo) LIKE $${i} OR LOWER(p.descripcion) LIKE $${i})`);
        i++;
    }
    if (categoriaId != null && !Number.isNaN(Number(categoriaId))) {
        values.push(Number(categoriaId));
        conditions.push(`p.categoria_id = $${i}`);
        i++;
    }
    if (min != null && !Number.isNaN(Number(min))) {
        values.push(Number(min));
        conditions.push(`p.precio >= $${i}`);
        i++;
    }
    if (max != null && !Number.isNaN(Number(max))) {
        values.push(Number(max));
        conditions.push(`p.precio <= $${i}`);
        i++;
    }

    let sql = `SELECT p.*, c.nombre AS categoria_nombre
                 FROM productos p
                 LEFT JOIN categorias c ON p.categoria_id = c.id
                WHERE ${conditions.join(" AND ")}
                ORDER BY p.created_at DESC`;

    if (limit != null && !Number.isNaN(Number(limit))) {
        values.push(Number(limit));
        sql += ` LIMIT $${i}`;
    }

    const result = await db.query(sql, values);
    return result.rows;
}

export async function getProductById(id: number | string): Promise<unknown> {
    const result = await db.query(
        `SELECT p.*, c.nombre categoria_nombre
             FROM productos p
             LEFT JOIN categorias c ON p.categoria_id = c.id
             WHERE p.id=$1`,
        [id]
    );

    if (!result.rows.length) {
        throw new Error("Producto no encontrado");
    }

    return result.rows[0];
}
