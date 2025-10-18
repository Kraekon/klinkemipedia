// Simple admin authentication middleware
// TODO: Implement proper JWT-based authentication in production

const adminAuth = (req, res, next) => {
  // For now, we'll use a simple header-based authentication
  // In production, this should be replaced with proper JWT authentication
  const adminKey = req.headers['x-admin-key'];
  
  if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Admin access required'
    });
  }
  
  next();
};

module.exports = { adminAuth };
