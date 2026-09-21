const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    name: String,
    avatar: String,
    date: String,
    comment: String,
  },
  { _id: false }
);

const listingSchema = new mongoose.Schema(
  {
    host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    type: { type: String, default: 'Entire Home' },
    city: { type: String, required: true },
    country: { type: String, required: true },
    pricePerNight: { type: Number, required: true, min: 0 },
    cleaningFee: { type: Number, default: 0 },
    guests: { type: Number, required: true, min: 1 },
    bedrooms: { type: Number, required: true, min: 1 },
    beds: { type: Number, default: 1 },
    baths: { type: Number, required: true, min: 1 },
    amenities: { type: [String], default: [] },
    enhancedCleaning: { type: Boolean, default: false },
    selfCheckIn: { type: Boolean, default: false },
    image: { type: String, required: true },
    images: { type: [String], default: [] },
    rating: { type: Number, default: 5 },
    reviewCount: { type: Number, default: 0 },
    ratingBreakdown: {
      type: Map,
      of: Number,
      default: {},
    },
    reviews: { type: [reviewSchema], default: [] },
    superhost: { type: Boolean, default: false },
    bedType: { type: String, default: '1 queen bed' },
    hostBio: { type: String, default: '' },
    hostJoined: { type: String, default: '' },
    hostResponseRate: { type: Number, default: 100 },
    hostResponseTime: { type: String, default: 'within an hour' },
    hostVerified: { type: Boolean, default: true },
    hostAvatar: { type: String, default: '' },
    cancellationDeadline: { type: String, default: 'Feb 14' },
    securityDeposit: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Listing', listingSchema);
