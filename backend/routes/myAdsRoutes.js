// routes/myAds.js
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Buy = require("../models/Buy");
const PostAd = require("../models/PostAd");
const HousematePost = require("../models/HousematePost");
const Profile = require("../models/profile");

// Helper function to format advertiser
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

// Unified route: GET /my-ads/:userId
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid userId" });
    }

    // Find profile for the given userId
    const profile = await Profile.findById(userId);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    // Fetch Buy ads
    const buyAds = await Buy.find({ userId }).populate(
      "userId",
      "firstName lastName profileImage lastActive isOnline email"
    );

    // Fetch PostAd ads
    const postAds = await PostAd.find({ userId }).populate(
      "userId",
      "firstName lastName profileImage lastActive isOnline email"
    );

    // Fetch HousematePost ads
    const housemateAds = await HousematePost.find({ postedBy: userId }).populate(
      "postedBy",
      "firstName lastName profileImage lastActive isOnline email"
    );

    // Format all ads with advertiser
    const formatAd = (ad, userField = "userId") => {
      const user = ad[userField];
      return {
        ...ad.toObject(),
        advertiser: formatAdvertiser(user),
      };
    };

    const allAds = [
      ...buyAds.map((ad) => formatAd(ad, "userId")),
      ...postAds.map((ad) => formatAd(ad, "userId")),
      ...housemateAds.map((ad) => formatAd(ad, "postedBy")),
    ];

    res.json({ success: true, ads: allAds });
  } catch (err) {
    console.error("❌ Error fetching my ads:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

module.exports = router;
