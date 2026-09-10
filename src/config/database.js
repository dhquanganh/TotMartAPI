const mongoose = require("mongoose");
const config = require("./environment");

const connectDB = async () => {
  try {
    console.log("Đang kết nối tới URI:", config.mongodb.uri);
    const conn = await mongoose.connect(config.mongodb.uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log("MongoDB Disconnected");
  } catch (error) {
    console.error(`Error disconnecting from MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = {
  connectDB,
  disconnectDB,
};
