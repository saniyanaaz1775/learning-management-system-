import { env } from './env';

export const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  path: '/',
  ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
};

const corsOrigins = env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean);
export const corsOptions = {
  origin: corsOrigins.length > 0 ? corsOrigins : ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200,
};
