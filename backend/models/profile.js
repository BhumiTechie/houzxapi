const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  firstName: { type: String, default: '' },
  lastName: { type: String, default: '' },
  profileImage: { type: String, default: '' },

  lastActive: { type: Date, default: Date.now },
  isOnline: { type: Boolean, default: false },
}, { timestamps: true });

// 👇 OverwriteModelError avoid karne ke liye yeh use karo
module.exports = mongoose.models.Profile || mongoose.model('Profile', ProfileSchema);
