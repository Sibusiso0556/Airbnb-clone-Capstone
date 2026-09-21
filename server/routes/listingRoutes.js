const express = require('express');
const listingController = require('../controllers/listingController');
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');

const router = express.Router();

// Public
router.get('/', listingController.search);

// Host-only (must be declared before the generic '/:id' route)
router.get('/host/mine', requireAuth, requireRole('host'), listingController.getMine);
router.post('/', requireAuth, requireRole('host'), listingController.create);
router.put('/:id', requireAuth, requireRole('host'), listingController.update);
router.delete('/:id', requireAuth, requireRole('host'), listingController.remove);

// Public detail (declared last so it doesn't swallow the routes above)
router.get('/:id', listingController.getById);

module.exports = router;
