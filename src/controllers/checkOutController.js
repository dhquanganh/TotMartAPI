const mongoose = require("mongoose");
const crypto = require("crypto");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const User = require("../models/User");
const Product = require("../models/Product");
const { notifyMerchant } = require("../utils/notify");

function buildQrUrl(orderId, amount) {
  const acc = process.env.SEPAY_BANK_ACCOUNT;
  const bank = process.env.SEPAY_BANK_NAME;
  return `https://qr.sepay.vn/img?acc=${acc}&bank=${bank}&amount=${amount}&des=${orderId}`;
}

// Build mảng products cho Order từ Cart hiện tại — snapshot giá thật tại thời điểm mua
// (áp dụng salePercent nếu có), đồng thời validate tồn kho ngay tại bước này.
async function buildOrderProductsFromCart(cart, session) {
  const products = [];
  for (const item of cart.items) {
    if (!item.productId) continue; // bỏ qua item box/subscribe lỡ lẫn trong giỏ hàng thường

    const product = await Product.findById(item.productId).session(session);
    if (!product) {
      const err = new Error("Một sản phẩm trong giỏ hàng không còn tồn tại");
      err.statusCode = 400;
      throw err;
    }
    if (product.instock === false || product.stock < item.quantity) {
      const err = new Error(`${product.name} không đủ hàng`);
      err.statusCode = 400;
      throw err;
    }

    const unitPrice =
      product.salePercent > 0
        ? Math.round(product.price * (1 - product.salePercent / 100))
        : product.price;

    products.push({
      productId: product._id,
      name: product.name,
      unitPrice,
      quantity: item.quantity,
      brand: product.brand,
      totalPrice: unitPrice * item.quantity,
    });
  }

  if (products.length === 0) {
    const err = new Error("Giỏ hàng không có sản phẩm hợp lệ để thanh toán");
    err.statusCode = 400;
    throw err;
  }
  return products;
}

// Trừ kho atomic — điều kiện stock nằm ngay trong query filter để tránh 2 request
// cùng trừ vượt quá tồn kho thực tế (race condition).
async function deductStock(products, session) {
  for (const item of products) {
    const updated = await Product.findOneAndUpdate(
      { _id: item.productId, stock: { $gte: item.quantity } },
      { $inc: { stock: -item.quantity } },
      { session, new: true },
    );
    if (!updated) {
      const err = new Error(`Sản phẩm "${item.name}" vừa hết hàng`);
      err.statusCode = 409;
      throw err;
    }
    if (updated.stock === 0) {
      await Product.findByIdAndUpdate(
        updated._id,
        { instock: false },
        { session },
      );
    }
  }
}

async function restoreStock(products, session) {
  for (const item of products) {
    await Product.findByIdAndUpdate(
      item.productId,
      { $inc: { stock: item.quantity }, instock: true },
      { session },
    );
  }
}

class CheckOutController {
  // ==== Tạo đơn hàng (COD hoặc online) ====
  async checkOut(req, res, next) {
    const session = await mongoose.startSession();
    let createdOrder;
    try {
      await session.withTransaction(async () => {
        const userId = req.userId;
        const { addressId, paymentMethod, note } = req.validatedBody;

        const user = await User.findById(userId).session(session);
        const address = user.addreses.id(addressId);
        if (!address) {
          const err = new Error("Địa chỉ không hợp lệ");
          err.statusCode = 400;
          throw err;
        }

        const cart = await Cart.findOne({
          userId,
          isSubcribeCart: false,
        }).session(session);
        if (!cart || cart.items.length === 0) {
          const err = new Error("Giỏ hàng trống");
          err.statusCode = 400;
          throw err;
        }

        const products = await buildOrderProductsFromCart(cart, session);
        const totalAmount = products.reduce((sum, p) => sum + p.totalPrice, 0);
        const orderId =
          "TMART" +
          Date.now() +
          crypto.randomBytes(3).toString("hex").toUpperCase();

        const orderData = {
          userId,
          customerEmail: user.email,
          products,
          orderId,
          totalAmount,
          shippingAddress: {
            fullName: user.name,
            phone: address.phone,
            address: address.address,
            district: address.district,
            city: address.city,
            country: address.country,
          },
          paymentMethod,
          paymentStatus: "pending",
          status: "pending",
          note,
        };

        if (paymentMethod === "cod") {
          await deductStock(products, session);
          orderData.stockDeducted = true;
        }

        const [order] = await Order.create([orderData], { session });

        cart.items = [];
        cart.totalPrice = 0;
        await cart.save({ session });

        createdOrder = order;
      });

      // Báo merchant ngay với COD (cần admin xử lý/xác nhận thủ công).
      // Online: KHÔNG báo ở đây — chỉ báo khi webhook xác nhận đã thanh toán thật.
      if (createdOrder.paymentMethod === "cod") {
        await notifyMerchant(createdOrder, "new_order");
      }

      const data = {
        orderId: createdOrder.orderId,
        totalAmount: createdOrder.totalAmount,
      };
      if (createdOrder.paymentMethod === "online") {
        data.qrUrl = buildQrUrl(createdOrder.orderId, createdOrder.totalAmount);
      }

      res
        .status(200)
        .json({ success: true, message: "Khởi tạo đơn hàng thành công", data });
    } catch (error) {
      next(error);
    } finally {
      session.endSession();
    }
  }

  // ==== Webhook SePay — field đúng theo docs thật: content, transferAmount, transferType, code, referenceCode ====
  async sepayWebhook(req, res, next) {
    try {
      const { content, code, transferAmount, transferType, referenceCode } =
        req.validatedBody;

      if (transferType !== "in") {
        return res
          .status(200)
          .json({
            success: true,
            message: "Ignored: not an incoming transfer",
          });
      }

      // Ưu tiên `code` (SePay tự trích theo Payment code structure cấu hình sẵn trên dashboard),
      // fallback regex trên `content` nếu `code` null.
      const matched = code || (content.match(/TMART[A-Z0-9]+/) || [])[0];
      if (!matched) {
        return res
          .status(200)
          .json({ success: true, message: "No order code found" });
      }

      const alreadyProcessed = await Order.exists({
        paidReferenceCode: referenceCode,
      });
      if (alreadyProcessed) {
        return res
          .status(200)
          .json({ success: true, message: "Already processed" });
      }

      const pendingOrder = await Order.findOne({
        orderId: matched,
        paymentStatus: "pending",
      });
      if (!pendingOrder) {
        return res
          .status(200)
          .json({
            success: true,
            message: "Order not found or already processed",
          });
      }

      if (Number(transferAmount) < pendingOrder.totalAmount) {
        // Tiền đã về nhưng thiếu — không set paid, nhưng phải ghi lại, không được im lặng bỏ qua.
        pendingOrder._statusChangeNote = `Nhận ${transferAmount}/${pendingOrder.totalAmount} qua ref ${referenceCode} — thiếu tiền, cần đối soát thủ công`;
        await pendingOrder.save();
        return res
          .status(200)
          .json({ success: true, message: "Underpaid, flagged for review" });
      }

      const session = await mongoose.startSession();
      let paidOrder = null;
      try {
        await session.withTransaction(async () => {
          // Atomic transition — điều kiện `paymentStatus: pending` nằm ngay trong filter,
          // đóng khoảng hở race condition kể cả khi 2 webhook trùng chạy song song
          // hoặc withTransaction tự retry do write conflict (retry sẽ chạy lại đúng
          // query này, không dùng document cũ từ closure).
          const order = await Order.findOneAndUpdate(
            { orderId: matched, paymentStatus: "pending" },
            {
              $set: { paymentStatus: "paid", paidReferenceCode: referenceCode },
            },
            { session, new: true },
          );
          if (!order) return; // request khác đã xử lý xong trong lúc mình chờ

          try {
            await deductStock(order.products, session);
            order.status = "processing";
            order.stockDeducted = true;
          } catch (stockError) {
            // Tiền đã về nhưng không đủ hàng để giao — không được để mất dấu đơn này.
            // Giữ paymentStatus: paid, chuyển sang on_hold để admin xử lý thủ công
            // (hoàn tiền một phần / giao hàng thay thế), KHÔNG trừ kho.
            order.status = "on_hold";
            order._statusChangeNote = `Đã nhận tiền nhưng thiếu hàng khi xử lý: ${stockError.message}`;
          }
          await order.save({ session });
          paidOrder = order;
        });
      } finally {
        session.endSession();
      }

      if (paidOrder) {
        await notifyMerchant(paidOrder, "payment_received");
      }

      res.status(200).json({ success: true });
    } catch (error) {
      console.error("[sepayWebhook] error:", error);
      // Luôn trả 200 cho SePay dù lỗi nội bộ — trả 5xx sẽ khiến SePay retry liên tục
      // trong 5 giờ cho một lỗi có thể không tự khỏi. Lỗi đã log để admin xử lý thủ công.
      res
        .status(200)
        .json({ success: false, message: "Internal error, logged for review" });
    }
  }

  // ==== Admin xác nhận đơn COD (bước gọi điện xác nhận trước khi giao) ====
  async confirmCodOrder(req, res, next) {
    try {
      const order = await Order.findOne({
        _id: req.params._id,
        paymentMethod: "cod",
        status: "pending",
      });
      if (!order) {
        return res
          .status(404)
          .json({
            success: false,
            message: "Đơn không tồn tại hoặc không ở trạng thái chờ xác nhận",
          });
      }
      order._statusChangedBy = req.userId;
      order.status = "processing";
      await order.save();
      res
        .status(200)
        .json({ success: true, message: "Đã xác nhận đơn hàng", data: order });
    } catch (error) {
      next(error);
    }
  }

  // ==== Admin/shipper xác nhận đã giao và đã thu tiền COD ====
  async markCodDelivered(req, res, next) {
    try {
      const order = await Order.findOne({
        _id: req.params._id,
        paymentMethod: "cod",
      });
      if (!order || !["processing", "shipped"].includes(order.status)) {
        return res
          .status(404)
          .json({
            success: false,
            message: "Đơn không hợp lệ để xác nhận đã giao",
          });
      }
      order._statusChangedBy = req.userId;
      order.status = "delivered";
      order.paymentStatus = "paid";
      await order.save();
      res
        .status(200)
        .json({
          success: true,
          message: "Đã xác nhận giao hàng thành công",
          data: order,
        });
    } catch (error) {
      next(error);
    }
  }

  // ==== Huỷ đơn — user tự huỷ đơn của mình, hoặc admin huỷ bất kỳ đơn nào ====
  async cancelOrder(req, res, next) {
    const session = await mongoose.startSession();
    let cancelled;
    try {
      await session.withTransaction(async () => {
        const order = await Order.findById(req.params._id).session(session);
        if (!order) {
          const err = new Error("Đơn hàng không tồn tại");
          err.statusCode = 404;
          throw err;
        }
        if (req.user.role !== "admin" && String(order.userId) !== req.userId) {
          const err = new Error("Không có quyền huỷ đơn hàng này");
          err.statusCode = 403;
          throw err;
        }
        if (!["pending", "processing"].includes(order.status)) {
          const err = new Error("Đơn hàng không thể huỷ ở trạng thái hiện tại");
          err.statusCode = 400;
          throw err;
        }

        if (order.stockDeducted) {
          await restoreStock(order.products, session);
          order.stockDeducted = false;
        }

        order._statusChangedBy = req.userId;
        order.cancelReason = req.body.reason || "Không có lý do";
        order.cancelledBy = req.userId;
        order.status = "cancelled";
        await order.save({ session });
        cancelled = order;
      });

      await notifyMerchant(cancelled, "order_cancelled");
      res
        .status(200)
        .json({ success: true, message: "Đã huỷ đơn hàng", data: cancelled });
    } catch (error) {
      next(error);
    } finally {
      session.endSession();
    }
  }
}

module.exports = new CheckOutController();
