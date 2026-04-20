const express = require('express');
const router = express.Router();
const brandController = require('../controllers/brandController');
const authMiddleware = require('../middleware/authMiddleware');
const validationHandler = require('../middleware/validationHandler');
const validationSchemas = require('../middleware/validationSchemas');

router.post('/create-brand',
    authMiddleware.authMiddleware,
    authMiddleware.adminMiddleware,
    validationHandler.validate(validationSchemas.brandSchema),
    brandController.createBrand
)
router.put('/update-brand/:_id',
    authMiddleware.authMiddleware,
    authMiddleware.adminMiddleware,
    validationHandler.validate(validationSchemas.idParamSchema, 'params'),
    validationHandler.validate(validationSchemas.updateBrandSchema),
    brandController.updateBrand
)
router.delete('/delete-brand/:_id',
    authMiddleware.authMiddleware,
    authMiddleware.adminMiddleware,
    validationHandler.validate(validationSchemas.idParamSchema, 'params'),
    brandController.deleteBrand
)

router.get('/get-all-brands',
    brandController.getAllBrands
)

module.exports = router;