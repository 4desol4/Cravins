const {
  getPaymentSettings,
  initializeAccessPayment,
  processPaymentCallback,
  getUserPaymentHistory,
} = require("../services/paymentService");
const { apiResponse } = require("../utils/helpers");
const { ERROR_MESSAGES, SUCCESS_MESSAGES } = require("../utils/constants");

/**
 * Get available payment plans
 */
const getPaymentPlans = async (req, res) => {
  try {
    const settings = await getPaymentSettings();

    if (!settings.paymentsEnabled) {
      return res.json(
        apiResponse(true, "Payments are currently disabled", {
          paymentsEnabled: false,
          plans: [],
        })
      );
    }

    const plans = [];

    if (settings.monthlyEnabled) {
      plans.push({
        type: "MONTHLY",
        name: "Monthly Access",
        price: settings.monthlyPrice,
        duration: "1 month",
        features: [
          "Full access to all questions",
          "Submit and complete tests",
          "Download test PDFs",
          "Access all study materials",
          "Download materials",
        ],
      });
    }

    if (settings.yearlyEnabled) {
      plans.push({
        type: "YEARLY",
        name: "Yearly Access",
        price: settings.yearlyPrice,
        duration: "12 months",
        features: [
          "All Monthly features",
          "Better value - Save money",
          "Priority support",
          "Early access to new features",
        ],
        recommended: true,
      });
    }

    if (settings.lifetimeEnabled) {
      plans.push({
        type: "LIFETIME",
        name: "Lifetime Access",
        price: settings.lifetimePrice,
        duration: "Forever",
        features: [
          "All Yearly features",
          "One-time payment",
          "Never pay again",
          "Best value for long-term users",
        ],
      });
    }

    res.json(
      apiResponse(true, "Payment plans retrieved successfully", {
        paymentsEnabled: true,
        freeQuestionLimit: settings.freeQuestionLimit,
        plans,
      })
    );
  } catch (error) {
    console.error("Get payment plans error:", error);
    res.status(500).json(apiResponse(false, ERROR_MESSAGES.SERVER_ERROR));
  }
};

/**
 * Initialize payment
 */
const initializePayment = async (req, res) => {
  try {
    const { planType } = req.body;

    if (!planType || !["MONTHLY", "YEARLY", "LIFETIME"].includes(planType)) {
      return res
        .status(400)
        .json(apiResponse(false, "Valid plan type is required"));
    }

    const userId = req.user.id;
    const email = req.user.email;

    const paymentData = await initializeAccessPayment(userId, email, planType);

    res.json(
      apiResponse(true, "Payment initialized successfully", paymentData)
    );
  } catch (error) {
    console.error("Initialize payment error:", error);
    res
      .status(500)
      .json(apiResponse(false, error.message || ERROR_MESSAGES.PAYMENT_FAILED));
  }
};

/**
 * Handle payment callback from Paystack
 */
const handleCallback = async (req, res) => {
  try {
    const { reference } = req.query;

    if (!reference) {
      return res
        .status(400)
        .json(apiResponse(false, "Payment reference is required"));
    }

    const result = await processPaymentCallback(reference);

    res.json(apiResponse(true, SUCCESS_MESSAGES.PAYMENT_SUCCESS, result));
  } catch (error) {
    console.error("Payment callback error:", error);
    res
      .status(500)
      .json(apiResponse(false, error.message || ERROR_MESSAGES.PAYMENT_FAILED));
  }
};

/**
 * Verify payment status
 */
const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;

    const result = await processPaymentCallback(reference);

    res.json(apiResponse(true, "Payment verified successfully", result));
  } catch (error) {
    console.error("Verify payment error:", error);
    res
      .status(500)
      .json(apiResponse(false, error.message || ERROR_MESSAGES.PAYMENT_FAILED));
  }
};

/**
 * Get user's payment history
 */
const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const payments = await getUserPaymentHistory(userId);

    res.json(
      apiResponse(true, "Payment history retrieved successfully", {
        payments,
        currentAccess: {
          hasPaid: req.user.hasPaid,
          paymentType: req.user.paymentType,
          paymentExpiry: req.user.paymentExpiry,
        },
      })
    );
  } catch (error) {
    console.error("Get payment history error:", error);
    res.status(500).json(apiResponse(false, ERROR_MESSAGES.SERVER_ERROR));
  }
};

/**
 * Get current user access status
 */
const getAccessStatus = async (req, res) => {
  try {
    const settings = await getPaymentSettings();

    const userHasPaid =
      req.user.role === "ADMIN" ||
      (req.user.hasPaid &&
        (!req.user.paymentExpiry ||
          new Date() <= new Date(req.user.paymentExpiry)));

    const response = {
      hasAccess: userHasPaid,
      hasPaid: req.user.hasPaid,
      paymentType: req.user.paymentType,
      paymentExpiry: req.user.paymentExpiry,
      freeQuestionLimit: settings.freeQuestionLimit,
      paymentsEnabled: settings.paymentsEnabled,
      isExpired:
        req.user.paymentExpiry && new Date() > new Date(req.user.paymentExpiry),
    };

    if (req.user.paymentExpiry && userHasPaid) {
      const daysRemaining = Math.ceil(
        (new Date(req.user.paymentExpiry) - new Date()) / (1000 * 60 * 60 * 24)
      );
      response.daysRemaining = daysRemaining;
    }

    res.json(
      apiResponse(true, "Access status retrieved successfully", response)
    );
  } catch (error) {
    console.error("Get access status error:", error);
    res.status(500).json(apiResponse(false, ERROR_MESSAGES.SERVER_ERROR));
  }
};

module.exports = {
  getPaymentPlans,
  initializePayment,
  handleCallback,
  verifyPayment,
  getPaymentHistory,
  getAccessStatus,
};
