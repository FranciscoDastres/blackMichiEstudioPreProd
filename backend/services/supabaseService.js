// backend/services/supabaseService.js

const { createClient } = require("@supabase/supabase-js");
const sharp = require("sharp");
const crypto = require("crypto");

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

const BUCKET = process.env.SUPABASE_BUCKET || "BlackMichiEstudio";

/**
 * Optimizar imagen antes de subir
 */
async function optimizeImage(buffer) {
    return await sharp(buffer)
        .rotate()
        .resize({
            width: 1000,
            withoutEnlargement: true
        })
        .webp({
            quality: 65,
            effort: 4
        })
        .toBuffer();
}

/**
 * Generar nombre único
 */
function generateFilename() {
    const id = crypto.randomBytes(6).toString("hex");
    const timestamp = Date.now();
    return `${timestamp}-${id}.webp`;
}

/**
 * Subir imagen genérica
 */
exports.uploadImage = async (
    fileBuffer,
    folder = "uploads"
) => {

    try {

        const optimized = await optimizeImage(fileBuffer);

        const filename = generateFilename();
        const filePath = `${folder}/${filename}`;

        const { error } = await supabase.storage
            .from(BUCKET)
            .upload(filePath, optimized, {
                contentType: "image/webp",
                cacheControl: "31536000",
                upsert: false
            });

        if (error) throw error;

        const { data } = supabase.storage
            .from(BUCKET)
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
 * Subir imagen hero
 */
exports.uploadHeroImage = async (buffer) => {

    return exports.uploadImage(
        buffer,
        "uploads/hero"
    );

};

/**
 * Subir imagen de producto
 */
exports.uploadProductImage = async (
    buffer,
    productSlug
) => {

    return exports.uploadImage(
        buffer,
        `uploads/productos/${productSlug}`
    );

};

/**
 * Subir logo
 */
exports.uploadLogo = async (buffer) => {

    return exports.uploadImage(
        buffer,
        "uploads/logo"
    );

};

/**
 * Eliminar archivo
 */
exports.deleteFile = async (filePath) => {

    try {

        const { error } = await supabase.storage
            .from(BUCKET)
            .remove([filePath]);

        if (error) throw error;

        return { success: true };

    } catch (error) {

        console.error("❌ Error eliminando archivo:", error);
        throw error;

    }

};

/**
 * Listar archivos
 */
exports.listFiles = async (folder) => {

    try {

        const { data, error } = await supabase.storage
            .from(BUCKET)
            .list(folder);

        if (error) throw error;

        return data;

    } catch (error) {

        console.error("❌ Error listando archivos:", error);
        throw error;

    }

};

module.exports = exports;