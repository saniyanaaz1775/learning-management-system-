import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { corsOptions } from './config/security';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import { authRoutes } from './modules/auth/auth.routes';
import { adminRoutes } from './modules/admin/admin.routes';
import { subjectRoutes } from './modules/subjects/subject.routes';
import { videoRoutes } from './modules/videos/video.routes';
import { progressRoutes } from './modules/progress/progress.routes';
import { executeRoutes } from './modules/execute/execute.routes';
import { healthRoutes } from './modules/health/health.routes';

const app = express();

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(requestLogger);

app.get('/', (_req, res) => {
  res.json({
    message: 'LMS API',
    docs: 'Use the frontend at http://localhost:3000',
    health: '/api/health',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/execute', executeRoutes);
app.use('/api/health', healthRoutes);

app.use('/api/*', (_, res) => res.status(404).json({ error: 'Not found' }));
app.use(errorHandler);

export default app;
