const express = require('express');
const router = express.Router();

const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const validationHandler = require('../middleware/validationHandler');
const validationSchemas = require('../middleware/validationSchemas');

router.post("/create-product/", 
    validationHandler.validate(validationSchemas.productSchema), 
    authMiddleware.authMiddleware, productController.createProduct
);
router.get("/get-all-products/",
    authMiddleware.authMiddleware,
    authMiddleware.adminMiddleware,
    productController.getAllProducts
);
router.put("/update-product/:_id",
    validationHandler.validate(validationSchemas.productUpdateSchema),
    authMiddleware.authMiddleware,
    authMiddleware.adminMiddleware,
    productController.updateProduct
);
router.delete("/delete-product/:_id",
    validationHandler.validate(validationSchemas.idParamSchema, 'params'),
    authMiddleware.authMiddleware,
    authMiddleware.adminMiddleware,
    productController.deleteProduct
);
module.exports = router;