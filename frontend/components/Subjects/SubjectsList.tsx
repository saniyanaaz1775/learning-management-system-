'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/apiClient';
import { Spinner } from '@/lib/common/Spinner';
import { Alert } from '@/lib/common/Alert';

interface SubjectItem {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  is_published: boolean;
  created_at: string;
}

export function SubjectsList() {
  const [items, setItems] = useState<SubjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .get<{ items: SubjectItem[] }>('/api/subjects')
      .then((data) => setItems(data.items))
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-8">
        <Spinner />
        <span>Loading subjects...</span>
      </div>
    );
  }
  if (error) {
    return <Alert variant="error">{error}</Alert>;
  }
  if (items.length === 0) {
    return <p className="text-neutral-500 py-8">No subjects yet.</p>;
  }

  return (
    <ul className="space-y-4">
      {items.map((s) => (
        <li key={s.id}>
          <Link
            href={`/subjects/${s.id}`}
            className="block p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
          >
            <h2 className="font-medium">{s.title}</h2>
            {s.description && (
              <p className="text-sm text-neutral-500 mt-1 line-clamp-2">{s.description}</p>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}
