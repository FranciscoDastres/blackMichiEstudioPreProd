// backend/routes/heroImages.js
import express from "express";
import multer from "multer";
import path from "path";
import * as heroController from "../controllers/heroImagesController.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

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

// ✅ Público — solo la primera imagen (para preload LCP, respuesta mínima y cacheada)
router.get("/first", heroController.getFirstHeroImage);

// Público — todas las imágenes
router.get("/public", heroController.getPublicHeroImages);

export default router;
