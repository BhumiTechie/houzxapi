const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const HousematePost = require('../models/HousematePost');
const Profile = require('../models/profile'); // advertiser ke liye
const auth = require('../middleware/authMiddleware');

// 🔹 Helper function: advertiser format
const formatAdvertiser = (user) =>
  user
    ? {
        _id: user._id,
        fullName: `${user.firstName} ${user.lastName}`.trim(),
        profileImage: user.profileImage,
        lastActive: user.lastActive,
        isOnline: user.isOnline,
      }
    : null;

// 🔹 Get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await HousematePost.find().populate(
      'postedBy',
      'firstName lastName profileImage lastActive isOnline'
    );

    const formattedPosts = posts.map((post) => ({
      ...post.toObject(),
      advertiser: formatAdvertiser(post.postedBy),
    }));

    res.json({ success: true, posts: formattedPosts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 🔹 Get single post by ID
router.get('/:id', async (req, res) => {
  try {
    const post = await HousematePost.findById(req.params.id).populate(
      'postedBy',
      'firstName lastName profileImage lastActive isOnline'
    );

    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    res.json({
      success: true,
      post: {
        ...post.toObject(),
        advertiser: formatAdvertiser(post.postedBy),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 🔹 Create a new post
router.post('/', auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.userId)) {
      return res.status(400).json({ success: false, error: 'Invalid userId in token' });
    }

    const userObjectId = new mongoose.Types.ObjectId(req.userId);

    const profileExists = await Profile.findById(userObjectId);
    if (!profileExists) {
      return res.status(400).json({ success: false, error: 'User not found in DB. Token invalid or user deleted.' });
    }

    const newPost = new HousematePost({
      ...req.body,
      postedBy: userObjectId,
    });

    await newPost.save();

    const populatedPost = await HousematePost.findById(newPost._id).populate(
      'postedBy',
      'firstName lastName profileImage lastActive isOnline'
    );

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post: {
        ...populatedPost.toObject(),
        advertiser: formatAdvertiser(populatedPost.postedBy),
      },
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 🔹 Update post (with ownership check)
router.put('/:id', auth, async (req, res) => {
  try {
    const post = await HousematePost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    // ✅ Ownership check
    if (post.postedBy.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this post' });
    }

    const updatedPost = await HousematePost.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).populate('postedBy', 'firstName lastName profileImage lastActive isOnline');

    res.json({
      success: true,
      post: {
        ...updatedPost.toObject(),
        advertiser: formatAdvertiser(updatedPost.postedBy),
      },
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 🔹 Delete post (with ownership check)
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await HousematePost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    // ✅ Ownership check
    if (post.postedBy.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this post' });
    }

    await HousematePost.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
