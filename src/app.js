const express = require('express');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const cors = require('cors')
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS (optional - uncomment if needed)
app.use(cors());

// Routes
routes(app);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

module.exports = app;
