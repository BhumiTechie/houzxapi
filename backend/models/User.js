const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
    unique: true
  },
  otp: {
    type: Number,
    required: false
  },
  otpExpiresAt: {
    type: Date,
    required: false
  },
  password: {
    type: String,
    required: false
  }
});

module.exports = mongoose.model('User', userSchema);
