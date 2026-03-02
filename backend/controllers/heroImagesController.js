const pool = require("../lib/db");

// Obtener imágenes actuales con todos los datos
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
            section3: null
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

// Obtener para el público (sin auth)
exports.getPublicHeroImages = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT section, image_url, title, subtitle, button_text, categoria 
             FROM hero_images 
             ORDER BY section`
        );

        const images = result.rows.map(row => ({
            id: row.section.replace('section', ''),
            title: row.title,
            subtitle: row.subtitle,
            buttonText: row.button_text,
            image: row.image_url,
            categoria: row.categoria
        }));

        res.json(images);
    } catch (error) {
        console.error("❌ Error obteniendo imágenes:", error);
        res.status(500).json({ error: "Error obteniendo imágenes" });
    }
};

// Subir/actualizar imagen con metadatos
exports.uploadHeroImage = async (req, res) => {
    try {
        const { section, title, subtitle, buttonText, categoria } = req.body;

        if (!req.file) {
            return res.status(400).json({ error: "No se recibió imagen" });
        }

        const imageUrl = `/uploads/hero/${req.file.filename}`;

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
            [section, imageUrl, title, subtitle, buttonText, categoria]
        );

        res.json({
            ok: true,
            message: "Imagen actualizada",
            data: {
                imageUrl,
                title,
                subtitle,
                buttonText,
                categoria
            }
        });
    } catch (error) {
        console.error("❌ Error subiendo imagen:", error);
        res.status(500).json({ error: error.message });
    }
};
