import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes.js';
import superAdminRoutes from './routes/superadmin.routes.js';
import restaurantRoutes from './routes/restaurant.routes.js';
import tableRoutes from './routes/table.routes.js';
import bookingRoutes from './routes/booking.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import institutionRoutes from './routes/institution.routes.js';
import userRoutes from './routes/user.routes.js';
import offerRoutes from './routes/offer.routes.js';
import staffRoutes from './routes/staff.routes.js';
import reviewRoutes from './routes/review.routes.js';
import healthRoutes from './routes/health.routes.js';
import { startReminderScheduler } from './services/reminder.service.js';

dotenv.config();

// Fallback configurations for cloud preview environments (e.g. v0 / Vercel preview)
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "postgresql://postgres.nhcdgjeygsazqjxpaomz:DIstRiCt%40%231757@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=10&connect_timeout=15&pool_timeout=20";
}
if (!process.env.DIRECT_URL) {
  process.env.DIRECT_URL = "postgresql://postgres.nhcdgjeygsazqjxpaomz:DIstRiCt%40%231757@aws-0-ap-south-1.pooler.supabase.com:5432/postgres?connect_timeout=15";
}
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "dine_bennett_super_secret_jwt_key_2026_rbac";
}

const app = express();
const PORT = process.env.PORT || 3000;

// CORS config
app.use(cors({
  origin: ['http://localhost:1574', 'http://127.0.0.1:1574', 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[API] ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// CORS and security headers
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Content-Security-Policy', "default-src 'self' 'unsafe-inline' 'unsafe-eval' *; connect-src 'self' *;");
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Chrome DevTools probe handler to prevent CSP / 404 noise
app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => {
  res.json({ status: 'ok' });
});

// Root and API root endpoints
app.get(['/', '/api', '/api/'], (req, res) => {
  res.json({
    success: true,
    message: 'Dine@Bennett Institutional REST API is running',
    version: '1.0.0',
    rbac: 'Active & Enforced',
    database: 'PostgreSQL (Supabase & Prisma ORM)'
  });
});

// Health check and diagnostics
app.use('/health', healthRoutes);
app.use('/api/health', healthRoutes);

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/superadmin', superAdminRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/restaurants/:restaurantId/staff', staffRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/institutions', institutionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/restaurants/:restaurantId/reviews', reviewRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[SERVER_ERROR]', err);
  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error',
    code: err.code || 'INTERNAL_ERROR'
  });
});

import { fileURLToPath } from 'url';
import path from 'path';

// Start server when run directly (local / container), not when imported by Vercel serverless
const isDirectRun = Boolean(
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))
);

if (isDirectRun && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`[START] Dine@Bennett REST API Server running on port ${PORT}`);
    console.log(`[URL] http://localhost:${PORT}`);
    console.log(`[RBAC] Active & Enforced Server-Side`);
    console.log(`[DATABASE] PostgreSQL (Supabase & Prisma ORM)`);
    console.log(`======================================================\n`);

    // Start background reminder scheduler
    startReminderScheduler(30);
  });
}

export default app;
