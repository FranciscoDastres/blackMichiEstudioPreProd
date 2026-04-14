import db from "../lib/db.js";
import * as cloudinaryService from "./cloudinaryService.js";

export async function getHeroImages() {
    const result = await db.query(
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
}

export async function getPublicHeroImages() {
    const result = await db.query(
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
}

export async function getFirstHeroImage() {
    const result = await db.query(
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
}

export async function uploadHeroImage(buffer, section, title, subtitle, buttonText, categoria) {
    if (!section || !section.match(/^section[1-6]$/)) {
        throw new Error("Sección inválida. Debe ser section1-section6");
    }

    if (!title) {
        throw new Error("El título es requerido");
    }

    if (!buffer) {
        const existing = await db.query(
            `SELECT image_url FROM hero_images WHERE section = $1`,
            [section]
        );

        if (!existing.rows.length) {
            throw new Error("No existe imagen para esta sección. Debés subir una imagen primero.");
        }

        await db.query(
            `UPDATE hero_images
                 SET title = $1, subtitle = $2, button_text = $3, categoria = $4, updated_at = NOW()
                 WHERE section = $5`,
            [title, subtitle, buttonText, categoria, section]
        );

        console.log(`📝 Texto actualizado para ${section} (sin nueva imagen)`);

        return {
            image_url: existing.rows[0].image_url,
            title,
            subtitle,
            button_text: buttonText,
            categoria,
            section,
        };
    }

    console.log(`📤 Subiendo hero image: ${section}`);

    const uploadResult = await cloudinaryService.uploadHeroImage(buffer, section);

    console.log(`✅ Subido a Cloudinary: ${uploadResult.url}`);

    const oldImageResult = await db.query(
        `SELECT image_url FROM hero_images WHERE section = $1`,
        [section]
    );
    const oldImage = oldImageResult.rows[0]?.image_url;

    await db.query(
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
}

export async function deleteHeroImage(section) {
    if (!section || !section.match(/^section[1-6]$/)) {
        throw new Error("Sección inválida");
    }

    const result = await db.query(
        `SELECT image_url FROM hero_images WHERE section = $1`,
        [section]
    );
    const imageUrl = result.rows[0]?.image_url;

    await db.query(
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
}
