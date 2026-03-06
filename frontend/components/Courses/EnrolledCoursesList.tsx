'use client';

import { useEffect, useState } from 'react';
import {
  fetchAllCourses,
  fetchEnrolledSubjectIds,
  fetchProgressMap,
  type CourseItem,
  type SubjectProgress,
} from '@/lib/courses';
import { Spinner } from '@/lib/common/Spinner';
import { Alert } from '@/lib/common/Alert';
import { toastStore } from '@/store/toastStore';
import { CourseCard } from './CourseCard';

/**
 * Displays ONLY enrolled courses. Used on the My Learning page.
 */
export function EnrolledCoursesList() {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, SubjectProgress>>({});
  const [loading, setLoading] = useState(true);
  const [progressLoading, setProgressLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const all = await fetchAllCourses();
        if (cancelled) return;
        const enrolledIds = await fetchEnrolledSubjectIds(all.map((c) => c.id));
        if (cancelled) return;
        const enrolled = all.filter((c) => enrolledIds.includes(c.id));
        setCourses(enrolled);

        const map =
          enrolledIds.length > 0 ? await fetchProgressMap(enrolledIds) : {};
        if (!cancelled) setProgressMap(map);
      } catch (e) {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : 'Failed to load';
          setError(msg);
          toastStore.getState().error(msg);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setProgressLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16">
        <Spinner />
        <span className="text-neutral-600 dark:text-neutral-400">Loading your courses…</span>
      </div>
    );
  }
  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/30">
        <Alert variant="error">{error}</Alert>
      </div>
    );
  }
  if (courses.length === 0) {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-neutral-50/50 py-16 text-center dark:border-neutral-800 dark:bg-neutral-900/30">
        <p className="text-neutral-500 dark:text-neutral-400">
          You haven&apos;t enrolled in any courses yet. Browse courses to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          id={course.id}
          title={course.title}
          description={course.description}
          percentComplete={progressMap[course.id]?.percent_complete ?? 0}
          hasProgress={(progressMap[course.id]?.completed_videos ?? 0) > 0}
          isLoadingProgress={progressLoading}
          thumbnail={course.thumbnail ?? null}
          videoUrl={course.videoUrl ?? null}
        />
      ))}
    </div>
  );
}
