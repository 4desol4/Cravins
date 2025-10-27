const { PrismaClient } = require('@prisma/client');

/**
 * @type {PrismaClient}
 */
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

module.exports = prisma;

