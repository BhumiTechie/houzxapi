const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const PostAd = require("../models/PostAd");
const Profile = require("../models/Profile"); 
const auth = require("../middleware/authMiddleware");

// 🔹 Get all posts
router.get("/", async (req, res) => {
  try {
    const { city, minPrice, maxPrice } = req.query;
    let query = {};

    if (city) query.city = city;
    if (minPrice || maxPrice) {
      query.rent = {};
      if (minPrice) query.rent.$gte = Number(minPrice);
      if (maxPrice) query.rent.$lte = Number(maxPrice);
    }

    const posts = await PostAd.find(query).populate(
      "userId",
      "firstName lastName profileImage lastActive isOnline"
    );

    const formattedPosts = posts.map((post) => {
      const advertiser = post.userId
        ? {
            _id: post.userId._id,
            fullName: `${post.userId.firstName} ${post.userId.lastName}`.trim(),
            profileImage: post.userId.profileImage,
            lastActive: post.userId.lastActive,
            isOnline: post.userId.isOnline,
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
router.get("/:id", async (req, res) => {
  try {
    const post = await PostAd.findById(req.params.id).populate(
      "userId",
      "firstName lastName profileImage lastActive isOnline"
    );

    if (!post) return res.status(404).json({ message: "Post not found" });

    const advertiser = post.userId
      ? {
          _id: post.userId._id,
          fullName: `${post.userId.firstName} ${post.userId.lastName}`.trim(),
          profileImage: post.userId.profileImage,
          lastActive: post.userId.lastActive,
          isOnline: post.userId.isOnline,
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

// 🔹 Create a new Post
router.post("/", auth, async (req, res) => {
  try {
    const data = req.body || {};
    console.log("Middleware userId:", req.userId); // Profile._id aana chahiye

    // ✅ Ensure valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.userId)) {
      return res.status(400).json({ error: "Invalid userId in token" });
    }

    const userObjectId = new mongoose.Types.ObjectId(req.userId);

    // ✅ Profile check karo
    const profileExists = await Profile.findById(userObjectId);
    if (!profileExists) {
      return res.status(400).json({
        error: "User not found in DB. Token invalid or user deleted.",
      });
    }

    data.userId = userObjectId;

    let postAd = new PostAd(data);
    await postAd.save();

    // ✅ Populate advertiser details
    postAd = await PostAd.findById(postAd._id).populate(
      "userId",
      "firstName lastName profileImage lastActive isOnline"
    );

    const advertiser = {
      _id: postAd.userId._id,
      fullName: `${postAd.userId.firstName} ${postAd.userId.lastName}`.trim(),
      profileImage: postAd.userId.profileImage,
      lastActive: postAd.userId.lastActive,
      isOnline: postAd.userId.isOnline,
    };

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

module.exports = router;
