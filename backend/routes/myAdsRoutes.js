const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');

const Buy = require('../models/Buy');
const PostAd = require('../models/PostAd');
const HousematePost = require('../models/HousematePost');

router.get('/myads', auth, async (req, res) => {
  try {
    const userId = req.userId;

    const buyAds = await Buy.find({ userId });
    const rentAds = await PostAd.find({ userId });
    const sharedAds = await HousematePost.find({ postedBy: userId });

    const allAds = [
      ...buyAds.map(a => ({ ...a.toObject(), adType:'Buy' })),
      ...rentAds.map(a => ({ ...a.toObject(), adType:'Rent' })),
      ...sharedAds.map(a => ({ ...a.toObject(), adType:'Shared' })),
    ];

    res.json({ success:true, ads: allAds });
  } catch (e) {
    res.status(500).json({ success:false, message:'Server error' });
  }
});

module.exports = router;
