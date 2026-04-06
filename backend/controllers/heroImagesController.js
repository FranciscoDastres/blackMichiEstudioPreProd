// backend/controllers/heroImagesController.js
// ✅ SOLO HTTP HANDLING - La lógica está en heroImagesService.js
const heroImagesService = require("../services/heroImagesService");

// ✅ Obtener hero images (Admin)
async function getHeroImages(req, res) {
  try {
    const images = await heroImagesService.getHeroImages();
    res.json(images);
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: "Error obteniendo imágenes" });
  }
}

// ✅ Obtener hero images públicas
async function getPublicHeroImages(req, res) {
  try {
    const images = await heroImagesService.getPublicHeroImages();
    res.json(images);
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: "Error obteniendo imágenes" });
  }
}

// ✅ Obtener SOLO la primera hero image (para preload LCP)
async function getFirstHeroImage(req, res) {
  try {
    const image = await heroImagesService.getFirstHeroImage();
    // Cache agresivo: la primera imagen cambia poco
    res.set("Cache-Control", "public, max-age=300, stale-while-revalidate=60");
    res.json(image);
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: "Error obteniendo imagen" });
  }
}

// ✅ Subir/actualizar hero image
async function uploadHeroImage(req, res) {
  try {
    const { section, title, subtitle, buttonText, categoria } = req.body;

    if (!section || !title) {
      return res.status(400).json({ error: "Se requieren section y título" });
    }

    // Si no viene imagen, solo actualizar los campos de texto
    const buffer = req.file ? req.file.buffer : null;

    const result = await heroImagesService.uploadHeroImage(
      buffer,
      section,
      title,
      subtitle,
      buttonText,
      categoria
    );

    res.json({
      ok: true,
      message: `${section} actualizado correctamente`,
      data: result,
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(400).json({ error: error.message || "Error subiendo imagen" });
  }
}

// ✅ Eliminar hero image
async function deleteHeroImage(req, res) {
  try {
    const { section } = req.params;

    if (!section) {
      return res.status(400).json({ error: "Section requerido" });
    }

    await heroImagesService.deleteHeroImage(section);
    res.json({ ok: true, message: `${section} eliminado correctamente` });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(400).json({ error: error.message });
  }
}

module.exports = {
  getHeroImages,
  getPublicHeroImages,
  getFirstHeroImage,
  uploadHeroImage,
  deleteHeroImage,
};