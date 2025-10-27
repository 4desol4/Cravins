const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const multer = require('multer');
// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const practiceRoutes = require('./routes/practice');
const videoRoutes = require('./routes/videos');
const pdfRoutes = require('./routes/pdfs');
const chatbotRoutes = require('./routes/chatbot');
const newsRoutes = require('./routes/news');
const paymentRoutes = require('./routes/payments');
const adminRoutes = require('./routes/admin');

// Import middleware
const { apiResponse } = require('./utils/helpers');
const { ERROR_MESSAGES, RATE_LIMITS } = require('./utils/constants');
const createLimiter = require('./utils/createLimiter');

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https://img.youtube.com"],
      scriptSrc: ["'self'"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL]
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Logging middleware
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting
const generalLimiter = createLimiter(
  RATE_LIMITS.API,
  apiResponse(false, ERROR_MESSAGES.RATE_LIMIT_EXCEEDED)
);

const authLimiter = createLimiter(
  RATE_LIMITS.AUTH,
  apiResponse(false, ERROR_MESSAGES.RATE_LIMIT_EXCEEDED)
);

const aiLimiter = createLimiter(
  RATE_LIMITS.AI,
  apiResponse(false, 'AI request limit exceeded. Please try again later.')
);
// Apply general rate limiting to all requests
 app.use(generalLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/practice', aiLimiter, practiceRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/materials', pdfRoutes);
app.use('/api/chatbot', aiLimiter, chatbotRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../frontend/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
  });
}

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json(
    apiResponse(false, 'API endpoint not found')
  );
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);

  // Mongoose validation error
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => err.message);
    return res.status(400).json(
      apiResponse(false, 'Validation failed', null, { errors })
    );
  }

  // Mongoose duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return res.status(400).json(
      apiResponse(false, `${field} already exists`)
    );
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json(
      apiResponse(false, ERROR_MESSAGES.INVALID_TOKEN)
    );
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json(
      apiResponse(false, 'Token has expired')
    );
  }

  // Multer errors
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json(
        apiResponse(false, ERROR_MESSAGES.FILE_TOO_LARGE)
      );
    }
    return res.status(400).json(
      apiResponse(false, error.message)
    );
  }

  // Prisma errors
  if (error.code === 'P2002') {
    return res.status(400).json(
      apiResponse(false, 'Duplicate entry detected')
    );
  }

  if (error.code === 'P2025') {
    return res.status(404).json(
      apiResponse(false, ERROR_MESSAGES.RESOURCE_NOT_FOUND)
    );
  }

  // Default error
  res.status(error.status || 500).json(
    apiResponse(
      false,
      process.env.NODE_ENV === 'production' 
        ? ERROR_MESSAGES.SERVER_ERROR 
        : error.message
    )
  );
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error('Unhandled Promise Rejection:', err);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

module.exports = app;

