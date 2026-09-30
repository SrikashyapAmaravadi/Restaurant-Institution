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

// Validate critical security environment variables
if (!process.env.DATABASE_URL) {
  console.error('[FATAL] DATABASE_URL is not set. Database connection cannot be established.');
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    console.error('[FATAL] JWT_SECRET must be explicitly configured in production.');
    process.exit(1);
  } else {
    console.warn('[SECURITY WARNING] JWT_SECRET not found in environment; using local development secret. Set JWT_SECRET in .env for production!');
    process.env.JWT_SECRET = 'dine_bennett_dev_insecure_secret_key_change_in_production';
  }
}

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration with whitelist
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : [
      'http://localhost:1574',
      'http://127.0.0.1:1574',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:3000'
    ];

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server or curl/mobile requests without origin
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(new Error('Blocked by CORS policy'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Standard Security Headers (hardening against XSS, clickjacking, MIME sniffing)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; img-src 'self' data: https: blob:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; connect-src 'self' https:;"
  );
  next();
});

app.use(express.json({ limit: '2mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[API] ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);
  });
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
