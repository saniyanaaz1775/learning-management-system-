import { Router } from 'express';
import { authMiddleware } from '../../middleware/authMiddleware';
import { getSubjectProgress, getVideoProgress, upsertVideoProgress } from './progress.controller';

export const progressRoutes = Router();
progressRoutes.get('/subjects/:subjectId', authMiddleware, getSubjectProgress);
progressRoutes.get('/videos/:videoId', authMiddleware, getVideoProgress);
progressRoutes.post('/videos/:videoId', authMiddleware, upsertVideoProgress);
