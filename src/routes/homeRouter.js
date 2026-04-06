const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');

router.get('/health', (req, res) => {
    res.send('API is healthy');
});

router.post('/login', authController.login);
router.post('/logout',auth.authMiddleware, authController.logout);

module.exports = router;