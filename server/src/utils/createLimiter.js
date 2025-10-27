const rateLimit = require("express-rate-limit");

function createLimiter(options, customMessage) {
  if (process.env.NODE_ENV === "development") {
    return (req, res, next) => next(); // 🔑 skip limiter in dev
  }

  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    message: customMessage,
    standardHeaders: true,
    legacyHeaders: false,
  });
}

module.exports = createLimiter;
