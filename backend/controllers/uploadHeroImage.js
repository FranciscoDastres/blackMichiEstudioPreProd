const { createClient } = require("@supabase/supabase-js");
const pool = require("../lib/db");

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.uploadHeroImage = async (req, res) => {
    try {
        const { section, title, subtitle, buttonText, categoria } = req.body;

        if (!req.file) {
            return res.status(400).json({ error: "No se recibió imagen" });
        }

        const ext = req.file.originalname.split(".").pop();
        const fileName = `uploads/hero/hero-${Date.now()}.${ext}`;
        const { error } = await supabase.storage
            .from("BlackMichiEstudio")
            .upload(fileName, req.file.buffer, {
                contentType: req.file.mimetype,
                upsert: true
            });

        if (error) throw error;

        const { data } = supabase
            .storage
            .from("BlackMichiEstudio")
            .getPublicUrl(fileName);

        const imageUrl = data.publicUrl;

        await pool.query(
            `
      INSERT INTO hero_images (section, image_url, title, subtitle, button_text, categoria, updated_at)
      VALUES ($1,$2,$3,$4,$5,$6,NOW())
      ON CONFLICT (section)
      DO UPDATE SET
        image_url = $2,
        title = $3,
        subtitle = $4,
        button_text = $5,
        categoria = $6,
        updated_at = NOW()
      `,
            [section, imageUrl, title, subtitle, buttonText, categoria]
        );

        res.json({ ok: true, imageUrl });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};