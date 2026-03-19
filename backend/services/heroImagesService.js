// backend/services/heroImagesService.js
const pool = require("../lib/db");
const cloudinaryService = require("../services/cloudinaryService");

// ✅ Obtener todas las hero images (Admin)
async function getHeroImages() {
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
            section6: null,
        };

        result.rows.forEach((row) => {
            images[row.section] = {
                image_url: row.image_url,
                title: row.title,
                subtitle: row.subtitle,
                button_text: row.button_text,
                categoria: row.categoria,
            };
        });

        return images;
    } catch (error) {
        throw error;
    }
}

// ✅ Obtener hero images públicas
async function getPublicHeroImages() {
    try {
        const result = await pool.query(
            `SELECT section, image_url, title, subtitle, button_text, categoria 
       FROM hero_images 
       WHERE image_url IS NOT NULL
       ORDER BY section`
        );

        const images = result.rows.map((row) => ({
            id: row.section.replace("section", ""),
            section: row.section,
            title: row.title,
            subtitle: row.subtitle,
            button_text: row.button_text,
            image_url: row.image_url,
            categoria: row.categoria,
        }));

        return images;
    } catch (error) {
        throw error;
    }
}

// ✅ Subir/actualizar hero image
async function uploadHeroImage(buffer, section, title, subtitle, buttonText, categoria) {
    try {
        // Validar sección
        if (!section || !section.match(/^section[1-6]$/)) {
            throw new Error("Sección inválida. Debe ser section1-section6");
        }

        if (!title || !buffer) {
            throw new Error("Se requieren título e imagen");
        }

        console.log(`📤 Subiendo hero image: ${section}`);

        // Subir a Supabase
        const uploadResult = await cloudinaryService.uploadHeroImage(buffer, section);

        console.log(`✅ Subido a Supabase: ${uploadResult.url}`);

        // Obtener imagen antigua
        const oldImageResult = await pool.query(
            `SELECT image_url FROM hero_images WHERE section = $1`,
            [section]
        );

        const oldImage = oldImageResult.rows[0]?.image_url;

        // Actualizar en BD
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
            [section, uploadResult.url, title, subtitle, buttonText, categoria]
        );

        console.log(`📝 Base de datos actualizada para ${section}`);

        // Eliminar imagen anterior
        if (oldImage && oldImage.includes("supabase.co")) {
            try {
                const urlParts = oldImage.split("/object/public/BlackMichiEstudio/");
                if (urlParts[1]) {
                    await cloudinaryService.deleteFile(urlParts[1]);
                    console.log(`🗑️ Imagen antigua eliminada`);
                }
            } catch (deleteError) {
                console.warn(
                    "⚠️ No se pudo eliminar imagen anterior:",
                    deleteError.message
                );
            }
        }

        return {
            image_url: uploadResult.url,
            title,
            subtitle,
            button_text: buttonText,
            categoria,
            section,
        };
    } catch (error) {
        throw error;
    }
}

// ✅ Eliminar hero image
async function deleteHeroImage(section) {
    try {
        // Validar sección
        if (!section || !section.match(/^section[1-6]$/)) {
            throw new Error("Sección inválida");
        }

        // Obtener imagen
        const result = await pool.query(
            `SELECT image_url FROM hero_images WHERE section = $1`,
            [section]
        );

        const imageUrl = result.rows[0]?.image_url;

        // Eliminar de BD
        await pool.query(
            `DELETE FROM hero_images WHERE section = $1`,
            [section]
        );

        // Eliminar de Supabase
        if (imageUrl && imageUrl.includes("supabase.co")) {
            try {
                const urlParts = imageUrl.split("/object/public/BlackMichiEstudio/");
                if (urlParts[1]) {
                    await cloudinaryService.deleteFile(urlParts[1]);
                }
            } catch (deleteError) {
                console.warn(
                    "⚠️ No se pudo eliminar de Supabase:",
                    deleteError.message
                );
            }
        }

        return { success: true };
    } catch (error) {
        throw error;
    }
}

module.exports = {
    getHeroImages,
    getPublicHeroImages,
    uploadHeroImage,
    deleteHeroImage,
};
