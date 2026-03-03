import { Request, Response } from 'express';
import { isEnrolled } from './subject.repository';
import { getFirstUnlockedVideoId } from '../../utils/ordering';
import { subjectService } from './subject.service';

export async function listSubjects(req: Request, res: Response): Promise<void> {
  try {
    const page = req.query.page ? parseInt(String(req.query.page), 10) : undefined;
    const pageSize = req.query.pageSize ? parseInt(String(req.query.pageSize), 10) : undefined;
    const q = typeof req.query.q === 'string' ? req.query.q : undefined;
    const result = await subjectService.list({ page, pageSize, q });
    res.json({
      items: result.items.map((s) => ({
        id: s.id.toString(),
        title: s.title,
        slug: s.slug,
        description: s.description,
        is_published: s.isPublished,
        created_at: s.createdAt,
      })),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to list subjects' });
  }
}

export async function getSubject(req: Request, res: Response): Promise<void> {
  try {
    const subjectId = BigInt(req.params.subjectId);
    const subject = await subjectService.getById(subjectId);
    if (!subject) {
      res.status(404).json({ error: 'Subject not found' });
      return;
    }
    res.json({
      id: subject.id.toString(),
      title: subject.title,
      slug: subject.slug,
      description: subject.description,
      is_published: subject.isPublished,
      created_at: subject.createdAt,
      updated_at: subject.updatedAt,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to get subject' });
  }
}

export async function getTree(req: Request, res: Response): Promise<void> {
  try {
    const subjectId = BigInt(req.params.subjectId);
    const userId = req.user!.id;
    const tree = await subjectService.getTree(subjectId, BigInt(userId));
    if (tree === null) {
      res.status(404).json({ error: 'Subject not found' });
      return;
    }
    if (tree === 'NOT_ENROLLED') {
      res.status(403).json({ error: 'Enroll in this course to view content' });
      return;
    }
    res.json(tree);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to get tree' });
  }
}

export async function enroll(req: Request, res: Response): Promise<void> {
  try {
    const subjectId = BigInt(req.params.subjectId);
    const userId = req.user!.id;
    const result = await subjectService.enroll(subjectId, BigInt(userId));
    if (result === 'NOT_FOUND') {
      res.status(404).json({ error: 'Subject not found' });
      return;
    }
    res.status(201).json({ message: 'Enrolled' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to enroll' });
  }
}

export async function getFirstVideo(req: Request, res: Response): Promise<void> {
  try {
    const subjectId = BigInt(req.params.subjectId);
    const userId = req.user!.id;
    const enrolled = await isEnrolled(BigInt(userId), subjectId);
    if (!enrolled) {
      res.status(403).json({ error: 'Enroll in this course first' });
      return;
    }
    const videoId = await getFirstUnlockedVideoId(BigInt(userId), subjectId);
    if (videoId == null) {
      res.status(404).json({ error: 'No unlocked video found' });
      return;
    }
    res.json({ video_id: videoId.toString() });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to get first video' });
  }
}
