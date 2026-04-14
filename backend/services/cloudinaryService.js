import cloudinaryPkg from "cloudinary";
import sharp from "sharp";
import logger from "../lib/logger.js";

const cloudinary = cloudinaryPkg.v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

const optimizeImage = async (buffer, width) => {
    return sharp(buffer)
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 72, effort: 5 })
        .toBuffer();
};

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

export async function uploadProductImage(fileBuffer, productName) {
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
        logger.error({ err: error }, "Error uploadProductImage");
        throw error;
    }
}

export async function uploadHeroImage(fileBuffer, section) {
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

        logger.info({ url }, "Hero subido a Cloudinary");
        return { url, path: `${folder}/${publicId}` };
    } catch (error) {
        logger.error({ err: error }, "Error uploadHeroImage");
        throw error;
    }
}

export async function uploadLogo(fileBuffer) {
    try {
        const optimized = await optimizeImage(fileBuffer, 500);
        const url = await uploadBuffer(optimized, "logo", "blackmichi/logo");
        return { url, path: "blackmichi/logo/logo" };
    } catch (error) {
        logger.error({ err: error }, "Error uploadLogo");
        throw error;
    }
}

export async function deleteFile(publicId) {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        if (result.result !== "ok" && result.result !== "not found") {
            throw new Error(`Cloudinary delete failed: ${result.result}`);
        }
        return { success: true };
    } catch (error) {
        logger.error({ err: error }, "Error eliminando archivo Cloudinary");
        throw error;
    }
}

export async function listFiles(folder) {
    try {
        const result = await cloudinary.api.resources({
            type: "upload",
            prefix: folder,
            max_results: 100,
        });
        return result.resources;
    } catch (error) {
        logger.error({ err: error }, "Error listando archivos Cloudinary");
        throw error;
    }
}
