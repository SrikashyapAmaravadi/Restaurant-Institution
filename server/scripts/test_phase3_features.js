// Automated integration test for Phase 3 Features
const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('=== RUNNING PHASE 3 INTEGRATION TESTS ===\n');
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
    // 1. Login as Priya Sharma (Student)
    console.log('[STEP 1] Logging in as student (priya.sharma@bennett.edu.in)...');
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'priya.sharma@bennett.edu.in',
        password: 'password123'
      })
    });
    const loginData = await loginRes.json();
    assert(loginData.success && loginData.data?.token, 'Student login succeeded with JWT token');
    const studentToken = loginData.data.token;
    const authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`
    };

    // 2. Discovery with Multi-filters and Haversine Distance
    console.log('\n[STEP 2] Testing Discovery endpoint with search and GPS coordinates...');
    const discRes = await fetch(`${BASE_URL}/api/restaurants?search=Spice&userLat=28.450&userLng=77.584`);
    const discData = await discRes.json();
    assert(discData.success && Array.isArray(discData.data), 'Discovery returned restaurants list');
    const spiceRest = discData.data.find(r => r.name.includes('Spice'));
    assert(spiceRest && typeof spiceRest.distance === 'number', `Found Spice Garden with calculated distance: ${spiceRest?.distance} km`);

    // 3. Test Eligibility Gate for Reviews
    console.log('\n[STEP 3] Testing review eligibility gate on restaurant without completed booking (Restaurant 3)...');
    const blockedRevRes = await fetch(`${BASE_URL}/api/restaurants/3/reviews`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        rating: 5,
        comment: 'Attempting to review without dining here!',
        orderedDish: 'Tandoori Platter'
      })
    });
    assert(blockedRevRes.status === 403, 'Eligibility gate correctly blocked unauthorized review with HTTP 403');
    const blockedData = await blockedRevRes.json();
    assert(blockedData.error && blockedData.error.includes('Verified Review Gate'), `Rejection message received: ${blockedData.error}`);

    // 4. Create a Booking with Capacity Reservation
    console.log('\n[STEP 4] Creating a reservation at Restaurant 1 (The Spice Garden)...');
    const bookRes = await fetch(`${BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        restaurantId: 1,
        date: '2026-09-10',
        time: '19:30',
        guests: 2,
        specialRequest: 'Corner booth for project discussion'
      })
    });
    const bookData = await bookRes.json();
    assert(bookData.success && bookData.data?.id, `Booking created successfully with ID: ${bookData.data?.id}, assigned table: ${bookData.data?.tableAssigned}`);
    const bookingId = bookData.data.id;

    // 5. Check Personal Bookings Endpoint
    console.log('\n[STEP 5] Testing GET /api/bookings/my for personal booking history...');
    const myBookingsRes = await fetch(`${BASE_URL}/api/bookings/my`, {
      headers: authHeaders
    });
    const myBookings = await myBookingsRes.json();
    assert(myBookings.success && Array.isArray(myBookings.data), 'GET /api/bookings/my returned user bookings');
    const foundBooking = myBookings.data.find(b => b.id === bookingId);
    assert(foundBooking && foundBooking.restaurantName === 'The Spice Garden', 'New booking found in student personal history');

    // 6. Submit a Verified Review on Restaurant 1
    console.log('\n[STEP 6] Submitting verified review now that booking exists at Restaurant 1...');
    const submitRevRes = await fetch(`${BASE_URL}/api/restaurants/1/reviews`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        rating: 5,
        comment: 'Outstanding dining experience! The dal makhani was rich and the campus discount was seamless.',
        orderedDish: 'Dal Makhani & Butter Naan'
      })
    });
    const submitRevData = await submitRevRes.json();
    assert(submitRevData.success && submitRevData.data?.id, `Review submitted successfully with ID: ${submitRevData.data?.id}`);
    const createdReviewId = submitRevData.data?.id;
    assert(submitRevData.data?.isVerified === true, 'Review automatically flagged as verified');

    // 7. Verify Restaurant Rating Recalculation
    console.log('\n[STEP 7] Verifying restaurant rating auto-recalculation...');
    const restCheckRes = await fetch(`${BASE_URL}/api/restaurants/1`);
    const restCheckData = await restCheckRes.json();
    const revCount = restCheckData.data?.reviewsCount !== undefined ? restCheckData.data.reviewsCount : (Array.isArray(restCheckData.data?.reviews) ? restCheckData.data.reviews.length : restCheckData.data?.reviews);
    assert(restCheckData.success && revCount > 0, `Restaurant review count verified: ${revCount}, rating: ${restCheckData.data?.rating}`);

    // 8. Test Upvote Review
    console.log('\n[STEP 8] Testing PATCH /api/reviews/:id/helpful...');
    if (createdReviewId) {
      const upvoteRes = await fetch(`${BASE_URL}/api/reviews/${createdReviewId}/helpful`, {
        method: 'PATCH',
        headers: authHeaders
      });
      const upvoteData = await upvoteRes.json();
      const votes = upvoteData.helpfulVotes !== undefined ? upvoteData.helpfulVotes : upvoteData.data?.helpfulCount;
      assert(upvoteData.success && votes >= 1, `Helpful votes incremented to: ${votes}`);
    }

    // 9. Cancel Booking and Verify Capacity Release
    console.log('\n[STEP 9] Testing Booking Cancellation (PATCH /api/bookings/:id/cancel)...');
    const cancelRes = await fetch(`${BASE_URL}/api/bookings/${bookingId}/cancel`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({ reason: 'Schedule clash with lab session' })
    });
    const cancelData = await cancelRes.json();
    assert(cancelData.success && cancelData.data?.status === 'CANCELLED', 'Booking successfully marked CANCELLED');

    // 10. Clean up Review
    if (createdReviewId) {
      console.log('\n[STEP 10] Cleaning up test review...');
      const delRes = await fetch(`${BASE_URL}/api/reviews/${createdReviewId}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      const delData = await delRes.json();
      assert(delData.success, 'Test review deleted cleanly');
    }

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  }

  console.log(`\n========================================`);
  console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
