require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Klinkemipedia API is running!',
    timestamp: new Date().toISOString()
  });
});

// Mount article routes
app.use('/api/articles', require('./routes/articles'));

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Klinkemipedia API',
    version: '1.0.0',
    endpoints: {
      test: '/api/test',
      articles: '/api/articles',
      articleBySlug: '/api/articles/:slug',
      articlesByCategory: '/api/articles/category/:category',
      searchArticles: '/api/articles/search?q=query'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`API available at http://localhost:${PORT}`);
});

module.exports = app;
