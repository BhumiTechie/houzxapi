const mongoose = require('mongoose');

const PostAdSchema = new mongoose.Schema({
  title: { type: String, required: false},
  address: { type: String, required: false},
  rent: { type: Number, required: true, set: val => Number(val) || 0 },
  deposit: { type: Number, default: 0, set: val => Number(val) || 0 },
  city: { type: String, required: true },
  locationName: { type: String, required: true },
  availableFrom: { type: Date },
  minStay: { type: String, default: 'None' },
  maxStay: { type: String, default: 'None' },
  propertyType: { type: String, required: true },
  rooms: { 
    type: Number, 
    required: true, 
    set: val => {
      if (typeof val === 'string') return Number(val.replace(/\D/g, '')) || 0;
      return val;
    }
  },
  bathroom: { type: Number, default: 1, set: val => Number(val) || 1 },
  area: { type: Number, required: true, set: val => Number(val) || 0 },

  photos: [{ type: String, set: val => (val.uri ? val.uri : val) }],
  floorPlan: { type: String },
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
 furnishType: {
    fullyFurnished: { type: Boolean, default: false },
    partFurnished: { type: Boolean, default: false },
    unfurnished: { type: Boolean, default: false }
  },
additionalDetails: {
  type: [
    {
      label: { type: String, trim: true },
      value: { type: String, trim: true },
    },
  ],
  default: [],
},


  suitableFor: [{ type: String }],

  nearestAirport: { 
    type: String,
    set: val => Array.isArray(val) ? val.map(a => `${a.name} - ${a.distance}`).join(', ') : val
  },
  nearestRailway: { type: String },
  nearestBus: { type: String },
  nearestHospital: { type: String },
  nearestCollege: { type: String },
  nearestSchool: { type: String },

 userId: { type: mongoose.Schema.Types.ObjectId,  ref: 'Profile', required: true },
 ownerId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Profile',
  required: true
},
}, { timestamps: true });

module.exports = mongoose.model('PostAd', PostAdSchema);
