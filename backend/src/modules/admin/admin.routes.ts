import { Router } from 'express';
import { authMiddleware } from '../../middleware/authMiddleware';
import { adminMiddleware } from '../../middleware/adminMiddleware';
import { createCourse } from './admin.controller';

export const adminRoutes = Router();

adminRoutes.post('/courses', authMiddleware, adminMiddleware, createCourse);
