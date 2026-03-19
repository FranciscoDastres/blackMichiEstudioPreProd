// backend/services/productService.js
const pool = require("../lib/db");
const cloudinaryService = require("./cloudinaryService");

// ===============================
// CACHE SIMPLE (5 minutos)
// ===============================
const cache = {
    products: null,
    timestamp: 0,
    ttl: 5 * 60 * 1000,
};

const invalidateCache = () => {
    cache.products = null;
    cache.timestamp = 0;
};

// ===============================
// HELPER: Extraer public_id de URL de Cloudinary
// Ejemplo: https://res.cloudinary.com/demo/image/upload/v123/blackmichi/productos/zapatilla/123-card.webp
// →        blackmichi/productos/zapatilla/123-card
// ===============================
const extractPublicId = (url) => {
    if (!url || !url.includes("cloudinary.com")) return null;
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/);
    return match ? match[1] : null;
};

// ===============================
// HELPER: Borrar lista de URLs de Cloudinary (silencioso)
// ===============================
const deleteCloudinaryImages = async (urls = []) => {
    const validUrls = urls.filter(Boolean);
    if (!validUrls.length) return;

    await Promise.allSettled(
        validUrls.map((url) => {
            const publicId = extractPublicId(url);
            if (!publicId) return Promise.resolve();
            return cloudinaryService.deleteFile(publicId).catch((err) =>
                console.warn(`⚠️ No se pudo eliminar de Cloudinary (${publicId}):`, err.message)
            );
        })
    );
};

// ===============================
// ✅ Crear producto con imágenes
// ===============================
async function createProduct(nombre, precio, stock, categoria, descripcion, files) {
    try {
        let imagenPrincipal = null;
        let imagenesAdicionales = [];

        if (files?.length) {
            const productSlug = nombre.toLowerCase().replace(/\s+/g, "-");

            // Imagen principal → usamos .card (600px)
            const main = await cloudinaryService.uploadProductImage(
                files[0].buffer,
                productSlug
            );
            imagenPrincipal = main.images.card;

            // Imágenes adicionales
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

        let categoriaId = null;
        if (categoria) {
            const result = await pool.query(
                `INSERT INTO categorias(nombre)
                 VALUES($1)
                 ON CONFLICT(nombre)
                 DO UPDATE SET nombre = EXCLUDED.nombre
                 RETURNING id`,
                [categoria]
            );
            categoriaId = result.rows[0].id;
        }

        await pool.query(
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
    } catch (error) {
        throw error;
    }
}

// ===============================
// ✅ Actualizar producto
// ===============================
async function updateProduct(id, titulo, precio, stock, categoria, descripcion, files) {
    try {
        const productResult = await pool.query(
            "SELECT * FROM productos WHERE id=$1",
            [id]
        );

        if (!productResult.rows.length) {
            throw new Error("Producto no encontrado");
        }

        const existing = productResult.rows[0];
        let imagenPrincipal = existing.imagen_principal;
        let imagenesAdicionales = existing.imagenes_adicionales || [];

        if (files?.length) {
            const productSlug = titulo.toLowerCase().replace(/\s+/g, "-");

            // Guardar URLs antiguas para borrar después
            const oldUrls = [
                existing.imagen_principal,
                ...(existing.imagenes_adicionales || []),
            ];

            // Subir nuevas imágenes
            const main = await cloudinaryService.uploadProductImage(
                files[0].buffer,
                productSlug
            );
            imagenPrincipal = main.images.card; // ✅ corregido (antes era u.publicUrl)

            imagenesAdicionales = [];
            if (files.length > 1) {
                const uploads = await Promise.all(
                    files.slice(1).map((file) =>
                        cloudinaryService.uploadProductImage(file.buffer, productSlug)
                    )
                );
                imagenesAdicionales = uploads.map((u) => u.images.card); // ✅ corregido
            }

            // Borrar imágenes antiguas de Cloudinary (sin bloquear si falla)
            await deleteCloudinaryImages(oldUrls);
        }

        const slug = titulo
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "");

        let categoriaId = null;
        if (categoria) {
            const result = await pool.query(
                `INSERT INTO categorias(nombre)
                 VALUES($1)
                 ON CONFLICT(nombre)
                 DO UPDATE SET nombre = EXCLUDED.nombre
                 RETURNING id`,
                [categoria]
            );
            categoriaId = result.rows[0].id;
        }

        const result = await pool.query(
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
    } catch (error) {
        throw error;
    }
}

// ===============================
// ✅ Eliminar producto (+ imágenes de Cloudinary)
// ===============================
async function deleteProduct(id) {
    try {
        // Obtener URLs antes de borrar
        const productResult = await pool.query(
            "SELECT imagen_principal, imagenes_adicionales FROM productos WHERE id=$1",
            [id]
        );

        if (productResult.rows.length) {
            const { imagen_principal, imagenes_adicionales } = productResult.rows[0];
            const allUrls = [imagen_principal, ...(imagenes_adicionales || [])];
            await deleteCloudinaryImages(allUrls);
        }

        await pool.query("DELETE FROM productos WHERE id=$1", [id]);

        invalidateCache();
        return { success: true };
    } catch (error) {
        throw error;
    }
}

// ===============================
// ✅ Obtener todos los productos (con cache)
// ===============================
async function getAllProducts() {
    try {
        const now = Date.now();

        if (cache.products && now - cache.timestamp < cache.ttl) {
            return cache.products;
        }

        const result = await pool.query(`
            SELECT p.*, c.nombre categoria_nombre
            FROM productos p
            LEFT JOIN categorias c ON p.categoria_id = c.id
            WHERE p.activo = true
            ORDER BY p.created_at DESC
        `);

        cache.products = result.rows;
        cache.timestamp = now;

        return result.rows;
    } catch (error) {
        throw error;
    }
}

// ===============================
// ✅ Obtener producto por ID
// ===============================
async function getProductById(id) {
    try {
        const result = await pool.query(
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
    } catch (error) {
        throw error;
    }
}

module.exports = {
    createProduct,
    updateProduct,
    deleteProduct,
    getAllProducts,
    getProductById,
    invalidateCache,
};
