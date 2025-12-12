// routes/myAds.js
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const authMiddleware = require("../middleware/auth"); // your token middleware

const Buy = require("../models/Buy");
const PostAd = require("../models/PostAd");
const HousematePost = require("../models/HousematePost");
const Profile = require("../models/profile");

// Helper to format advertiser
const formatAdvertiser = (user) =>
  user
    ? {
        _id: user._id,
        fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email,
        profileImage: user.profileImage || "https://via.placeholder.com/150",
        lastActive: user.lastActive,
        isOnline: user.isOnline,
      }
    : null;

// GET /myads - only fetch ads for logged-in user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid userId" });
    }

    // Fetch ads from all collections for this user
    const buyAds = await Buy.find({ userId }).populate("userId", "firstName lastName profileImage lastActive isOnline email");
    const postAds = await PostAd.find({ userId }).populate("userId", "firstName lastName profileImage lastActive isOnline email");
    const housemateAds = await HousematePost.find({ postedBy: userId }).populate("postedBy", "firstName lastName profileImage lastActive isOnline email");

    const formatAd = (ad, userField = "userId") => {
      const user = ad[userField];
      return {
        ...ad.toObject(),
        advertiser: formatAdvertiser(user),
      };
    };

    const allAds = [
      ...buyAds.map(ad => formatAd(ad, "userId")),
      ...postAds.map(ad => formatAd(ad, "userId")),
      ...housemateAds.map(ad => formatAd(ad, "postedBy")),
    ];

    res.json({ success: true, ads: allAds });
  } catch (err) {
    console.error("❌ Error fetching my ads:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

module.exports = router;
