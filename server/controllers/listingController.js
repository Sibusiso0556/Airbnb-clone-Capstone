const listingService = require('../services/listingService');

async function search(req, res, next) {
  try {
    const { location, guests, minPrice, maxPrice, checkIn, checkOut, sort, page, limit } = req.query;
    const { results, pagination } = await listingService.search({
      location,
      guests,
      minPrice,
      maxPrice,
      checkIn,
      checkOut,
      sort,
      page,
      limit,
    });
    res.json({ results, pagination });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const listing = await listingService.getById(req.params.id);
    res.json(listing);
  } catch (err) {
    next(err);
  }
}

async function getMine(req, res, next) {
  try {
    const listings = await listingService.getByHost(req.user._id);
    res.json(listings);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const listing = await listingService.create(req.user._id, req.body);
    res.status(201).json(listing);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const listing = await listingService.update(req.user._id, req.params.id, req.body);
    res.json(listing);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await listingService.remove(req.user._id, req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { search, getById, getMine, create, update, remove };
