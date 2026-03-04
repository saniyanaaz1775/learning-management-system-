/// <reference path="../types/express.d.ts" />
import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

export function adminMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  if (!env.ADMIN_EMAIL) {
    res.status(503).json({ error: 'Admin not configured' });
    return;
  }
  if (req.user.email.toLowerCase() !== env.ADMIN_EMAIL.toLowerCase()) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }
  next();
}
