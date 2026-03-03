import { Request, Response } from 'express';
import { progressService } from './progress.service';

export async function getSubjectProgress(req: Request, res: Response): Promise<void> {
  try {
    const subjectId = BigInt(req.params.subjectId);
    const userId = req.user!.id;
    const progress = await progressService.getSubjectProgress(BigInt(userId), subjectId);
    if (!progress) {
      res.status(404).json({ error: 'Subject not found' });
      return;
    }
    res.json(progress);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to get progress' });
  }
}

export async function getVideoProgress(req: Request, res: Response): Promise<void> {
  try {
    const videoId = BigInt(req.params.videoId);
    const userId = req.user!.id;
    const progress = await progressService.getVideoProgress(BigInt(userId), videoId);
    res.json(progress);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to get progress' });
  }
}

export async function upsertVideoProgress(req: Request, res: Response): Promise<void> {
  try {
    const videoId = BigInt(req.params.videoId);
    const userId = req.user!.id;
    const body = req.body as { last_position_seconds?: number; is_completed?: boolean };
    const last_position_seconds = typeof body.last_position_seconds === 'number' ? body.last_position_seconds : 0;
    const result = await progressService.upsertVideoProgress(BigInt(userId), videoId, {
      last_position_seconds,
      is_completed: body.is_completed,
    });
    if (result === 'NOT_FOUND') {
      res.status(404).json({ error: 'Video not found' });
      return;
    }
    if (result === 'NOT_ENROLLED') {
      res.status(403).json({ error: 'Enroll in this course to save progress' });
      return;
    }
    res.json({ message: 'OK' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to update progress' });
  }
}
