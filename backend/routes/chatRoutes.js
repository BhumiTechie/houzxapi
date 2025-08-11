const express = require('express');
const router = express.Router();
const { getAllMessages } = require('../controllers/chatController');

router.get('/', getAllMessages);

module.exports = router;
