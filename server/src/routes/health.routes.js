import { Router } from 'express';
import prisma from '../config/db.js';
import { checkAndSendReminders } from '../services/reminder.service.js';

const router = Router();

/**
 * GET /health and GET /api/health
 * Production health check reporting DB connectivity latency & system resources
 */
router.get('/', async (req, res) => {
  const startTime = Date.now();
  let dbStatus = 'connected';
  let dbLatency = 0;

  try {
    const dbPingStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatency = Date.now() - dbPingStart;
  } catch (err) {
    dbStatus = 'disconnected';
    console.error('[HEALTH_CHECK_DB_FAIL]', err.message);
  }

  const memory = process.memoryUsage();
  const formatMB = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

  const isHealthy = dbStatus === 'connected';

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'degraded',
    service: 'Dine@Bennett Platform API',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatus,
      latencyMs: dbLatency
    },
    memory: {
      rss: formatMB(memory.rss),
      heapUsed: formatMB(memory.heapUsed),
      heapTotal: formatMB(memory.heapTotal)
    },
    responseTimeMs: Date.now() - startTime
  });
});

/**
 * POST /health/trigger-reminders
 * Trigger background reminder dispatch on demand
 */
router.post('/trigger-reminders', async (req, res) => {
  try {
    const result = await checkAndSendReminders();
    res.json({
      success: true,
      message: 'Background reminder job executed',
      result
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
