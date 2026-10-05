import crypto from 'crypto';

const ACCESS_COOKIE = 'db_access';
const REFRESH_COOKIE = 'db_refresh';

export function isProduction() {
  return process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL_ENV === 'production');
}

export function requireSecret(name) {
  const value = process.env[name];
  if (!value || value.length < 16) {
    throw new Error(`${name} must be set to a strong secret (16+ characters)`);
  }
  return value;
}

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (isProduction()) {
      throw new Error('JWT_SECRET is required in production');
    }
    return 'dev-only-insecure-jwt-secret-change-me';
  }
  return secret;
}

export function getOtpPepper() {
  return process.env.OTP_PEPPER || getJwtSecret();
}

export function generateNumericOtp() {
  return crypto.randomInt(100000, 1000000).toString();
}

export function hashOtp(code) {
  return crypto.createHmac('sha256', getOtpPepper()).update(String(code).trim()).digest('hex');
}

export function otpMatches(code, codeHash) {
  if (!code || !codeHash) return false;
  const hashed = hashOtp(code);
  const a = Buffer.from(hashed);
  const b = Buffer.from(String(codeHash));
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function hashRefreshToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function generateRefreshTokenValue() {
  return crypto.randomBytes(48).toString('base64url');
}

export function parseCookies(req) {
  const header = req.headers.cookie || '';
  const out = {};
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (!key) continue;
    try {
      out[key] = decodeURIComponent(value);
    } catch {
      out[key] = value;
    }
  }
  return out;
}

export function cookieOptions({ maxAgeMs, path = '/' } = {}) {
  const production = isProduction();
  return {
    httpOnly: true,
    secure: production,
    sameSite: production ? 'none' : 'lax',
    path,
    maxAge: maxAgeMs,
  };
}

function serializeCookie(name, value, options) {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  if (options.maxAge != null) parts.push(`Max-Age=${Math.floor(options.maxAge / 1000)}`);
  if (options.path) parts.push(`Path=${options.path}`);
  if (options.httpOnly) parts.push('HttpOnly');
  if (options.secure) parts.push('Secure');
  if (options.sameSite) parts.push(`SameSite=${options.sameSite}`);
  return parts.join('; ');
}

export function appendCookie(res, name, value, options) {
  const next = serializeCookie(name, value, options);
  const prev = res.getHeader('Set-Cookie');
  if (!prev) {
    res.setHeader('Set-Cookie', next);
  } else if (Array.isArray(prev)) {
    res.setHeader('Set-Cookie', [...prev, next]);
  } else {
    res.setHeader('Set-Cookie', [prev, next]);
  }
}

export function clearCookie(res, name) {
  appendCookie(res, name, '', cookieOptions({ maxAgeMs: 0 }));
}

export const AUTH_COOKIES = { ACCESS_COOKIE, REFRESH_COOKIE };

export function publicError(err, fallback = 'Request failed') {
  if (!isProduction()) {
    return err?.message || fallback;
  }
  return fallback;
}

export function normalizeEmail(raw) {
  return String(raw || '').toLowerCase().trim();
}

export function domainFromEmail(email) {
  const at = email.lastIndexOf('@');
  if (at === -1) return '';
  return email.slice(at + 1);
}

export function institutionDomainMatches(institutionDomain, email) {
  const emailDomain = domainFromEmail(email);
  const cleaned = String(institutionDomain || '').replace(/^@/, '').toLowerCase();
  return Boolean(cleaned) && emailDomain === cleaned;
}
