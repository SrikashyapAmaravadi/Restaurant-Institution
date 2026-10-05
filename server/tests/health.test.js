import 'dotenv/config';
import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/server.js';
import http from 'node:http';

/**
 * Health Endpoint Test Suite
 */
test('GET /api/health returns 200 OK and health telemetry', async (t) => {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/health`);
    assert.strictEqual(res.status, 200);
    const body = await res.json();

    assert.strictEqual(body.status, 'healthy');
    assert.strictEqual(body.service, 'Dine@Bennett Platform API');
    assert.ok(typeof body.uptimeSeconds === 'number');
    assert.ok(body.database);
    assert.strictEqual(body.database.status, 'connected');
  } finally {
    server.close();
  }
});

test('POST /api/health/trigger-reminders rejects request without valid x-cron-secret', async (t) => {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/health/trigger-reminders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    assert.strictEqual(res.status, 401);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.error, 'Unauthorized');
  } finally {
    server.close();
  }
});
