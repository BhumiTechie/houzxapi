require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose'); // ✅ Add this

const authRoutes = require('./routes/authRoutes');
const adRoutes = require('./routes/adsRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// ✅ Middleware
app.use(cors());
app.use(bodyParser.json());

// ✅ Routes
app.use('/auth', authRoutes);
app.use('/ads', adRoutes);
app.use('/user', userRoutes);

// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

module.exports = app;
