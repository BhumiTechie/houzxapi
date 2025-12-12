const express = require('express');
const router = express.Router();

const Buy = require('../models/Buy');
const HousematePost = require('../models/HousematePost');
const PostAd = require('../models/PostAd');

router.get("/myads/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const buyAds = await Buy.find({ userId }).lean();
    const rentAds = await PostAd.find({ userId }).lean();
    const housemateAds = await HousematePost.find({ postedBy: userId }).lean();

    const allAds = [
      ...buyAds.map(a => ({ ...a, category: 'buy' })),
      ...rentAds.map(a => ({ ...a, category: 'rent' })),
      ...housemateAds.map(a => ({ ...a, category: 'housemate' }))
    ];

    res.json({ ads: allAds });

  } catch (err) {
    console.error("MyAds Error:", err);
    res.status(500).json({ message: "Error fetching ads" });
  }
});

module.exports = router;
