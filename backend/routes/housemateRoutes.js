const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const HousematePost = require('../models/HousematePost');
const Profile = require('../models/profile');
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Helper
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

// GET all posts
router.get('/', async (req, res) => {
  try {
    const posts = await HousematePost.find().populate(
      'postedBy',
      'firstName lastName profileImage lastActive isOnline'
    );

    const formatted = posts.map((post) => ({
      ...post.toObject(),
      advertiser: formatAdvertiser(post.postedBy),
    }));

    res.json({ success: true, posts: formatted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET single
router.get('/:id', async (req, res) => {
  try {
    const post = await HousematePost.findById(req.params.id).populate(
      'postedBy',
      'firstName lastName profileImage lastActive isOnline'
    );

    if (!post)
      return res.status(404).json({ success: false, message: 'Post not found' });

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

// CREATE with furnishType FIX
router.post('/', auth, upload.array("photos", 12), async (req, res) => {
  try {
    const uploadedFiles = (req.files || []).map(file => `/uploads/${file.filename}`);
    req.body.photos = uploadedFiles;

    if (typeof req.body.furnishType === "string") {
      try {
        req.body.furnishType = JSON.parse(req.body.furnishType);
      } catch {
        req.body.furnishType = {
          fullyFurnished: false,
          partFurnished: false,
          unfurnished: false
        };
      }
    }

    req.body.postedBy = new mongoose.Types.ObjectId(req.userId);

    const newPost = new HousematePost(req.body);
    await newPost.save();

    const populated = await HousematePost.findById(newPost._id).populate(
      'postedBy',
      'firstName lastName profileImage lastActive isOnline'
    );

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post: {
        ...populated.toObject(),
        advertiser: formatAdvertiser(populated.postedBy),
      },
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// UPDATE
router.put('/:id', auth, async (req, res) => {
  try {
    if (typeof req.body.furnishType === "string") {
      try {
        req.body.furnishType = JSON.parse(req.body.furnishType);
      } catch {}
    }

    const post = await HousematePost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false });

    if (post.postedBy.toString() !== req.userId)
      return res.status(403).json({ success: false });

    const updated = await HousematePost.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).populate('postedBy', 'firstName lastName profileImage lastActive isOnline');

    res.json({
      success: true,
      post: {
        ...updated.toObject(),
        advertiser: formatAdvertiser(updated.postedBy),
      },
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// DELETE
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await HousematePost.findOneAndDelete({
      _id: req.params.id,
      postedBy: req.userId,
    });

    if (!post)
      return res.status(404).json({ success: false, message: "Not found" });

    res.json({ success: true, message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

module.exports = router;
