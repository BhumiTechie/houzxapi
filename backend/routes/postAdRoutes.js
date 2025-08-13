const express = require('express');
const router = express.Router();
const PostAd = require('../models/PostAd'); // path adjust kar lena


router.post('/', async (req, res) => {
  console.log('POST /postads called with body:', req.body);
  try {
    const newAd = new PostAd(req.body);
    const savedAd = await newAd.save();
    console.log('Post saved:', savedAd);
    res.status(201).json(savedAd);
  } catch (error) {
    console.error('Error saving post:', error);
    res.status(400).json({ error: 'Failed to create post ad', details: error.message });
  }
});


module.exports = router;
