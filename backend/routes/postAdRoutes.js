const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const PostAd = require("../models/PostAd");
const auth = require("../middleware/authMiddleware");
const upload= require("../middleware/uploadMiddleware");




// =========================================
// CREATE POST (with up to 12 photos)
// =========================================
router.post("/", auth, upload.array("photos", 12), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.userId)) {
      return res.status(400).json({ error: "Invalid userId in token" });
    }

    const data = req.body || {};
    data.userId = new mongoose.Types.ObjectId(req.userId);
    

    // ✅ Handle uploaded files AND direct URL array
    const uploadedFiles = (req.files || []).map(file => `/uploads/${file.filename}`);
    let photosFromBody = [];

    try {
      photosFromBody = typeof data.photos === "string" ? JSON.parse(data.photos) : data.photos || [];
    } catch (err) {
      photosFromBody = data.photos || [];
    }

    data.photos = uploadedFiles.length > 0 ? uploadedFiles : photosFromBody;

    let postAd = new PostAd(data);
    await postAd.save();

    // ✅ Populate advertiser from Profile
    postAd = await PostAd.findById(postAd._id).populate(
      "userId",
      "firstName lastName profileImage lastActive isOnline email"
    );

    const advertiser = postAd.userId
      ? {
          _id: postAd.userId._id,
          fullName: `${postAd.userId.firstName || ""} ${postAd.userId.lastName || ""}`.trim() || postAd.userId.email,
          profileImage: postAd.userId.profileImage || "https://via.placeholder.com/150",
          lastActive: postAd.userId.lastActive,
          isOnline: postAd.userId.isOnline,
        }
      : null;

    res.status(201).json({
      message: "Post created successfully",
      post: {
        ...postAd.toObject(),
        advertiser,
      },
    });
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).json({ error: "Something went wrong", details: err.message });
  }
});


// =========================================
// GET ALL POSTS
// =========================================
router.get("/", async (req, res) => {
  try {
    const posts = await PostAd.find()
      .populate("userId", "firstName lastName profileImage lastActive isOnline email")
      .sort({ createdAt: -1 });

    const formatted = posts.map((post) => {
      const advertiser = post.userId
        ? {
            _id: post.userId._id,
            fullName: `${post.userId.firstName || ""} ${post.userId.lastName || ""}`.trim() || post.userId.email,
            profileImage: post.userId.profileImage || "https://via.placeholder.com/150",
            lastActive: post.userId.lastActive,
            isOnline: post.userId.isOnline,
          }
        : null;

      return { ...post.toObject(), advertiser };
    });

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =========================================
// GET MY POSTS
// =========================================
router.get("/my-posts", auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.userId)) {
      return res.status(400).json({ error: "Invalid userId in token" });
    }

    const posts = await PostAd.find({ userId: req.userId })
      .populate("userId", "firstName lastName profileImage lastActive isOnline email")
      .sort({ createdAt: -1 });

    const formatted = posts.map((post) => {
      const advertiser = post.userId
        ? {
            _id: post.userId._id,
            fullName: `${post.userId.firstName || ""} ${post.userId.lastName || ""}`.trim() || post.userId.email,
            profileImage: post.userId.profileImage || "https://via.placeholder.com/150",
            lastActive: post.userId.lastActive,
            isOnline: post.userId.isOnline,
          }
        : null;

      return { ...post.toObject(), advertiser };
    });

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =========================================
// GET SINGLE POST
// =========================================
router.get("/:id", async (req, res) => {
  try {
    const post = await PostAd.findById(req.params.id).populate(
      "userId",
      "firstName lastName profileImage lastActive isOnline email"
    );

    if (!post) return res.status(404).json({ message: "Post not found" });

    const advertiser = post.userId
      ? {
          _id: post.userId._id,
          fullName: `${post.userId.firstName || ""} ${post.userId.lastName || ""}`.trim() || post.userId.email,
          profileImage: post.userId.profileImage || "https://via.placeholder.com/150",
          lastActive: post.userId.lastActive,
          isOnline: post.userId.isOnline,
        }
      : null;

    res.json({ ...post.toObject(), advertiser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =========================================
// DELETE MY POST
// =========================================
router.delete("/my-posts/:id", auth, async (req, res) => {
  try {
    const post = await PostAd.findOneAndDelete({ _id: req.params.id, userId: req.userId });

    if (!post) {
      return res.status(404).json({ message: "Post not found or not authorized" });
    }

    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;