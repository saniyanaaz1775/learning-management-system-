import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface AccessPayload {
  userId: number;
  email: string;
}

export interface RefreshPayload {
  userId: number;
}

export function signAccessToken(payload: AccessPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRES_IN });
}

export function signRefreshToken(payload: RefreshPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN });
}

export function verifyAccessToken(token: string): AccessPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessPayload;
}

export function verifyRefreshToken(token: string): RefreshPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshPayload;
}
