const prisma = require("../config/database");
const {
  hashPassword,
  comparePassword,
  generateToken,
  generateRefreshToken,
  generateResetToken,
  apiResponse,
  sanitizeUser,
} = require("../utils/helpers");
const {
  sendWelcomeEmail,
  sendPasswordResetEmail,
} = require("../services/emailService");
const { SUCCESS_MESSAGES, ERROR_MESSAGES } = require("../utils/constants");

/**
 * Register new user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, dateOfBirth } =
      req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res
        .status(400)
        .json(apiResponse(false, ERROR_MESSAGES.EMAIL_EXISTS));
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      },
    });

    // Generate tokens
    const token = generateToken({ userId: user.id });
    const refreshToken = generateRefreshToken({ userId: user.id });

    // Send welcome email (don't wait for it)
    sendWelcomeEmail(user.email, user.firstName).catch(console.error);

    // Return sanitized user data
    const sanitizedUser = sanitizeUser(user);

    res.status(201).json(
      apiResponse(true, SUCCESS_MESSAGES.USER_CREATED, {
        user: sanitizedUser,
        token,
        refreshToken,
      })
    );
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json(apiResponse(false, ERROR_MESSAGES.SERVER_ERROR));
  }
};

/**
 * Login user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res
        .status(401)
        .json(apiResponse(false, ERROR_MESSAGES.INVALID_CREDENTIALS));
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password);

    if (!isValidPassword) {
      return res
        .status(401)
        .json(apiResponse(false, ERROR_MESSAGES.INVALID_CREDENTIALS));
    }

    // Check if premium has expired
    if (
      user.isPremium &&
      user.premiumExpiry &&
      new Date() > user.premiumExpiry
    ) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          isPremium: false,
          role: "USER",
        },
      });
      user.isPremium = false;
      user.role = "USER";
    }

    // Generate tokens
    const token = generateToken({ userId: user.id });
    const refreshToken = generateRefreshToken({ userId: user.id });

    // Return sanitized user data
    const sanitizedUser = sanitizeUser(user);

    res.json(
      apiResponse(true, SUCCESS_MESSAGES.LOGIN_SUCCESS, {
        user: sanitizedUser,
        token,
        refreshToken,
      })
    );
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json(apiResponse(false, ERROR_MESSAGES.SERVER_ERROR));
  }
};

/**
 * Request password reset
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if email exists or not
      return res.json(apiResponse(true, SUCCESS_MESSAGES.PASSWORD_RESET_SENT));
    }

    // Generate reset token (you might want to store this in a separate table)
    const resetToken = generateResetToken();
    const resetExpiry = new Date(Date.now() + 3600000); // 1 hour

    // In a real app, you'd store this token in the database
    // For now, we'll use JWT with short expiry
    const resetJWT = generateToken(
      {
        userId: user.id,
        type: "reset",
        resetToken,
      },
      "1h"
    );

    // Send reset email
    await sendPasswordResetEmail(user.email, resetJWT);

    res.json(apiResponse(true, SUCCESS_MESSAGES.PASSWORD_RESET_SENT));
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json(apiResponse(false, ERROR_MESSAGES.SERVER_ERROR));
  }
};

/**
 * Reset password
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Verify reset token
    const jwt = require("jsonwebtoken");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type !== "reset") {
      return res
        .status(400)
        .json(apiResponse(false, ERROR_MESSAGES.INVALID_TOKEN));
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update user password
    await prisma.user.update({
      where: { id: decoded.userId },
      data: { password: hashedPassword },
    });

    res.json(apiResponse(true, SUCCESS_MESSAGES.PASSWORD_RESET_SUCCESS));
  } catch (error) {
    console.error("Reset password error:", error);

    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res
        .status(400)
        .json(apiResponse(false, ERROR_MESSAGES.INVALID_TOKEN));
    }

    res.status(500).json(apiResponse(false, ERROR_MESSAGES.SERVER_ERROR));
  }
};

/**
 * Get current user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        testResults: {
          orderBy: { completedAt: "desc" },
          take: 5,
        },
        materialDownloads: {
          include: {
            material: true,
          },
        },
      },
    });

    if (!user) {
      return res
        .status(404)
        .json(apiResponse(false, ERROR_MESSAGES.USER_NOT_FOUND));
    }

    // Rename materialDownloads to materialPurchases for frontend compatibility
    const sanitizedUser = sanitizeUser({
      ...user,
      materialPurchases: user.materialDownloads,
    });

    res.json(
      apiResponse(true, "Profile retrieved successfully", sanitizedUser)
    );
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json(apiResponse(false, ERROR_MESSAGES.SERVER_ERROR));
  }
};

/**
 * Update user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, dateOfBirth } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        firstName,
        lastName,
        phone,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      },
    });

    const sanitizedUser = sanitizeUser(updatedUser);

    res.json(
      apiResponse(true, SUCCESS_MESSAGES.PROFILE_UPDATED, sanitizedUser)
    );
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json(apiResponse(false, ERROR_MESSAGES.SERVER_ERROR));
  }
};

/**
 * Change password
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get current user with password
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    // Verify current password
    const isValidPassword = await comparePassword(
      currentPassword,
      user.password
    );

    if (!isValidPassword) {
      return res
        .status(400)
        .json(apiResponse(false, "Current password is incorrect"));
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword },
    });

    res.json(apiResponse(true, "Password changed successfully"));
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json(apiResponse(false, ERROR_MESSAGES.SERVER_ERROR));
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  changePassword,
};
