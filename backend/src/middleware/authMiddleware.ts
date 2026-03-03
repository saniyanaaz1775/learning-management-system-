/// <reference path="../types/express.d.ts" />
import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.userId, email: payload.email };
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
}
