// models/AdUser.js
const mongoose = require('mongoose');

const AdUserSchema = new mongoose.Schema({

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
    default: '', // URL of profile picture
  },
  profilePic: { // agar aapka signup me yeh use ho raha hai toh bhi
    type: String,
  }
}, {
  timestamps: true, // createdAt and updatedAt
});

module.exports = mongoose.model('AdUser', AdUserSchema);
