import express from "express";
import {
    getFeaturedProductos,
    addFeaturedProducto,
    removeFeaturedProducto
} from "../controllers/featuredController.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// Público
router.get("/", getFeaturedProductos);

// Solo admin
router.post("/", requireAuth, requireAdmin, addFeaturedProducto);
router.delete("/:id", requireAuth, requireAdmin, removeFeaturedProducto);

export default router;
