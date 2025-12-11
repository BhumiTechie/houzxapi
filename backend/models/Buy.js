const mongoose = require('mongoose');

const BuySchema = new mongoose.Schema({
  propertyPrice: { type: Number, required: true },
  propertyType: { type: String, required: true },
rooms: { type: String }, // change from Number
  bathroom: Number,
  area: String,

  address: String,
  locality: String,
  city: String,

  description: String,

  photos: [String],
  floorPlanImage: String,

  amenities: { type: [String], default: [] },
  
   furnishType: {
    fullyFurnished: { type: Boolean, default: false },
    partFurnished: { type: Boolean, default: false },
    unfurnished: { type: Boolean, default: false }
  },



additionalDetails: [
  {
    label: {
      type: String,
      enum: [
        'Nearest Station',
        'Nearest Bus Stop',
        'Nearest Airport',
        'Nearest School',
        'Nearest College',
        'Nearest Hospital',
        'None'
      ]
    },
   value: { type: mongoose.Schema.Types.Mixed } 
  }
],


// ✅ new: reference to User collection
 userId: { type: mongoose.Schema.Types.ObjectId,  ref: 'Profile', required: true },

  advertiser: { 
    fullName: String,
    profileImage: String,
    lastActive: Date, 
    isOnline: Boolean
  },

  createdAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model('Buy', BuySchema);
