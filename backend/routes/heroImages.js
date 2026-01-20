const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const heroController = require("../controllers/heroImagesController");
const { requireAuth, requireAdmin } = require("../middleware/auth");

// Configurar multer (igual que antes)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/hero/");
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, "hero-" + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error("Solo se permiten imágenes"));
    }
});

// Rutas admin (con auth)
router.get("/", requireAuth, requireAdmin, heroController.getHeroImages);
router.post("/", requireAuth, requireAdmin, upload.single("image"), heroController.uploadHeroImage);

// ✅ Ruta pública para el frontend
router.get("/public", heroController.getPublicHeroImages);

module.exports = router;
