const express = require('express');
const router = express.Router();
const PostAd = require('../models/PostAd'); // path adjust kar lena
const mongoose = require('mongoose');


router.post('/', async (req, res) => {
  try {
    const data = req.body;

    // Ensure userId exists and is valid
    if (!data.userId || !mongoose.Types.ObjectId.isValid(data.userId)) {
      return res.status(400).json({ error: 'Valid userId is required' });
    }

    // Optional: handle photos if sent as objects
    if (Array.isArray(data.photos)) {
      data.photos = data.photos.map(photo => (photo.uri ? photo.uri : photo));
    }

    // Optional: handle nearestAirport if sent as array
    if (Array.isArray(data.nearestAirport)) {
      data.nearestAirport = data.nearestAirport.map(a => `${a.name} - ${a.distance}`).join(', ');
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