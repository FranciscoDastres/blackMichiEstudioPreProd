// backend/controllers/productosController.js

const pool = require("../lib/db");
const supabaseService = require("../services/supabaseService");

// ===============================
// CACHE SIMPLE (5 minutos)
// ===============================

const cache = {
  products: null,
  timestamp: 0,
  ttl: 5 * 60 * 1000
};

const invalidateCache = () => {
  cache.products = null;
  cache.timestamp = 0;
};

// ===============================
// CREAR PRODUCTO
// ===============================

exports.createProduct = async (req, res) => {
  try {
    const { nombre, precio, stock, categoria, descripcion } = req.body;

    let imagenPrincipal = null;
    let imagenesAdicionales = [];

    // Subir imágenes
    if (req.files?.length) {
      const productSlug = nombre.toLowerCase().replace(/\s+/g, "-");

      const main = await supabaseService.uploadProductImage(
        req.files[0].buffer,
        productSlug
      );

      imagenPrincipal = main.images.card;

      if (req.files.length > 1) {
        const uploads = await Promise.all(
          req.files.slice(1).map(file =>
            supabaseService.uploadProductImage(
              file.buffer,
              productSlug
            )
          )
        );

        imagenesAdicionales = uploads.map(u => u.images.card);
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
        Number(stock)
      ]
    );

    invalidateCache();

    res.json({ ok: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error creando producto" });
  }
};

// ===============================
// ACTUALIZAR PRODUCTO
// ===============================

exports.updateProduct = async (req, res) => {
  try {

    const { id } = req.params;
    const { titulo, precio, stock, categoria, descripcion } = req.body;

    const product = await pool.query(
      "SELECT * FROM productos WHERE id=$1",
      [id]
    );

    if (!product.rows.length)
      return res.status(404).json({ error: "Producto no encontrado" });

    let imagenPrincipal = product.rows[0].imagen_principal;
    let imagenesAdicionales = product.rows[0].imagenes_adicionales || [];

    if (req.files?.length) {

      const productSlug = titulo.toLowerCase().replace(/\s+/g, "-");

      const main = await supabaseService.uploadProductImage(
        req.files[0].buffer,
        req.files[0].originalname,
        productSlug
      );

      imagenPrincipal = main.publicUrl;

      imagenesAdicionales = [];

      if (req.files.length > 1) {

        const uploads = await Promise.all(
          req.files.slice(1).map(file =>
            supabaseService.uploadProductImage(
              file.buffer,
              file.originalname,
              productSlug
            )
          )
        );

        imagenesAdicionales = uploads.map(u => u.publicUrl);
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
        id
      ]
    );

    invalidateCache();

    res.json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error actualizando producto" });
  }
};

// ===============================
// ELIMINAR PRODUCTO
// ===============================

exports.deleteProduct = async (req, res) => {

  try {

    const { id } = req.params;

    await pool.query("DELETE FROM productos WHERE id=$1", [id]);

    invalidateCache();

    res.json({ ok: true });

  } catch (err) {

    console.error(err);

    res.status(500).json({ error: "Error eliminando producto" });

  }

};

// ===============================
// LISTAR PRODUCTOS
// ===============================

exports.getAllProducts = async (req, res) => {

  try {

    const now = Date.now();

    if (cache.products && now - cache.timestamp < cache.ttl)
      return res.json(cache.products);

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

    res.json(result.rows);

  } catch (err) {

    console.error(err);

    res.status(500).json({ error: "Error obteniendo productos" });

  }

};

// ===============================
// PRODUCTO POR ID
// ===============================

exports.getProductById = async (req, res) => {

  try {

    const { id } = req.params;

    const result = await pool.query(
      `SELECT p.*,c.nombre categoria_nombre
       FROM productos p
       LEFT JOIN categorias c
       ON p.categoria_id=c.id
       WHERE p.id=$1`,
      [id]
    );

    if (!result.rows.length)
      return res.status(404).json({ error: "Producto no encontrado" });

    res.json(result.rows[0]);

  } catch (err) {

    console.error(err);

    res.status(500).json({ error: "Error obteniendo producto" });

  }

};