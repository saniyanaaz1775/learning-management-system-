import dotenv from 'dotenv';

dotenv.config();

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
} as const;
