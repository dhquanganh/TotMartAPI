const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/get-cart/:_id',
    authMiddleware.authMiddleware,
    cartController.getCartByUser
);
router.get('/get-all-cart',
    authMiddleware.authMiddleware,
    authMiddleware.adminMiddleware,
    cartController.getAllCart
);
router.post('/add-to-cart',
    authMiddleware.authMiddleware,
    cartController.addToCart
);
router.put('/update-cart/:_id',
    authMiddleware.authMiddleware,
    cartController.updateCart
);
router.delete('/delete-from-cart/:_id',
    authMiddleware.authMiddleware,
    cartController.deleteFromCart
);

router.post('/add-subcribe-plan-to-cart',
    authMiddleware.authMiddleware,
    cartController.addSubcribePlanToCart
);
router.put('/update-subcribe-cart',
    authMiddleware.authMiddleware,
    cartController.updateSubcribeCart
);
router.delete('/delete-from-subcribe-cart/:_id',
    authMiddleware.authMiddleware,
    cartController.deleteFromSubcribeCart
);

router.get('/get-subcribe-cart/:_id',
    authMiddleware.authMiddleware,
    cartController.getSubcribeCartByUser
);
module.exports = router;