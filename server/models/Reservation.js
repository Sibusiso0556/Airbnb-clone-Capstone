const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
    guest: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    guests: { type: Number, required: true, min: 1 },
    totalPrice: { type: Number, required: true },
    status: { type: String, enum: ['confirmed', 'canceled'], default: 'confirmed' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Reservation', reservationSchema);
