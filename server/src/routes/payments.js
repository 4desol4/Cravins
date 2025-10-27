const express = require("express");
const router = express.Router();
const {
  getPaymentPlans,
  initializePayment,
  handleCallback,
  verifyPayment,
  getPaymentHistory,
  getAccessStatus,
} = require("../controllers/paymentController");
const { authenticateToken } = require("../middleware/auth");
const { body } = require("express-validator");
const { handleValidationErrors } = require("../middleware/validation");

// Public route - get available plans
router.get("/plans", getPaymentPlans);

// Callback doesn't need authentication
router.get("/callback", handleCallback);

// Authenticated routes
router.post(
  "/initialize",
  authenticateToken,
  [
    body("planType")
      .isIn(["MONTHLY", "YEARLY", "LIFETIME"])
      .withMessage("Valid plan type is required"),
    handleValidationErrors,
  ],
  initializePayment
);

router.get("/verify/:reference", authenticateToken, verifyPayment);
router.get("/history", authenticateToken, getPaymentHistory);
router.get("/status", authenticateToken, getAccessStatus);

module.exports = router;
