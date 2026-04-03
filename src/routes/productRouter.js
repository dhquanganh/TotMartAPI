const express = require('express');
const router = express.Router();

const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const validationHandler = require('../middleware/validationHandler');
const validationSchemas = require('../middleware/validationSchemas');

router.post("/create-product/", 
    validationHandler.validate(validationSchemas.productSchema), 
    authMiddleware.authMiddleware, productController.createProduct);

module.exports = router;