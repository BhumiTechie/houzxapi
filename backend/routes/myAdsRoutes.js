const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const authMiddleware = require("../middleware/authMiddleware");

const Buy = require("../models/Buy");
const PostAd = require("../models/PostAd");
const HousematePost = require("../models/HousematePost");

// GET /myads
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid userId" });
    }

    const buyAds = await Buy.find({ userId });
    const rentAds = await PostAd.find({ userId });
    const sharedAds = await HousematePost.find({ postedBy: userId });

    const allAds = [
      ...buyAds.map(ad => ({ ...ad.toObject(), adType: "BUY" })),
      ...rentAds.map(ad => ({ ...ad.toObject(), adType: "RENT" })),
      ...sharedAds.map(ad => ({ ...ad.toObject(), adType: "SHARED" })),
    ];

    res.json({ success: true, ads: allAds });
  } catch (err) {
    console.error("❌ MyAds error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
