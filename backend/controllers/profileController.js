const Profile = require('../models/Profile');

exports.getProfile = async (req, res) => {
  try {
    const email = req.user.email;
    if (!email) return res.status(400).json({ message: 'Email missing in token' });

    const profile = await Profile.findOne({ email });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    res.json({ profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const email = req.user.email;
    if (!email) return res.status(400).json({ message: 'Email missing in token' });

    const { firstName, lastName, profileImage } = req.body;

    let profile = await Profile.findOne({ email });

    if (!profile) {
      profile = new Profile({ email });
    }

    if (firstName !== undefined) profile.firstName = firstName;
    if (lastName !== undefined) profile.lastName = lastName;
    if (profileImage !== undefined) profile.profileImage = profileImage;

    await profile.save();

    res.json({ message: 'Profile updated successfully', profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
