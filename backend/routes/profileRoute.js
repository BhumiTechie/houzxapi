// routes/profile.js
const express = require('express');
const router = express.Router();
const AdUser = require('../models/AdUser');
const authMiddleware = require('../middleware/authMiddleware');

router.put('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, profileImage } = req.body;

    const user = await AdUser.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (profileImage) user.profileImage = profileImage;

    await user.save();

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
