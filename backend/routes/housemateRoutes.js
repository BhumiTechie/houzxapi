const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const HousematePost = require('../models/HousematePost');
const Profile = require('../models/profile'); // 👈 yeh use hoga advertiser ke liye
const auth = require('../middleware/authMiddleware');

// 🔹 Get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await HousematePost.find().populate(
      'postedBy',
      'firstName lastName profileImage lastActive isOnline'
    );

    const formattedPosts = posts.map((post) => {
      const advertiser = post.postedBy
        ? {
            _id: post.postedBy._id,
            fullName: `${post.postedBy.firstName} ${post.postedBy.lastName}`.trim(),
            profileImage: post.postedBy.profileImage,
            lastActive: post.postedBy.lastActive,
            isOnline: post.postedBy.isOnline,
          }
        : null;

      return {
        ...post.toObject(),
        advertiser,
      };
    });

    res.json(formattedPosts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Get single post by ID
router.get('/:id', async (req, res) => {
  try {
    const post = await HousematePost.findById(req.params.id).populate(
      'postedBy',
      'firstName lastName profileImage lastActive isOnline'
    );

    if (!post) return res.status(404).json({ message: 'Post not found' });

    const advertiser = post.postedBy
      ? {
          _id: post.postedBy._id,
          fullName: `${post.postedBy.firstName} ${post.postedBy.lastName}`.trim(),
          profileImage: post.postedBy.profileImage,
          lastActive: post.postedBy.lastActive,
          isOnline: post.postedBy.isOnline,
        }
      : null;

    res.json({
      ...post.toObject(),
      advertiser,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Create a new post
router.post('/', auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.userId)) {
      return res.status(400).json({ error: 'Invalid userId in token' });
    }

    const userObjectId = new mongoose.Types.ObjectId(req.userId);

    const profileExists = await Profile.findById(userObjectId);
    if (!profileExists) {
      return res.status(400).json({ error: 'User not found in DB. Token invalid or user deleted.' });
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

    const advertiser = {
      _id: populatedPost.postedBy._id,
      fullName: `${populatedPost.postedBy.firstName} ${populatedPost.postedBy.lastName}`.trim(),
      profileImage: populatedPost.postedBy.profileImage,
      lastActive: populatedPost.postedBy.lastActive,
      isOnline: populatedPost.postedBy.isOnline,
    };

    res.status(201).json({
      message: 'Post created successfully',
      post: {
        ...populatedPost.toObject(),
        advertiser,
      },
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 🔹 Update post
router.put('/:id', auth, async (req, res) => {
  try {
    const updatedPost = await HousematePost.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('postedBy', 'firstName lastName profileImage lastActive isOnline');

    if (!updatedPost) return res.status(404).json({ message: 'Post not found' });

    const advertiser = updatedPost.postedBy
      ? {
          _id: updatedPost.postedBy._id,
          fullName: `${updatedPost.postedBy.firstName} ${updatedPost.postedBy.lastName}`.trim(),
          profileImage: updatedPost.postedBy.profileImage,
          lastActive: updatedPost.postedBy.lastActive,
          isOnline: updatedPost.postedBy.isOnline,
        }
      : null;

    res.json({
      ...updatedPost.toObject(),
      advertiser,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 🔹 Delete post
router.delete('/:id', auth, async (req, res) => {
  try {
    await HousematePost.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
