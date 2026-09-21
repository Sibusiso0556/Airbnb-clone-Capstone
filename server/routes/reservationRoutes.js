const express = require('express');
const reservationController = require('../controllers/reservationController');
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');

const router = express.Router();

router.post('/', requireAuth, requireRole('guest'), reservationController.create);
router.get('/mine', requireAuth, reservationController.getMine);
router.get('/host', requireAuth, requireRole('host'), reservationController.getForHost);
router.delete('/:id', requireAuth, reservationController.cancel);

module.exports = router;
