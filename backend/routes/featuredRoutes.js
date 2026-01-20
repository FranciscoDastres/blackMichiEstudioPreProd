const express = require("express");
const router = express.Router();

const {
    getFeaturedProductos,
    addFeaturedProducto,
    removeFeaturedProducto
} = require("../controllers/featuredController");

const { requireAuth, requireAdmin } = require("../middleware/auth");

// Público
router.get("/", getFeaturedProductos);

// Solo admin
router.post("/", requireAuth, requireAdmin, addFeaturedProducto);
router.delete("/:id", requireAuth, requireAdmin, removeFeaturedProducto);

module.exports = router;
