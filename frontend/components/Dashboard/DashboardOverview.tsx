'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  fetchAllCourses,
  fetchEnrolledSubjectIds,
  fetchProgressMap,
  type CourseItem,
  type SubjectProgress,
} from '@/lib/courses';
import { Spinner } from '@/lib/common/Spinner';
import { Alert } from '@/lib/common/Alert';
import { Button } from '@/lib/common/Button';
import { toastStore } from '@/store/toastStore';

export function DashboardOverview() {
  const [enrolledCount, setEnrolledCount] = useState<number>(0);
  const [continueCourse, setContinueCourse] = useState<{
    course: CourseItem;
    progress: SubjectProgress;
  } | null>(null);
  const [progressSummary, setProgressSummary] = useState<{
    inProgress: number;
    completed: number;
    averagePercent: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const courses = await fetchAllCourses();
        if (cancelled) return;
        const ids = courses.map((c) => c.id);
        const enrolledIds = await fetchEnrolledSubjectIds(ids);
        if (cancelled) return;
        setEnrolledCount(enrolledIds.length);

        if (enrolledIds.length === 0) {
          setProgressSummary({ inProgress: 0, completed: 0, averagePercent: 0 });
          setLoading(false);
          return;
        }

        const progressMap = await fetchProgressMap(enrolledIds);
        if (cancelled) return;

        const enrolledCourses = courses.filter((c) => enrolledIds.includes(c.id));
        let inProgress = 0;
        let completed = 0;
        let totalPercent = 0;
        let continueCandidate: { course: CourseItem; progress: SubjectProgress } | null = null;

        for (const course of enrolledCourses) {
          const p = progressMap[course.id] ?? {
            total_videos: 0,
            completed_videos: 0,
            percent_complete: 0,
            last_video_id: null,
            last_position_seconds: null,
          };
          if (p.percent_complete > 0 && p.percent_complete < 100) inProgress++;
          if (p.percent_complete >= 100) completed++;
          totalPercent += p.percent_complete;
          if (p.last_video_id != null && !continueCandidate) {
            continueCandidate = { course, progress: p };
          }
        }
        if (!continueCandidate && enrolledCourses.length > 0) {
          const first = enrolledCourses[0];
          continueCandidate = {
            course: first,
            progress: progressMap[first.id] ?? {
              total_videos: 0,
              completed_videos: 0,
              percent_complete: 0,
              last_video_id: null,
              last_position_seconds: null,
            },
          };
        }
        setContinueCourse(continueCandidate ?? null);
        setProgressSummary({
          inProgress,
          completed,
          averagePercent:
            enrolledIds.length > 0 ? Math.round(totalPercent / enrolledIds.length) : 0,
        });
      } catch (e) {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : 'Failed to load';
          setError(msg);
          toastStore.getState().error(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
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
        <span className="text-neutral-600 dark:text-neutral-400">Loading dashboard…</span>
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

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="flex h-full flex-col justify-between rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
            Enrolled courses
          </p>
          <p className="mt-2 text-3xl font-bold text-neutral-900 dark:text-white">
            {enrolledCount}
          </p>
        </div>
        {progressSummary != null && (
          <>
            <div className="flex h-full flex-col justify-between rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                In progress
              </p>
              <p className="mt-2 text-3xl font-bold text-neutral-900 dark:text-white">
                {progressSummary.inProgress}
              </p>
            </div>
            <div className="flex h-full flex-col justify-between rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                Average progress
              </p>
              <p className="mt-2 text-3xl font-bold text-neutral-900 dark:text-white">
                {progressSummary.averagePercent}%
              </p>
            </div>
          </>
        )}
      </div>

      {continueCourse && (
        <section>
          <h2 className="mb-4 text-xl font-semibold text-neutral-900 dark:text-white">
            Continue learning
          </h2>
          <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  {continueCourse.course.title}
                </h3>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  {continueCourse.progress.percent_complete}% complete
                </p>
                <div className="mt-2 h-2 w-full max-w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                  <div
                    className="h-full max-w-full rounded-full bg-emerald-500"
                    style={{ width: `${Math.min(100, continueCourse.progress.percent_complete)}%` }}
                  />
                </div>
              </div>
              <Link
                href={`/subjects/${continueCourse.course.id}`}
                className="shrink-0"
                title={
                  continueCourse.progress.last_video_id != null
                    ? 'Pick up where you left off'
                    : 'Enroll and begin the first lesson'
                }
              >
                <Button
                  variant="primary"
                  className="rounded-lg"
                  title={
                    continueCourse.progress.last_video_id != null
                      ? 'Pick up where you left off'
                      : 'Enroll and begin the first lesson'
                  }
                >
                  {continueCourse.progress.last_video_id != null ? 'Continue' : 'Start'}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {enrolledCount === 0 && (
        <div className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-6 text-center dark:border-neutral-700 dark:bg-neutral-900/30">
          <p className="text-neutral-500 dark:text-neutral-400">
            You haven&apos;t enrolled in any courses yet.
          </p>
          <Link href="/courses" className="mt-4 inline-block">
            <Button variant="primary">Browse courses</Button>
          </Link>
        </div>
      )}

      <section>
        <h2 className="mb-4 text-xl font-semibold text-neutral-900 dark:text-white">
          Tools
        </h2>
        <Link
          href="/compiler"
          className="flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-neutral-700 dark:bg-neutral-900"
        >
          <span
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800"
            aria-hidden
          >
            <svg
              className="h-6 w-6 text-neutral-600 dark:text-neutral-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
              />
            </svg>
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-neutral-900 dark:text-white">
              Online Code Compiler
            </h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Run code in Python, C, C++, Java, or JavaScript
            </p>
          </div>
        </Link>
      </section>
    </div>
  );
}
