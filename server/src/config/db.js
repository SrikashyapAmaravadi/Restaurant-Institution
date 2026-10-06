import { PrismaClient } from '@prisma/client';

// Singleton pattern for Prisma Client in serverless (prevents connection exhaustion)
// Reference: https://www.prisma.io/docs/guides/performance-and-optimization/connection-management#serverless-environments

const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
