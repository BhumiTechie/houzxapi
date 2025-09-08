const Profile = require('../models/Profile');

async function updateActivity(req, res, next) {
  try {
    if (req.userId) {
      await Profile.findByIdAndUpdate(req.userId, {
        lastActive: new Date(),
        isOnline: true
      });
    }
  } catch (err) {
    console.error("Error updating activity:", err);
  }
  next();
}

module.exports = updateActivity;
