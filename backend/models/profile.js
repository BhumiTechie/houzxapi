const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  firstName: {
    type: String,
    default: '',
  },
  lastName: {
    type: String,
    default: '',
  },
  profileImage: {
    type: String,
    default: '',
  },
}, { timestamps: true });

module.exports = mongoose.model('Profile', ProfileSchema);
