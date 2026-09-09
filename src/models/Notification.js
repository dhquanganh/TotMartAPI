const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["new_order", "payment_received", "order_cancelled"],
      required: true,
    },

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    orderCode: { type: String, required: true }, // denormalize orderId để FE render list không cần populate

    message: { type: String, required: true },

    // Dữ liệu tóm tắt để hiển thị nhanh trên danh sách thông báo, khỏi phải populate Order mỗi lần
    meta: {
      totalAmount: { type: Number },
      paymentMethod: { type: String },
      customerName: { type: String },
    },

    isRead: { type: Boolean, default: false },
    readAt: { type: Date, default: null },
    readBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    }, // admin nào đã đọc
  },
  {
    timestamps: true,
  },
);

notificationSchema.index({ isRead: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
