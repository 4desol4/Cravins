const prisma = require("../config/database");
const { initializePayment, verifyPayment } = require("../config/paystack");
const { sendPaymentSuccessEmail } = require("./emailService");

/**
 * Get current payment settings
 */
const getPaymentSettings = async () => {
  let settings = await prisma.paymentSettings.findFirst();

  if (!settings) {
    // Create default settings if none exist
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

  return settings;
};

/**
 * Initialize access payment
 */
const initializeAccessPayment = async (userId, email, planType) => {
  try {
    const settings = await getPaymentSettings();

    // Check if payments are enabled
    if (!settings.paymentsEnabled) {
      throw new Error("Payments are currently disabled");
    }

    // Check if plan is enabled and get price
    let amount = 0;
    let planName = "";

    switch (planType) {
      case "MONTHLY":
        if (!settings.monthlyEnabled) {
          throw new Error("Monthly plan is not available");
        }
        amount = settings.monthlyPrice;
        planName = "Monthly Access";
        break;
      case "YEARLY":
        if (!settings.yearlyEnabled) {
          throw new Error("Yearly plan is not available");
        }
        amount = settings.yearlyPrice;
        planName = "Yearly Access";
        break;
      case "LIFETIME":
        if (!settings.lifetimeEnabled) {
          throw new Error("Lifetime plan is not available");
        }
        amount = settings.lifetimePrice;
        planName = "Lifetime Access";
        break;
      default:
        throw new Error("Invalid plan type");
    }

    const amountInKobo = Math.round(amount * 100);
    const reference = `access_${planType.toLowerCase()}_${userId}_${Date.now()}`;

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        userId,
        amount,
        type: planType,
        reference,
        metadata: {
          planType,
          planName,
        },
      },
    });

    // Initialize Paystack payment
    const paystackResponse = await initializePayment(
      email,
      amountInKobo,
      reference,
      {
        userId,
        paymentId: payment.id,
        planType,
      }
    );

    if (!paystackResponse.status) {
      throw new Error("Failed to initialize payment");
    }

    return {
      paymentId: payment.id,
      reference,
      authorizationUrl: paystackResponse.data.authorization_url,
      accessCode: paystackResponse.data.access_code,
      amount,
      planType,
      planName,
    };
  } catch (error) {
    throw new Error(`Payment initialization failed: ${error.message}`);
  }
};

/**
 * Process payment callback
 */
const processPaymentCallback = async (reference) => {
  try {
    // Verify payment with Paystack
    const verification = await verifyPayment(reference);

    if (!verification.status || verification.data.status !== "success") {
      throw new Error("Payment verification failed");
    }

    // Get payment record
    const payment = await prisma.payment.findUnique({
      where: { reference },
      include: { user: true },
    });

    if (!payment) {
      throw new Error("Payment record not found");
    }

    if (payment.status === "SUCCESS") {
      return { message: "Payment already processed", payment };
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "SUCCESS",
        paidAt: new Date(),
      },
    });

    // Grant user access based on plan type
    await grantUserAccess(payment);

    // Send confirmation email
    await sendPaymentSuccessEmail(
      payment.user.email,
      payment.user.firstName,
      payment.type,
      payment.amount
    );

    return {
      message: "Payment processed successfully",
      payment,
    };
  } catch (error) {
    // Update payment status to failed
    try {
      await prisma.payment.updateMany({
        where: { reference },
        data: { status: "FAILED" },
      });
    } catch (updateError) {
      console.error("Failed to update payment status:", updateError);
    }

    throw new Error(`Payment processing failed: ${error.message}`);
  }
};

/**
 * Grant user access based on payment plan
 */
const grantUserAccess = async (payment) => {
  const updateData = {
    hasPaid: true,
    paymentType: payment.type,
  };

  // Calculate expiry date
  if (payment.type === "MONTHLY") {
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 1);
    updateData.paymentExpiry = expiryDate;
  } else if (payment.type === "YEARLY") {
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    updateData.paymentExpiry = expiryDate;
  } else if (payment.type === "LIFETIME") {
    updateData.paymentExpiry = null; // No expiry for lifetime
  }

  await prisma.user.update({
    where: { id: payment.userId },
    data: updateData,
  });
};

/**
 * Get user payment history
 */
const getUserPaymentHistory = async (userId) => {
  try {
    const payments = await prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return payments.map((payment) => ({
      id: payment.id,
      amount: payment.amount,
      type: payment.type,
      status: payment.status,
      reference: payment.reference,
      createdAt: payment.createdAt,
      paidAt: payment.paidAt,
    }));
  } catch (error) {
    throw new Error(`Failed to get payment history: ${error.message}`);
  }
};

/**
 * Check if user needs to renew (for cron jobs)
 */
const checkExpiringAccess = async () => {
  const now = new Date();
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(now.getDate() + 3);

  const expiringUsers = await prisma.user.findMany({
    where: {
      hasPaid: true,
      paymentExpiry: {
        gte: now,
        lte: threeDaysFromNow,
      },
    },
  });

  return expiringUsers;
};

/**
 * Revoke expired access
 */
const revokeExpiredAccess = async () => {
  const now = new Date();

  const expiredUsers = await prisma.user.updateMany({
    where: {
      hasPaid: true,
      paymentExpiry: {
        lt: now,
      },
      paymentType: {
        in: ["MONTHLY", "YEARLY"],
      },
    },
    data: {
      hasPaid: false,
    },
  });

  return expiredUsers;
};

module.exports = {
  getPaymentSettings,
  initializeAccessPayment,
  processPaymentCallback,
  getUserPaymentHistory,
  checkExpiringAccess,
  revokeExpiredAccess,
};
