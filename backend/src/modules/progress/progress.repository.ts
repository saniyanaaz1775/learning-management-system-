import { prisma } from '../../config/db';

export const progressRepository = {
  async getSubjectProgress(userId: bigint, subjectId: bigint) {
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      include: {
        sections: { include: { videos: true } },
      },
    });
    if (!subject) return null;
    const videoIds = subject.sections.flatMap((s) => s.videos.map((v) => v.id));
    const totalVideos = videoIds.length;
    if (totalVideos === 0) {
      return {
        total_videos: 0,
        completed_videos: 0,
        percent_complete: 0,
        last_video_id: null,
        last_position_seconds: null,
      };
    }
    const completed = await prisma.videoProgress.count({
      where: { userId, videoId: { in: videoIds }, isCompleted: true },
    });
    const lastWatched = await prisma.videoProgress.findFirst({
      where: { userId, videoId: { in: videoIds } },
      orderBy: { updatedAt: 'desc' },
      include: { video: true },
    });
    const percentComplete = totalVideos > 0 ? Math.round((completed / totalVideos) * 100) : 0;
    let completed_at: string | null = null;
    if (percentComplete >= 100 && videoIds.length > 0) {
      const lastCompleted = await prisma.videoProgress.findFirst({
        where: { userId, videoId: { in: videoIds }, isCompleted: true },
        orderBy: { completedAt: 'desc' },
        select: { completedAt: true },
      });
      completed_at = lastCompleted?.completedAt?.toISOString() ?? null;
    }
    return {
      total_videos: totalVideos,
      completed_videos: completed,
      percent_complete: percentComplete,
      last_video_id: lastWatched?.videoId.toString() ?? null,
      last_position_seconds: lastWatched?.lastPositionSeconds ?? null,
      completed_at,
    };
  },

  async getVideoProgress(userId: bigint, videoId: bigint) {
    const row = await prisma.videoProgress.findUnique({
      where: { userId_videoId: { userId, videoId } },
    });
    return {
      last_position_seconds: row?.lastPositionSeconds ?? 0,
      is_completed: row?.isCompleted ?? false,
    };
  },

  async upsertVideoProgress(
    userId: bigint,
    videoId: bigint,
    data: { lastPositionSeconds: number; isCompleted?: boolean },
    durationSeconds: number | null
  ) {
    let lastPositionSeconds = Math.max(0, data.lastPositionSeconds);
    if (durationSeconds != null) lastPositionSeconds = Math.min(lastPositionSeconds, durationSeconds);
    const completedAt = data.isCompleted ? new Date() : undefined;
    await prisma.videoProgress.upsert({
      where: { userId_videoId: { userId, videoId } },
      create: {
        userId,
        videoId,
        lastPositionSeconds,
        isCompleted: data.isCompleted ?? false,
        completedAt,
      },
      update: {
        lastPositionSeconds,
        ...(data.isCompleted !== undefined ? { isCompleted: data.isCompleted, completedAt } : {}),
      },
    });
  },
};
