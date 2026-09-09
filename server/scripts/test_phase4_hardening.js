// Phase 4: Security Hardening, Zod Input Sanitization & Automation Test Suite
const BASE_URL = 'http://localhost:3000';

async function runHardeningTests() {
  console.log('=== RUNNING PHASE 4 SECURITY & AUTOMATION TEST SUITE ===\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 1. Health Check Endpoint
    console.log('[STEP 1] Testing Health Check & DB Latency (GET /health)...');
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200, 'Health check returned HTTP 200');
    assert(healthData.status === 'healthy', 'System status is healthy');
    assert(healthData.database?.status === 'connected', `Database is connected (latency: ${healthData.database?.latencyMs}ms)`);
    assert(healthData.memory?.heapUsed, `Memory metrics active: ${healthData.memory?.heapUsed}`);

    // 2. Zod Input Validation on Auth
    console.log('\n[STEP 2] Testing Zod validation on malformed email (POST /api/auth/send-otp)...');
    const badEmailRes = await fetch(`${BASE_URL}/api/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'not-an-email' })
    });
    assert(badEmailRes.status === 400, 'Zod blocked malformed email format with HTTP 400');
    const badEmailData = await badEmailRes.json();
    assert(badEmailData.error?.includes('Validation Error'), `Zod error intercepted: ${badEmailData.error}`);

    // 3. Authenticate Student
    console.log('\n[STEP 3] Authenticating student (priya.sharma@bennett.edu.in)...');
    const studentLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'priya.sharma@bennett.edu.in', password: 'password123' })
    });
    const studentLogin = await studentLoginRes.json();
    const studentToken = studentLogin.data?.token;
    assert(studentToken, 'Student JWT token obtained');
    const studentHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`
    };

    // 4. Zod Input Validation on Bookings
    console.log('\n[STEP 4] Testing Zod validation on corrupt booking payload (invalid guests & date)...');
    const badBookingRes = await fetch(`${BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: studentHeaders,
      body: JSON.stringify({
        restaurantId: 1,
        date: 'invalid-date-format',
        time: '7pm',
        guests: 50 // exceeds limit of 20
      })
    });
    assert(badBookingRes.status === 400, 'Zod blocked invalid booking bounds with HTTP 400');
    const badBookingData = await badBookingRes.json();
    assert(badBookingData.error?.includes('Validation Error'), `Zod validation blocked bad booking payload: ${badBookingData.error}`);

    // 5. Zod Input Validation on Reviews
    console.log('\n[STEP 5] Testing Zod validation on corrupt review payload (rating > 5)...');
    const badReviewRes = await fetch(`${BASE_URL}/api/restaurants/1/reviews`, {
      method: 'POST',
      headers: studentHeaders,
      body: JSON.stringify({
        rating: 9.5, // exceeds 5.0
        comment: 'Too short' // under 3 or invalid
      })
    });
    assert(badReviewRes.status === 400, 'Zod blocked out-of-range review rating with HTTP 400');
    const badReviewData = await badReviewRes.json();
    assert(badReviewData.error?.includes('Validation Error'), `Zod error detail: ${badReviewData.error}`);

    // 6. Role Barriers (Student blocked from Super Admin routes)
    console.log('\n[STEP 6] Testing Role Barriers (Student accessing /api/superadmin/clearance-queue)...');
    const forbiddenAdminRes = await fetch(`${BASE_URL}/api/superadmin/clearance-queue`, {
      headers: studentHeaders
    });
    assert(forbiddenAdminRes.status === 403, 'Student token correctly blocked from Super Admin endpoint with HTTP 403');

    // 7. IDOR Defense (Restaurant Admin scoping)
    console.log('\n[STEP 7] Testing IDOR Defense (Restaurant Admin 1 mutating Restaurant 2)...');
    const ownerLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'owner@spicegarden.com', password: 'password123' })
    });
    const ownerLogin = await ownerLoginRes.json();
    const ownerToken = ownerLogin.data?.token;
    assert(ownerToken, 'Restaurant 1 Admin JWT token obtained');

    const idorRes = await fetch(`${BASE_URL}/api/restaurants/2/menu`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ownerToken}`
      },
      body: JSON.stringify({
        category: 'Starters',
        name: 'Hacked Dish',
        price: 199
      })
    });
    assert(idorRes.status === 403, 'Cross-restaurant IDOR mutation blocked with HTTP 403');

    // 8. Super Admin Review Moderation
    console.log('\n[STEP 8] Testing Super Admin Review Moderation...');
    const superLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'superadmin@bennett.edu.in', password: 'superadmin123' })
    });
    const superLogin = await superLoginRes.json();
    const superToken = superLogin.data?.token;
    assert(superToken, 'Super Admin JWT token obtained');
    const superHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${superToken}`
    };

    // Fetch all reviews for moderation
    const allRevRes = await fetch(`${BASE_URL}/api/reviews`, { headers: superHeaders });
    const allRevData = await allRevRes.json();
    assert(allRevData.success && Array.isArray(allRevData.data), 'Super Admin retrieved global review list');

    if (allRevData.data.length > 0) {
      const targetReview = allRevData.data[0];
      // Moderate status to HIDDEN
      const hideRes = await fetch(`${BASE_URL}/api/reviews/${targetReview.id}/status`, {
        method: 'PATCH',
        headers: superHeaders,
        body: JSON.stringify({ status: 'HIDDEN' })
      });
      const hideData = await hideRes.json();
      assert(hideData.success && hideData.data?.status === 'HIDDEN', 'Review successfully moderated to HIDDEN');

      // Reinstate to APPROVED
      const approveRes = await fetch(`${BASE_URL}/api/reviews/${targetReview.id}/status`, {
        method: 'PATCH',
        headers: superHeaders,
        body: JSON.stringify({ status: 'APPROVED' })
      });
      const approveData = await approveRes.json();
      assert(approveData.success && approveData.data?.status === 'APPROVED', 'Review reinstated to APPROVED');
    }

    // 9. Background Reminder Service Trigger
    console.log('\n[STEP 9] Testing Background Reminder Service (POST /health/trigger-reminders)...');
    const reminderRes = await fetch(`${BASE_URL}/health/trigger-reminders`, {
      method: 'POST'
    });
    const reminderData = await reminderRes.json();
    assert(reminderData.success, 'Background reminder job executed successfully');
    assert(typeof reminderData.result?.scanned === 'number', `Reminders scanned: ${reminderData.result?.scanned} active bookings`);

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  }

  console.log(`\n========================================`);
  console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================`);
  process.exit(failed > 0 ? 1 : 0);
}

runHardeningTests();
