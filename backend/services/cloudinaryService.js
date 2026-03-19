// backend/services/cloudinaryService.js
const cloudinary = require("cloudinary").v2;
const sharp = require("sharp");

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
OPTIMIZACIÓN DE IMÁGENES (antes de subir)
-------------------------------------------------------
*/
const optimizeImage = async (buffer, width) => {
    return sharp(buffer)
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 72, effort: 5 })
        .toBuffer();
};

/*
-------------------------------------------------------
SUBIR BUFFER A CLOUDINARY
-------------------------------------------------------
*/
const uploadBuffer = (buffer, publicId, folder) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                public_id: publicId,
                overwrite: true,
                resource_type: "image",
                format: "webp",
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result.secure_url);
            }
        );
        stream.end(buffer);
    });
};

/*
-------------------------------------------------------
PRODUCT IMAGES
Sube 3 tamaños: thumb(300), card(600), full(1000)
-------------------------------------------------------
*/
exports.uploadProductImage = async (fileBuffer, productName) => {
    try {
        if (!fileBuffer) throw new Error("No se recibió imagen");
        if (!productName) productName = "producto";

        const folder = `blackmichi/productos/${sanitize(productName)}`;
        const baseName = Date.now().toString();

        const imageSizes = { thumb: 300, card: 600, full: 1000 };
        const images = {};

        await Promise.all(
            Object.entries(imageSizes).map(async ([sizeName, width]) => {
                const optimized = await optimizeImage(fileBuffer, width);
                const url = await uploadBuffer(
                    optimized,
                    `${baseName}-${sizeName}`,
                    folder
                );
                images[sizeName] = url;
            })
        );

        return { folder, images };
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
        const sanitized = section.toString().toLowerCase().replace(/\s+/g, "-");
        const folder = `blackmichi/hero`;
        const publicId = sanitized;

        const optimized = await sharp(fileBuffer)
            .rotate()
            .resize({ width: 1200, withoutEnlargement: true })
            .webp({ quality: 75, effort: 5 })
            .toBuffer();

        const url = await uploadBuffer(optimized, publicId, folder);

        console.log("✅ Hero subido a Cloudinary:", url);
        return { url, path: `${folder}/${publicId}` };
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
        const url = await uploadBuffer(optimized, "logo", "blackmichi/logo");
        return { url, path: "blackmichi/logo/logo" };
    } catch (error) {
        console.error("❌ Error uploadLogo:", error);
        throw error;
    }
};

/*
-------------------------------------------------------
DELETE FILE
Recibe el public_id de Cloudinary (sin extensión)
-------------------------------------------------------
*/
exports.deleteFile = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        if (result.result !== "ok" && result.result !== "not found") {
            throw new Error(`Cloudinary delete failed: ${result.result}`);
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
        const result = await cloudinary.api.resources({
            type: "upload",
            prefix: folder,
            max_results: 100,
        });
        return result.resources;
    } catch (error) {
        console.error("❌ Error listando archivos:", error);
        throw error;
    }
};