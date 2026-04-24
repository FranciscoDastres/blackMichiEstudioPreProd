// backend/routes/reviews.ts
import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { getByProducto, create } from "../controllers/reviewsController.js";

const router = express.Router();

router.get("/",  getByProducto);
router.post("/", requireAuth, create);

export default router;
