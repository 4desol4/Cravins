const jwt = require("jsonwebtoken");
const prisma = require("../config/database");

/**
 * Authenticate user with JWT token
 */
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access token required",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        hasPaid: true,
        paymentExpiry: true,
        paymentType: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    // Auto-expire payments
    if (
      user.hasPaid &&
      user.paymentExpiry &&
      new Date() > new Date(user.paymentExpiry)
    ) {
      await prisma.user.update({
        where: { id: user.id },
        data: { hasPaid: false },
      });
      user.hasPaid = false;
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

/**
 * Optional authentication - doesn't fail if no token
 */
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        hasPaid: true,
        paymentExpiry: true,
        paymentType: true,
      },
    });

    if (user) {
      // Auto-expire paid status if expired
      if (
        user.hasPaid &&
        user.paymentExpiry &&
        new Date() > new Date(user.paymentExpiry)
      ) {
        await prisma.user.update({
          where: { id: user.id },
          data: { hasPaid: false },
        });
        user.hasPaid = false;
      }

      req.user = user;
    }
  } catch (error) {
    // Ignore invalid tokens in optional auth
  }

  next();
};

module.exports = {
  authenticateToken,
  optionalAuth,
};
