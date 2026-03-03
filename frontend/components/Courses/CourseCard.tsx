'use client';

import Link from 'next/link';
import { Button } from '@/lib/common/Button';

export interface CourseCardProps {
  id: string;
  title: string;
  description: string | null;
  percentComplete: number;
  hasProgress: boolean;
  isLoadingProgress?: boolean;
}

export function CourseCard({
  id,
  title,
  description,
  percentComplete,
  hasProgress,
  isLoadingProgress,
}: CourseCardProps) {
  const shortDescription =
    description != null
      ? description.length > 120
        ? description.slice(0, 120).trim() + '…'
        : description
      : '';

  return (
    <article className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-md transition-all duration-200 hover:scale-[1.02] hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mb-5">
        <h2 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-white">
          {title}
        </h2>
        {shortDescription ? (
          <p className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400 line-clamp-3">
            {shortDescription}
          </p>
        ) : null}
      </div>
      <div className="mb-5">
        {isLoadingProgress ? (
          <div className="h-2 w-full rounded-full bg-neutral-100 dark:bg-neutral-800" />
        ) : (
          <div className="space-y-1.5">
            <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${Math.min(100, percentComplete)}%` }}
              />
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {percentComplete}% complete
            </p>
          </div>
        )}
      </div>
      <Link href={`/subjects/${id}`} className="inline-block w-full">
        <Button variant="primary" className="w-full rounded-lg">
          {hasProgress ? 'Continue' : 'Start'}
        </Button>
      </Link>
    </article>
  );
}
