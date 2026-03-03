import { isEnrolled } from '../subjects/subject.repository';
import { videoRepository } from './video.repository';
import {
  getOrderedVideoIdsForSubject,
  getPrevNextVideoId,
  isVideoLockedForUser,
} from '../../utils/ordering';

export const videoService = {
  async getVideoMeta(videoId: bigint, userId: bigint) {
    const video = await videoRepository.findById(videoId);
    if (!video) return null;
    const subjectId = video.section.subjectId;
    const enrolled = await isEnrolled(userId, subjectId);
    if (!enrolled) return 'NOT_ENROLLED';

    const ordered = await getOrderedVideoIdsForSubject(subjectId);
    const { previousVideoId, nextVideoId } = getPrevNextVideoId(ordered, videoId);
    const { locked } = await isVideoLockedForUser(userId, videoId, ordered);

    return {
      video: {
        id: video.id.toString(),
        title: video.title,
        description: video.description,
        youtube_url: `https://www.youtube.com/watch?v=${video.youtubeVideoId}`,
        youtube_video_id: video.youtubeVideoId,
        order_index: video.orderIndex,
        duration_seconds: video.durationSeconds,
        section_id: video.sectionId.toString(),
        section_title: video.section.title,
        subject_id: video.section.subjectId.toString(),
        subject_title: video.section.subject.title,
      },
      previous_video_id: previousVideoId?.toString() ?? null,
      next_video_id: nextVideoId?.toString() ?? null,
      locked,
    };
  },
};
