const Listing = require('../models/Listing');
const Reservation = require('../models/Reservation');
const User = require('../models/User');

function notFoundError(message = 'Listing not found.') {
  const error = new Error(message);
  error.statusCode = 404;
  return error;
}

function forbiddenError(message = 'You do not own this listing.') {
  const error = new Error(message);
  error.statusCode = 403;
  return error;
}

const SORT_OPTIONS = {
  price_asc: { pricePerNight: 1 },
  price_desc: { pricePerNight: -1 },
  rating: { rating: -1 },
  newest: { createdAt: -1 },
};

async function search({ location, guests, minPrice, maxPrice, checkIn, checkOut, sort, page = 1, limit = 12 }) {
  const query = {};
  if (location) {
    query.$or = [
      { city: new RegExp(location, 'i') },
      { country: new RegExp(location, 'i') },
      { title: new RegExp(location, 'i') },
    ];
  }
  if (guests) {
    query.guests = { $gte: Number(guests) };
  }
  if (minPrice || maxPrice) {
    query.pricePerNight = {};
    if (minPrice) query.pricePerNight.$gte = Number(minPrice);
    if (maxPrice) query.pricePerNight.$lte = Number(maxPrice);
  }

  if (checkIn && checkOut) {
    const overlapping = await Reservation.find({
      status: 'confirmed',
      checkIn: { $lt: new Date(checkOut) },
      checkOut: { $gt: new Date(checkIn) },
    }).select('listing');
    const bookedIds = overlapping.map((r) => r.listing);
    if (bookedIds.length) {
      query._id = { $nin: bookedIds };
    }
  }

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(50, Math.max(1, Number(limit) || 12));
  const sortSpec = SORT_OPTIONS[sort] || SORT_OPTIONS.newest;

  const [results, total] = await Promise.all([
    Listing.find(query)
      .sort(sortSpec)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Listing.countDocuments(query),
  ]);

  return {
    results,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.max(1, Math.ceil(total / limitNum)),
    },
  };
}

async function getById(id) {
  const listing = await Listing.findById(id).populate('host', 'name username');
  if (!listing) throw notFoundError();
  const obj = listing.toObject();
  obj.hostName = listing.host?.name;
  return obj;
}

async function getByHost(hostId) {
  return Listing.find({ host: hostId }).sort({ createdAt: -1 });
}

const DEFAULT_REVIEWS = [
  {
    name: 'Alex',
    avatar: 'https://i.pravatar.cc/80?img=5',
    date: 'Recently',
    comment: 'Great communication and a spotless place. Would stay again.',
  },
  {
    name: 'Priya',
    avatar: 'https://i.pravatar.cc/80?img=25',
    date: 'Recently',
    comment: 'Exactly as described, easy check-in, and a fantastic location.',
  },
];

async function create(hostId, payload) {
  const host = await User.findById(hostId);
  const hostName = host?.name || 'the host';
  return Listing.create({
    ...payload,
    host: hostId,
    reviews: payload.reviews?.length ? payload.reviews : DEFAULT_REVIEWS,
    rating: payload.rating ?? 4.8,
    reviewCount: payload.reviewCount ?? DEFAULT_REVIEWS.length,
    bedType: payload.bedType || `${payload.beds || 1} queen bed${(payload.beds || 1) > 1 ? 's' : ''}`,
    hostBio: payload.hostBio || `${hostName} is committed to providing a great stay for guests.`,
    hostJoined: payload.hostJoined || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    hostAvatar: payload.hostAvatar || `https://i.pravatar.cc/150?u=${hostId}`,
  });
}

async function update(hostId, listingId, payload) {
  const listing = await Listing.findById(listingId);
  if (!listing) throw notFoundError();
  if (listing.host.toString() !== hostId.toString()) throw forbiddenError();
  Object.assign(listing, payload);
  await listing.save();
  return listing;
}

async function remove(hostId, listingId) {
  const listing = await Listing.findById(listingId);
  if (!listing) throw notFoundError();
  if (listing.host.toString() !== hostId.toString()) throw forbiddenError();
  await listing.deleteOne();
}

module.exports = { search, getById, getByHost, create, update, remove };
