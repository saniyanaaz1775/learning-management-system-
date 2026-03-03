'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { sidebarStore } from '@/store/sidebarStore';
import { Spinner } from '@/lib/common/Spinner';

export default function ModulePage() {
  const params = useParams();
  const subjectId = String(params.subjectId);
  const sectionId = String(params.sectionId);
  const tree = sidebarStore((s) => s.tree);
  const loading = sidebarStore((s) => s.loading);

  const sectionItem = tree?.sections?.find((s) => s.section.id === sectionId);

  if (loading && !tree) {
    return (
      <div className="flex items-center gap-2 p-8">
        <Spinner />
        <span>Loading…</span>
      </div>
    );
  }

  if (!sectionItem) {
    return (
      <div className="p-8">
        <p className="text-neutral-500 dark:text-neutral-400">Module not found.</p>
      </div>
    );
  }

  const { section, videos } = sectionItem;
  const courseTitle = tree?.subject?.title ?? 'Course';

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-6 flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
        <Link href="/" className="hover:text-neutral-700 dark:hover:text-neutral-300">
          Courses
        </Link>
        <span aria-hidden>/</span>
        <Link
          href={`/subjects/${subjectId}`}
          className="hover:text-neutral-700 dark:hover:text-neutral-300"
        >
          {courseTitle}
        </Link>
        <span aria-hidden>/</span>
        <span className="text-neutral-900 dark:text-white">{section.title}</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          {section.title}
        </h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          {videos.length} lesson{videos.length !== 1 ? 's' : ''}
        </p>
      </header>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">
          Lessons
        </h2>
        <ul className="space-y-2">
          {videos.map((item) => (
            <li key={item.video.id}>
              <Link
                href={`/subjects/${subjectId}/video/${item.video.id}`}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
                  item.locked
                    ? 'cursor-not-allowed border-neutral-200 bg-neutral-50 text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900/50 dark:text-neutral-500'
                    : 'border-neutral-200 bg-white text-neutral-900 shadow-sm hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800'
                }`}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-sm font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                  {item.video.order_index + 1}
                </span>
                <span className="flex-1 font-medium">{item.video.title}</span>
                {item.locked ? (
                  <span className="text-xs" title="Complete the previous lesson">
                    Locked
                  </span>
                ) : null}
                {item.is_completed ? (
                  <span className="text-emerald-600 dark:text-emerald-400" title="Completed">
                    Done
                  </span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
