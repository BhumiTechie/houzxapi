const express = require("express");
const router = express.Router();

const Buy = require("../models/Buy");
const PostAd = require("../models/PostAd");
const HousematePost = require("../models/HousematePost");

router.get("/myads/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const buy = await Buy.find({ userId });
    const rent = await PostAd.find({ userId });
    const housemate = await HousematePost.find({ postedBy: userId });

    return res.json({
      success: true,
      ads: [
        ...buy,
        ...rent,
        ...housemate
      ]
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
});

module.exports = router;
