const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Buy = require("../models/Buy");
const PostAd = require("../models/PostAd");
const HousematePost = require("../models/HousematePost");

// GET all ads of a user (Buy, Rent, Housemate)
router.get("/myads/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID"
      });
    }

    // Fetch from all three collections
    const buy = await Buy.find({ userId: mongoose.Types.ObjectId(userId) });
    const rent = await PostAd.find({ userId: mongoose.Types.ObjectId(userId) });
    const housemate = await HousematePost.find({ postedBy: mongoose.Types.ObjectId(userId) });

    // Combine all ads
    const allAds = [
      ...buy.map(ad => ({ ...ad.toObject(), type: "Buy" })),
      ...rent.map(ad => ({ ...ad.toObject(), type: "Rent" })),
      ...housemate.map(ad => ({ ...ad.toObject(), type: "Housemate" })),
    ];

    // If no ads found
    if (allAds.length === 0) {
      return res.status(200).json({
        success: true,
        ads: [],
        message: "No ads found for this user"
      });
    }

    // Return combined ads
    return res.json({
      success: true,
      ads: allAds
    });

  } catch (err) {
    console.error("MY ADS ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
});

module.exports = router;
