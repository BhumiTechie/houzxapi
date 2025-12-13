const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const authMiddleware = require("../middleware/authMiddleware");

const Buy = require("../models/Buy");
const PostAd = require("../models/PostAd");
const HousematePost = require("../models/HousematePost");

// helper
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

// ✅ GET MY ADS
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId; // 🔥 FIX

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid userId" });
    }

    const buyAds = await Buy.find({ userId }).populate(
      "userId",
      "firstName lastName profileImage lastActive isOnline email"
    );

    const rentAds = await PostAd.find({ userId }).populate(
      "userId",
      "firstName lastName profileImage lastActive isOnline email"
    );

    const sharedAds = await HousematePost.find({ postedBy: userId }).populate(
      "postedBy",
      "firstName lastName profileImage lastActive isOnline email"
    );

    const ads = [
      ...buyAds.map((ad) => ({
        ...ad.toObject(),
        adType: "BUY",
        advertiser: formatAdvertiser(ad.userId),
      })),
      ...rentAds.map((ad) => ({
        ...ad.toObject(),
        adType: "RENT",
        advertiser: formatAdvertiser(ad.userId),
      })),
      ...sharedAds.map((ad) => ({
        ...ad.toObject(),
        adType: "SHARED",
        advertiser: formatAdvertiser(ad.postedBy),
      })),
    ];

    res.json({ success: true, ads });
  } catch (err) {
    console.error("❌ MyAds error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
