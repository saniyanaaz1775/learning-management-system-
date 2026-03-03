'use client';

import { SectionItem } from './SectionItem';
import type { SubjectTree } from '@/store/sidebarStore';

interface SubjectSidebarProps {
  tree: SubjectTree;
  subjectId: string;
}

export function SubjectSidebar({ tree, subjectId }: SubjectSidebarProps) {
  return (
    <aside className="w-64 shrink-0 border-r border-neutral-200 bg-neutral-50/50 p-4 overflow-y-auto dark:border-neutral-800 dark:bg-neutral-900/30">
      <h2 className="mb-1 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
        Course
      </h2>
      <p className="mb-4 font-medium text-neutral-900 dark:text-white">{tree.subject.title}</p>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
        Modules
      </h3>
      {tree.sections.map((item) => (
        <SectionItem key={item.section.id} sectionItem={item} subjectId={subjectId} />
      ))}
    </aside>
  );
}
