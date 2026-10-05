const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

async function testOtpAuth() {
  console.log('=== INSTITUTIONAL OTP AUTH CHECKS ===\n');

  const gmailRes = await fetch(`${BASE_URL}/api/auth/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@gmail.com' })
  });
  const gmailData = await gmailRes.json();
  if (gmailRes.status === 400 && !gmailData.success) {
    console.log('[PASS] Personal Gmail rejected');
  } else {
    console.error('[FAIL] Gmail was not rejected', gmailData);
    process.exit(1);
  }

  const sendRes = await fetch(`${BASE_URL}/api/auth/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'radhika.nair@bennett.edu.in' })
  });
  const sendData = await sendRes.json();
  if (!sendData.success) {
    console.error('[FAIL] Failed to send OTP:', sendData);
    process.exit(1);
  }
  if (sendData.otp) {
    console.error('[FAIL] OTP leaked in JSON response');
    process.exit(1);
  }
  console.log('[PASS] OTP accepted without echoing the code');

  if (sendData.devOtp) {
    const verifyRes = await fetch(`${BASE_URL}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        email: 'radhika.nair@bennett.edu.in',
        otp: sendData.devOtp
      })
    });
    const verifyData = await verifyRes.json();
    if (verifyData.success && verifyData.data?.user?.verified) {
      console.log('[PASS] OTP verification with OTP_ECHO succeeded');
    } else {
      console.error('[FAIL] OTP verification failed:', verifyData);
      process.exit(1);
    }
  } else {
    console.log('[INFO] OTP_ECHO is off — verify using the emailed code');
  }

  console.log('\nOTP AUTH CHECKS COMPLETE');
}

testOtpAuth().catch((err) => {
  console.error(err);
  process.exit(1);
});
