const express = require('express');
const router = express.Router();
const checkOutController = require('../controllers/checkOutController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/check-out',
    authMiddleware.authMiddleware,
    checkOutController.checkOut
);

module.exports = router;