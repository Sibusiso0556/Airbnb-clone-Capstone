const express = require('express');
const wishlistController = require('../controllers/wishlistController');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

router.use(requireAuth);
router.get('/', wishlistController.list);
router.post('/:listingId', wishlistController.save);
router.delete('/:listingId', wishlistController.unsave);

module.exports = router;
