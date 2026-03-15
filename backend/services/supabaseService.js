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

async function uploadHeroImage(buffer, section, title, subtitle, buttonText, categoria) {
    try {
        if (!section || !section.match(/^section[1-6]$/)) {
            throw new Error("Sección inválida. Debe ser section1-section6");
        }

        if (!title || !buffer) {
            throw new Error("Se requieren título e imagen");
        }

        // Obtener imagen antigua PRIMERO
        const oldImageResult = await pool.query(
            `SELECT image_url FROM hero_images WHERE section = $1`,
            [section]
        );
        const oldImage = oldImageResult.rows[0]?.image_url;

        // Eliminar imagen antigua de Supabase ANTES de subir la nueva
        // if (oldImage && oldImage.includes("supabase.co")) {
        //     try {
        //         const urlParts = oldImage.split("/object/public/BlackMichiEstudio/");
        //         if (urlParts[1]) {
        //             await supabaseService.deleteFile(urlParts[1]);
        //             console.log(`🗑️ Imagen antigua eliminada`);
        //         }
        //     } catch (deleteError) {
        //         console.warn("⚠️ No se pudo eliminar imagen anterior:", deleteError.message);
        //     }
        // }

        // Subir nueva imagen
        console.log(`📤 Subiendo hero image: ${section}`);
        const uploadResult = await supabaseService.uploadHeroImage(buffer, section);
        console.log(`✅ Subido a Supabase: ${uploadResult.url}`);

        // Actualizar BD
        await pool.query(
            `INSERT INTO hero_images (section, image_url, title, subtitle, button_text, categoria, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, NOW())
             ON CONFLICT (section) 
             DO UPDATE SET 
                image_url = $2, title = $3, subtitle = $4, 
                button_text = $5, categoria = $6, updated_at = NOW()`,
            [section, uploadResult.url, title, subtitle, buttonText, categoria]
        );

        console.log(`📝 Base de datos actualizada para ${section}`);

        return {
            image_url: uploadResult.url,
            title, subtitle,
            button_text: buttonText,
            categoria, section,
        };
    } catch (error) {
        throw error;
    }
}


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

exports.uploadHeroImage = async (fileBuffer, section) => {
    try {
        const sanitized = section.toString().toLowerCase().replace(/\s+/g, "-");
        const folder = `hero/${sanitized}`;
        const baseName = "hero";

        console.log('📁 Subiendo a path:', `${folder}/${baseName}.webp`);

        const optimized = await sharp(fileBuffer)
            .rotate()
            .resize({ width: 800, withoutEnlargement: true })
            .webp({ quality: 75, effort: 5 })
            .toBuffer();

        const path = `${folder}/${baseName}.webp`;
        const url = await uploadFile(optimized, path);

        console.log('✅ URL generada:', url);

        return { url, path };
    } catch (error) {
        console.error("❌ Error uploadHeroImage:", error);
        throw error;
    }
};
