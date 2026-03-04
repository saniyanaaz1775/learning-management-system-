import { Request, Response } from 'express';
import { env } from '../../config/env';
import { toApiError } from '../../utils/apiError';
import { authService } from './auth.service';

export async function me(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (userId == null) return res.status(401).json({ error: 'Not authenticated' });
    const data = await authService.getMe(userId);
    if (!data) return res.status(401).json({ error: 'User not found' });
    return res.json(data);
  } catch (e: unknown) {
    if (env.NODE_ENV !== 'production' && e) console.error('Me error:', e);
    const { statusCode, message } = toApiError(e);
    return res.status(statusCode).json({ error: message });
  }
}

const COOKIE_NAME = env.COOKIE_NAME;
const isDev = env.NODE_ENV !== 'production';

export async function register(req: Request, res: Response) {
  try {
    const body = req.body as Record<string, unknown> | undefined;
    const email = body && typeof body.email === 'string' ? body.email : '';
    const password = body && typeof body.password === 'string' ? body.password : '';
    const name = body && typeof body.name === 'string' ? body.name : '';
    const result = await authService.register({ email, password, name });
    if (result.cookie) res.cookie(result.cookie.name, result.cookie.value, result.cookie.options);
    return res.status(201).json(result.json);
  } catch (e: unknown) {
    if (isDev && e) console.error('Register error:', e);
    const { statusCode, message } = toApiError(e);
    return res.status(statusCode).json({ error: message });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const body = req.body as Record<string, unknown> | undefined;
    const email = body && typeof body.email === 'string' ? body.email : '';
    const password = body && typeof body.password === 'string' ? body.password : '';
    const result = await authService.login({ email, password });
    if (result.cookie) res.cookie(result.cookie.name, result.cookie.value, result.cookie.options);
    return res.json(result.json);
  } catch (e: unknown) {
    if (isDev && e) console.error('Login error:', e);
    const { statusCode, message } = toApiError(e);
    return res.status(statusCode).json({ error: message });
  }
}

export async function refresh(req: Request, res: Response) {
  try {
    const token = req.cookies?.[COOKIE_NAME];
    const result = await authService.refresh(token);
    return res.json(result.json);
  } catch (e: unknown) {
    const { statusCode, message } = toApiError(e);
    return res.status(statusCode).json({ error: message });
  }
}

export async function logout(req: Request, res: Response) {
  try {
    const token = req.cookies?.[COOKIE_NAME];
    await authService.logout(token);
    res.clearCookie(COOKIE_NAME, { path: '/', httpOnly: true });
    return res.json({ message: 'Logged out' });
  } catch {
    res.clearCookie(COOKIE_NAME, { path: '/', httpOnly: true });
    return res.json({ message: 'Logged out' });
  }
}
