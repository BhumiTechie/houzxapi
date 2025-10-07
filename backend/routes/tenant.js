const express = require('express');
const router = express.Router();

const PostAd = require('../models/PostAd');          // Whole
const HousemateAd = require('../models/HousematePost'); // Shared
const BuyAd = require('../models/Buy');             // Buy

// ✅ GET /tenant/getproperties
router.get('/getproperties', async (req, res) => {
  try {
    let { city, location, minBudget, maxBudget, propertyType, usageType } = req.query;

    if (!usageType) return res.status(400).json({ error: "usageType is required: Whole, Shared, or Buy" });

    usageType = usageType.trim().toLowerCase(); // normalize

    let results = [];
    let query = {};

    // Common filters
    if (city) query.city = { $regex: city.trim(), $options: 'i' };
    if (location) query.locationName = { $regex: location.trim(), $options: 'i' };
    if (propertyType) {
      const types = propertyType.split(',').map(t => t.trim());
      query.propertyType = { $in: types.map(t => new RegExp(`^${t}$`, 'i')) };
    }

    // Whole
    if (usageType === 'whole') {
      if(minBudget || maxBudget){
        query.rent = {};
        if(minBudget) query.rent.$gte = parseInt(minBudget);
        if(maxBudget) query.rent.$lte = parseInt(maxBudget);
      }

      const whole = await PostAd.find(query)
        .populate('userId', 'firstName lastName profileImage email isOnline lastActive')
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

    // Shared
    else if (usageType === 'shared') {
      const roomRentFilter = {};
      if(minBudget) roomRentFilter.$gte = parseInt(minBudget);
      if(maxBudget) roomRentFilter.$lte = parseInt(maxBudget);
      if(Object.keys(roomRentFilter).length > 0) query['roomDetails.rent'] = roomRentFilter;

      const shared = await HousemateAd.find(query)
        .populate('postedBy', 'firstName lastName profileImage email isOnline lastActive')
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

    // Buy
    // Buy
else if (usageType === 'buy') {
  let buyQuery = {};
  
  if(city) buyQuery.city = { $regex: city.trim(), $options: 'i' };
  if(location) buyQuery.locality = { $regex: location.trim(), $options: 'i' };
  if(propertyType) {
    const types = propertyType.split(',').map(t => t.trim());
    buyQuery.propertyType = { $in: types.map(t => new RegExp(`^${t}$`, 'i')) };
  }
  if(minBudget || maxBudget) {
    buyQuery.propertyPrice = {};
    if(minBudget) buyQuery.propertyPrice.$gte = parseInt(minBudget);
    if(maxBudget) buyQuery.propertyPrice.$lte = parseInt(maxBudget);
  }

  const buy = await BuyAd.find(buyQuery)
    .populate('userId', 'firstName lastName profileImage email isOnline lastActive')
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
else {
      return res.status(400).json({ error: "Invalid usageType. Must be Whole, Shared, or Buy" });
    }

    res.json({ properties: results });

  } catch (err) {
    console.error('Tenant fetch error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ GET individual property details
router.get('/getproperty/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let { usageType } = req.query;

    if(!usageType) return res.status(400).json({ error: "usageType is required" });

    usageType = usageType.trim().toLowerCase();

    let property;

    if(usageType === 'whole') {
      property = await PostAd.findOne({ _id: id })
        .populate('userId', 'firstName lastName profileImage email isOnline lastActive');
    } else if(usageType === 'shared') {
      property = await HousemateAd.findOne({ _id: id })
        .populate('postedBy', 'firstName lastName profileImage email isOnline lastActive');
    } else if(usageType === 'buy') {
      property = await BuyAd.findOne({ _id: id })
        .populate('userId', 'firstName lastName profileImage email isOnline lastActive');
    } else {
      return res.status(400).json({ error: "Invalid usageType. Must be Whole, Shared, or Buy" });
    }

    if(!property) return res.status(404).json({ error: "Property not found" });

    const advertiser = usageType === 'shared'
      ? property.postedBy ? {
          _id: property.postedBy._id,
          fullName: `${property.postedBy.firstName || ''} ${property.postedBy.lastName || ''}`.trim() || property.postedBy.email,
          profileImage: property.postedBy.profileImage || 'https://via.placeholder.com/150',
          email: property.postedBy.email,
          isOnline: property.postedBy.isOnline,
          lastActive: property.postedBy.lastActive
        } : null
      : property.userId ? {
          _id: property.userId._id,
          fullName: `${property.userId.firstName || ''} ${property.userId.lastName || ''}`.trim() || property.userId.email,
          profileImage: property.userId.profileImage || 'https://via.placeholder.com/150',
          email: property.userId.email,
          isOnline: property.userId.isOnline,
          lastActive: property.userId.lastActive
        } : null;

    res.json({ property: { ...property.toObject(), advertiser, usageType } });

  } catch(err) {
    console.error("❌ Individual property error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ GET My Ads
router.get('/my-properties', async (req, res) => {
  try {
    const currentUserId = req.user?._id;
    if (!currentUserId) return res.status(401).json({ error: "Unauthorized" });

    const whole = await PostAd.find({ userId: currentUserId });
    const shared = await HousemateAd.find({ postedBy: currentUserId });
    const buy = await BuyAd.find({ userId: currentUserId });

    const results = [
      ...whole.map(post => ({ ...post.toObject(), usageType: 'Whole' })),
      ...shared.map(post => ({ ...post.toObject(), usageType: 'Shared' })),
      ...buy.map(post => ({ ...post.toObject(), usageType: 'Buy' }))
    ];

    res.json({ properties: results });

  } catch (err) {
    console.error('My properties fetch error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
