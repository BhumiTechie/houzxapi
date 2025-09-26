// const express = require('express');
// const Buy = require('../models/Buy');
// const User = require('../models/User');

// const router = express.Router();

// router.post('/', async (req, res) => {
//   try {
//     const { userId, ...rest } = req.body;

//     const user = await User.findById(userId).select(
//       'email firstName lastName profileImage isOnline lastActive'
//     );
//     if (!user) return res.status(404).json({ message: 'User not found' });

//     const fullName = `${user.firstName} ${user.lastName}`;

//     const property = new Buy({
//       ...rest,
//       advertiser: {
//         fullName,
//         profileImage: user.profileImage,
//         lastActive: user.lastActive,
//         isOnline: user.isOnline
//       },
//       userId: user._id  // reference top-level
//     });

//     const savedProperty = await property.save();

//     // ✅ populate top-level userId instead
//     const populated = await Buy.findById(savedProperty._id).populate({
//       path: 'userId',
//       select: 'email firstName lastName profileImage isOnline lastActive'
//     });

//     res.status(201).json({
//       message: "Post created successfully",
//       post: populated
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Failed to save property", error: err.message });
//   }
// });

// module.exports = router;
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Buy = require("../models/Buy");
const Profile = require("../models/profile");
const auth = require("../middleware/authMiddleware");

router.post("/", auth, async (req, res) => {
  try {
    const data = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(req.userId)) {
      return res.status(400).json({ error: "Invalid userId in token" });
    }

    // ✅ link post with Profile._id
    data.userId = new mongoose.Types.ObjectId(req.userId);
    

    // ✅ instance ka naam change
    const newProperty = new Buy(data);
    await newProperty.save();

    // ✅ Populate advertiser from Profile
    const savedProperty = await Buy.findById(newProperty._id).populate(
      "userId",
      "firstName lastName profileImage lastActive isOnline email"
    );

    const advertiser = savedProperty.userId
      ? {
          _id: savedProperty.userId._id,
          fullName:
            `${savedProperty.userId.firstName || ""} ${savedProperty.userId.lastName || ""}`.trim() ||
            savedProperty.userId.email,
          profileImage:
            savedProperty.userId.profileImage || "https://via.placeholder.com/150",
          lastActive: savedProperty.userId.lastActive,
          isOnline: savedProperty.userId.isOnline,
        }
      : null;

    res.status(201).json({
      message: "Post created successfully",
      post: {
        ...savedProperty.toObject(),
        advertiser,
      },
    });
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).json({ error: "Something went wrong", details: err.message });
  }
});
router.get("/", async (req, res) => {
  try {
    const { city, location, minBudget, maxBudget, propertyTypes, furnishTypes } = req.query;
    const filter = {};

    // 🔹 City filter (case-insensitive)
    if (city) filter.city = { $regex: city.trim(), $options: "i" };

    // 🔹 Location / Locality filter (case-insensitive)
    if (location) filter.locality = { $regex: location.trim(), $options: "i" };

    // 🔹 Budget filter
    if (minBudget || maxBudget) filter.propertyPrice = {};
    if (minBudget) filter.propertyPrice.$gte = Number(minBudget);
    if (maxBudget) filter.propertyPrice.$lte = Number(maxBudget);

    // 🔹 Property Types filter (case-insensitive)
    if (propertyTypes) {
      filter.propertyType = {
        $in: propertyTypes.split(',').map(t => new RegExp(`^${t.trim()}$`, 'i'))
      };
    }

    // 🔹 Furnish Types filter (case-insensitive)
    if (furnishTypes) {
      filter.furnishType = {
        $in: furnishTypes.split(',').map(t => new RegExp(`^${t.trim()}$`, 'i'))
      };
    }

    console.log('🔹 Filter sent to DB:', JSON.stringify(filter));

    const posts = await Buy.find(filter)
      .populate("userId", "firstName lastName lastActive isOnline profileImage email")
      .sort({ createdAt: -1 });

    // 🔹 Add advertiser info like POST route
    const formattedPosts = posts.map(post => {
      const advertiser = post.userId
        ? {
            _id: post.userId._id,
            fullName: `${post.userId.firstName || ""} ${post.userId.lastName || ""}`.trim() || post.userId.email,
            profileImage: post.userId.profileImage || "https://via.placeholder.com/150",
            lastActive: post.userId.lastActive,
            isOnline: post.userId.isOnline,
          }
        : null;

      return {
        ...post.toObject(),
        advertiser,
      };
    });

    res.json(formattedPosts);
  } catch (err) {
    console.error('❌ Error in /buy GET:', err);
    res.status(500).json({ error: err.message });
  }
});









// 🔹 Get only my posts (logged-in user)
router.get("/my-posts", auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.userId)) {
      return res.status(400).json({ error: "Invalid userId in token" });
    }

    const posts = await Buy.find({ userId: req.userId })
      .populate("userId", "firstName lastName profileImage lastActive isOnline email")
      .sort({ createdAt: -1 });

    const formatted = posts.map((post) => {
      const advertiser = post.userId
        ? {
            _id: post.userId._id,
            fullName:
              `${post.userId.firstName || ""} ${post.userId.lastName || ""}`.trim() ||
              post.userId.email,
            profileImage: post.userId.profileImage || "https://via.placeholder.com/150",
            lastActive: post.userId.lastActive,
            isOnline: post.userId.isOnline,
          }
        : null;

      return {
        ...post.toObject(),
        advertiser,
      };
    });

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Delete my post
router.delete("/my-posts/:id", auth, async (req, res) => {
  try {
    const post = await Buy.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId, // ✅ सिर्फ अपनी ही ad delete कर पाएगा
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found or not authorized" });
    }

    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Get single post
router.get("/:id", async (req, res) => {
  try {
    const post = await Buy.findById(req.params.id).populate(
      "userId",
      "firstName lastName profileImage lastActive isOnline email"
    );

    if (!post) return res.status(404).json({ message: "Post not found" });

    const advertiser = post.userId
      ? {
          _id: post.userId._id,
          fullName:
            `${post.userId.firstName || ""} ${post.userId.lastName || ""}`.trim() ||
            post.userId.email,
          profileImage: post.userId.profileImage || "https://via.placeholder.com/150",
          lastActive: post.userId.lastActive,
          isOnline: post.userId.isOnline,
        }
      : null;

    res.json({
      ...post.toObject(),
      advertiser,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
