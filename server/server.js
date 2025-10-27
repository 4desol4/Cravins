require('dotenv').config();
const app = require('./src/app');
const prisma = require('./src/config/database');

const PORT = process.env.PORT || 5000;

// Database connection check
async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

// Graceful shutdown
async function gracefulShutdown() {
  console.log('\n🔄 Shutting down gracefully...');
  
  try {
    await prisma.$disconnect();
    console.log('✅ Database disconnected');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
}

// Handle shutdown signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
async function startServer() {
  try {
    await connectDatabase();
    
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
      
      if (process.env.NODE_ENV !== 'production') {
        console.log(`📊 Health Check: http://localhost:${PORT}/health`);
      }
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.syscall !== 'listen') {
        throw error;
      }

      switch (error.code) {
        case 'EACCES':
          console.error(`❌ Port ${PORT} requires elevated privileges`);
          process.exit(1);
          break;
        case 'EADDRINUSE':
          console.error(`❌ Port ${PORT} is already in use`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

