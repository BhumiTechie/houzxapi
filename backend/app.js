require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const authRoutes = require('./routes/authRoutes');
const adRoutes = require('./routes/adsRoutes');
const userRoutes = require('./routes/userRoutes');
const profileRoutes = require('./routes/profileRoute');
const postAdRoutes = require('./routes/postAdRoutes');
const housemateRoutes  = require('./routes/housemateRoutes')

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/auth', authRoutes);
app.use('/ads', adRoutes);
app.use('/user', userRoutes);
app.use('/', profileRoutes);
app.use('/postads', postAdRoutes);
app.use('/housemate-posts', housemateRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

module.exports = app;
