import { prisma } from '../config/db';

export interface FlatVideo {
  id: bigint;
  videoId: bigint;
  sectionId: bigint;
  orderIndex: number;
}

/**
 * Get flattened list of videos in global order for a subject (sections by order_index, then videos by order_index).
 */
export async function getOrderedVideoIdsForSubject(subjectId: bigint): Promise<FlatVideo[]> {
  const sections = await prisma.section.findMany({
    where: { subjectId },
    orderBy: { orderIndex: 'asc' },
    include: {
      videos: { orderBy: { orderIndex: 'asc' } },
    },
  });
  const result: FlatVideo[] = [];
  for (const sec of sections) {
    for (const v of sec.videos) {
      result.push({
        id: v.id,
        videoId: v.id,
        sectionId: sec.id,
        orderIndex: v.orderIndex,
      });
    }
  }
  return result;
}

/**
 * Get previous and next video ids in global order. Returns null for first/last.
 */
export function getPrevNextVideoId(
  ordered: FlatVideo[],
  videoId: bigint
): { previousVideoId: bigint | null; nextVideoId: bigint | null } {
  const idx = ordered.findIndex((v) => v.videoId === videoId);
  if (idx < 0)
    return { previousVideoId: null, nextVideoId: null };
  return {
    previousVideoId: idx > 0 ? ordered[idx - 1].videoId : null,
    nextVideoId: idx < ordered.length - 1 ? ordered[idx + 1].videoId : null,
  };
}

/**
 * Check if a video is locked for the user: prerequisite = previous video in sequence;
 * locked if prerequisite exists and user has not completed it.
 */
export async function isVideoLockedForUser(
  userId: bigint,
  videoId: bigint,
  ordered: FlatVideo[]
): Promise<{ locked: boolean; unlockReason: string | null }> {
  const { previousVideoId } = getPrevNextVideoId(ordered, videoId);
  if (previousVideoId == null) {
    return { locked: false, unlockReason: null };
  }
  const completed = await prisma.videoProgress.findUnique({
    where: {
      userId_videoId: { userId, videoId: previousVideoId },
    },
  });
  const prerequisiteCompleted = completed?.isCompleted ?? false;
  if (prerequisiteCompleted) {
    return { locked: false, unlockReason: null };
  }
  return { locked: true, unlockReason: 'Complete previous video' };
}

/**
 * First unlocked video id in global order for the subject (or null if none).
 */
export async function getFirstUnlockedVideoId(
  userId: bigint,
  subjectId: bigint
): Promise<bigint | null> {
  const ordered = await getOrderedVideoIdsForSubject(subjectId);
  for (const v of ordered) {
    const { locked } = await isVideoLockedForUser(userId, v.videoId, ordered);
    if (!locked) return v.videoId;
  }
  return null;
}
