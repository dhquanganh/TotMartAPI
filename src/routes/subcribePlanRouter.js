const express = require('express');
const router = express.Router();
const subcribePlanController = require('../controllers/subcribePlanController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/create-subcribe-plan',
    authMiddleware.authMiddleware,
    authMiddleware.adminMiddleware,
    subcribePlanController.createSubcribePlan
);

router.get('/get-all-subcribe-plans',
    authMiddleware.authMiddleware,
    authMiddleware.adminMiddleware,
    subcribePlanController.getAllSubcribePlans
);

router.post('/process-deliveries',
    authMiddleware.authMiddleware,
    authMiddleware.adminMiddleware,
    subcribePlanController.triggerDeliveryProcessing
);

router.get('/user/:userId',
    authMiddleware.authMiddleware,
    authMiddleware.adminMiddleware,
    subcribePlanController.getSubcribePlansByUser
);

router.get('/:id',
    authMiddleware.authMiddleware,
    authMiddleware.adminMiddleware,
    subcribePlanController.getSubcribePlanById
);

router.patch('/:id/cancel',
    authMiddleware.authMiddleware,
    authMiddleware.adminMiddleware,
    subcribePlanController.cancelSubcribePlan
);

router.patch('/:id/cancel-immediately',
    authMiddleware.authMiddleware,
    authMiddleware.adminMiddleware,
    subcribePlanController.cancelImmediately
);

module.exports = router;
