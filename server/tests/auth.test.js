import 'dotenv/config';
import test from 'node:test';
import assert from 'node:assert/strict';
import { generateNumericOtp, hashOtp, otpMatches } from '../src/lib/otp.js';
import { resolveInstitutionalEmail } from '../src/services/institution-access.js';

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

test('Institutional Email Domain Resolution', async () => {
  const valid = await resolveInstitutionalEmail('priya.sharma@bennett.edu.in');
  assert.strictEqual(valid.email, 'priya.sharma@bennett.edu.in');
  assert.strictEqual(valid.institution.domain, '@bennett.edu.in');
  assert.strictEqual(valid.error, undefined);

  const invalid = await resolveInstitutionalEmail('hacker@unauthorized-domain.com');
  assert.ok(invalid.error);
  assert.ok(invalid.error.includes('approved university'));
});
