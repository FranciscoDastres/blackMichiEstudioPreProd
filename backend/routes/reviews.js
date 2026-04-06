// backend/routes/reviews.js
const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { getByProducto, create } = require('../controllers/reviewsController');

router.get('/',  getByProducto);
router.post('/', requireAuth, create);

module.exports = router;
