const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  title: { type: String, required: true },
  rent: { type: Number, required: true },
  deposit: { type: Number, default: 0 },
  billingPeriod: { type: String, default: '' },
  roomType: { type: String, enum: ['Single Room', 'Double Room', 'Shared Room'], required: true },
  facilities: { type: [String], default: [] },
});

const adSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  price: {
    type: Number,
    required: true
  },
  facilities: {
    type: [String], // array of strings
    default: []
  },
  location: String,
  type: { type: String, enum: ['rent', 'shared'], required: true },
  image: String,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdUser',
    required: true
  },
  rooms: {
    type: [roomSchema],
    default: []
  }
}, { timestamps: true });

module.exports = mongoose.model('Ad', adSchema);
