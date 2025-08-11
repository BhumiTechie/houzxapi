const express = require('express');
const router = express.Router();
const Otp = require('../models/Otp');
const generateOtp = require('../utils/generateOtp');
const transporter = require('../config/mailer');

// ✅ Send OTP
router.post('/send', async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: 'Email is required' });

  const code = generateOtp();
  try {
    await transporter.sendMail({
      from: `"MyApp" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your OTP Code',
      html: `<h3>Your OTP is <b>${code}</b></h3><p>It is valid for 5 minutes.</p>`,
    });

    await Otp.deleteMany({ email }); // Remove previous OTPs
    await Otp.create({ email, code });

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});

// ✅ Verify OTP
router.post('/verify', async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) return res.status(400).json({ message: 'Email and OTP are required' });

  const otpRecord = await Otp.findOne({ email, code });

  if (!otpRecord) {
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  }

  await Otp.deleteMany({ email }); // OTP verified — remove from DB
  res.status(200).json({ message: 'OTP verified successfully' });
});

module.exports = router;
