// routes/heroImages.routes.js

const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const heroController = require("../controllers/heroImagesController");
const { requireAuth, requireAdmin } = require("../middleware/auth");

// Multer en memoria (NO disco)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp/;
        const extname = allowedTypes.test(
            path.extname(file.originalname).toLowerCase()
        );
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) return cb(null, true);

        cb(new Error("Solo se permiten imágenes"));
    }
});

// Admin
router.get("/", requireAuth, requireAdmin, heroController.getHeroImages);
router.post(
    "/",
    requireAuth,
    requireAdmin,
    upload.single("image"),
    heroController.uploadHeroImage
);

// Público
router.get("/public", heroController.getPublicHeroImages);

module.exports = router; 