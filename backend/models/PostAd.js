const mongoose = require('mongoose');

const PostAdSchema = new mongoose.Schema({
  title: { type: String, required: true }, // Apartment Name / Title
  address: { type: String, required: true },
  rent: { type: Number, required: true },
  deposit: { type: Number, default: 0 },
  availableFrom: { type: Date, required: false },
  minStay: { type: String, default: '6 Months' }, // could be number or string
  maxStay: { type: String, default: 'None' },
  propertyType: { type: String, required: true },
  rooms: { type: Number, required: true },
  bathroom: { type: Number, default: 1 },
  area: { type: Number, required: true }, // in sq.ft.

  photos: [{ type: String }], // URLs or file paths for images

  floorPlan: { type: String }, // URL or path to floor plan image

  description: { type: String },

  amenities: {
    Wifi: { type: Boolean, default: false },
    TV: { type: Boolean, default: false },
    AC: { type: Boolean, default: false },
    Lift: { type: Boolean, default: false },
    WashingMachine: { type: Boolean, default: false },
    WaterPurifier: { type: Boolean, default: false },
    Terrace: { type: Boolean, default: false },
    Balcony: { type: Boolean, default: false },
    Gym: { type: Boolean, default: false },
    Garden: { type: Boolean, default: false },
    KidsArea: { type: Boolean, default: false },
    TwoWheelerParking: { type: Boolean, default: false },
    FourWheelerParking: { type: Boolean, default: false },
  },

  additionalDetails: [{ type: String }], // e.g. ['Nearest Airport', 'Nearest School']

  suitableFor: [{ type: String }], // e.g. ['Only Females', 'Professionals', ...]

  nearestAirport: { type: String }, // could be name/distance or id ref
  nearestRailway: { type: String },
  nearestBus: { type: String },
  nearestHospital: { type: String },
  nearestCollege: { type: String },
  nearestSchool: { type: String },

  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

}, { timestamps: true });

module.exports = mongoose.model('PostAd', PostAdSchema);
