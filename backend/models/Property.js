const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: String,
  city: String,
  address: String,
  price: Number,
  rooms: Number,
  isSharedProperty: Boolean,
  description: String,
  photos: [String],
  furnishType: String, // 'Unfurnished', etc.
  propertyType: String, // 'Apartment', 'Studio', etc.
});

module.exports = mongoose.model('Property', propertySchema);
