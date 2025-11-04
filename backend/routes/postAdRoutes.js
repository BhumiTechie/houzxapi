
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const PostAd = require("../models/PostAd");
const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const Profile = require("../models/profile");

// =========================================
// CREATE POST (with up to 12 photos)
// =========================================
router.post(
  "/",
  auth,
  upload.fields([
    { name: "photos", maxCount: 12 },
    { name: "floorPlan", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      console.log("✅ req.userId from auth middleware:", req.userId);
      console.log("📥 req.body:", req.body);
      console.log("📸 req.files:", req.files);

      // ✅ Parse JSON fields if they come as string
      try {
        if (typeof req.body.additionalDetails === "string") {
          req.body.additionalDetails = JSON.parse(req.body.additionalDetails);
        }
        if (!Array.isArray(req.body.additionalDetails)) {
  try {
    req.body.additionalDetails = JSON.parse(req.body.additionalDetails || "[]");
  } catch {
    req.body.additionalDetails = [];
  }
}

        if (typeof req.body.suitableFor === "string") {
          req.body.suitableFor = JSON.parse(req.body.suitableFor);
        }
        if (typeof req.body.amenities === "string") {
          req.body.amenities = JSON.parse(req.body.amenities);
        }
      } catch (err) {
        console.warn("⚠️ JSON parse error:", err.message);
      }

      // 🔹 Validate userId
      if (!mongoose.Types.ObjectId.isValid(req.userId)) {
        return res.status(400).json({ error: "Invalid userId in token" });
      }

      // 🔹 Find profile of logged-in user
      const userProfile = await Profile.findOne({ email: req.user.email });
      if (!userProfile) {
        return res.status(404).json({ error: "Profile not found for this user" });
      }

      const data = req.body || {};
      data.userId = userProfile._id;
 

      // ✅ Handle floorPlan file upload
      if (req.files && req.files.floorPlan && req.files.floorPlan.length > 0) {
        data.floorPlan = `/uploads/${req.files.floorPlan[0].filename}`;
      }

      // ✅ Parse amenities JSON if sent as string
      try {
        if (typeof data.amenities === "string") {
          data.amenities = JSON.parse(data.amenities);
        }
      } catch (err) {
        console.warn("⚠️ Amenities parse error:", err.message);
        data.amenities = {};
      }

      // ✅ Handle uploaded photos properly
      let uploadedPhotos = [];
      if (req.files && req.files.photos) {
        uploadedPhotos = req.files.photos.map((f) => `/uploads/${f.filename}`);
      }

      // ✅ Fallback to any existing photos in request body
      let photosFromBody = [];
      try {
        photosFromBody =
          typeof data.photos === "string" ? JSON.parse(data.photos) : data.photos || [];
      } catch {
        photosFromBody = data.photos || [];
      }

      data.photos = uploadedPhotos.length > 0 ? uploadedPhotos : photosFromBody;

      // ✅ Parse array fields that come stringified
      ["additionalDetails", "suitableFor"].forEach((key) => {
        if (typeof data[key] === "string") {
          try {
            data[key] = JSON.parse(data[key]);
          } catch {
            console.warn(`⚠️ Failed to parse ${key}`);
          }
        }
      });

      // ✅ Normalize minStay / maxStay strings
      if (!data.minStay || data.minStay === "undefined" || data.minStay === "null") {
        data.minStay = "None";
      }
      if (!data.maxStay || data.maxStay === "undefined" || data.maxStay === "null") {
        data.maxStay = "None";
      }

      console.log("🧩 Final parsed data before saving:", data);

      // ✅ Finally create post
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
            profileImage: postAd.userId.profileImage || "https://via.placeholder.com/150",
            lastActive: postAd.userId.lastActive,
            isOnline: postAd.userId.isOnline,
          }
        : null;

      res.status(201).json({
        message: "Post created successfully ✅",
        post: {
          ...postAd.toObject(),
          advertiser,
        },
      });
    } catch (err) {
      console.error("❌ Error creating post:", err);
      res.status(500).json({ error: "Something went wrong", details: err.message });
    }
  }
);

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
            fullName:
              `${post.userId.firstName || ""} ${post.userId.lastName || ""}`.trim() ||
              post.userId.email,
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
    const userProfile = await Profile.findOne({ email: req.user.email });
    if (!userProfile) {
      return res.status(404).json({ error: "Profile not found for this user" });
    }

    const posts = await PostAd.find({ userId: userProfile._id })
      .populate("userId", "firstName lastName profileImage lastActive isOnline email")
      .sort({ createdAt: -1 });

    const formatted = posts.map((post) => {
      const advertiser = post.userId
        ? {
            _id: post.userId._id,
            fullName:
              `${post.userId.firstName || ""} ${post.userId.lastName || ""}`.trim() ||
              post.userId.email,
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
          fullName:
            `${post.userId.firstName || ""} ${post.userId.lastName || ""}`.trim() ||
            post.userId.email,
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
    const userProfile = await Profile.findOne({ email: req.user.email });
    if (!userProfile) {
      return res.status(404).json({ error: "Profile not found for this user" });
    }

    const post = await PostAd.findOneAndDelete({
      _id: req.params.id,
      userId: userProfile._id,
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found or not authorized" });
    }

    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
 