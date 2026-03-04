import { Request, Response } from 'express';
import { subjectRepository } from '../subjects/subject.repository';
import { toApiError } from '../../utils/apiError';

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'course';
}

function extractYoutubeId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  const m1 = trimmed.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (m1) return m1[1];
  return null;
}

export async function createCourse(req: Request, res: Response): Promise<void> {
  try {
    const body = (req.body || {}) as Record<string, unknown>;
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const description = typeof body.description === 'string' ? body.description.trim() || null : null;
    const lessons = Array.isArray(body.lessons) ? body.lessons : [];

    if (!title) {
      res.status(400).json({ error: 'Course title is required' });
      return;
    }

    let baseSlug = slugify(title);
    let slug = baseSlug;
    let n = 1;
    while (await subjectRepository.findExistingSlug(slug)) {
      slug = `${baseSlug}-${++n}`;
    }

    const sectionTitle = typeof body.sectionTitle === 'string' && body.sectionTitle.trim()
      ? body.sectionTitle.trim()
      : 'Lessons';

    const videos: Array<{ title: string; youtubeVideoId: string; description: string | null; orderIndex: number }> = [];
    for (let i = 0; i < lessons.length; i++) {
      const lesson = lessons[i] as Record<string, unknown> | undefined;
      if (!lesson || typeof lesson !== 'object') continue;
      const lessonTitle = typeof lesson.title === 'string' ? lesson.title.trim() : '';
      const videoUrl = typeof lesson.videoUrl === 'string' ? lesson.videoUrl : '';
      const youtubeVideoId = extractYoutubeId(videoUrl);
      if (!lessonTitle || !youtubeVideoId) continue;

      const textNotes = typeof lesson.textNotes === 'string' ? lesson.textNotes.trim() : '';
      const assignmentQuestion = typeof lesson.assignmentQuestion === 'string' ? lesson.assignmentQuestion.trim() : '';
      const descriptionParts = [textNotes];
      if (assignmentQuestion) descriptionParts.push(`Assignment: ${assignmentQuestion}`);
      const description = descriptionParts.join('\n\n').trim() || null;

      videos.push({
        title: lessonTitle,
        youtubeVideoId,
        description,
        orderIndex: i,
      });
    }

    const subject = await subjectRepository.createSubjectWithContent({
      title,
      slug,
      description,
      sectionTitle,
      videos,
    });

    res.status(201).json({
      id: subject.id.toString(),
      title: subject.title,
      slug: subject.slug,
      description: subject.description,
    });
  } catch (e: unknown) {
    const { statusCode, message } = toApiError(e);
    res.status(statusCode).json({ error: message });
  }
}
