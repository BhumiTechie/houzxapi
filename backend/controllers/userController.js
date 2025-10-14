require('dotenv').config(); // Ensure env variables are loaded

const AdUser = require('../models/AdUser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Profile = require('../models/profile');

// ✅ JWT Generators
const generateAccessToken = (payload) => {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET not set');
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const generateRefreshToken = (payload) => {
  if (!process.env.JWT_REFRESH_SECRET) throw new Error('JWT_REFRESH_SECRET not set');
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' });
};

// 🟢 SIGNUP
exports.signup = async (req, res) => {
  try {
    const { email, phoneNumber, password } = req.body;

    // 1️⃣ Check if user already exists
    const existingUser = await AdUser.findOne({ $or: [{ email }, { phoneNumber }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 2️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3️⃣ Create new user
    const newUser = new AdUser({ email, phoneNumber, password: hashedPassword });

    try {
      await newUser.save();
      console.log('User saved successfully:', newUser._id.toString());
    } catch (dbError) {
      console.error('Database save error:', dbError);
      return res.status(500).json({ message: 'Error saving user to database' });
    }

    // 4️⃣ Generate tokens safely
    let accessToken, refreshToken;
    const payload = { id: newUser._id.toString(), email }; // Convert ObjectId to string
    console.log('JWT Payload:', payload);
    console.log('JWT_SECRET loaded?', !!process.env.JWT_SECRET);
    console.log('JWT_REFRESH_SECRET loaded?', !!process.env.JWT_REFRESH_SECRET);

    try {
      accessToken = generateAccessToken(payload);
      refreshToken = generateRefreshToken(payload);
    } catch (tokenError) {
      console.error('JWT generation error:', tokenError);
      return res.status(500).json({ message: 'Token generation failed' });
    }

    // 5️⃣ Return success
    res.status(201).json({
      message: 'User registered successfully',
      user: newUser,
      accessToken,
      refreshToken
    });

  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


// 🟢 LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await AdUser.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

    let profile = await Profile.findOne({ email: user.email });
    if (!profile) {
      profile = new Profile({ email: user.email, firstName: "", lastName: "", profileImage: user.profilePic });
      await profile.save();
    }

    const payload = { id: profile._id, email: profile.email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.status(200).json({
      message: 'Login successful',
      user: profile,
      accessToken,
      refreshToken
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// 🆕 REFRESH TOKEN ENDPOINT
exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ message: 'Refresh token missing' });

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const newAccessToken = generateAccessToken({ id: decoded.id, email: decoded.email });
    res.status(200).json({ accessToken: newAccessToken });
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
};
