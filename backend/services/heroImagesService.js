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

        return result.rows.map((row) => ({
            id: row.section.replace("section", ""),
            section: row.section,
            title: row.title,
            subtitle: row.subtitle,
            button_text: row.button_text,
            image_url: row.image_url,
            categoria: row.categoria,
        }));
    } catch (error) {
        throw error;
    }
}

// ✅ Obtener SOLO la primera hero image (para preload LCP)
// Respuesta mínima y rápida — solo los campos necesarios para renderizar el primer slide
async function getFirstHeroImage() {
    try {
        const result = await pool.query(
            `SELECT image_url, title, subtitle, button_text, categoria
             FROM hero_images
             WHERE image_url IS NOT NULL
             ORDER BY section
             LIMIT 1`
        );

        if (!result.rows.length) return null;

        const row = result.rows[0];
        return {
            image_url: row.image_url,
            title: row.title,
            subtitle: row.subtitle,
            button_text: row.button_text,
            categoria: row.categoria,
        };
    } catch (error) {
        throw error;
    }
}

// ✅ Subir/actualizar hero image
async function uploadHeroImage(buffer, section, title, subtitle, buttonText, categoria) {
    try {
        if (!section || !section.match(/^section[1-6]$/)) {
            throw new Error("Sección inválida. Debe ser section1-section6");
        }

        if (!title || !buffer) {
            throw new Error("Se requieren título e imagen");
        }

        console.log(`📤 Subiendo hero image: ${section}`);

        const uploadResult = await cloudinaryService.uploadHeroImage(buffer, section);

        console.log(`✅ Subido a Cloudinary: ${uploadResult.url}`);

        const oldImageResult = await pool.query(
            `SELECT image_url FROM hero_images WHERE section = $1`,
            [section]
        );
        const oldImage = oldImageResult.rows[0]?.image_url;

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

        if (oldImage && oldImage.includes("cloudinary.com")) {
            try {
                const urlParts = oldImage.split("/upload/");
                if (urlParts[1]) {
                    const publicId = urlParts[1]
                        .replace(/\.[^/.]+$/, "")
                        .replace(/^v\d+\//, "");
                    await cloudinaryService.deleteFile(publicId);
                    console.log(`🗑️ Imagen anterior eliminada de Cloudinary`);
                }
            } catch (deleteError) {
                console.warn("⚠️ No se pudo eliminar imagen anterior:", deleteError.message);
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
        if (!section || !section.match(/^section[1-6]$/)) {
            throw new Error("Sección inválida");
        }

        const result = await pool.query(
            `SELECT image_url FROM hero_images WHERE section = $1`,
            [section]
        );
        const imageUrl = result.rows[0]?.image_url;

        await pool.query(
            `DELETE FROM hero_images WHERE section = $1`,
            [section]
        );

        if (imageUrl && imageUrl.includes("cloudinary.com")) {
            try {
                const urlParts = imageUrl.split("/upload/");
                if (urlParts[1]) {
                    const publicId = urlParts[1]
                        .replace(/\.[^/.]+$/, "")
                        .replace(/^v\d+\//, "");
                    await cloudinaryService.deleteFile(publicId);
                    console.log(`🗑️ Imagen eliminada de Cloudinary`);
                }
            } catch (deleteError) {
                console.warn("⚠️ No se pudo eliminar de Cloudinary:", deleteError.message);
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
    getFirstHeroImage,
    uploadHeroImage,
    deleteHeroImage,
};
