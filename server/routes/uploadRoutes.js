const express = require('express');
const upload = require('../middleware/upload');
const uploadController = require('../controllers/uploadController');
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');

const router = express.Router();

router.post('/', requireAuth, requireRole('host'), upload.array('images', 10), uploadController.uploadImages);

module.exports = router;
