import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'server/.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const isProduction =
  process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL_ENV === 'production');

export function requireEnv(name, { minLength = 1 } = {}) {
  const value = process.env[name];
  if (!value || String(value).trim().length < minLength) {
    throw new Error(`Missing required environment variable ${name}`);
  }
  return value;
}

export function loadRuntimeEnv() {
  if (isProduction) {
    requireEnv('DATABASE_URL', { minLength: 20 });
    requireEnv('JWT_SECRET', { minLength: 32 });
    if (process.env.JWT_SECRET === 'dine_bennett_super_secret_jwt_key_2026_rbac') {
      throw new Error('Refuse to start: default JWT_SECRET is not allowed in production');
    }
  } else if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'dine_bennett_dev_only_secret_change_me_32chars';
    console.warn('[ENV] JWT_SECRET missing — using a local development secret. Do not use this in production.');
  }

  process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
  process.env.REFRESH_TOKEN_DAYS = process.env.REFRESH_TOKEN_DAYS || '7';
}

export function corsAllowlist() {
  return (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}
