const express = require('express');
const router = express.Router();

const PostAd = require('../models/PostAd');          // Whole
const HousemateAd = require('../models/HousematePost'); // Shared
const BuyAd = require('../models/Buy');             // Buy

// GET /tenant/getproperties
router.get('/getproperties', async (req, res) => {
  try {
    const { city, location, minBudget, maxBudget, propertyType, usageType } = req.query;

    if(!usageType) {
      return res.status(400).json({ error: "usageType is required: Whole, Shared, or Buy" });
    }

    let results = [];
    let query = {};
// Common filters
// ✅ Common filters (case-insensitive + trim)
if (city) {
  // remove ^$ so that trailing space in DB (e.g. "Pune ") bhi match ho
  query.city = { $regex: city.trim(), $options: 'i' };
}

if (location) {
  query.locationName = { $regex: location.trim(), $options: 'i' };
}

if (propertyType) {
  const types = propertyType.split(',').map(t => t.trim());
  // Case-insensitive regex for each property type
  query.propertyType = { $in: types.map(t => new RegExp(`^${t}$`, 'i')) };
}


    // ----------- WHOLE PROPERTIES -----------
    if(usageType === 'Whole') {
      if(minBudget || maxBudget) {
        query.rent = {};
        if(minBudget) query.rent.$gte = parseInt(minBudget);
        if(maxBudget) query.rent.$lte = parseInt(maxBudget);
      }

      const whole = await PostAd.find(query)
        .populate('userId', 'firstName lastName profileImage email')
        .sort({ createdAt: -1 });

      results = whole.map(post => ({
        ...post.toObject(),
        usageType: 'Whole',
        advertiser: post.userId ? {
          _id: post.userId._id,
          fullName: `${post.userId.firstName || ''} ${post.userId.lastName || ''}`.trim() || post.userId.email,
          profileImage: post.userId.profileImage || 'https://via.placeholder.com/150',
          email: post.userId.email,
          isOnline: post.userId.isOnline,
          lastActive: post.userId.lastActive
        } : null
      }));
    }

    // ----------- SHARED PROPERTIES -----------
    else if(usageType === 'Shared') {
      const roomRentFilter = {};
      if(minBudget) roomRentFilter.$gte = parseInt(minBudget);
      if(maxBudget) roomRentFilter.$lte = parseInt(maxBudget);
      if(Object.keys(roomRentFilter).length > 0) query['roomDetails.rent'] = roomRentFilter;

      const shared = await HousemateAd.find(query)
        .populate('postedBy', 'firstName lastName profileImage email')
        .sort({ createdAt: -1 });

      results = shared.map(post => ({
        ...post.toObject(),
        usageType: 'Shared',
        advertiser: post.postedBy ? {
          _id: post.postedBy._id,
          fullName: `${post.postedBy.firstName || ''} ${post.postedBy.lastName || ''}`.trim() || post.postedBy.email,
          profileImage: post.postedBy.profileImage || 'https://via.placeholder.com/150',
          email: post.postedBy.email,
          isOnline: post.postedBy.isOnline,
          lastActive: post.postedBy.lastActive
        } : null
      }));
    }

  if(usageType === 'Buy'){
    let query = {};
    if(city) query.city = city;
    if(location) query.locality = { $regex: location, $options: 'i' };
    if(propertyType) query.propertyType = propertyType;
    if(minBudget || maxBudget){
        query.propertyPrice = {};
        if(minBudget) query.propertyPrice.$gte = parseInt(minBudget);
        if(maxBudget) query.propertyPrice.$lte = parseInt(maxBudget);
    }

    const buy = await BuyAd.find(query)
        .populate('userId', 'firstName lastName profileImage email')
        .sort({ createdAt: -1 });

    results = buy.map(post => ({
        ...post.toObject(),
        usageType: 'Buy',
        advertiser: post.userId ? {
            _id: post.userId._id,
            fullName: `${post.userId.firstName || ''} ${post.userId.lastName || ''}`.trim() || post.userId.email,
            profileImage: post.userId.profileImage || 'https://via.placeholder.com/150',
            email: post.userId.email,
            isOnline: post.userId.isOnline,
            lastActive: post.userId.lastActive
        } : null
    }));
}


    res.json({ properties: results });

  } catch(err) {
    console.error('Tenant fetch error:', err);
    res.status(500).json({ error: err.message });
  }
});
// GET /tenant/getproperty/:id
router.get('/getproperty/:id', async (req, res) => {
  try {
    const { id } = req.params;  // clicked property ka _id
    const { usageType } = req.query; // Whole, Shared, Buy

    if(!usageType) {
      return res.status(400).json({ error: "usageType is required" });
    }

    let property;

    if(usageType === 'Whole') {
      property = await PostAd.findById(id)
        .populate('userId', 'firstName lastName profileImage email isOnline lastActive');
    } else if(usageType === 'Shared') {
      property = await HousemateAd.findById(id)
        .populate('postedBy', 'firstName lastName profileImage email isOnline lastActive');
    } else if(usageType === 'Buy') {
      property = await BuyAd.findById(id)
        .populate('userId', 'firstName lastName profileImage email isOnline lastActive');
    }

    if(!property) return res.status(404).json({ error: "Property not found" });

    res.json({ property });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
