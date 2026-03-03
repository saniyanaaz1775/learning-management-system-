'use client';

import Link from 'next/link';
import type { TreeSectionItem } from '@/store/sidebarStore';

interface SectionItemProps {
  sectionItem: TreeSectionItem;
  subjectId: string;
}

export function SectionItem({ sectionItem, subjectId }: SectionItemProps) {
  const { section, videos } = sectionItem;
  return (
    <div className="mb-4">
      <h4 className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
        {section.title}
      </h4>
      <ul className="space-y-0.5">
        {videos.map((item) => (
          <li key={item.video.id}>
            <Link
              href={`/subjects/${subjectId}/video/${item.video.id}`}
              className={`block rounded-lg py-2 px-3 text-sm ${
                item.locked
                  ? 'cursor-not-allowed text-neutral-400 dark:text-neutral-500'
                  : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
              }`}
            >
              <span className="inline-flex items-center gap-2">
                {item.locked ? (
                  <span className="text-xs" title="Complete previous lesson">🔒</span>
                ) : null}
                {item.is_completed ? (
                  <span className="text-emerald-600 dark:text-emerald-400" title="Completed">✓</span>
                ) : null}
                {item.video.title}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
