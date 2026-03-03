'use client';

import { useEffect, useState } from 'react';
import { fetchAllCourses, fetchProgressMap, type CourseItem, type SubjectProgress } from '@/lib/courses';
import { Spinner } from '@/lib/common/Spinner';
import { Alert } from '@/lib/common/Alert';
import { CourseCard } from './CourseCard';

/**
 * Displays ALL available courses (browse/explore). Used on the Courses page.
 */
export function CoursesList() {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, SubjectProgress>>({});
  const [loading, setLoading] = useState(true);
  const [progressLoading, setProgressLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllCourses()
      .then(setCourses)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (courses.length === 0) {
      setProgressLoading(false);
      return;
    }
    const ids = courses.map((c) => c.id);
    fetchProgressMap(ids).then(setProgressMap).finally(() => setProgressLoading(false));
  }, [courses]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16">
        <Spinner />
        <span className="text-neutral-600 dark:text-neutral-400">Loading courses…</span>
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
        <p className="text-neutral-500 dark:text-neutral-400">No courses available yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          id={course.id}
          title={course.title}
          description={course.description}
          percentComplete={progressMap[course.id]?.percent_complete ?? 0}
          hasProgress={(progressMap[course.id]?.completed_videos ?? 0) > 0}
          isLoadingProgress={progressLoading}
        />
      ))}
    </div>
  );
}
