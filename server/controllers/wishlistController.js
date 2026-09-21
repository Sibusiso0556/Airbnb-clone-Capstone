const wishlistService = require('../services/wishlistService');

async function list(req, res, next) {
  try {
    const savedListings = await wishlistService.list(req.user._id);
    res.json(savedListings);
  } catch (err) {
    next(err);
  }
}

async function save(req, res, next) {
  try {
    const savedListings = await wishlistService.save(req.user._id, req.params.listingId);
    res.status(201).json(savedListings);
  } catch (err) {
    next(err);
  }
}

async function unsave(req, res, next) {
  try {
    const savedListings = await wishlistService.unsave(req.user._id, req.params.listingId);
    res.json(savedListings);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, save, unsave };
