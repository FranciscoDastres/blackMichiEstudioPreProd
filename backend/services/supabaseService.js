const { createClient } = require("@supabase/supabase-js");
const sharp = require("sharp");

// Inicializar cliente Supabase
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

const BUCKET = process.env.SUPABASE_BUCKET || "BlackMichiEstudio";

/*
-------------------------------------------------------
SANITIZE TEXT (soporta acentos)
-------------------------------------------------------
*/
const sanitize = (text = "") => {
    return text
        .toString()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w\-]+/g, "")
        .replace(/\-\-+/g, "-");
};


/*
-------------------------------------------------------
OPTIMIZACIÓN DE IMÁGENES
-------------------------------------------------------
*/

const imageSizes = {
    thumb: 300,
    card: 600,
    full: 1000
};

const optimizeImage = async (buffer, width) => {
    return sharp(buffer)
        .rotate()
        .resize({
            width,
            withoutEnlargement: true
        })
        .webp({
            quality: 72,
            effort: 5
        })
        .toBuffer();
};


/*
-------------------------------------------------------
SUBIR ARCHIVO A SUPABASE
-------------------------------------------------------
*/

const uploadFile = async (buffer, path) => {

    const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, buffer, {
            contentType: "image/webp",
            cacheControl: "31536000",
            upsert: true
        });

    if (error) {
        throw new Error(error.message);
    }

    const { data } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(path);

    return data.publicUrl;
};


/*
-------------------------------------------------------
UPLOAD MULTI SIZE (thumb / card / full)
-------------------------------------------------------
*/

const uploadResponsiveImage = async (buffer, baseFolder, baseName) => {

    const uploads = {};

    await Promise.all(
        Object.entries(imageSizes).map(async ([sizeName, width]) => {

            const optimized = await optimizeImage(buffer, width);

            const path = `${baseFolder}/${baseName}-${sizeName}.webp`;

            const url = await uploadFile(optimized, path);

            uploads[sizeName] = url;

        })
    );

    return uploads;
};


/*
-------------------------------------------------------
PRODUCT IMAGES
-------------------------------------------------------
*/

exports.uploadProductImage = async (fileBuffer, productName) => {

    try {

        // VALIDACIONES
        if (!fileBuffer) {
            throw new Error("No se recibió imagen");
        }

        if (!productName) {
            productName = "producto";
        }

        const folder = `uploads/productos/${sanitize(productName)}`;
        const baseName = Date.now().toString();

        const images = await uploadResponsiveImage(
            fileBuffer,
            folder,
            baseName
        );

        return {
            folder,
            images
        };

    } catch (error) {

        console.error("❌ Error uploadProductImage:", error);
        throw error;

    }

};

/*
-------------------------------------------------------
HERO IMAGE
-------------------------------------------------------
*/

exports.uploadHeroImage = async (fileBuffer, section) => {

    try {

        const folder = `uploads/hero/${sanitize(section)}`
        const baseName = "hero";

        const optimized = await optimizeImage(fileBuffer, 1600);

        const path = `${folder}/${baseName}.webp`;

        const url = await uploadFile(optimized, path);

        return {
            url,
            path
        };

    } catch (error) {

        console.error("❌ Error uploadHeroImage:", error);
        throw error;

    }
};


/*
-------------------------------------------------------
LOGO
-------------------------------------------------------
*/

exports.uploadLogo = async (fileBuffer) => {

    try {

        const optimized = await optimizeImage(fileBuffer, 500);

        const path = `logo/logo.webp`;

        const url = await uploadFile(optimized, path);

        return {
            url,
            path
        };

    } catch (error) {

        console.error("❌ Error uploadLogo:", error);
        throw error;

    }
};


/*
-------------------------------------------------------
DELETE FILE
-------------------------------------------------------
*/

exports.deleteFile = async (filePath) => {

    try {

        const { error } = await supabase.storage
            .from(BUCKET)
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


/*
-------------------------------------------------------
LIST FILES
-------------------------------------------------------
*/

exports.listFiles = async (folder) => {

    try {

        const { data, error } = await supabase.storage
            .from(BUCKET)
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