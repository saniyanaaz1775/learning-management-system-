import { prisma } from '../../config/db';
import { isEnrolled } from '../subjects/subject.repository';
import { progressRepository } from './progress.repository';

export const progressService = {
  async getSubjectProgress(userId: bigint, subjectId: bigint) {
    return progressRepository.getSubjectProgress(userId, subjectId);
  },

  async getVideoProgress(userId: bigint, videoId: bigint) {
    return progressRepository.getVideoProgress(userId, videoId);
  },

  async upsertVideoProgress(
    userId: bigint,
    videoId: bigint,
    body: { last_position_seconds: number; is_completed?: boolean }
  ): Promise<'ok' | 'NOT_ENROLLED' | 'NOT_FOUND'> {
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      include: { section: true },
    });
    if (!video) return 'NOT_FOUND';
    const subjectId = video.section.subjectId;
    const enrolled = await isEnrolled(userId, subjectId);
    if (!enrolled) return 'NOT_ENROLLED';

    const durationSeconds = video.durationSeconds ?? null;
    await progressRepository.upsertVideoProgress(
      userId,
      videoId,
      {
        lastPositionSeconds: body.last_position_seconds,
        isCompleted: body.is_completed,
      },
      durationSeconds
    );
    return 'ok';
  },
};
