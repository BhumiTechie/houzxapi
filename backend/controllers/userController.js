const AdUser = require('../models/AdUser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Profile = require('../models/profile');


// Signup
exports.signup = async (req, res) => {
  try {
    const { email, phoneNumber, password } = req.body;

    const existingUser = await AdUser.findOne({ $or: [{ email }, { phoneNumber }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email or phone number' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new AdUser({
      email,
      phoneNumber,
      password: hashedPassword,
      profilePic: `https://i.pravatar.cc/150?u=${email}`
    });

    await newUser.save();

    // JWT Token with email
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({ message: 'User registered successfully', user: newUser, token });

  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await AdUser.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // JWT Token with email
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // ✅ Profile fetch karo
    const profile = await Profile.findOne({ email: user.email });

    // ✅ Clean + merged user data
    const userData = {
      _id: user._id,
      email: user.email,
      phoneNumber: user.phoneNumber,
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      name: profile ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim() : '',
      profileImage: profile?.profileImage || user.profilePic || null,
    };

    res.status(200).json({ message: 'Login successful', user: userData, token });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};



