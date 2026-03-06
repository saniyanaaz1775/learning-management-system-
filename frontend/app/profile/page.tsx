'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AuthGuard } from '@/components/Auth/AuthGuard';
import { apiClient } from '@/lib/apiClient';
import { authStore } from '@/store/authStore';
import { Spinner } from '@/lib/common/Spinner';
import { Alert } from '@/lib/common/Alert';
import {
  fetchAllCourses,
  fetchEnrolledSubjectIds,
  fetchProgressMap,
  type CourseItem,
  type SubjectProgress as ProgressType,
} from '@/lib/courses';
import { getCourseCardThumbnail } from '@/lib/thumbnail';

interface SubjectItem {
  id: string;
  title: string;
}
interface SubjectProgress {
  subject_id: string;
  title: string;
  total_videos: number;
  completed_videos: number;
  percent_complete: number;
  last_video_id: string | null;
}

/** Mock weekly activity (12 weeks × 7 days). In production, derive from progress/activity API. */
function useActivityGrid(): number[][] {
  const [grid, setGrid] = useState<number[][]>([]);
  useEffect(() => {
    setGrid(
      Array.from({ length: 12 }, () =>
        Array.from({ length: 7 }, () => Math.floor(Math.random() * 5))
      )
    );
  }, []);
  return grid;
}

/** Derive badges from progress. */
function getBadges(subjectsProgress: SubjectProgress[]): { id: string; name: string; icon: string; unlocked: boolean }[] {
  const completedCount = subjectsProgress.filter((p) => p.percent_complete >= 100).length;
  const hasAnyProgress = subjectsProgress.some((p) => p.percent_complete > 0);
  const titles = subjectsProgress.map((p) => p.title.toLowerCase());

  return [
    { id: 'first', name: 'First Course Completed', icon: '🎯', unlocked: completedCount >= 1 },
    { id: 'streak', name: '5 Day Learning Streak', icon: '🔥', unlocked: false },
    { id: 'html', name: 'HTML Beginner', icon: '📄', unlocked: titles.some((t) => t.includes('html')) },
    { id: 'js', name: 'JavaScript Explorer', icon: '⚡', unlocked: titles.some((t) => t.includes('javascript')) },
    { id: 'sql', name: 'SQL Starter', icon: '🗄️', unlocked: titles.some((t) => t.includes('sql')) },
    { id: 'start', name: 'Learning Started', icon: '🌱', unlocked: hasAnyProgress },
  ];
}

const STAT_CARDS = [
  { key: 'enrolled', label: 'Courses Enrolled', icon: '📚', color: 'from-violet-500/20 to-purple-600/20 border-violet-500/30' },
  { key: 'completed', label: 'Courses Completed', icon: '✅', color: 'from-emerald-500/20 to-teal-600/20 border-emerald-500/30' },
  { key: 'time', label: 'Total Learning Time', icon: '⏱️', color: 'from-amber-500/20 to-orange-600/20 border-amber-500/30' },
  { key: 'streak', label: 'Learning Streak', icon: '🔥', color: 'from-rose-500/20 to-pink-600/20 border-rose-500/30' },
] as const;

export default function ProfilePage() {
  const [subjectsProgress, setSubjectsProgress] = useState<SubjectProgress[]>([]);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [enrolledIds, setEnrolledIds] = useState<string[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, ProgressType>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = authStore((s) => s.user);
  const activityGrid = useActivityGrid();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [subjectsRes, allCourses] = await Promise.all([
          apiClient.get<{ items: SubjectItem[] }>('/api/subjects'),
          fetchAllCourses(),
        ]);
        if (cancelled) return;
        const list = subjectsRes.items ?? [];
        setCourses(allCourses);

        const enrolled = await fetchEnrolledSubjectIds(allCourses.map((c) => c.id));
        if (cancelled) return;
        setEnrolledIds(enrolled);

        const progress = await fetchProgressMap(enrolled.length ? enrolled : list.map((s) => s.id));
        if (cancelled) return;
        setProgressMap(progress);

        const results = await Promise.all(
          list.map(async (s) => {
            try {
              const p = await apiClient.get<{
                total_videos: number;
                completed_videos: number;
                percent_complete: number;
                last_video_id: string | null;
              }>(`/api/progress/subjects/${s.id}`);
              return { subject_id: s.id, title: s.title, ...p };
            } catch {
              return null;
            }
          })
        );
        if (!cancelled) setSubjectsProgress(results.filter((r): r is SubjectProgress => r !== null));
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  const coursesEnrolled = enrolledIds.length;
  const coursesCompleted = subjectsProgress.filter((p) => p.percent_complete >= 100).length;
  const continueLearning = subjectsProgress
    .filter((p) => p.percent_complete > 0 && p.percent_complete < 100)
    .slice(0, 3);
  const completedForCerts = subjectsProgress.filter((p) => p.percent_complete >= 100);
  const badges = getBadges(subjectsProgress);
  const courseById = Object.fromEntries(courses.map((c) => [c.id, c]));

  const stats = {
    enrolled: coursesEnrolled,
    completed: coursesCompleted,
    time: '—', // Could be derived from video progress if backend tracks time
    streak: 0, // Would come from activity API
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-neutral-100 px-4 py-8 dark:bg-neutral-950">
          <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 py-24">
            <Spinner />
            <span className="text-neutral-600 dark:text-neutral-400">Loading profile…</span>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-neutral-100 px-4 py-8 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
        <div className="mx-auto max-w-6xl space-y-10">
          {error && (
            <Alert variant="error" className="rounded-xl">
              {error}
            </Alert>
          )}

          {/* 1. Profile Header */}
          <section className="flex flex-col gap-6 rounded-2xl border border-neutral-200 bg-white p-6 shadow-lg dark:border-neutral-800 dark:bg-neutral-900/50 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-2xl font-bold text-white">
                {user?.name?.charAt(0)?.toUpperCase() ?? '?'}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">{user?.name ?? 'User'}</h1>
                <p className="text-neutral-600 dark:text-neutral-400">{user?.email}</p>
                <p className="mt-1 text-sm text-neutral-500">Member</p>
              </div>
            </div>
            <Link
              href="/profile/edit"
              className="inline-flex shrink-0 items-center justify-center rounded-lg border border-neutral-300 bg-neutral-100 px-5 py-2.5 text-sm font-medium text-neutral-800 transition-colors hover:bg-neutral-200 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700"
            >
              Edit Profile
            </Link>
          </section>

          {/* 2. Statistics */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">Overview</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {STAT_CARDS.map(({ key, label, icon, color }) => (
                <div
                  key={key}
                  className={`rounded-xl border bg-gradient-to-br p-5 shadow-md transition-all hover:shadow-lg ${color}`}
                >
                  <span className="text-2xl" aria-hidden>{icon}</span>
                  <p className="mt-2 text-2xl font-bold text-neutral-900 dark:text-white">
                    {key === 'time' ? stats.time : key === 'streak' ? `${stats.streak} days` : stats[key as keyof typeof stats]}
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">{label}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="grid gap-10 lg:grid-cols-3">
            {/* 3. Skill Progress */}
            <section className="lg:col-span-2">
            <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">Skill Progress</h2>
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-lg dark:border-neutral-800 dark:bg-neutral-900/50">
                {subjectsProgress.length === 0 ? (
                  <p className="text-neutral-500">No course progress yet. Enroll in a course to start.</p>
                ) : (
                  <div className="space-y-5">
                    {subjectsProgress.map((p) => (
                      <div key={p.subject_id}>
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-neutral-900 dark:text-white">{p.title}</span>
                          <span className="text-neutral-600 dark:text-neutral-400">{p.percent_complete}%</span>
                        </div>
                        <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
                          <div
                            className="h-full rounded-full bg-purple-500 transition-all duration-500"
                            style={{ width: `${p.percent_complete}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* 4. Continue Learning */}
            <section>
            <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">Continue Learning</h2>
            <div className="space-y-3">
                {continueLearning.length === 0 ? (
                  <p className="rounded-xl border border-neutral-200 bg-white p-4 text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900/50">
                    No courses in progress. Start a course from the Courses page.
                  </p>
                ) : (
                  continueLearning.map((p) => {
                    const course = courseById[p.subject_id];
                    const thumb = course ? getCourseCardThumbnail(course.videoUrl, course.thumbnail) : null;
                    return (
                      <Link
                        key={p.subject_id}
                        href={`/subjects/${p.subject_id}`}
                        className="flex gap-3 rounded-xl border border-neutral-200 bg-white p-3 transition-colors hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/50 dark:hover:border-neutral-700 dark:hover:bg-neutral-800/50"
                      >
                        <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-lg bg-neutral-200 dark:bg-neutral-800">
                          {thumb ? (
                            <Image src={thumb} alt="" fill className="object-cover" unoptimized sizes="96px" />
                          ) : null}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">{p.title}</p>
                          <p className="text-xs text-neutral-600 dark:text-neutral-400">{p.percent_complete}% complete</p>
                        </div>
                        <span className="shrink-0 self-center rounded bg-purple-500/20 px-2 py-1 text-xs font-medium text-purple-300">
                          Continue
                        </span>
                      </Link>
                    );
                  })
                )}
              </div>
            </section>
          </div>

          {/* 5. Achievements / Badges */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">Achievements</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
              {badges.map((b) => (
                <div
                  key={b.id}
                  className={`flex flex-col items-center rounded-xl border p-4 text-center transition-all ${
                    b.unlocked
                      ? 'border-amber-500/50 bg-amber-500/10 shadow-md'
                      : 'border-neutral-200 bg-neutral-100 opacity-60 dark:border-neutral-800 dark:bg-neutral-900/30'
                  }`}
                >
                  <span className="text-2xl">{b.icon}</span>
                  <p className="mt-2 text-xs font-medium text-neutral-900 dark:text-white">{b.name}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 6. Learning Activity */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">Learning Activity</h2>
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-lg dark:border-neutral-800 dark:bg-neutral-900/50">
              <div className="flex gap-1 overflow-x-auto pb-2">
                {activityGrid.map((week, wi) => (
                  <div key={wi} className="flex shrink-0 gap-0.5">
                    {week.map((level, di) => (
                      <div
                        key={di}
                        className="h-3 w-3 rounded-sm"
                        style={{
                          backgroundColor:
                            level === 0
                              ? 'rgb(38 38 38)'
                              : level === 1
                                ? 'rgb(88 28 135 / 0.5)'
                                : level === 2
                                  ? 'rgb(126 34 206 / 0.7)'
                                  : level === 3
                                    ? 'rgb(139 92 246 / 0.9)'
                                    : 'rgb(139 92 246)',
                        }}
                        title={`${level} activities`}
                      />
                    ))}
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-neutral-500">Last 12 weeks · More activity = darker</p>
            </div>
          </section>

          {/* 7. Certificates */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">Certificates</h2>
            {completedForCerts.length === 0 ? (
              <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center dark:border-neutral-800 dark:bg-neutral-900/50">
                <p className="text-neutral-500">Complete courses to earn certificates.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {completedForCerts.map((p) => (
                  <div
                    key={p.subject_id}
                    className="flex flex-col rounded-xl border border-neutral-200 bg-white p-5 shadow-md transition-all hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900/50"
                  >
                    <p className="font-medium text-neutral-900 dark:text-white">{p.title}</p>
                    <p className="mt-1 text-sm text-neutral-500">Completed</p>
                    <Link
                      href="#"
                      className="mt-4 inline-flex w-full justify-center rounded-lg bg-purple-600 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-500"
                    >
                      Download Certificate
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </AuthGuard>
  );
}
