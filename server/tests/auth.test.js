import 'dotenv/config';
import test from 'node:test';
import assert from 'node:assert/strict';
import { generateNumericOtp, hashOtp, otpMatches } from '../src/lib/otp.js';

test('OTP Generator produces 6-digit numeric string', () => {
  const otp = generateNumericOtp();
  assert.strictEqual(typeof otp, 'string');
  assert.strictEqual(otp.length, 6);
  assert.ok(/^\d{6}$/.test(otp));
});

test('OTP Hashing and Match Verification', () => {
  const email = 'test.student@bennett.edu.in';
  const code = '749201';
  const hash = hashOtp(email, code);

  assert.ok(hash);
  assert.strictEqual(typeof hash, 'string');
  assert.ok(otpMatches(email, code, hash));
  assert.strictEqual(otpMatches(email, '000000', hash), false);
  assert.strictEqual(otpMatches('other@bennett.edu.in', code, hash), false);
});

test('OTP Security - Pepper Binding', () => {
  const email = 'test@bennett.edu.in';
  const code = '123456';
  
  // Hash with current pepper
  const hash1 = hashOtp(email, code);
  
  // Verify hash structure
  assert.ok(hash1);
  assert.ok(hash1.length > 50); // bcrypt hashes are ~60 chars
  assert.ok(hash1.startsWith('$2')); // bcrypt hash prefix
  
  // Same inputs produce verifiable hash
  assert.ok(otpMatches(email, code, hash1));
});
