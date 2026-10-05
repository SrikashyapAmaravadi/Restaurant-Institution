const ACCESS_COOKIE = 'dine_access';
const REFRESH_COOKIE = 'dine_refresh';

function cookieBase() {
  const isProd = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';
  const parts = ['Path=/', 'HttpOnly', 'SameSite=Lax'];
  if (isProd) parts.push('Secure');
  return parts;
}

function serializeCookie(name, value, maxAgeSeconds) {
  const encoded = encodeURIComponent(value);
  return [`${name}=${encoded}`, ...cookieBase(), `Max-Age=${maxAgeSeconds}`].join('; ');
}

export function parseCookies(req) {
  const header = req.headers.cookie;
  if (!header) return {};
  const out = {};
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    if (!key) continue;
    try {
      out[key] = decodeURIComponent(val);
    } catch {
      out[key] = val;
    }
  }
  return out;
}

export function setAuthCookies(res, { accessToken, refreshToken }) {
  const refreshDays = Number(process.env.REFRESH_TOKEN_DAYS || 7);
  res.append('Set-Cookie', serializeCookie(ACCESS_COOKIE, accessToken, 15 * 60));
  res.append('Set-Cookie', serializeCookie(REFRESH_COOKIE, refreshToken, refreshDays * 24 * 60 * 60));
}

export function clearAuthCookies(res) {
  res.append('Set-Cookie', serializeCookie(ACCESS_COOKIE, '', 0));
  res.append('Set-Cookie', serializeCookie(REFRESH_COOKIE, '', 0));
}

export function getAccessTokenFromRequest(req) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  return parseCookies(req)[ACCESS_COOKIE] || null;
}

export function getRefreshTokenFromRequest(req) {
  if (req.body?.refreshToken) return String(req.body.refreshToken);
  return parseCookies(req)[REFRESH_COOKIE] || null;
}

export { ACCESS_COOKIE, REFRESH_COOKIE };
