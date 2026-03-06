import { apiClient } from './apiClient';

export interface CourseItem {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  is_published: boolean;
  created_at: string;
  /** Video URL (e.g. YouTube). Thumbnail is derived from this for YouTube; otherwise use thumbnail. */
  videoUrl?: string | null;
  /** Manual thumbnail URL when video is not from YouTube. */
  thumbnail?: string | null;
}

/** API may return snake_case video_url. */
interface CourseItemFromApi extends CourseItem {
  video_url?: string | null;
}

export interface SubjectProgress {
  total_videos: number;
  completed_videos: number;
  percent_complete: number;
  last_video_id: string | null;
  last_position_seconds: number | null;
}

/** Parse API response into a flat list of courses (no category grouping). */
export function getAllCoursesFromResponse(data: unknown): CourseItem[] {
  if (!data) return [];
  const empty: CourseItem[] = [];

  if (Array.isArray(data)) {
    return (data as { courses?: CourseItemFromApi[]; items?: CourseItemFromApi[] }[]).flatMap(
      (category) => (category.courses ?? category.items ?? empty).map(normalizeCourseItem)
    );
  }

  if (typeof data === 'object' && data !== null) {
    const d = data as Record<string, unknown>;
    if (Array.isArray(d.items)) {
      return (d.items as CourseItemFromApi[]).map(normalizeCourseItem);
    }
    if (Array.isArray(d.categories)) {
      return (d.categories as { courses?: CourseItemFromApi[]; items?: CourseItemFromApi[] }[]).flatMap(
        (category) => (category.courses ?? category.items ?? empty).map(normalizeCourseItem)
      );
    }
  }

  return [];
}

function normalizeCourseItem(item: CourseItemFromApi): CourseItem {
  const { video_url, ...rest } = item;
  return {
    ...rest,
    videoUrl: item.videoUrl ?? video_url ?? null,
  };
}

/** Fetch all published courses from the API. */
export async function fetchAllCourses(): Promise<CourseItem[]> {
  const data = await apiClient.get<unknown>('/api/subjects');
  return getAllCoursesFromResponse(data);
}

/**
 * Determine which subject IDs the current user is enrolled in.
 * Uses GET /api/subjects/:id/tree — 200 = enrolled, 403 = not enrolled.
 */
export async function fetchEnrolledSubjectIds(subjectIds: string[]): Promise<string[]> {
  if (subjectIds.length === 0) return [];
  const results = await Promise.all(
    subjectIds.map(async (id) => {
      try {
        await apiClient.get(`/api/subjects/${id}/tree`);
        return id;
      } catch {
        return null;
      }
    })
  );
  return results.filter((id): id is string => id !== null);
}

/** Fetch progress for the given subject IDs. */
export async function fetchProgressMap(
  subjectIds: string[]
): Promise<Record<string, SubjectProgress>> {
  if (subjectIds.length === 0) return {};
  const defaultProgress: SubjectProgress = {
    total_videos: 0,
    completed_videos: 0,
    percent_complete: 0,
    last_video_id: null,
    last_position_seconds: null,
  };
  const results = await Promise.all(
    subjectIds.map(async (id) => {
      try {
        const p = await apiClient.get<SubjectProgress>(`/api/progress/subjects/${id}`);
        return { id, p };
      } catch {
        return { id, p: defaultProgress };
      }
    })
  );
  const map: Record<string, SubjectProgress> = {};
  results.forEach(({ id, p }) => {
    map[id] = p;
  });
  return map;
}
