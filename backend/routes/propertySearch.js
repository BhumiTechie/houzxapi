// ./routes/propertySearch.js
require('dotenv').config();
const express = require('express');
const router = express.Router();
const HousematePost = require('../models/HousematePost');
const PostAd = require('../models/PostAd');

// GET /properties/search
router.get('/search', async (req, res) => {
  try {
    const {
      city,
      minRent,
      maxRent,
      propertyType,
      rooms,
      furnishType,
      rentalType // shared / whole
    } = req.query;

    const filters = {};

    // City filter (case-insensitive)
    if (city) {
      filters.address = { $regex: city, $options: 'i' };
    }

    // Property type
    if (propertyType) {
      filters.propertyType = propertyType;
    }

    // Number of rooms
    if (rooms) {
      filters.rooms = Number(rooms);
    }

    // Furnishing type
    if (furnishType) {
      filters.furnishType = furnishType;
    }

    // Rent filter
    const rentFilter = {};
    if (minRent) rentFilter.$gte = Number(minRent);
    if (maxRent) rentFilter.$lte = Number(maxRent);

    let results = [];

    if (rentalType === 'shared') {
      if (Object.keys(rentFilter).length) {
        filters['roomDetails.rent'] = rentFilter;
      }
      results = await HousematePost.find(filters).sort({ createdAt: -1 });
    } 
    else if (rentalType === 'whole') {
      if (Object.keys(rentFilter).length) {
        filters.rent = rentFilter;
      }
      results = await PostAd.find(filters).sort({ createdAt: -1 });
    } 
    else {
      // If no rentalType, fetch both shared and whole
      const shared = await HousematePost.find({
        ...filters,
        ...(Object.keys(rentFilter).length ? { 'roomDetails.rent': rentFilter } : {})
      }).sort({ createdAt: -1 });

      const whole = await PostAd.find({
        ...filters,
        ...(Object.keys(rentFilter).length ? { rent: rentFilter } : {})
      }).sort({ createdAt: -1 });

      results = [...shared, ...whole];
    }

    res.json(results);

  } catch (err) {
    console.error('Property search error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
