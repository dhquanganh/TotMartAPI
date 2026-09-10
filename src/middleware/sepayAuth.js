const crypto = require("crypto");

class SepayAuth {
  verifyApiKey(req, res, next) {
    const configuredKey = process.env.SEPAY_API_KEY;
    if (!configuredKey) {
      console.error(
        "[sepayAuth] SEPAY_API_KEY chưa được cấu hình trong environment",
      );
      return res
        .status(500)
        .json({ success: false, message: "Webhook is not configured" });
    }

    const received = req.headers["authorization"] || "";
    const expected = `Apikey ${configuredKey}`;

    const receivedBuf = Buffer.from(received);
    const expectedBuf = Buffer.from(expected);

    const isValid =
      receivedBuf.length === expectedBuf.length &&
      crypto.timingSafeEqual(receivedBuf, expectedBuf);

    if (!isValid) {
      console.warn("[sepayAuth] Webhook auth failed", {
        ip: req.ip,
        at: new Date().toISOString(),
      });
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    next();
  }
}

module.exports = new SepayAuth();
