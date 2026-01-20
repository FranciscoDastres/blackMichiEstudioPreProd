const express = require("express");
const router = express.Router();
const pool = require("../lib/db"); // usa EXACTAMENTE este path

router.get("/", async (req, res) => {
  try {
    console.log("📥 GET /api/categorias");

    const result = await pool.query("SELECT * FROM categorias");

    console.log("📦 RESULTADO:", result.rows);

    return res.json(result.rows);
  } catch (err) {
    console.error("🔥 ERROR REAL /api/categorias 🔥");
    console.error(err);

    return res.status(500).json({
      message: "ERROR REAL",
      error: err.message,
      stack: err.stack,
    });
  }
});

module.exports = router;
