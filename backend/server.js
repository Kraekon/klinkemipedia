const express = require('express');
const cors = require('cors');
const path = require('path');
const { validate: validateEnvironment, getEnv } = require('./config/environment');

// Validate environment configuration before starting
if (!validateEnvironment()) {
  console.error('\n❌ Server cannot start due to configuration errors.');
  console.error('Please fix the issues above and try again.\n');
  process.exit(1);
}

const connectDB = require('./config/db');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

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

// Mount tags routes
app.use('/api/tags', require('./routes/tags'));

// Mount media routes
app.use('/api/media', require('./routes/media'));

// Mount user routes
app.use('/api/users', require('./routes/users'));

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const mongoose = require('mongoose');
  const isDbConnected = mongoose.connection.readyState === 1;
  
  res.json({
    status: isDbConnected ? 'healthy' : 'unhealthy',
    database: isDbConnected ? 'connected' : 'disconnected',
    port: getEnv('PORT', 5001)
  });
});

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

// Start server with health checks
const PORT = getEnv('PORT', 5001);
const StartupHealthCheck = require('./config/startup');

const startServer = async () => {
  const healthCheck = new StartupHealthCheck();
  const checksPass = await healthCheck.runChecks(PORT);
  
  if (!checksPass) {
    console.error('❌ Server cannot start due to failed health checks.');
    process.exit(1);
  }
  
  app.listen(PORT, () => {
    console.log('🚀 Server Started Successfully!');
    console.log('─────────────────────────────────────');
    console.log(`📡 API available at: http://localhost:${PORT}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
    console.log(`📚 Articles API: http://localhost:${PORT}/api/articles`);
    console.log('─────────────────────────────────────\n');
  });
};

startServer();

module.exports = app;
