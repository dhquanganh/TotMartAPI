const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');

router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running'
    })
});

router.post('/login', authController.login);
router.post('/logout',auth.authMiddleware, authController.logout);

module.exports = router;