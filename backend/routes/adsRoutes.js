const express = require('express');
const router = express.Router();
const adController = require('../controllers/adController');

router.post('/create', adController.createAd);
router.get('/all', adController.getAllAds);
router.get('/type/:type', adController.getAdsByType);   // New route to get ads by type
router.put('/update/:id', adController.updateAd);
router.delete('/delete/:id', adController.deleteAd);

module.exports = router;
