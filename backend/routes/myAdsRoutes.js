const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const authMiddleware = require("../middleware/authMiddleware");

const Buy = require("../models/Buy");
const PostAd = require("../models/PostAd");
const HousematePost = require("../models/HousematePost");

// Helper to format advertiser
const formatAdvertiser = (user) =>
  user
    ? {
        _id: user._id,
        fullName:
          `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
          user.email,
        profileImage:
          user.profileImage || "https://via.placeholder.com/150",
        lastActive: user.lastActive,
        isOnline: user.isOnline,
      }
    : null;

// ✅ GET /myads (BUY + RENT + SHARED for OWNER)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // 🔹 BUY ADS
    const buyAds = await Buy.find({
      $or: [{ userId }, { ownerId: userId }],
    }).populate("userId ownerId", "firstName lastName profileImage lastActive isOnline email");

    // 🔹 RENT ADS
    const rentAds = await PostAd.find({
      $or: [{ userId }, { ownerId: userId }],
    }).populate("userId ownerId", "firstName lastName profileImage lastActive isOnline email");

    // 🔹 SHARED ADS
    const sharedAds = await HousematePost.find({
      $or: [{ postedBy: userId }, { ownerId: userId }],
    }).populate("postedBy ownerId", "firstName lastName profileImage lastActive isOnline email");

    // 🔹 Format all ads
    const allAds = [
      ...buyAds.map(ad => ({
        ...ad.toObject(),
        advertiser: formatAdvertiser(ad.userId),
      })),
      ...rentAds.map(ad => ({
        ...ad.toObject(),
        advertiser: formatAdvertiser(ad.userId),
      })),
      ...sharedAds.map(ad => ({
        ...ad.toObject(),
        advertiser: formatAdvertiser(ad.postedBy),
      })),
    ];

    res.json({ success: true, ads: allAds });
  } catch (err) {
    console.error("❌ Error fetching my ads:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
});

module.exports = router;
