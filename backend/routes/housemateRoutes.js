const express = require('express');
const router = express.Router();
const HousematePost = require('../models/HousematePost');
const User = require('../models/User');

// Get all posts
router.get('/', async (req, res) => {   // just '/'
  try {
    const posts = await HousematePost.find().populate('postedBy');
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single post by ID
router.get('/:id', async (req, res) => {
  try {
    const post = await HousematePost.findById(req.params.id).populate('postedBy');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new post
router.post('/', async (req, res) => {
  try {
    const newPost = new HousematePost(req.body);
    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update post
router.put('/:id', async (req, res) => {
  try {
    const updatedPost = await HousematePost.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedPost);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete post
router.delete('/:id', async (req, res) => {
  try {
    await HousematePost.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// User routes
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
