require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const updateActivity = require('./middleware/activity');
const path = require("path");

// Route imports
const authRoutes = require('./routes/authRoutes');
const adRoutes = require('./routes/adsRoutes');
const userRoutes = require('./routes/userRoutes');
const profileRoutes = require('./routes/profileRoute');
const postAdRoutes = require('./routes/postAdRoutes');
const housemateRoutes  = require('./routes/housemateRoutes');
const propertyRoutes = require('./routes/propertySearch');
const messageRoutes = require('./routes/messages');
const BuyRoutes = require('./routes/buy');
const tenantRoutes = require('./routes/tenant');
const uploadRoutes = require('./routes/upload');
const MyAdsRoutes = require('./routes/myAdsRoutes');


const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// ✅ API Routes
app.use('/auth', authRoutes);
app.use('/ads', adRoutes);
app.use('/user', userRoutes);
app.use('/profile', profileRoutes);
app.use('/postads', postAdRoutes);
app.use('/housemate-posts', housemateRoutes);
app.use('/properties', propertyRoutes);
app.use('/messages', messageRoutes);
app.use('/buy', BuyRoutes);
app.use('/tenant', tenantRoutes); 



app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// app.use('/upload', uploadRoutes);
app.use("/myads", MyAdsRoutes);




module.exports = app;
