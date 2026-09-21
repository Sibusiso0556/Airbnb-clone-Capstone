const Reservation = require('../models/Reservation');
const Listing = require('../models/Listing');

function badRequest(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function notFoundError(message = 'Reservation not found.') {
  const error = new Error(message);
  error.statusCode = 404;
  return error;
}

function nightsBetween(checkIn, checkOut) {
  const ms = new Date(checkOut) - new Date(checkIn);
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

async function create(guestId, { listing: listingId, checkIn, checkOut, guests }) {
  const listing = await Listing.findById(listingId);
  if (!listing) throw badRequest('That listing no longer exists.');

  const nights = nightsBetween(checkIn, checkOut);
  if (nights <= 0) throw badRequest('Check-out must be after check-in.');
  if (guests > listing.guests) throw badRequest(`This listing sleeps a maximum of ${listing.guests} guests.`);

  const overlapping = await Reservation.findOne({
    listing: listingId,
    status: 'confirmed',
    checkIn: { $lt: checkOut },
    checkOut: { $gt: checkIn },
  });
  if (overlapping) throw badRequest('These dates are no longer available.');

  const subtotal = nights * listing.pricePerNight;
  const weeklyDiscount = nights >= 7 ? Math.round(subtotal * 0.05) : 0;
  const discountedSubtotal = subtotal - weeklyDiscount;
  const serviceFee = Math.round(discountedSubtotal * 0.12);
  const occupancyTaxes = Math.round(discountedSubtotal * 0.05);
  const totalPrice = discountedSubtotal + listing.cleaningFee + serviceFee + occupancyTaxes;

  return Reservation.create({
    listing: listingId,
    guest: guestId,
    checkIn,
    checkOut,
    guests,
    totalPrice,
  });
}

async function getForGuest(guestId) {
  return Reservation.find({ guest: guestId }).populate('listing').sort({ createdAt: -1 });
}

async function getForHost(hostId) {
  const hostListings = await Listing.find({ host: hostId }).select('_id');
  const listingIds = hostListings.map((l) => l._id);
  return Reservation.find({ listing: { $in: listingIds } })
    .populate('listing')
    .populate('guest', 'name username')
    .sort({ createdAt: -1 });
}

async function cancel(userId, reservationId) {
  const reservation = await Reservation.findById(reservationId).populate('listing', 'host');
  if (!reservation) throw notFoundError();

  const isGuestOwner = reservation.guest.toString() === userId.toString();
  const isHostOwner = reservation.listing?.host?.toString() === userId.toString();

  if (!isGuestOwner && !isHostOwner) {
    const error = new Error('You can only cancel reservations you made or that were made on your listings.');
    error.statusCode = 403;
    throw error;
  }
  reservation.status = 'canceled';
  await reservation.save();
  return reservation;
}

module.exports = { create, getForGuest, getForHost, cancel };
