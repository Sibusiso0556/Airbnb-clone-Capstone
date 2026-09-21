const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['guest', 'host'], default: 'guest' },
    savedListings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Listing', default: [] }],
  },
  { timestamps: true }
);

userSchema.methods.toSafeObject = function toSafeObject() {
  return {
    _id: this._id,
    name: this.name,
    username: this.username,
    role: this.role,
    savedListings: this.savedListings,
  };
};

module.exports = mongoose.model('User', userSchema);
