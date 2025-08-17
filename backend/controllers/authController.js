const User = require('../models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Generate a random 4-digit OTP
const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000);
};

// Send OTP
exports.sendOTP = async (req, res) => {
  const { phoneNumber } = req.body;
  const otp = generateOTP();
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  try {
    let user = await User.findOne({ phoneNumber });

    if (!user) {
      user = new User({ phoneNumber });
    }

    if (user.otp && user.otpExpiresAt > Date.now()) {
      console.log(`Resending OTP to ${phoneNumber}: ${user.otp}`);
      return res.json({ success: true, message: 'OTP resent successfully' });
    }

    user.otp = otp;
    user.otpExpiresAt = otpExpiresAt;
    await user.save();

    console.log(`Generated OTP for ${phoneNumber}: ${otp}`);
    res.json({ success: true, message: 'OTP generated and stored' });
  } catch (error) {
    console.error('Error generating OTP:', error);
    res.status(500).json({ success: false, message: 'Failed to generate OTP' });
  }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
  const { phoneNumber, otp } = req.body;

  try {
    const user = await User.findOne({ phoneNumber });

    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }

    // OTP mismatch
    if (String(user.otp) !== String(otp)) {
      return res.status(400).json({ success: false, message: 'Incorrect OTP' });
    }

    // OTP expired
    if (user.otpExpiresAt < Date.now()) {
      return res.status(400).json({ success: false, message: 'OTP has expired' });
    }

    res.json({ success: true, message: 'OTP verified successfully' });

  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ success: false, message: 'Failed to verify OTP' });
  }
};


// Reset Password
exports.resetPassword = async (req, res) => {
  const { phoneNumber, newPassword } = req.body;

  try {
    let user = await User.findOne({ phoneNumber });
    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ success: false, message: 'Failed to reset password' });
  }
};

// Login
exports.login = async (req, res) => {
  const { phoneNumber, password } = req.body;

  try {
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    res.json({ success: true, message: 'Login successful', user });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ success: false, message: 'Failed to login' });
  }
};

// Resend OTP
exports.resendOTP = async (req, res) => {
  const { phoneNumber } = req.body;
  const otp = generateOTP();
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

  try {
    let user = await User.findOne({ phoneNumber });
    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }

    user.otp = otp;
    user.otpExpiresAt = otpExpiresAt;
    await user.save();

    console.log(`Resent OTP for ${phoneNumber}: ${otp}`);
    res.json({ success: true, message: 'OTP resent successfully' });
  } catch (error) {
    console.error('Error resending OTP:', error);
    res.status(500).json({ success: false, message: 'Failed to resend OTP' });
  }
};
