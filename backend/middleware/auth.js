const jwt = require('jsonwebtoken');
const { ROLE_PERMISSIONS } = require('../config/roles');

// Authenticate JWT token
const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Authorize based on permissions
const authorize = (...requiredPermissions) => {
  return (req, res, next) => {
    try {
      const userRole = req.user.role;
      const userPermissions = ROLE_PERMISSIONS[userRole] || [];

      const hasPermission = requiredPermissions.every((permission) =>
        userPermissions.includes(permission)
      );

      if (!hasPermission) {
        return res.status(403).json({
          message: 'Insufficient permissions',
        });
      }

      next();
    } catch (error) {
      return res.status(403).json({ message: 'Authorization failed' });
    }
  };
};

// Check if user has any of the specified roles
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Access denied for this role',
      });
    }
    next();
  };
};

module.exports = {
  authenticate,
  authorize,
  authorizeRoles,
};
