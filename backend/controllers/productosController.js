// backend/controllers/productosController.js
const pool = require("../lib/db");
const supabaseService = require("../services/supabaseService");

// =======================================================
// 📌 CREAR PRODUCTO
// =======================================================

exports.createProduct = async (req, res) => {
  try {
    const { nombre, precio, stock, categoria, descripcion } = req.body;

    let imagenPrincipal = null;
    let imagenesAdicionales = [];

    // Procesar imágenes subidas a Supabase
    if (req.files && req.files.length > 0) {
      try {
        // Imagen principal
        const mainUpload = await supabaseService.uploadProductImage(
          req.files[0].buffer,
          req.files[0].originalname,
          nombre.toLowerCase().replace(/\s+/g, "-")
        );
        imagenPrincipal = mainUpload.publicUrl;

        // Imágenes adicionales
        if (req.files.length > 1) {
          const additionalUploads = await Promise.all(
            req.files.slice(1).map(file =>
              supabaseService.uploadProductImage(
                file.buffer,
                file.originalname,
                nombre.toLowerCase().replace(/\s+/g, "-")
              )
            )
          );
          imagenesAdicionales = additionalUploads.map(u => u.publicUrl);
        }
      } catch (uploadError) {
        console.error("❌ Error subiendo imágenes:", uploadError);
        return res.status(400).json({
          error: "Error subiendo imágenes",
          details: uploadError.message
        });
      }
    }

    const slug = nombre.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    // Manejo categoría
    let categoriaId = null;
    if (categoria) {
      const parsed = parseInt(categoria);
      if (isNaN(parsed)) {
        const cat = await pool.query(
          `INSERT INTO categorias (nombre)
                     VALUES ($1)
                     ON CONFLICT (nombre) DO UPDATE SET nombre = EXCLUDED.nombre
                     RETURNING id`,
          [categoria]
        );
        categoriaId = cat.rows[0].id;
      } else {
        categoriaId = parsed;
      }
    }

    await pool.query(
      `INSERT INTO productos
             (titulo, slug, precio, descripcion, imagen_principal, imagenes_adicionales, categoria_id, stock, activo)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        nombre,
        slug,
        Number(precio),
        descripcion || null,
        imagenPrincipal,
        imagenesAdicionales.length > 0 ? imagenesAdicionales : null,
        categoriaId,
        Number(stock),
        true
      ]
    );

    res.json({ ok: true, message: "Producto creado correctamente" });

  } catch (error) {
    console.error("❌ Error creando producto:", error);
    res.status(500).json({ error: "Error creando producto" });
  }
};

// =======================================================
// 📌 ACTUALIZAR PRODUCTO
// =======================================================

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, precio, stock, categoria, descripcion } = req.body;

    if (!titulo) {
      return res.status(400).json({ error: "El título es requerido" });
    }

    // Obtener producto actual para saber si hay imágenes viejas
    const currentProduct = await pool.query(
      `SELECT imagen_principal, imagenes_adicionales FROM productos WHERE id = $1`,
      [id]
    );

    if (currentProduct.rows.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    let imagenPrincipal = currentProduct.rows[0].imagen_principal;
    let imagenesAdicionales = currentProduct.rows[0].imagenes_adicionales || [];

    // Procesar nuevas imágenes si se suben
    if (req.files && req.files.length > 0) {
      try {
        // Eliminar imágenes antiguas de Supabase
        if (imagenPrincipal && imagenPrincipal.includes("supabaseusercontent.com")) {
          try {
            const urlParts = imagenPrincipal.split("/object/public/BlackMichiEstudio/");
            if (urlParts[1]) {
              await supabaseService.deleteFile(urlParts[1]);
            }
          } catch (deleteError) {
            console.warn("⚠️ No se pudo eliminar imagen principal antigua:", deleteError.message);
          }
        }

        if (imagenesAdicionales && imagenesAdicionales.length > 0) {
          for (const oldUrl of imagenesAdicionales) {
            if (oldUrl.includes("supabaseusercontent.com")) {
              try {
                const urlParts = oldUrl.split("/object/public/BlackMichiEstudio/");
                if (urlParts[1]) {
                  await supabaseService.deleteFile(urlParts[1]);
                }
              } catch (deleteError) {
                console.warn("⚠️ No se pudo eliminar imagen adicional:", deleteError.message);
              }
            }
          }
        }

        // Subir nuevas imágenes
        const productName = titulo.toLowerCase().replace(/\s+/g, "-");

        // Imagen principal
        const mainUpload = await supabaseService.uploadProductImage(
          req.files[0].buffer,
          req.files[0].originalname,
          productName
        );
        imagenPrincipal = mainUpload.publicUrl;

        // Imágenes adicionales
        imagenesAdicionales = [];
        if (req.files.length > 1) {
          const additionalUploads = await Promise.all(
            req.files.slice(1).map(file =>
              supabaseService.uploadProductImage(
                file.buffer,
                file.originalname,
                productName
              )
            )
          );
          imagenesAdicionales = additionalUploads.map(u => u.publicUrl);
        }
      } catch (uploadError) {
        console.error("❌ Error subiendo nuevas imágenes:", uploadError);
        return res.status(400).json({
          error: "Error subiendo imágenes",
          details: uploadError.message
        });
      }
    }

    const slug = titulo.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    let categoriaId = null;
    if (categoria) {
      const parsed = parseInt(categoria);
      if (isNaN(parsed)) {
        const cat = await pool.query(
          `INSERT INTO categorias (nombre)
                     VALUES ($1)
                     ON CONFLICT (nombre) DO UPDATE SET nombre = EXCLUDED.nombre
                     RETURNING id`,
          [categoria]
        );
        categoriaId = cat.rows[0].id;
      } else {
        categoriaId = parsed;
      }
    }

    // Actualizar producto
    const result = await pool.query(
      `UPDATE productos
             SET titulo = $1,
                 slug = $2,
                 precio = $3,
                 descripcion = $4,
                 imagen_principal = $5,
                 imagenes_adicionales = $6,
                 categoria_id = $7,
                 stock = $8,
                 updated_at = NOW()
             WHERE id = $9
             RETURNING *`,
      [
        titulo,
        slug,
        Number(precio),
        descripcion || null,
        imagenPrincipal,
        imagenesAdicionales.length > 0 ? imagenesAdicionales : null,
        categoriaId,
        Number(stock),
        id
      ]
    );

    res.json({
      ok: true,
      message: "Producto actualizado correctamente",
      producto: result.rows[0]
    });

  } catch (error) {
    console.error("❌ Error actualizando producto:", error);
    res.status(500).json({ error: "Error actualizando producto" });
  }
};

// =======================================================
// 📌 ELIMINAR PRODUCTO (SOFT/HARD DELETE)
// =======================================================

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener datos del producto
    const result = await pool.query(
      `SELECT imagen_principal, imagenes_adicionales, categoria_id
             FROM productos WHERE id=$1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    const { imagen_principal, imagenes_adicionales, categoria_id } = result.rows[0];

    // ✅ Verificar si el producto existe en pedidos
    const enPedidos = await pool.query(
      'SELECT COUNT(*) as count FROM pedido_items WHERE producto_id = $1',
      [id]
    );

    if (parseInt(enPedidos.rows[0].count) > 0) {
      // ✅ SOFT DELETE - Solo desactivar
      await pool.query(
        'UPDATE productos SET activo = false, updated_at = NOW() WHERE id = $1',
        [id]
      );

      console.log(`📦 Producto ${id} desactivado (tiene pedidos asociados)`);

      return res.json({
        ok: true,
        message: 'Producto desactivado (tiene historial de ventas)',
        softDeleted: true
      });
    }

    // ✅ HARD DELETE - Eliminar completamente

    // Eliminar imágenes de Supabase
    if (imagen_principal && imagen_principal.includes("supabaseusercontent.com")) {
      try {
        const urlParts = imagen_principal.split("/object/public/BlackMichiEstudio/");
        if (urlParts[1]) {
          await supabaseService.deleteFile(urlParts[1]);
        }
      } catch (deleteError) {
        console.warn("⚠️ No se pudo eliminar imagen principal:", deleteError.message);
      }
    }

    if (imagenes_adicionales && imagenes_adicionales.length > 0) {
      for (const imageUrl of imagenes_adicionales) {
        if (imageUrl.includes("supabaseusercontent.com")) {
          try {
            const urlParts = imageUrl.split("/object/public/BlackMichiEstudio/");
            if (urlParts[1]) {
              await supabaseService.deleteFile(urlParts[1]);
            }
          } catch (deleteError) {
            console.warn("⚠️ No se pudo eliminar imagen adicional:", deleteError.message);
          }
        }
      }
    }

    // Borrar producto
    await pool.query("DELETE FROM productos WHERE id=$1", [id]);

    // ✅ Borrar categoría si queda sin productos
    if (categoria_id) {
      const checkCat = await pool.query(
        "SELECT COUNT(*) FROM productos WHERE categoria_id=$1",
        [categoria_id]
      );

      if (parseInt(checkCat.rows[0].count) === 0) {
        await pool.query("DELETE FROM categorias WHERE id=$1", [categoria_id]);
        console.log(`🗑️ Categoría ${categoria_id} eliminada (sin productos)`);
      }
    }

    console.log(`🗑️ Producto ${id} eliminado permanentemente`);

    res.json({
      ok: true,
      message: "Producto eliminado completamente",
      softDeleted: false
    });

  } catch (error) {
    console.error("❌ Error eliminando producto:", error);
    res.status(500).json({
      error: "Error eliminando producto",
      details: error.message
    });
  }
};

// =======================================================
// 📌 OBTENER TODOS LOS PRODUCTOS (SOLO ACTIVOS)
// =======================================================

exports.getAllProducts = async (req, res) => {
  try {
    const result = await pool.query(`
            SELECT p.*, c.nombre AS categoria_nombre
            FROM productos p
            LEFT JOIN categorias c ON p.categoria_id = c.id
            WHERE p.activo = true
            ORDER BY p.created_at DESC
        `);

    console.log('🔍 Productos devueltos:', result.rows.length);
    console.log('🔍 IDs:', result.rows.map(p => p.id));

    res.json(result.rows);

  } catch (error) {
    console.error("❌ Error obteniendo productos:", error);
    res.status(500).json({ error: "Error obteniendo productos" });
  }
};

// =======================================================
// 📌 OBTENER UN PRODUCTO POR ID
// =======================================================

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT p.*, c.nombre AS categoria_nombre
             FROM productos p
             LEFT JOIN categorias c ON p.categoria_id = c.id
             WHERE p.id = $1 AND p.activo = true`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error obteniendo producto:", error);
    res.status(500).json({ error: "Error obteniendo producto" });
  }
};

// =======================================================
// 📌 OBTENER PRODUCTOS POR CATEGORÍA
// =======================================================

exports.getProductsByCategory = async (req, res) => {
  try {
    const { categoria } = req.params;

    // Verificar si es un número (ID) o texto (nombre)
    const isNumeric = !isNaN(categoria);

    const query = isNumeric
      ? `SELECT p.*, c.nombre AS categoria_nombre
               FROM productos p
               LEFT JOIN categorias c ON p.categoria_id = c.id
               WHERE c.id = $1 AND p.activo = true
               ORDER BY p.created_at DESC`
      : `SELECT p.*, c.nombre AS categoria_nombre
               FROM productos p
               LEFT JOIN categorias c ON p.categoria_id = c.id
               WHERE LOWER(c.nombre) = LOWER($1) AND p.activo = true
               ORDER BY p.created_at DESC`;

    const result = await pool.query(query, [categoria]);

    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error obteniendo productos por categoría:", error);
    res.status(500).json({ error: "Error obteniendo productos" });
  }
};

// =======================================================
// 🔍 BUSCAR PRODUCTOS POR TÉRMINO
// =======================================================

exports.buscarProductos = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === '') {
      return res.json([]);
    }

    const searchTerm = `%${q.trim().toLowerCase()}%`;

    const result = await pool.query(
      `SELECT p.*, c.nombre AS categoria_nombre
             FROM productos p
             LEFT JOIN categorias c ON p.categoria_id = c.id
             WHERE p.activo = true
               AND (
                 LOWER(p.titulo) LIKE $1
                 OR LOWER(p.descripcion) LIKE $1
                 OR LOWER(c.nombre) LIKE $1
               )
             ORDER BY p.created_at DESC`,
      [searchTerm]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error buscando productos:", error);
    res.status(500).json({ error: "Error buscando productos" });
  }
};

// =======================================================
// 💡 OBTENER SUGERENCIAS DE BÚSQUEDA (AUTOCOMPLETE)
// =======================================================

exports.getSugerencias = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === '') {
      return res.json([]);
    }

    const searchTerm = `%${q.trim().toLowerCase()}%`;

    // Buscar en productos y categorías
    const [productosResult, categoriasResult] = await Promise.all([
      pool.query(
        `SELECT titulo AS texto, 'producto' AS tipo
                 FROM productos
                 WHERE activo = true
                   AND LOWER(titulo) LIKE $1
                 ORDER BY created_at DESC
                 LIMIT 5`,
        [searchTerm]
      ),
      pool.query(
        `SELECT nombre AS texto, 'categoria' AS tipo
                 FROM categorias
                 WHERE LOWER(nombre) LIKE $1
                 ORDER BY nombre ASC
                 LIMIT 3`,
        [searchTerm]
      )
    ]);

    // Combinar resultados
    const sugerencias = [
      ...productosResult.rows.map(row => ({ ...row, icon: "📦" })),
      ...categoriasResult.rows.map(row => ({ ...row, icon: "🏷️" }))
    ];

    res.json(sugerencias);

  } catch (error) {
    console.error("❌ Error obteniendo sugerencias:", error);
    res.status(500).json({ error: "Error obteniendo sugerencias" });
  }
};
