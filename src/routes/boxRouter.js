const express = require('express');
const router = express.Router();
const boxController = require('../controllers/boxController');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });
const validateHandler = require('../middlewares/validationHandler');
const validationSchemas = require('../middlewares/validationSchemas');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/create-box', upload.array("images", 10),
    authMiddleware.authMiddleware,
    authMiddleware.adminMiddleware,
    validateHandler.validate(validationSchemas.createBoxSchema),
    boxController.createBox
);
router.get('/get-all-box',
    authMiddleware.authMiddleware,
    authMiddleware.adminMiddleware,
    boxController.getAllBoxes
);
router.get('/get-box-by-id/:_id',
    authMiddleware.authMiddleware,
    authMiddleware.adminMiddleware,
    boxController.getBoxById
);
router.put('/update-box/:_id', upload.array("images", 10),
    authMiddleware.authMiddleware,
    authMiddleware.adminMiddleware,
    validateHandler.validate(validationSchemas.createBoxSchema),
    boxController.updateBox
);
router.delete('/delete-box/:_id',
    authMiddleware.authMiddleware,
    authMiddleware.adminMiddleware,
    boxController.deleteBox
);

module.exports = router;