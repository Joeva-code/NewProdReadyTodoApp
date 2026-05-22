// Simplified auth middleware - extend with JWT for production
const authMiddleware = async (req, res, next) => {
  // For demo purposes, we'll use a simple user_id from header
  // In production, use JWT tokens
  const userId = req.headers['x-user-id'];
  
  if (!userId) {
    return res.status(401).json({
      status: 'error',
      message: 'Authentication required',
    });
  }

  req.user = { id: parseInt(userId) };
  next();
};

module.exports = authMiddleware;