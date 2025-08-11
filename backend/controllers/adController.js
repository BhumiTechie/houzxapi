const Ad = require('../models/Ad');

exports.createAd = async (req, res) => {
  try {
    const newAd = new Ad(req.body);
    const savedAd = await newAd.save();
    res.status(201).json({ message: 'Ad created successfully', ad: savedAd });
  } catch (err) {
    console.error('Create Ad Error:', err);
    res.status(500).json({ message: 'Failed to create ad' });
  }
};

exports.getAllAds = async (req, res) => {
  try {
    const ads = await Ad.find().sort({ createdAt: -1 });
    res.status(200).json(ads);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch ads' });
  }
};

exports.updateAd = async (req, res) => {
  try {
    const ad = await Ad.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!ad) return res.status(404).json({ message: 'Ad not found' });
    res.status(200).json({ message: 'Ad updated successfully', ad });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update ad' });
  }
};

exports.deleteAd = async (req, res) => {
  try {
    const ad = await Ad.findByIdAndDelete(req.params.id);
    if (!ad) return res.status(404).json({ message: 'Ad not found' });
    res.status(200).json({ message: 'Ad deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete ad' });
  }
};
// controllers/adController.js

exports.getAdsByType = async (req, res) => {
  const { type } = req.params;  // rent ya shared

  if (!['rent', 'shared'].includes(type)) {
    return res.status(400).json({ message: 'Invalid type parameter' });
  }

  try {
    const ads = await Ad.find({ type }).sort({ createdAt: -1 });
    res.status(200).json(ads);
  } catch (err) {
    console.error('Get Ads By Type Error:', err);
    res.status(500).json({ message: 'Failed to fetch ads by type' });
  }
};
