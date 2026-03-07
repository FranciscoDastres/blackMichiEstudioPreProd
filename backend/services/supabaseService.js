// backend/services/supabaseService.js

const { createClient } = require("@supabase/supabase-js");
const sharp = require("sharp");

// Inicializar cliente Supabase
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

/**
 * Sanitizar nombres de carpeta
 */
const sanitize = (text) => {
    return text
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w\-]+/g, "");
};

/**
 * Subir imagen a Supabase
 */
exports.uploadImage = async (
    fileBuffer,
    bucket = "BlackMichiEstudio",
    folder = "uploads"
) => {

    try {

        // Convertir imagen a WebP optimizado
        const processedBuffer = await sharp(fileBuffer)
            .rotate()
            .resize({
                width: 1200,
                withoutEnlargement: true
            })
            .webp({
                quality: 70,
                effort: 4
            })
            .toBuffer();

        // Nombre único
        const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.webp`;

        const filePath = `${folder}/${filename}`;

        const { error } = await supabase.storage
            .from(bucket)
            .upload(filePath, processedBuffer, {
                contentType: "image/webp",
                cacheControl: "31536000",
                upsert: false
            });

        if (error) {
            throw new Error(error.message);
        }

        const { data } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);

        return {
            publicUrl: data.publicUrl,
            path: filePath,
            filename
        };

    } catch (error) {

        console.error("❌ Error subiendo imagen:", error);
        throw error;

    }
};



/**
 * HERO IMAGES
 */
exports.uploadHeroImage = async (fileBuffer, section) => {

    const folder = `hero/${sanitize(section)}`;

    return exports.uploadImage(
        fileBuffer,
        process.env.SUPABASE_BUCKET || "BlackMichiEstudio",
        folder
    );

};



/**
 * PRODUCT IMAGES
 */
exports.uploadProductImage = async (fileBuffer, productName) => {

    const folder = `productos/${sanitize(productName)}`;

    return exports.uploadImage(
        fileBuffer,
        process.env.SUPABASE_BUCKET || "BlackMichiEstudio",
        folder
    );

};



/**
 * LOGO
 */
exports.uploadLogo = async (fileBuffer) => {

    return exports.uploadImage(
        fileBuffer,
        process.env.SUPABASE_BUCKET || "BlackMichiEstudio",
        "logo"
    );

};



/**
 * Eliminar archivo
 */
exports.deleteFile = async (filePath, bucket = "BlackMichiEstudio") => {

    try {

        const { error } = await supabase.storage
            .from(bucket)
            .remove([filePath]);

        if (error) {
            throw new Error(error.message);
        }

        return { success: true };

    } catch (error) {

        console.error("❌ Error eliminando archivo:", error);
        throw error;

    }

};



/**
 * Listar archivos
 */
exports.listFiles = async (folder, bucket = "BlackMichiEstudio") => {

    try {

        const { data, error } = await supabase.storage
            .from(bucket)
            .list(folder);

        if (error) {
            throw new Error(error.message);
        }

        return data;

    } catch (error) {

        console.error("❌ Error listando archivos:", error);
        throw error;

    }

};

module.exports = exports;