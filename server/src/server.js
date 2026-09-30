import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Robust environment variable resolution for both local and Vercel serverless
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../server/.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'server/.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const DEFAULT_DATABASE_URL = "postgresql://postgres.nhcdgjeygsazqjxpaomz:DIstRiCt%40%231757@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=10&connect_timeout=15&pool_timeout=20";
const DEFAULT_DIRECT_URL = "postgresql://postgres.nhcdgjeygsazqjxpaomz:DIstRiCt%40%231757@aws-0-ap-south-1.pooler.supabase.com:5432/postgres?connect_timeout=15";
const DEFAULT_JWT_SECRET = "dine_bennett_super_secret_jwt_key_2026_rbac";

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = DEFAULT_DATABASE_URL;
}
if (!process.env.DIRECT_URL) {
  process.env.DIRECT_URL = DEFAULT_DIRECT_URL;
}
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = DEFAULT_JWT_SECRET;
}

const app = express();
const PORT = process.env.PORT || 3000;

// Universal CORS configuration supporting Vercel preview & production domains
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

// Standard Security Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
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

// Health & Root endpoints
const handleRoot = (req, res) => {
  res.json({
    success: true,
    message: 'Dine@Bennett Institutional REST API is running',
    version: '1.0.0',
    rbac: 'Active & Enforced',
    database: 'PostgreSQL (Supabase & Prisma ORM)'
  });
};

app.get('/', handleRoot);
app.get('/api', handleRoot);
app.get('/api/', handleRoot);

// Mount routes on both /api and root prefix for seamless Vercel serverless routing
const mountRoutes = (prefix = '/api') => {
  app.use(`${prefix}/auth`, authRoutes);
  app.use(`${prefix}/superadmin`, superAdminRoutes);
  app.use(`${prefix}/restaurants`, restaurantRoutes);
  app.use(`${prefix}/restaurants/:restaurantId/staff`, staffRoutes);
  app.use(`${prefix}/tables`, tableRoutes);
  app.use(`${prefix}/bookings`, bookingRoutes);
  app.use(`${prefix}/payments`, paymentRoutes);
  app.use(`${prefix}/notifications`, notificationRoutes);
  app.use(`${prefix}/institutions`, institutionRoutes);
  app.use(`${prefix}/users`, userRoutes);
  app.use(`${prefix}/offers`, offerRoutes);
  app.use(`${prefix}/reviews`, reviewRoutes);
  app.use(`${prefix}/restaurants/:restaurantId/reviews`, reviewRoutes);
  app.use(`${prefix}/health`, healthRoutes);
};

mountRoutes('/api');
mountRoutes('');

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
