import { Router } from 'express';
import { authMiddleware } from '../../middleware/authMiddleware';
import { runCode } from './execute.controller';
import { chat } from './execute.chat.controller';

export const executeRoutes = Router();
executeRoutes.post('/run', authMiddleware, runCode);
executeRoutes.post('/chat', authMiddleware, chat);
