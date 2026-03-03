import { Request, Response } from 'express';
import { videoService } from './video.service';

export async function getVideo(req: Request, res: Response): Promise<void> {
  try {
    const videoId = BigInt(req.params.videoId);
    const userId = req.user!.id;
    const meta = await videoService.getVideoMeta(videoId, BigInt(userId));
    if (!meta) {
      res.status(404).json({ error: 'Video not found' });
      return;
    }
    if (meta === 'NOT_ENROLLED') {
      res.status(403).json({ error: 'Enroll in this course to watch videos' });
      return;
    }
    res.json(meta);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to get video' });
  }
}
