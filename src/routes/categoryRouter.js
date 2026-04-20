const experss = require("express");
const router = experss.Router();

const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middleware/authMiddleware');
const validationHandler = require('../middleware/validationHandler');
const validationSchemas = require('../middleware/validationSchemas');

router.post('/create-category',
    authMiddleware.authMiddleware,
    authMiddleware.adminMiddleware,
    validationHandler.validate(validationSchemas.categorySchema),
    categoryController.createCategory
);
router.put('/update-category/:_id',
    authMiddleware.authMiddleware,
    authMiddleware.adminMiddleware,
    validationHandler.validate(validationSchemas.idParamSchema, 'params'),
    validationHandler.validate(validationSchemas.updateCategorySchema),
    categoryController.updateCategory
);
router.delete('/delete-category/:_id',
    authMiddleware.authMiddleware,
    authMiddleware.adminMiddleware,
    validationHandler.validate(validationSchemas.idParamSchema, 'params'),
    categoryController.deleteCategory
);
router.get('/get-all-categories',
    authMiddleware.authMiddleware,
    authMiddleware.adminMiddleware,
    categoryController.getAllCategories);

module.exports = router;
