import { Router } from 'express';
import { authMiddleware } from '../../middleware/authMiddleware';
import { listSubjects, getSubject, getTree, getFirstVideo, enroll } from './subject.controller';

export const subjectRoutes = Router();
subjectRoutes.get('/', listSubjects);
subjectRoutes.post('/:subjectId/enroll', authMiddleware, enroll);
subjectRoutes.get('/:subjectId/first-video', authMiddleware, getFirstVideo);
subjectRoutes.get('/:subjectId/tree', authMiddleware, getTree);
subjectRoutes.get('/:subjectId', getSubject);
