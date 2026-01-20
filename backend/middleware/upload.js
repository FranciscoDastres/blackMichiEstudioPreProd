// backend/middleware/upload.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");

// Storage temporal para multer
const tempStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const tempDir = "uploads/temp";
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        cb(null, tempDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'temp-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const tempUpload = multer({
    storage: tempStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error("Solo se permiten imágenes (JPG, PNG, GIF, WebP)"));
        }
    }
});

// Procesar y convertir a WebP
async function processImage(req, res, next) {
    if (!req.file && !req.files) {
        return next();
    }

    try {
        const files = Array.isArray(req.files) ? req.files : [req.file].filter(Boolean);
        const processedFiles = [];

        for (const file of files) {
            const productName = req.body.nombre || "producto";
            const folderName = productName
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[^a-z0-9-]/g, "");

            const productPath = path.join("uploads/products", folderName);
            if (!fs.existsSync(productPath)) {
                fs.mkdirSync(productPath, { recursive: true });
            }

            // Contar archivos existentes
            const existingFiles = fs.readdirSync(productPath).filter(f => f.endsWith('.webp'));
            const fileCount = existingFiles.length + 1;

            const finalFileName = `${folderName}-${fileCount}.webp`;
            const finalPath = path.join(productPath, finalFileName);

            // Convertir con rotación automática
            await sharp(file.path)
                .rotate() // Auto-rotar según EXIF
                .webp({ quality: 80, effort: 4 })
                .toFile(finalPath);

            // Eliminar archivo temporal
            fs.unlinkSync(file.path);

            // Guardar ruta relativa
            const relativePath = '/' + path.relative('.', finalPath).replace(/\\/g, '/');
            processedFiles.push({
                filename: finalFileName,
                path: relativePath
            });
        }

        // Asignar a req para el controlador
        if (Array.isArray(req.files)) {
            req.processedFiles = processedFiles;
        } else {
            req.processedFile = processedFiles[0];
        }

        next();
    } catch (error) {
        console.error("❌ Error procesando imagen:", error);
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        if (req.files) {
            req.files.forEach(file => {
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            });
        }
        next(error);
    }
}

module.exports = {
    single: (fieldName) => [
        tempUpload.single(fieldName),
        (req, res, next) => processImage(req, res, next)
    ],
    array: (fieldName, maxCount) => [
        tempUpload.array(fieldName, maxCount),
        (req, res, next) => processImage(req, res, next)
    ]
};