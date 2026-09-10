const cron = require("node-cron");
const Order = require("../models/Order");
const config = require("../config/environment");

const EXPIRY_HOURS = config.orderExpiryHours;

/**
 * Huỷ các đơn online (paymentMethod: 'online') còn ở paymentStatus 'pending' quá
 * EXPIRY_HOURS kể từ lúc tạo — vì khách không thanh toán, không có webhook nào bắn
 * tới nữa. Đơn COD KHÔNG bị job này đụng vào: COD đã trừ kho ngay lúc tạo và cần
 * admin xử lý qua confirm/cancel thủ công, không tự động huỷ theo thời gian.
 */
async function expireStaleOrders() {
  try {
    const cutoff = new Date(Date.now() - EXPIRY_HOURS * 60 * 60 * 1000);

    const staleOrders = await Order.find({
      paymentMethod: "online",
      paymentStatus: "pending",
      status: "pending",
      createdAt: { $lt: cutoff },
    });

    if (staleOrders.length === 0) return;

    console.log(
      `[OrderExpiryScheduler] Tìm thấy ${staleOrders.length} đơn online quá hạn thanh toán`,
    );

    for (const order of staleOrders) {
      try {
        // stockDeducted luôn false ở đây vì online chỉ trừ kho lúc webhook báo paid —
        // đơn pending chưa từng chạm vào kho, không cần hoàn kho.
        order.status = "cancelled";
        order.cancelReason = `Tự động huỷ - quá ${EXPIRY_HOURS}h không thanh toán`;
        order.cancelledBy = null; // null = hệ thống
        order._statusChangeNote = "Huỷ tự động bởi orderExpiryScheduler";
        await order.save();
      } catch (err) {
        console.error(
          `[OrderExpiryScheduler] Lỗi huỷ đơn ${order.orderId}:`,
          err.message,
        );
      }
    }
  } catch (error) {
    console.error("[OrderExpiryScheduler] Lỗi:", error.message);
  }
}

function startOrderExpiryScheduler() {
  console.log(
    `[OrderExpiryScheduler] Đã khởi động - chạy mỗi giờ, ngưỡng ${EXPIRY_HOURS}h`,
  );

  expireStaleOrders();

  cron.schedule("0 * * * *", () => {
    console.log(
      `[OrderExpiryScheduler] Đang kiểm tra đơn quá hạn... ${new Date().toISOString()}`,
    );
    expireStaleOrders();
  });
}

module.exports = { startOrderExpiryScheduler, expireStaleOrders };
