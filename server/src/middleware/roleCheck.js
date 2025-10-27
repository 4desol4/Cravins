/**
 * Check if user has required role
 * @param {string[]} roles - Required roles
 * @returns {Function}
 */
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Insufficient permissions' 
      });
    }

    next();
  };
};

/**
 * Check if user is admin
 */
const requireAdmin = requireRole(['ADMIN']);

/**
 * Check if user has paid for access
 */
const requirePaidAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
    });
  }

  // Admin always has access
  if (req.user.role === 'ADMIN') {
    return next();
  }

  // Check if user has paid
  if (!req.user.hasPaid) {
    return res.status(403).json({ 
      success: false, 
      message: 'Payment required to access this feature',
      requiresPayment: true
    });
  }

  // Check if payment has expired (for monthly/yearly)
  if (req.user.paymentExpiry && new Date() > new Date(req.user.paymentExpiry)) {
    return res.status(403).json({ 
      success: false, 
      message: 'Your access has expired. Please renew your subscription.',
      requiresPayment: true,
      expired: true
    });
  }

  next();
};

/**
 * Optional paid check - doesn't block but adds payment info to request
 */
const checkPaidStatus = (req, res, next) => {
  if (req.user) {
    req.userHasPaid = req.user.role === 'ADMIN' || 
                      (req.user.hasPaid && 
                       (!req.user.paymentExpiry || new Date() <= new Date(req.user.paymentExpiry)));
    req.paymentExpired = req.user.paymentExpiry && new Date() > new Date(req.user.paymentExpiry);
  } else {
    req.userHasPaid = false;
    req.paymentExpired = false;
  }
  next();
};

module.exports = {
  requireRole,
  requireAdmin,
  requirePaidAccess,
  checkPaidStatus,
};