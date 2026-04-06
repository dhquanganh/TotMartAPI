const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');
const validationHandler = require('../middleware/validationHandler');
const validationSchemas = require('../middleware/validationSchemas');

router.get('/health', (req, res) => {
    res.send('API is healthy');
});

router.post('/login', validationHandler.validate(validationSchemas.loginSchema), authController.login);
router.post('/logout',auth.authMiddleware, authController.logout);

module.exports = router;