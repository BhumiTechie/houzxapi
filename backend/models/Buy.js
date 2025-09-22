const mongoose = require('mongoose');

const BuySchema = new mongoose.Schema({
  propertyPrice: { type: Number, required: true },
  propertyType: { type: String, required: true },
  rooms: Number,
  bathroom: Number,
  area: String,

  address: String,
  locality: String,
  city: String,

  description: String,

  photos: [String],
  floorPlanImage: String,

  amenities: {
    type: Map,
    of: Boolean
  },

  additionalDetails: [String],

  advertiser: {
    fullName: String,
    profileImage: String,
    lastActive: Date,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Buy', BuySchema);
