'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getCourseCardThumbnail } from '@/lib/thumbnail';

export interface CourseCardProps {
  id: string;
  title: string;
  description: string | null;
  percentComplete: number;
  hasProgress: boolean;
  isLoadingProgress?: boolean;
  thumbnail?: string | null;
  videoUrl?: string | null;
}

function getCourseAction(percentComplete: number): 'start' | 'continue' | 'completed' {
  if (percentComplete >= 100) return 'completed';
  if (percentComplete > 0) return 'continue';
  return 'start';
}

const actionLabels: Record<'start' | 'continue' | 'completed', string> = {
  start: 'Start Learning',
  continue: 'Continue',
  completed: 'Completed',
};

const actionTooltips: Record<'start' | 'continue' | 'completed', string> = {
  start: "You haven't started this course yet. Click to enroll and begin the first lesson.",
  continue: "You've already started. Click to pick up where you left off.",
  completed: "You've finished all lessons in this course.",
};

function getYouTubeHqDefault(videoUrl: string | null | undefined): string | null {
  if (!videoUrl || typeof videoUrl !== 'string') return null;
  const m = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  if (!m) return null;
  return `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg`;
}

export function CourseCard({
  id,
  title,
  description,
  percentComplete,
  isLoadingProgress,
  thumbnail,
  videoUrl,
}: CourseCardProps) {
  const shortDescription =
    description != null
      ? description.length > 80
        ? description.slice(0, 80).trim() + '…'
        : description
      : '';

  const action = getCourseAction(percentComplete);
  const isCompleted = action === 'completed';

  const thumbnailUrl = useMemo(
    () => getCourseCardThumbnail(videoUrl, thumbnail),
    [videoUrl, thumbnail]
  );
  const fallbackHqUrl = useMemo(() => getYouTubeHqDefault(videoUrl), [videoUrl]);
  const [useFallback, setUseFallback] = useState(false);
  const imageUrl = useFallback && fallbackHqUrl ? fallbackHqUrl : thumbnailUrl;

  return (
    <article className="group flex h-full w-full max-w-[380px] flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-md transition-all duration-300 hover:shadow-xl dark:border-neutral-700 dark:bg-neutral-900">
      {/* Thumbnail: 140px, 16:9, overlay gradient */}
      <Link
        href={`/subjects/${id}`}
        className="relative block h-[140px] w-full shrink-0 overflow-hidden bg-neutral-200 dark:bg-neutral-800"
      >
        <div className="relative h-full w-full">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt=""
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 380px"
              unoptimized
              onError={() => {
                if (fallbackHqUrl && !useFallback) setUseFallback(true);
              }}
            />
          ) : (
            <div className="h-full w-full bg-neutral-300 dark:bg-neutral-700" aria-hidden />
          )}
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"
            aria-hidden
          />
        </div>
      </Link>

      {/* Content: compact padding */}
      <div className="flex min-h-0 flex-1 flex-col px-4 py-3">
        <h2 className="text-base font-semibold leading-snug text-neutral-900 dark:text-white line-clamp-2 mt-2">
          {title}
        </h2>
        {shortDescription ? (
          <p className="mt-1 text-sm text-neutral-500 line-clamp-2 dark:text-gray-400">
            {shortDescription}
          </p>
        ) : null}

        {/* Progress + button */}
        <div className="mt-2.5 flex flex-col gap-1.5">
          {isLoadingProgress ? (
            <div className="h-1 w-full rounded-full bg-neutral-200 dark:bg-neutral-700" />
          ) : (
            <div className="space-y-0.5">
              <div className="h-1 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                <div
                  className="h-full rounded-full bg-purple-500 transition-all duration-300"
                  style={{ width: `${Math.min(100, percentComplete)}%` }}
                />
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {percentComplete}% complete
              </p>
            </div>
          )}

          {isCompleted ? (
            <button
              type="button"
              disabled
              className="mt-2 w-full rounded-lg border border-neutral-300 bg-neutral-100 py-1.5 text-xs font-medium text-neutral-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
              title={actionTooltips.completed}
            >
              {actionLabels.completed}
            </button>
          ) : (
            <Link
              href={`/subjects/${id}`}
              className="mt-2 block w-full rounded-lg bg-neutral-900 py-1.5 text-center text-xs font-medium text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
              title={actionTooltips[action]}
            >
              {actionLabels[action]}
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
