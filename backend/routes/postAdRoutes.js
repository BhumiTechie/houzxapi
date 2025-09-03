const express = require('express');
const router = express.Router();
const PostAd = require('../models/PostAd');
const mongoose = require('mongoose');

// 🔹 Get all posts
router.get('/', async (req, res) => {
  try {
    const { city, minPrice, maxPrice } = req.query; // filters optional
    let query = {};

    if (city) query.city = city;
    if (minPrice || maxPrice) {
      query.rent = {};
      if (minPrice) query.rent.$gte = Number(minPrice);
      if (maxPrice) query.rent.$lte = Number(maxPrice);
    }

    const posts = await PostAd.find(query);
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Get single post by ID
router.get('/:id', async (req, res) => {
  try {
    const post = await PostAd.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const data = req.body || {};

    if (!data.userId || !mongoose.Types.ObjectId.isValid(data.userId)) {
      return res.status(400).json({ error: 'Valid userId is required' });
    }

    if (!data.locationName || typeof data.locationName !== 'string') {
      return res.status(400).json({ error: 'locationName is required' });
    }

    // handle photos & nearestAirport as before
    if (Array.isArray(data.photos)) {
      data.photos = data.photos.map(photo => (photo.uri ? photo.uri : photo));
    }

    if (Array.isArray(data.nearestAirport)) {
      data.nearestAirport = data.nearestAirport
        .map(a => `${a.name} - ${a.distance}`)
        .join(', ');
    }

    const postAd = new PostAd(data);
    await postAd.save();

    res.status(201).json({ message: 'Post created successfully', post: postAd });
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).json({ error: 'Something went wrong', details: err.message });
  }
});


module.exports = router;
