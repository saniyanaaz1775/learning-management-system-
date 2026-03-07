import dotenv from 'dotenv';
import path from 'path';

// Load .env from backend root. override: false so production env (e.g. Render) is never overwritten.
dotenv.config({ path: path.resolve(__dirname, '../../.env'), override: false });

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: parseInt(process.env.PORT ?? '3001', 10),
  DATABASE_URL: process.env.DATABASE_URL ?? '',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET ?? 'dev-access-secret',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret',
  JWT_ACCESS_EXPIRES_IN: '15m',
  JWT_REFRESH_EXPIRES_IN: '30d',
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN ?? undefined,
  COOKIE_NAME: process.env.COOKIE_NAME ?? 'refreshToken',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL ?? undefined,
  HUGGINGFACE_API_KEY: process.env.HUGGINGFACE_API_KEY ?? '',
} as const;
