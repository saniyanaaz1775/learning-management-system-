import { Router } from 'express';
import { authMiddleware } from '../../middleware/authMiddleware';
import { runCode } from './execute.controller';

export const executeRoutes = Router();
executeRoutes.post('/run', authMiddleware, runCode);
