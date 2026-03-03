import { subjectRepository, isEnrolled, enrollUser } from './subject.repository';
import { getOrderedVideoIdsForSubject, isVideoLockedForUser } from '../../utils/ordering';
import { prisma } from '../../config/db';

export const subjectService = {
  async list(params: { page?: number; pageSize?: number; q?: string }) {
    return subjectRepository.findManyPublished(params);
  },

  async getById(subjectId: bigint) {
    return subjectRepository.findById(subjectId);
  },

  async getTree(subjectId: bigint, userId: bigint) {
    const subject = await subjectRepository.getTree(subjectId);
    if (!subject) return null;
    const enrolled = await isEnrolled(userId, subjectId);
    if (!enrolled) return 'NOT_ENROLLED';

    const ordered = await getOrderedVideoIdsForSubject(subjectId);
    const completedSet = new Set<bigint>();
    const progress = await prisma.videoProgress.findMany({
      where: { userId, videoId: { in: ordered.map((v) => v.videoId) }, isCompleted: true },
    });
    progress.forEach((p) => completedSet.add(p.videoId));

    const sections = subject.sections.map((sec) => ({
      section: {
        id: sec.id.toString(),
        title: sec.title,
        order_index: sec.orderIndex,
        created_at: sec.createdAt,
        updated_at: sec.updatedAt,
      },
      videos: sec.videos.map((v) =>
        (async () => {
          const { locked } = await isVideoLockedForUser(userId, v.id, ordered);
          return {
            video: {
              id: v.id.toString(),
              title: v.title,
              description: v.description,
              youtube_video_id: v.youtubeVideoId,
              order_index: v.orderIndex,
              duration_seconds: v.durationSeconds,
              section_id: sec.id.toString(),
              created_at: v.createdAt,
              updated_at: v.updatedAt,
            },
            is_completed: completedSet.has(v.id),
            locked,
          };
        })()
      ),
    }));

    const videosResolved = await Promise.all(
      sections.map(async (sec) => ({
        section: sec.section,
        videos: await Promise.all(sec.videos),
      }))
    );

    return {
      subject: {
        id: subject.id.toString(),
        title: subject.title,
        slug: subject.slug,
        description: subject.description,
        is_published: subject.isPublished,
        created_at: subject.createdAt,
        updated_at: subject.updatedAt,
      },
      sections: videosResolved,
    };
  },

  async enroll(subjectId: bigint, userId: bigint): Promise<'ok' | 'NOT_FOUND'> {
    const subject = await subjectRepository.findById(subjectId);
    if (!subject) return 'NOT_FOUND';
    await enrollUser(userId, subjectId);
    return 'ok';
  },
};
