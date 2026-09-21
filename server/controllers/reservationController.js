const reservationService = require('../services/reservationService');

async function create(req, res, next) {
  try {
    const reservation = await reservationService.create(req.user._id, req.body);
    res.status(201).json(reservation);
  } catch (err) {
    next(err);
  }
}

async function getMine(req, res, next) {
  try {
    const reservations = await reservationService.getForGuest(req.user._id);
    res.json(reservations);
  } catch (err) {
    next(err);
  }
}

async function getForHost(req, res, next) {
  try {
    const reservations = await reservationService.getForHost(req.user._id);
    res.json(reservations);
  } catch (err) {
    next(err);
  }
}

async function cancel(req, res, next) {
  try {
    const reservation = await reservationService.cancel(req.user._id, req.params.id);
    res.json(reservation);
  } catch (err) {
    next(err);
  }
}

module.exports = { create, getMine, getForHost, cancel };
