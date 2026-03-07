'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/apiClient';
import { Button } from '@/lib/common/Button';
import { Spinner } from '@/lib/common/Spinner';
import { sidebarStore } from '@/store/sidebarStore';
import { toastStore } from '@/store/toastStore';
import { aiHelperStore } from '@/store/aiHelperStore';

export default function CourseOverviewPage() {
  const params = useParams();
  const router = useRouter();
  const subjectId = String(params.subjectId);
  const tree = sidebarStore((s) => s.tree);
  const notEnrolled = sidebarStore((s) => s.notEnrolled);
  const [description, setDescription] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    apiClient
      .get<{ description: string | null }>(`/api/subjects/${subjectId}`)
      .then((data) => setDescription(data.description ?? null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [subjectId]);

  useEffect(() => {
    const setCourse = aiHelperStore.getState().setCourse;
    const setLesson = aiHelperStore.getState().setLesson;
    const setCode = aiHelperStore.getState().setCode;
    if (tree?.subject?.title) {
      setCourse(tree.subject.title);
    }
    setLesson(null);
    setCode(null);
    return () => {
      setCourse(null);
    };
  }, [tree?.subject?.title]);

  async function handleStart() {
    setStarting(true);
    try {
      let data: { video_id: string };
      try {
        data = await apiClient.get<{ video_id: string }>(`/api/subjects/${subjectId}/first-video`);
      } catch (e) {
        const msg = e instanceof Error ? e.message : '';
        if (msg.includes('Enroll')) {
          await apiClient.post(`/api/subjects/${subjectId}/enroll`);
          data = await apiClient.get<{ video_id: string }>(`/api/subjects/${subjectId}/first-video`);
        } else throw e;
      }
      router.push(`/subjects/${subjectId}/video/${data.video_id}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Something went wrong';
      toastStore.getState().error(msg);
      setStarting(false);
    }
  }

  if (loading && !tree) {
    return (
      <div className="flex items-center gap-2 p-8">
        <Spinner />
        <span>Loading…</span>
      </div>
    );
  }

  if (notEnrolled && !tree) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        {description ? (
          <p className="mb-6 whitespace-pre-wrap text-neutral-600 dark:text-neutral-400">
            {description}
          </p>
        ) : null}
        <Button onClick={handleStart} loading={starting}>
          Enroll and start
        </Button>
      </div>
    );
  }

  const courseTitle = tree?.subject?.title ?? 'Course';
  const modules = tree?.sections ?? [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-10">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          {courseTitle}
        </h1>
        {description ? (
          <p className="mt-3 leading-relaxed text-neutral-600 dark:text-neutral-400">
            {description}
          </p>
        ) : null}
      </header>

      <div className="mb-8">
        <Button
          onClick={handleStart}
          loading={starting}
          variant="primary"
          className="rounded-lg"
          title="Open the first lesson or continue where you left off"
        >
          Start / Continue
        </Button>
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">
          Modules
        </h2>
        {modules.length === 0 ? (
          <p className="text-neutral-500 dark:text-neutral-400">No modules in this course yet.</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {modules.map((item) => (
              <li key={item.section.id}>
                <Link
                  href={`/subjects/${subjectId}/modules/${item.section.id}`}
                  className="block rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
                >
                  <h3 className="font-medium text-neutral-900 dark:text-white">
                    {item.section.title}
                  </h3>
                  <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                    {item.videos.length} lesson{item.videos.length !== 1 ? 's' : ''}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
