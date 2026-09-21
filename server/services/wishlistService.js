const User = require('../models/User');
const Listing = require('../models/Listing');

function notFoundError(message) {
  const error = new Error(message);
  error.statusCode = 404;
  return error;
}

async function list(userId) {
  const user = await User.findById(userId).populate('savedListings');
  if (!user) throw notFoundError('User not found.');
  return user.savedListings;
}

async function save(userId, listingId) {
  const listing = await Listing.findById(listingId);
  if (!listing) throw notFoundError('Listing not found.');

  const user = await User.findById(userId);
  const alreadySaved = user.savedListings.some((id) => id.toString() === listingId);
  if (!alreadySaved) {
    user.savedListings.push(listingId);
    await user.save();
  }
  return user.savedListings;
}

async function unsave(userId, listingId) {
  const user = await User.findById(userId);
  if (!user) throw notFoundError('User not found.');
  user.savedListings = user.savedListings.filter((id) => id.toString() !== listingId);
  await user.save();
  return user.savedListings;
}

module.exports = { list, save, unsave };
