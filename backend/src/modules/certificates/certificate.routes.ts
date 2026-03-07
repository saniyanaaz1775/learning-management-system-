import { Router } from 'express';
import { authMiddleware } from '../../middleware/authMiddleware';
import { getCertificate, getCertificateMeta } from './certificate.controller';

export const certificateRoutes = Router();
certificateRoutes.get('/:courseId/meta', authMiddleware, getCertificateMeta);
certificateRoutes.get('/:courseId', authMiddleware, getCertificate);
