const Notification = require("../models/Notification");
const {
  registerSseClient,
  removeSseClient,
  issueSseTicket,
  consumeSseTicket,
} = require("../utils/notify");

class NotificationController {
  // Admin gọi API này trước (JWT header bình thường) để lấy vé, rồi FE mở
  // EventSource kèm vé qua query string.
  issueStreamTicket(req, res) {
    const ticket = issueSseTicket(req.userId);
    res.status(200).json({ success: true, data: { ticket } });
  }

  // Kết nối SSE thật — không qua authMiddleware, xác thực bằng vé.
  streamNotifications(req, res) {
    const userId = consumeSseTicket(req.query.ticket);
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid or expired ticket" });
    }

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    res.write("\n");

    const clientId = `${userId}-${Date.now()}`;
    registerSseClient(clientId, res);

    // Heartbeat giữ kết nối sống qua proxy/load balancer (nhiều proxy tự đóng
    // connection nhàn rỗi sau ~30-60s nếu không có dữ liệu được gửi).
    const heartbeat = setInterval(() => {
      try {
        res.write(": ping\n\n");
      } catch (err) {
        clearInterval(heartbeat);
        removeSseClient(clientId);
      }
    }, 20000);

    req.on("close", () => {
      clearInterval(heartbeat);
      removeSseClient(clientId);
    });
  }

  async getNotifications(req, res, next) {
    try {
      const page = Math.max(parseInt(req.query.page) || 1, 1);
      const limit = Math.min(parseInt(req.query.limit) || 20, 100);
      const filter = {};
      if (req.query.isRead !== undefined) {
        filter.isRead = req.query.isRead === "true";
      }

      const [notifications, total, unreadCount] = await Promise.all([
        Notification.find(filter)
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit),
        Notification.countDocuments(filter),
        Notification.countDocuments({ isRead: false }),
      ]);

      res.status(200).json({
        success: true,
        data: notifications,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        unreadCount,
      });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req, res, next) {
    try {
      const notification = await Notification.findByIdAndUpdate(
        req.params._id,
        { isRead: true, readAt: new Date(), readBy: req.userId },
        { new: true },
      );
      if (!notification) {
        return res
          .status(404)
          .json({ success: false, message: "Không tìm thấy thông báo" });
      }
      res.status(200).json({ success: true, data: notification });
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req, res, next) {
    try {
      await Notification.updateMany(
        { isRead: false },
        { isRead: true, readAt: new Date(), readBy: req.userId },
      );
      res
        .status(200)
        .json({ success: true, message: "Đã đánh dấu tất cả đã đọc" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new NotificationController();
