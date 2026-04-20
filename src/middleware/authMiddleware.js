const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');
class authMiddleware {
  async authMiddleware(req, res, next) {
    try {
      // Get token from headers
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'No token provided'
        });
      }

      // Verify token
      const decoded = verifyToken(token);
      req.user = decoded;
      req.userId = decoded.userId;
      const user = await User.findById(decoded.userId);
      if (user.isActive === false) {
        return res.status(403).json({
          success: true,
          message: 'Account is locked. Please contact Admin to support.'
        });
      }
      next();
    } catch (error) {
      next(error);
    }
  }

  async adminMiddleware(req, res, next) {
    try {
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'No token provided'
        });
      }
      const decoded = verifyToken(token);
      if (decoded.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied! Admins only'
        });
      }
      req.userId = decoded.userId;
      next();
    } catch (error) {
      next(error);
    }
  }
}
module.exports = new authMiddleware();
