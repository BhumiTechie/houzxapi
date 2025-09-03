require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Route imports
const authRoutes = require('./routes/authRoutes');
const adRoutes = require('./routes/adsRoutes');
const userRoutes = require('./routes/userRoutes');
const profileRoutes = require('./routes/profileRoute');
const postAdRoutes = require('./routes/postAdRoutes');
const housemateRoutes  = require('./routes/housemateRoutes');
const propertyRoutes = require('./routes/propertySearch');
const messageRoutes = require('./routes/messages');

const app = express();

// ✅ Middlewares
app.use(cors());
app.use(bodyParser.json());

// ✅ API Routes
app.use('/auth', authRoutes);
app.use('/ads', adRoutes);
app.use('/user', userRoutes);
app.use('/profile', profileRoutes);
app.use('/postads', postAdRoutes);
app.use('/housemate-posts', housemateRoutes);
app.use('/properties', propertyRoutes);
app.use('/messages', messageRoutes);


module.exports = app;
