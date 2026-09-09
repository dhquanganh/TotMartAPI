const express = require("express");
const router = express.Router();
const couponController = require("../controllers/couponController");
const authMiddleware = require("../middleware/authMiddleware");
const validationHandler = require("../middleware/validationHandler");
const {
  couponSchema,
  updateCouponSchema,
  idParamSchema,
} = require("../middleware/validationSchemas");

router.post(
  "/create-coupon",
  authMiddleware.authMiddleware,
  authMiddleware.adminMiddleware,
  validationHandler.validate(couponSchema, "body"),
  couponController.createCoupon,
);

router.get(
  "/get-all-coupons",
  authMiddleware.authMiddleware,
  authMiddleware.adminMiddleware,
  couponController.getAllCoupons,
);

router.put(
  "/update-coupon/:_id",
  authMiddleware.authMiddleware,
  authMiddleware.adminMiddleware,
  validationHandler.validate(idParamSchema, "params"),
  validationHandler.validate(updateCouponSchema, "body"),
  couponController.updateCoupon,
);

router.delete(
  "/delete-coupon/:_id",
  authMiddleware.authMiddleware,
  authMiddleware.adminMiddleware,
  validationHandler.validate(idParamSchema, "params"),
  couponController.deleteCoupon,
);

module.exports = router;
