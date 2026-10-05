import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

import { corsAllowlist, isProduction, loadRuntimeEnv } from './config/env.js';

loadRuntimeEnv();

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

const app = express();
const PORT = process.env.PORT || 3000;
const allowedOrigins = corsAllowlist();

app.set('trust proxy', 1);

app.use(cors({
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }
    if (allowedOrigins.length === 0 && !isProduction) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('CORS origin is not allowlisted'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (isProduction) {
    res.setHeader('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
  }
  next();
});

app.use(express.json({ limit: '200kb' }));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests. Please slow down.' }
}));

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log(`[API] ${req.method} ${req.originalUrl} ${res.statusCode} (${Date.now() - start}ms)`);
  });
  next();
});

app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => {
  res.json({ status: 'ok' });
});

const handleRoot = (req, res) => {
  res.json({
    success: true,
    message: 'Institutional dining API',
    version: '1.1.0'
  });
};

app.get('/', handleRoot);
app.get('/api', handleRoot);
app.get('/api/', handleRoot);

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

app.use((err, req, res, next) => {
  console.error('[SERVER_ERROR]', err);
  const statusCode = err.statusCode || err.status || 500;
  const publicMessage =
    isProduction && statusCode >= 500
      ? 'Internal Server Error'
      : err.message || 'Internal Server Error';
  res.status(statusCode).json({
    success: false,
    error: publicMessage,
    code: err.code || 'INTERNAL_ERROR'
  });
});

const isDirectRun = Boolean(
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))
);

if (isDirectRun && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`[START] Institutional dining API on port ${PORT}`);
    startReminderScheduler(30);
  });
}

export default app;
