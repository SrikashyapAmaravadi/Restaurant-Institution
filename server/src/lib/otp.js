import crypto from 'crypto';

function pepper() {
  return process.env.OTP_PEPPER || process.env.JWT_SECRET || 'dev-otp-pepper';
}

export function generateNumericOtp() {
  return crypto.randomInt(100000, 1000000).toString();
}

export function hashOtp(email, code) {
  return crypto
    .createHmac('sha256', pepper())
    .update(`${email.toLowerCase().trim()}:${String(code).trim()}`)
    .digest('hex');
}

export function otpMatches(email, code, storedHash) {
  if (!storedHash || !code) return false;
  const computed = hashOtp(email, code);
  const a = Buffer.from(computed, 'hex');
  const b = Buffer.from(String(storedHash), 'hex');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function randomPasswordHashSource() {
  return crypto.randomBytes(32).toString('hex');
}
