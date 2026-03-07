// backend/services/supabaseService.js
const { createClient } = require("@supabase/supabase-js");
const sharp = require("sharp");

// Inicializar cliente Supabase
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY // ⚠️ IMPORTANTE: Usar SERVICE KEY en backend
);

/**
 * Subir imagen a Supabase Storage
 * @param {Buffer} fileBuffer - Contenido del archivo
 * @param {String} originalFilename - Nombre original del archivo
 * @param {String} bucket - Nombre del bucket (ej: 'BlackMichiEstudio')
 * @param {String} folder - Carpeta dentro del bucket (ej: 'hero', 'productos')
 * @returns {Promise<Object>} URL pública del archivo
 */
exports.uploadImage = async (fileBuffer, originalFilename, bucket = "BlackMichiEstudio", folder = "uploads") => {
    try {

        // Convertir a WebP
        const processedBuffer = await sharp(fileBuffer)
            .rotate() // Auto-rotar según EXIF
            .webp({
                quality: 80,
                effort: 4
            })
            .toBuffer();

        // Generar nombre único
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(7);
        const filename = `${timestamp}-${randomStr}.webp`;

        // Ruta completa en Supabase
        const filePath = `${folder}/${filename}`;

        // Subir a Supabase Storage
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(filePath, processedBuffer, {
                contentType: "image/webp",
                cacheControl: "31536000", // 🔥 CACHE 1 AÑO (OPTIMIZACIÓN IMPORTANTE)
                upsert: false,
            });

        if (error) {
            throw new Error(`Error Supabase: ${error.message}`);
        }

        // Obtener URL pública
        const urlResult = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);

        if (!urlResult || !urlResult.data) {
            throw new Error("No se pudo obtener URL pública de Supabase");
        }

        return {
            publicUrl: urlResult.data.publicUrl || urlResult.publicUrl,
            path: filePath,
            filename: filename
        };

    } catch (error) {
        console.error("❌ Error subiendo a Supabase:", error);
        throw error;
    }
};


/**
 * Subir imagen hero específica
 */
exports.uploadHeroImage = async (fileBuffer, originalFilename, section) => {
    return exports.uploadImage(
        fileBuffer,
        originalFilename,
        process.env.SUPABASE_BUCKET || "BlackMichiEstudio",
        "uploads/hero"
    );
};


/**
 * Subir imagen de producto
 */
exports.uploadProductImage = async (fileBuffer, originalFilename, productId) => {
    return exports.uploadImage(
        fileBuffer,
        originalFilename,
        process.env.SUPABASE_BUCKET || "BlackMichiEstudio",
        `uploads/productos/${productId}`
    );
};


/**
 * Subir logo
 */
exports.uploadLogo = async (fileBuffer, originalFilename) => {
    return exports.uploadImage(
        fileBuffer,
        originalFilename,
        process.env.SUPABASE_BUCKET || "BlackMichiEstudio",
        "uploads/logo"
    );
};


/**
 * Eliminar archivo de Supabase
 */
exports.deleteFile = async (filePath, bucket = "BlackMichiEstudio") => {
    try {

        const { error } = await supabase.storage
            .from(bucket)
            .remove([filePath]);

        if (error) {
            throw new Error(`Error eliminando: ${error.message}`);
        }

        return { success: true };

    } catch (error) {
        console.error("❌ Error eliminando archivo:", error);
        throw error;
    }
};


/**
 * Listar archivos en una carpeta
 */
exports.listFiles = async (folder, bucket = "BlackMichiEstudio") => {
    try {

        const { data, error } = await supabase.storage
            .from(bucket)
            .list(folder);

        if (error) {
            throw new Error(`Error listando: ${error.message}`);
        }

        return data;

    } catch (error) {
        console.error("❌ Error listando archivos:", error);
        throw error;
    }
};

module.exports = exports;