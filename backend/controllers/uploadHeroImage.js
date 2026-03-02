const { createClient } = require("@supabase/supabase-js");
const pool = require("../lib/db");

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.uploadHeroImage = async (req, res) => {
    try {
        const { section, title, subtitle, buttonText, categoria } = req.body;

        if (!section) {
            return res.status(400).json({ error: "Section requerida" });
        }

        let imageUrl = null;

        if (req.file) {

            const ext = req.file.originalname.split(".").pop();

            const fileName = `uploads/hero/hero-${Date.now()}-${Math.round(
                Math.random() * 1e9
            )}.${ext}`;

            const { error } = await supabase.storage
                .from("BlackMichiEstudio")
                .upload(fileName, req.file.buffer, {
                    contentType: req.file.mimetype,
                    upsert: true
                });

            if (error) {
                console.error(error);
                return res.status(500).json({ error: error.message });
            }

            const { data } = supabase.storage
                .from("BlackMichiEstudio")
                .getPublicUrl(fileName);

            imageUrl = data.publicUrl;
        }

        const current = await pool.query(
            `SELECT image_url FROM hero_images WHERE section = $1`,
            [section]
        );

        const finalImageUrl =
            imageUrl ||
            (current.rows[0] ? current.rows[0].image_url : null);

        if (!finalImageUrl) {
            return res.status(400).json({
                error: "Debe existir una imagen para la sección"
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