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

        // OBTENEMOS EL HOST DINÁMICAMENTE (Evita el error de localhost en Render)
        const protocol = req.protocol;
        const host = req.get('host');
        const fullHost = `${protocol}://${host}`;

        const images = result.rows.map(row => ({
            id: row.section.replace('section', ''),
            title: row.title,
            subtitle: row.subtitle,
            buttonText: row.button_text,
            // Cambiado localhost por el host dinámico
            image: `${fullHost}${row.image_url}`,
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
        // Extraemos los datos del body
        const { section, title, subtitle, buttonText, categoria } = req.body;

        // Si Multer falló o no hay archivo, lanzamos error 400
        if (!req.file) {
            console.error("❌ No se recibió req.file en el controlador");
            return res.status(400).json({ error: "No se recibió imagen" });
        }

        const imageUrl = `/uploads/hero/${req.file.filename}`;

        // Usamos ON CONFLICT para que si la sección ya existe, se actualice en lugar de dar error
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
            message: "Imagen actualizada correctamente",
            data: {
                imageUrl,
                title,
                subtitle,
                buttonText,
                categoria
            }
        });
    } catch (error) {
        console.error("❌ Error detallado en uploadHeroImage:", error);
        res.status(500).json({ error: "Error interno: " + error.message });
    }
};