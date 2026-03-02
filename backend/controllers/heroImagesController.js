exports.uploadHeroImage = async (req, res) => {
    try {
        const { section, title, subtitle, buttonText, categoria } = req.body;

        if (!section) {
            return res.status(400).json({ error: "Section requerida" });
        }

        let imageUrl = null;

        if (req.file) {
            imageUrl = `/uploads/hero/${req.file.filename}`;
        }

        // Traer la imagen actual (si existe)
        const current = await pool.query(
            `SELECT image_url FROM hero_images WHERE section = $1`,
            [section]
        );

        const finalImageUrl =
            imageUrl ||
            (current.rows[0] ? current.rows[0].image_url : null);

        if (!finalImageUrl) {
            return res.status(400).json({
                error: "Debe existir una imagen para la sección (sube una imagen primero)"
            });
        }

        await pool.query(
            `INSERT INTO hero_images
                (section, image_url, title, subtitle, button_text, categoria, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, NOW())
             ON CONFLICT (section)
             DO UPDATE SET
                image_url   = $2,
                title       = $3,
                subtitle    = $4,
                button_text = $5,
                categoria   = $6,
                updated_at  = NOW()`,
            [
                section,
                finalImageUrl,
                title || "",
                subtitle || "",
                buttonText || "",
                categoria || ""
            ]
        );

        res.json({
            ok: true,
            data: {
                imageUrl: finalImageUrl,
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