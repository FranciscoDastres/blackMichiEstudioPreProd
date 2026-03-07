// backend/controllers/heroImagesController.js
const pool = require("../lib/db");
const supabaseService = require("../services/supabaseService");

/**
 * GET - Obtener todas las hero images (Admin)
 */
exports.getHeroImages = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT section, image_url, title, subtitle, button_text, categoria 
             FROM hero_images 
             ORDER BY section`
        );

        const images = {
            section1: null,
            section2: null,
            section3: null,
            section4: null,
            section5: null,
            section6: null
        };

        result.rows.forEach(row => {
            images[row.section] = {
                imageUrl: row.image_url,
                title: row.title,
                subtitle: row.subtitle,
                buttonText: row.button_text,
                categoria: row.categoria
            };
        });

        res.json(images);
    } catch (error) {
        console.error("❌ Error obteniendo imágenes:", error);
        res.status(500).json({ error: "Error obteniendo imágenes" });
    }
};

/**
 * GET - Obtener hero images públicas (Sin autenticación)
 */
exports.getPublicHeroImages = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT section, image_url, title, subtitle, button_text, categoria 
             FROM hero_images 
             WHERE image_url IS NOT NULL
             ORDER BY section`
        );

        const images = result.rows.map(row => ({
            id: row.section.replace('section', ''),
            section: row.section,
            title: row.title,
            subtitle: row.subtitle,
            buttonText: row.button_text,
            image: row.image_url, // Ahora es URL de Supabase directamente
            categoria: row.categoria
        }));

        res.json(images);
    } catch (error) {
        console.error("❌ Error obteniendo imágenes públicas:", error);
        res.status(500).json({ error: "Error obteniendo imágenes" });
    }
};

/**
 * POST - Subir/actualizar hero image
 */
exports.uploadHeroImage = async (req, res) => {
    try {
        const { section, title, subtitle, buttonText, categoria } = req.body;

        // Validar que existe la sección
        if (!section || !section.match(/^section[1-6]$/)) {
            return res.status(400).json({
                error: "Sección inválida. Debe ser section1-section6"
            });
        }

        // Validar datos mínimos
        if (!title || !req.file) {
            return res.status(400).json({
                error: "Se requieren título e imagen"
            });
        }

        console.log(`📤 Subiendo hero image: ${section}`);

        // Subir a Supabase
        const uploadResult = await supabaseService.uploadHeroImage(
            req.file.buffer,
            req.file.originalname,
            section
        );

        console.log(`✅ Subido a Supabase: ${uploadResult.publicUrl}`);

        // Obtener imagen antigua para eliminarla
        const oldImageResult = await pool.query(
            `SELECT image_url FROM hero_images WHERE section = $1`,
            [section]
        );

        const oldImage = oldImageResult.rows[0]?.image_url;

        // Actualizar en base de datos
        await pool.query(
            `INSERT INTO hero_images (section, image_url, title, subtitle, button_text, categoria, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, NOW())
             ON CONFLICT (section) 
             DO UPDATE SET 
                image_url = $2, 
                title = $3, 
                subtitle = $4, 
                button_text = $5, 
                categoria = $6, 
                updated_at = NOW()`,
            [section, uploadResult.publicUrl, title, subtitle, buttonText, categoria]
        );

        console.log(`📝 Base de datos actualizada para ${section}`);

        // Eliminar imagen anterior de Supabase si existía
        if (oldImage && oldImage.includes("supabase.co")) {
            try {
                // Extraer la ruta del archivo de la URL
                const urlParts = oldImage.split("/object/public/BlackMichiEstudio/");
                if (urlParts[1]) {
                    await supabaseService.deleteFile(urlParts[1]);
                    console.log(`🗑️ Imagen antigua eliminada`);
                }
            } catch (deleteError) {
                console.warn("⚠️ No se pudo eliminar imagen anterior:", deleteError.message);
            }
        }

        res.json({
            ok: true,
            message: `✅ ${section} actualizado correctamente`,
            data: {
                imageUrl: uploadResult.publicUrl,
                title,
                subtitle,
                buttonText,
                categoria,
                section
            }
        });

    } catch (error) {
        console.error("❌ Error subiendo hero image:", error);
        res.status(500).json({
            error: error.message || "Error subiendo imagen"
        });
    }
};

/**
 * DELETE - Eliminar una hero image
 */
exports.deleteHeroImage = async (req, res) => {
    try {
        const { section } = req.params;

        // Validar sección
        if (!section || !section.match(/^section[1-6]$/)) {
            return res.status(400).json({
                error: "Sección inválida"
            });
        }

        // Obtener imagen para eliminarla de Supabase
        const result = await pool.query(
            `SELECT image_url FROM hero_images WHERE section = $1`,
            [section]
        );

        const imageUrl = result.rows[0]?.image_url;

        // Eliminar de base de datos
        await pool.query(
            `DELETE FROM hero_images WHERE section = $1`,
            [section]
        );

        // Eliminar de Supabase
        if (imageUrl && imageUrl.includes("supabase.co")) {
            try {
                const urlParts = imageUrl.split("/object/public/BlackMichiEstudio/");
                if (urlParts[1]) {
                    await supabaseService.deleteFile(urlParts[1]);
                }
            } catch (deleteError) {
                console.warn("⚠️ No se pudo eliminar de Supabase:", deleteError.message);
            }
        }

        res.json({
            ok: true,
            message: `${section} eliminado correctamente`
        });

    } catch (error) {
        console.error("❌ Error eliminando hero image:", error);
        res.status(500).json({ error: error.message });
    }
};
