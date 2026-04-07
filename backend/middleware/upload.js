// backend/middleware/upload.js
const multer = require("multer");
const path = require("path");

// Storage en memoria (NO en disco)
const memoryStorage = multer.memoryStorage();

// Whitelist estricta: mime types exactos permitidos
const ALLOWED_MIME_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
]);

// Whitelist estricta de extensiones
const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const upload = multer({
    storage: memoryStorage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const mime = (file.mimetype || "").toLowerCase();

        if (!ALLOWED_MIME_TYPES.has(mime)) {
            return cb(new Error(`Tipo MIME no permitido: ${mime}`));
        }
        if (!ALLOWED_EXTENSIONS.has(ext)) {
            return cb(new Error(`Extensión no permitida: ${ext}`));
        }
        cb(null, true);
    },
});

module.exports = upload;