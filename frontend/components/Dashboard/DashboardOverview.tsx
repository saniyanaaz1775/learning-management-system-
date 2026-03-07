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
import { aiHelperStore } from '@/store/aiHelperStore';

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

  const inProgress = progressSummary?.inProgress ?? 0;
  const completed = progressSummary?.completed ?? 0;
  const averagePercent = progressSummary?.averagePercent ?? 0;

  const statCards = [
    {
      label: 'Enrolled Courses',
      value: String(enrolledCount),
      icon: (
        <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      gradient: 'from-violet-500/20 to-purple-600/20 dark:from-violet-500/25 dark:to-purple-600/25',
      border: 'border-violet-500/30 dark:border-violet-400/30',
      iconBg: 'text-violet-600 dark:text-violet-400',
    },
    {
      label: 'In Progress',
      value: String(inProgress),
      icon: (
        <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      gradient: 'from-amber-500/20 to-orange-600/20 dark:from-amber-500/25 dark:to-orange-600/25',
      border: 'border-amber-500/30 dark:border-amber-400/30',
      iconBg: 'text-amber-600 dark:text-amber-400',
    },
    {
      label: 'Average Progress',
      value: `${averagePercent}%`,
      icon: (
        <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      gradient: 'from-blue-500/20 to-indigo-600/20 dark:from-blue-500/25 dark:to-indigo-600/25',
      border: 'border-blue-500/30 dark:border-blue-400/30',
      iconBg: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Completed Courses',
      value: String(completed),
      icon: (
        <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: 'from-emerald-500/20 to-teal-600/20 dark:from-emerald-500/25 dark:to-teal-600/25',
      border: 'border-emerald-500/30 dark:border-emerald-400/30',
      iconBg: 'text-emerald-600 dark:text-emerald-400',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`flex flex-col rounded-xl border bg-gradient-to-br p-5 shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${card.gradient} ${card.border} dark:shadow-neutral-900/20`}
          >
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${card.iconBg}`} aria-hidden>
              {card.icon}
            </div>
            <p className="mt-4 text-3xl font-bold text-neutral-900 dark:text-white">
              {card.value}
            </p>
            <p className="mt-1 text-sm font-medium text-neutral-600 dark:text-neutral-400">
              {card.label}
            </p>
          </div>
        ))}
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
        <div className="space-y-4">
          <button
            type="button"
            onClick={() => aiHelperStore.getState().setOpenPanel(true)}
            className="flex w-full items-center gap-4 rounded-xl border border-neutral-200 bg-white p-5 text-left shadow-sm transition-shadow hover:shadow-md dark:border-neutral-700 dark:bg-neutral-900"
          >
            <span
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/40"
              aria-hidden
            >
              <svg
                className="h-6 w-6 text-violet-600 dark:text-violet-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-neutral-900 dark:text-white">
                AI Learning Assistant
              </h3>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                Ask questions about courses, coding problems, or concepts.
              </p>
            </div>
            <span className="shrink-0 flex h-10 items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white dark:bg-blue-600">
              Ask AI
            </span>
          </button>
          <Link
            href="/profile#certificates"
            className="flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-neutral-700 dark:bg-neutral-900"
          >
            <span
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/40"
              aria-hidden
            >
              <svg
                className="h-6 w-6 text-amber-600 dark:text-amber-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                />
              </svg>
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-neutral-900 dark:text-white">
                Certificates
              </h3>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                View and download your course certificates
              </p>
            </div>
          </Link>
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
        </div>
      </section>
    </div>
  );
}
