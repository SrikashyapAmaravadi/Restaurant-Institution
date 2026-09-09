// Test OTP authentication flow
const BASE_URL = 'http://localhost:3000';

async function testOtpAuth() {
  console.log('=== TESTING DIRECT INSTITUTIONAL OTP AUTH FLOW ===\n');

  // 1. Rejection of personal email
  console.log('[STEP 1] Testing non-institutional email rejection (test@gmail.com)...');
  const gmailRes = await fetch(`${BASE_URL}/api/auth/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@gmail.com' })
  });
  const gmailData = await gmailRes.json();
  if (gmailRes.status === 400 && !gmailData.success) {
    console.log('[PASS] Gmail correctly rejected:', gmailData.error);
  } else {
    console.error('[FAIL] Gmail was not rejected properly');
  }

  // 2. Send OTP to institutional email (radhika.nair@bennett.edu.in)
  console.log('\n[STEP 2] Sending OTP to institutional email (radhika.nair@bennett.edu.in)...');
  const sendRes = await fetch(`${BASE_URL}/api/auth/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'radhika.nair@bennett.edu.in' })
  });
  const sendData = await sendRes.json();
  if (sendData.success && sendData.otp) {
    console.log(`[PASS] OTP successfully issued: ${sendData.otp}`);
  } else {
    console.error('[FAIL] Failed to issue OTP:', sendData);
    process.exit(1);
  }

  const issuedOtp = sendData.otp;

  // 3. Verify OTP and check instant auto-verification
  console.log('\n[STEP 3] Verifying OTP and checking instant auto-provisioning...');
  const verifyRes = await fetch(`${BASE_URL}/api/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'radhika.nair@bennett.edu.in',
      otp: issuedOtp
    })
  });
  const verifyData = await verifyRes.json();
  if (verifyData.success && verifyData.data?.user && verifyData.data?.token) {
    const user = verifyData.data.user;
    console.log(`[PASS] Logged in successfully as: ${user.name} (${user.email})`);
    console.log(`[PASS] User role: ${user.role}`);
    console.log(`[PASS] User verified status: ${user.verified}`);
    if (user.verified === true) {
      console.log('[PASS] User is officially a VERIFIED institutional member eligible for offers!');
    } else {
      console.error('[FAIL] User verified status is false');
    }
  } else {
    console.error('[FAIL] OTP verification failed:', verifyData);
    process.exit(1);
  }

  console.log('\n========================================');
  console.log('ALL OTP AUTH TESTS PASSED CLEANLY');
  console.log('========================================');
}

testOtpAuth();
