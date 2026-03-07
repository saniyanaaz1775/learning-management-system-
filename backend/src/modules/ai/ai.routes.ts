import { Router } from 'express';
import { authMiddleware } from '../../middleware/authMiddleware';
import { postHelp } from './ai.controller';

export const aiRoutes = Router();
aiRoutes.post('/help', authMiddleware, postHelp);
