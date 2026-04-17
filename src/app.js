const express = require('express');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const cors = require('cors')
const cookieParser = require('cookie-parser');
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(cors());
app.use(cookieParser());
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
