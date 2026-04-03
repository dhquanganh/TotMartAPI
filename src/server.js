const app = require('./app');
const { connectDB } = require('./config/database');
const config = require('./config/environment');

// Create server
const server = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start server
    const PORT = config.port;
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}/api/home/health`);
      console.log(`Environment: ${config.nodeEnv}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error.message);
  process.exit(1);
});

// Start the server
server();
