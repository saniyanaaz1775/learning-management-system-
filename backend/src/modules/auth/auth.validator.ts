import { Request, Response, NextFunction } from 'express';

function validateBody(
  req: Request,
  res: Response,
  next: NextFunction,
  fields: string[]
): void {
  const body = req.body as Record<string, unknown>;
  const missing = fields.filter((f) => body[f] == null || body[f] === '');
  if (missing.length > 0) {
    res.status(400).json({ error: `Missing or empty: ${missing.join(', ')}` });
    return;
  }
  next();
}

export function validateRegister(req: Request, res: Response, next: NextFunction): void {
  validateBody(req, res, next, ['email', 'password', 'name']);
}

export function validateLogin(req: Request, res: Response, next: NextFunction): void {
  validateBody(req, res, next, ['email', 'password']);
}
