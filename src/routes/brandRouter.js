const express = require('express');
const router = express.Router();
const brandController = require('../controllers/brandController');
const authMiddleware = require('../middleware/authMiddleware');
const validationHandler = require('../middleware/validationHandler');
const validationSchemas = require('../middleware/validationSchemas');

router.post('/create-brand',
    authMiddleware.authMiddleware,
    validationHandler.validate(validationSchemas.brandSchema),
    brandController.createBrand
)
router.put('/update-brand/:_id',
    authMiddleware.authMiddleware,
    validationHandler.validate(validationSchemas.brandSchema),
    validationHandler.validate(validationSchemas.idParamSchema, 'params'),
    brandController.updateBrand
)
router.delete('/delete-brand/:_id',
    authMiddleware.authMiddleware,
    validationHandler.validate(validationSchemas.idParamSchema, 'params'),
    brandController.deleteBrand
)

module.exports = router;