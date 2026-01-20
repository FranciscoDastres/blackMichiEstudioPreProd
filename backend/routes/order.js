import express from "express";
import { getOrders, updateOrderStatus } from "../controllers/ordersController.js";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authMiddleware, adminMiddleware, getOrders);
router.put("/:id", authMiddleware, adminMiddleware, updateOrderStatus);

export default router;
