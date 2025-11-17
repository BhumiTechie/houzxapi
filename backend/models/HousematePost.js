// models/HousematePost.js
const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  roomType: { type: String, required: true }, // Single, Double, Shared
  facilities: [{ type: String }], // e.g., Independent Bed, Shared Bathroom
  rent: { type: Number, required: true },
  deposit: { type: Number, default: 0 },
});

const HousematePostSchema = new mongoose.Schema({
  city: { type: String, required: true },
  locationName: { type: String, required: true }, // e.g., "Andheri", "Rohini"

  description: { type: String },
  propertyType: { type: String, default: 'N/A' },
  address: { type: String, default: 'N/A' },
  location: {
    lat: Number,
    lng: Number,
  },
  rooms: { type: Number, default: 1 },
  roomDetails: [RoomSchema],
  amenities: [{ type: String }], // e.g., Wifi, AC, Lift
  suitableFor: [{ type: String }], // e.g., Only Females, Professionals
  availableFrom: { type: Date },
  minStay: { type: String, default: '6 Months' },
  maxStay: { type: String, default: 'None' },
  floorPlan: { type: String }, // URL of floor plan image
  photos: [{ type: String }], // URLs of images
additionalDetails: [
  {
    label: String,
    value: String
  }
]


  // 👇 yeh important hai
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true },
}, { timestamps: true });

module.exports = mongoose.model('HousematePost', HousematePostSchema);
