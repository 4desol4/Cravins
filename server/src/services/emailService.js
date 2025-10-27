const nodemailer = require("nodemailer");

// Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * Send welcome email
 */
const sendWelcomeEmail = async (email, firstName) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Welcome to Cravins - Your Learning Journey Begins!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0;">Welcome to Cravins!</h1>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9;">
          <h2>Hello ${firstName}! 🎉</h2>
          
          <p>Welcome to Cravins, your cutting-edge learning platform designed to unlock your academic potential!</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>🚀 What you can do:</h3>
            <ul style="line-height: 1.8;">
              <li>📝 Try sample CBT questions (first 5 questions free)</li>
              <li>📺 Watch educational video lessons</li>
              <li>💬 Chat with our AI Study Bot</li>
              <li>📰 Stay updated with educational news</li>
            </ul>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>🌟 Get Full Access:</h3>
            <ul style="line-height: 1.8;">
              <li>📄 Complete and submit all test questions</li>
              <li>💾 Download test results as PDF</li>
              <li>📚 Access and download all study materials</li>
              <li>⭐ Unlock your full learning potential</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/payments" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">View Plans</a>
          </div>
          
          <p>Happy learning!<br>The Cravins Team</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Failed to send welcome email:", error);
  }
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Reset Your Cravins Password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0;">Password Reset Request</h1>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9;">
          <p>You requested to reset your Cravins account password.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: #e74c3c; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
          </div>
          
          <p style="color: #666; font-size: 14px;">This link will expire in 1 hour. If you didn't request this, please ignore this email.</p>
          
          <p style="color: #666; font-size: 12px;">If the button doesn't work, copy this link: ${resetUrl}</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Failed to send password reset email:", error);
  }
};

/**
 * Send payment success email
 */
const sendPaymentSuccessEmail = async (email, firstName, planType, amount) => {
  const planNames = {
    MONTHLY: "Monthly Access",
    YEARLY: "Yearly Access",
    LIFETIME: "Lifetime Access",
  };

  const planDurations = {
    MONTHLY: "1 month",
    YEARLY: "12 months",
    LIFETIME: "Forever",
  };

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "🎉 Payment Successful - Welcome to Full Access!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f39c12 0%, #e74c3c 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0;">🌟 Payment Successful! 🌟</h1>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9;">
          <h2>Congratulations ${firstName}! 🎉</h2>
          
          <p>Your payment has been processed successfully. You now have full access to Cravins!</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>📋 Payment Details:</h3>
            <table style="width: 100%; line-height: 1.8;">
              <tr>
                <td><strong>Plan:</strong></td>
                <td>${planNames[planType]}</td>
              </tr>
              <tr>
                <td><strong>Duration:</strong></td>
                <td>${planDurations[planType]}</td>
              </tr>
              <tr>
                <td><strong>Amount Paid:</strong></td>
                <td>₦${amount.toLocaleString()}</td>
              </tr>
            </table>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>✨ You Now Have Access To:</h3>
            <ul style="line-height: 1.8;">
              <li>📝 Complete and submit unlimited test questions</li>
              <li>📄 Download test results as PDF</li>
              <li>📚 Access all study materials</li>
              <li>💾 Download any study material</li>
              <li>🚀 Full platform access</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${
              process.env.FRONTEND_URL
            }/dashboard" style="background: linear-gradient(135deg, #f39c12 0%, #e74c3c 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Go to Dashboard</a>
          </div>
          
          <p>Thank you for choosing Cravins!<br>The Cravins Team</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Failed to send payment success email:", error);
  }
};

/**
 * Send payment expiry reminder
 */
const sendExpiryReminderEmail = async (email, firstName, daysRemaining) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "⚠️ Your Cravins Access is Expiring Soon",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0;">⚠️ Access Expiring Soon</h1>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9;">
          <h2>Hello ${firstName},</h2>
          
          <p>Your Cravins access will expire in <strong>${daysRemaining} days</strong>.</p>
          
          <p>Don't lose access to:</p>
          <ul style="line-height: 1.8;">
            <li>Unlimited practice questions</li>
            <li>Test result downloads</li>
            <li>All study materials</li>
            <li>Full platform features</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/payments" style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Renew Now</a>
          </div>
          
          <p>Best regards,<br>The Cravins Team</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Failed to send expiry reminder email:", error);
  }
};

module.exports = {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendPaymentSuccessEmail,
  sendExpiryReminderEmail,
};
