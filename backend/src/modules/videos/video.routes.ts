import { Router } from 'express';
import { authMiddleware } from '../../middleware/authMiddleware';
import { getVideo } from './video.controller';

export const videoRoutes = Router();
videoRoutes.get('/:videoId', authMiddleware, getVideo);
