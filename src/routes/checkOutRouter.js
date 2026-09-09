const express = require("express");
const router = express.Router();
const checkOutController = require("../controllers/checkOutController");
const authMiddleware = require("../middleware/authMiddleware");
const sepayAuth = require("../middleware/sepayAuth");
const validationHandler = require("../middleware/validationHandler");
const {
  checkoutSchema,
  sepayWebhookSchema,
  idParamSchema,
} = require("../middleware/validationSchemas");

// ==== User đặt hàng (COD hoặc online) ====
router.post(
  "/check-out",
  authMiddleware.authMiddleware,
  validationHandler.validate(checkoutSchema, "body"),
  checkOutController.checkOut,
);

// ==== Webhook SePay — KHÔNG dùng authMiddleware (SePay không có JWT hệ thống),
// chỉ xác thực bằng API key riêng ====
router.post(
  "/sepay-webhook",
  sepayAuth.verifyApiKey,
  validationHandler.validate(sepayWebhookSchema, "body"),
  checkOutController.sepayWebhook,
);

// ==== User huỷ đơn của mình / admin huỷ bất kỳ đơn nào (check quyền trong controller) ====
router.post(
  "/cancel/:_id",
  authMiddleware.authMiddleware,
  validationHandler.validate(idParamSchema, "params"),
  checkOutController.cancelOrder,
);

// ==== Admin xác nhận đơn COD trước khi giao ====
router.post(
  "/confirm-cod/:_id",
  authMiddleware.authMiddleware,
  authMiddleware.adminMiddleware,
  validationHandler.validate(idParamSchema, "params"),
  checkOutController.confirmCodOrder,
);

// ==== Admin/shipper xác nhận đã giao và đã thu tiền COD ====
router.post(
  "/mark-cod-delivered/:_id",
  authMiddleware.authMiddleware,
  authMiddleware.adminMiddleware,
  validationHandler.validate(idParamSchema, "params"),
  checkOutController.markCodDelivered,
);

module.exports = router;
