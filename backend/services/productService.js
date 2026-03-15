// backend/services/productService.js
const pool = require("../lib/db");
const supabaseService = require("./supabaseService");

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

// ✅ Crear producto con imágenes
async function createProduct(nombre, precio, stock, categoria, descripcion, files) {
    try {
        let imagenPrincipal = null;
        let imagenesAdicionales = [];

        // Subir imágenes
        if (files?.length) {
            const productSlug = nombre.toLowerCase().replace(/\s+/g, "-");

            const main = await supabaseService.uploadProductImage(
                files[0].buffer,
                productSlug
            );

            imagenPrincipal = main.images.card;

            if (files.length > 1) {
                const uploads = await Promise.all(
                    files.slice(1).map((file) =>
                        supabaseService.uploadProductImage(file.buffer, productSlug)
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
      (titulo,slug,precio,descripcion,imagen_principal,imagenes_adicionales,categoria_id,stock,activo)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,true)`,
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

// ✅ Actualizar producto
async function updateProduct(id, titulo, precio, stock, categoria, descripcion, files) {
    try {
        const product = await pool.query(
            "SELECT * FROM productos WHERE id=$1",
            [id]
        );

        if (!product.rows.length) {
            throw new Error("Producto no encontrado");
        }

        let imagenPrincipal = product.rows[0].imagen_principal;
        let imagenesAdicionales = product.rows[0].imagenes_adicionales || [];

        if (files?.length) {
            const productSlug = titulo.toLowerCase().replace(/\s+/g, "-");

            const main = await supabaseService.uploadProductImage(
                files[0].buffer,
                files[0].originalname,
                productSlug
            );

            imagenPrincipal = main.publicUrl;
            imagenesAdicionales = [];

            if (files.length > 1) {
                const uploads = await Promise.all(
                    files.slice(1).map((file) =>
                        supabaseService.uploadProductImage(
                            file.buffer,
                            file.originalname,
                            productSlug
                        )
                    )
                );

                imagenesAdicionales = uploads.map((u) => u.publicUrl);
            }
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

// ✅ Eliminar producto
async function deleteProduct(id) {
    try {
        await pool.query("DELETE FROM productos WHERE id=$1", [id]);
        invalidateCache();
        return { success: true };
    } catch (error) {
        throw error;
    }
}

// ✅ Obtener todos los productos (con cache)
async function getAllProducts() {
    try {
        const now = Date.now();

        if (cache.products && now - cache.timestamp < cache.ttl) {
            return cache.products;
        }

        const result = await pool.query(`
      SELECT p.*, c.nombre categoria_nombre
      FROM productos p
      LEFT JOIN categorias c
      ON p.categoria_id = c.id
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

// ✅ Obtener producto por ID
async function getProductById(id) {
    try {
        const result = await pool.query(
            `SELECT p.*,c.nombre categoria_nombre
       FROM productos p
       LEFT JOIN categorias c
       ON p.categoria_id=c.id
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
