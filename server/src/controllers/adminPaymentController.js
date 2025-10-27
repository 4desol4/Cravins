const prisma = require("../config/database");
const { apiResponse } = require("../utils/helpers");
const { ERROR_MESSAGES, SUCCESS_MESSAGES } = require("../utils/constants");

/**
 * Get payment settings
 */
const getPaymentSettings = async (req, res) => {
  try {
    let settings = await prisma.paymentSettings.findFirst();

    if (!settings) {
      // Create default settings
      settings = await prisma.paymentSettings.create({
        data: {
          monthlyEnabled: true,
          monthlyPrice: 2000,
          yearlyEnabled: true,
          yearlyPrice: 18000,
          lifetimeEnabled: true,
          lifetimePrice: 50000,
          paymentsEnabled: true,
          freeQuestionLimit: 5,
        },
      });
    }

    res.json(
      apiResponse(true, "Payment settings retrieved successfully", settings)
    );
  } catch (error) {
    console.error("Get payment settings error:", error);
    res.status(500).json(apiResponse(false, ERROR_MESSAGES.SERVER_ERROR));
  }
};

/**
 * Update payment settings
 */
const updatePaymentSettings = async (req, res) => {
  try {
    const {
      monthlyEnabled,
      monthlyPrice,
      yearlyEnabled,
      yearlyPrice,
      lifetimeEnabled,
      lifetimePrice,
      paymentsEnabled,
      freeQuestionLimit,
    } = req.body;

    // Validate prices if provided
    if (monthlyPrice !== undefined && monthlyPrice < 0) {
      return res
        .status(400)
        .json(apiResponse(false, "Monthly price must be non-negative"));
    }

    if (yearlyPrice !== undefined && yearlyPrice < 0) {
      return res
        .status(400)
        .json(apiResponse(false, "Yearly price must be non-negative"));
    }

    if (lifetimePrice !== undefined && lifetimePrice < 0) {
      return res
        .status(400)
        .json(apiResponse(false, "Lifetime price must be non-negative"));
    }

    if (freeQuestionLimit !== undefined && freeQuestionLimit < 0) {
      return res
        .status(400)
        .json(apiResponse(false, "Free question limit must be non-negative"));
    }

    // Get existing settings or create new
    let settings = await prisma.paymentSettings.findFirst();

    const updateData = {};
    if (monthlyEnabled !== undefined)
      updateData.monthlyEnabled = monthlyEnabled;
    if (monthlyPrice !== undefined)
      updateData.monthlyPrice = parseFloat(monthlyPrice);
    if (yearlyEnabled !== undefined) updateData.yearlyEnabled = yearlyEnabled;
    if (yearlyPrice !== undefined)
      updateData.yearlyPrice = parseFloat(yearlyPrice);
    if (lifetimeEnabled !== undefined)
      updateData.lifetimeEnabled = lifetimeEnabled;
    if (lifetimePrice !== undefined)
      updateData.lifetimePrice = parseFloat(lifetimePrice);
    if (paymentsEnabled !== undefined)
      updateData.paymentsEnabled = paymentsEnabled;
    if (freeQuestionLimit !== undefined)
      updateData.freeQuestionLimit = parseInt(freeQuestionLimit);

    if (settings) {
      // Update existing
      settings = await prisma.paymentSettings.update({
        where: { id: settings.id },
        data: updateData,
      });
    } else {
      // Create new
      settings = await prisma.paymentSettings.create({
        data: {
          monthlyEnabled: monthlyEnabled ?? true,
          monthlyPrice: monthlyPrice ?? 2000,
          yearlyEnabled: yearlyEnabled ?? true,
          yearlyPrice: yearlyPrice ?? 18000,
          lifetimeEnabled: lifetimeEnabled ?? true,
          lifetimePrice: lifetimePrice ?? 50000,
          paymentsEnabled: paymentsEnabled ?? true,
          freeQuestionLimit: freeQuestionLimit ?? 5,
        },
      });
    }

    res.json(apiResponse(true, SUCCESS_MESSAGES.SETTINGS_UPDATED, settings));
  } catch (error) {
    console.error("Update payment settings error:", error);
    res.status(500).json(apiResponse(false, ERROR_MESSAGES.SERVER_ERROR));
  }
};

/**
 * Toggle payment system (enable/disable all payments)
 */
const togglePaymentSystem = async (req, res) => {
  try {
    const { enabled } = req.body;

    if (enabled === undefined) {
      return res
        .status(400)
        .json(apiResponse(false, "Enabled status is required"));
    }

    let settings = await prisma.paymentSettings.findFirst();

    if (settings) {
      settings = await prisma.paymentSettings.update({
        where: { id: settings.id },
        data: { paymentsEnabled: enabled },
      });
    } else {
      settings = await prisma.paymentSettings.create({
        data: {
          paymentsEnabled: enabled,
          monthlyEnabled: true,
          monthlyPrice: 2000,
          yearlyEnabled: true,
          yearlyPrice: 18000,
          lifetimeEnabled: true,
          lifetimePrice: 50000,
          freeQuestionLimit: 5,
        },
      });
    }

    const message = enabled
      ? "Payment system enabled"
      : "Payment system disabled - all users now have free access";

    res.json(apiResponse(true, message, settings));
  } catch (error) {
    console.error("Toggle payment system error:", error);
    res.status(500).json(apiResponse(false, ERROR_MESSAGES.SERVER_ERROR));
  }
};

/**
 * Get payment statistics
 */
const getPaymentStats = async (req, res) => {
  try {
    const [
      totalPayments,
      successfulPayments,
      totalRevenue,
      monthlyRevenue,
      paidUsers,
      recentPayments,
      planDistribution,
    ] = await Promise.all([
      // Total payments
      prisma.payment.count(),

      // Successful payments
      prisma.payment.count({
        where: { status: "SUCCESS" },
      }),

      // Total revenue
      prisma.payment.aggregate({
        where: { status: "SUCCESS" },
        _sum: { amount: true },
      }),

      // Revenue this month
      prisma.payment.aggregate({
        where: {
          status: "SUCCESS",
          paidAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
        _sum: { amount: true },
      }),

      // Paid users count
      prisma.user.count({
        where: { hasPaid: true },
      }),

      // Recent payments
      prisma.payment.findMany({
        where: { status: "SUCCESS" },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: { paidAt: "desc" },
        take: 10,
      }),

      // Plan distribution
      prisma.payment.groupBy({
        by: ["type"],
        where: { status: "SUCCESS" },
        _count: { type: true },
        _sum: { amount: true },
      }),
    ]);

    const stats = {
      overview: {
        totalPayments,
        successfulPayments,
        totalRevenue: totalRevenue._sum.amount || 0,
        monthlyRevenue: monthlyRevenue._sum.amount || 0,
        paidUsers,
        conversionRate:
          totalPayments > 0
            ? ((successfulPayments / totalPayments) * 100).toFixed(2)
            : 0,
      },
      planDistribution: planDistribution.map((plan) => ({
        type: plan.type,
        count: plan._count.type,
        revenue: plan._sum.amount || 0,
      })),
      recentPayments: recentPayments.map((payment) => ({
        id: payment.id,
        amount: payment.amount,
        type: payment.type,
        user: `${payment.user.firstName} ${payment.user.lastName}`,
        email: payment.user.email,
        paidAt: payment.paidAt,
      })),
    };

    res.json(
      apiResponse(true, "Payment statistics retrieved successfully", stats)
    );
  } catch (error) {
    console.error("Get payment stats error:", error);
    res.status(500).json(apiResponse(false, ERROR_MESSAGES.SERVER_ERROR));
  }
};

/**
 * Grant manual access to user
 */
const grantManualAccess = async (req, res) => {
  try {
    const { planType, duration } = req.body;
    const { userId } = req.params;

    if (!userId || !planType) {
      return res
        .status(400)
        .json(apiResponse(false, "User ID and plan type are required"));
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res
        .status(404)
        .json(apiResponse(false, ERROR_MESSAGES.USER_NOT_FOUND));
    }

    const updateData = {
      hasPaid: true,
      paymentType: planType,
    };

    if (planType === "MONTHLY") {
      const expiry = new Date();
      expiry.setMonth(expiry.getMonth() + (duration || 1));
      updateData.paymentExpiry = expiry;
    } else if (planType === "YEARLY") {
      const expiry = new Date();
      expiry.setFullYear(expiry.getFullYear() + (duration || 1));
      updateData.paymentExpiry = expiry;
    } else if (planType === "LIFETIME") {
      updateData.paymentExpiry = null;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        hasPaid: true,
        paymentType: true,
        paymentExpiry: true,
      },
    });

    res.json(apiResponse(true, "Access granted successfully", updatedUser));
  } catch (error) {
    console.error("Grant manual access error:", error);
    res.status(500).json(apiResponse(false, ERROR_MESSAGES.SERVER_ERROR));
  }
};

/**
 * Revoke user access
 */
const revokeUserAccess = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res
        .status(404)
        .json(apiResponse(false, ERROR_MESSAGES.USER_NOT_FOUND));
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        hasPaid: false,
        paymentExpiry: null,
        paymentType: null,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        hasPaid: true,
        paymentType: true,
        paymentExpiry: true,
      },
    });

    res.json(apiResponse(true, "Access revoked successfully", updatedUser));
  } catch (error) {
    console.error("Revoke user access error:", error);
    res.status(500).json(apiResponse(false, ERROR_MESSAGES.SERVER_ERROR));
  }
};

module.exports = {
  getPaymentSettings,
  updatePaymentSettings,
  togglePaymentSystem,
  getPaymentStats,
  grantManualAccess,
  revokeUserAccess,
};
