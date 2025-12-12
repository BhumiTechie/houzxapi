const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Buy = require("../models/Buy");
const PostAd = require("../models/PostAd");
const HousematePost = require("../models/HousematePost");

// ✅ Test route: Check all ads for a given Profile ID
router.get("/test-my-ads/:profileId", async (req, res) => {
  try {
    const profileId = req.params.profileId;

    if (!mongoose.Types.ObjectId.isValid(profileId)) {
      return res.status(400).json({ success: false, message: "Invalid Profile ID" });
    }

    const buyAds = await Buy.find({ userId: profileId });
    const rentAds = await PostAd.find({ userId: profileId });
    const housemateAds = await HousematePost.find({ postedBy: profileId });

    console.log("Buy Ads:", buyAds);
    console.log("Rent Ads:", rentAds);
    console.log("Housemate Ads:", housemateAds);

    res.json({
      success: true,
      buyAdsCount: buyAds.length,
      rentAdsCount: rentAds.length,
      housemateAdsCount: housemateAds.length,
      totalAds: buyAds.length + rentAds.length + housemateAds.length,
      details: {
        buyAds,
        rentAds,
        housemateAds,
      },
    });
  } catch (err) {
    console.error("Error in test-my-ads route:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
