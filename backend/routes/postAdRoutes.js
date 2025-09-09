const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const PostAd = require("../models/PostAd");
const Profile = require("../models/profile");
const auth = require("../middleware/authMiddleware");

// 🔹 Get all posts
router.get("/", async (req, res) => {
  try {
    const posts = await PostAd.find()
      .populate("userId", "firstName lastName profileImage lastActive isOnline email");

    const formattedPosts = posts.map((post) => {
      const advertiser = post.userId
        ? {
            _id: post.userId._id,
            fullName:
              `${post.userId.firstName || ""} ${post.userId.lastName || ""}`.trim() ||
              post.userId.email, // 👈 agar naam empty ho to email dikha do
            profileImage:
              post.userId.profileImage || "https://via.placeholder.com/150",
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

// 🔹 Get single post
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
          fullName:
            `${post.userId.firstName || ""} ${post.userId.lastName || ""}`.trim() ||
            post.userId.email,
          profileImage:
            post.userId.profileImage || "https://via.placeholder.com/150",
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

// 🔹 Create post
router.post("/", auth, async (req, res) => {
  try {
    const data = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(req.userId)) {
      return res.status(400).json({ error: "Invalid userId in token" });
    }

    // ✅ Always link post with Profile._id
    data.userId = new mongoose.Types.ObjectId(req.userId);

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
          fullName:
            `${postAd.userId.firstName || ""} ${postAd.userId.lastName || ""}`.trim() ||
            postAd.userId.email,
          profileImage:
            postAd.userId.profileImage || "https://via.placeholder.com/150",
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

module.exports = router;
