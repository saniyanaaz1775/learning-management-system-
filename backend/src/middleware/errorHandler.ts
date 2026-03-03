import { Request, Response, NextFunction } from 'express';
import { toApiError } from '../utils/apiError';

export function errorHandler(
  err: Error & { statusCode?: number; code?: string },
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const { statusCode, message } = toApiError(err);
  console.error(err);
  res.status(statusCode).json({ error: message });
}
