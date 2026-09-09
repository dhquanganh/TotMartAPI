const app = require("./app");
const { connectDB } = require("./config/database");
const config = require("./config/environment");
const { startDeliveryScheduler } = require("./jobs/deliveryScheduler");
const { startOrderExpiryScheduler } = require("./jobs/orderExpiryScheduler");

const server = async () => {
  try {
    await connectDB();

    const PORT = config.port;
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}/api/home/health`);
      console.log(`Environment: ${config.nodeEnv}`);

      startDeliveryScheduler();
      startOrderExpiryScheduler();
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

process.on("unhandledRejection", (error) => {
  console.error("Unhandled Rejection:", error.message);
  process.exit(1);
});

server();
