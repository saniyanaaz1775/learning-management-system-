'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AuthGuard } from '@/components/Auth/AuthGuard';
import { apiClient } from '@/lib/apiClient';
import { authStore } from '@/store/authStore';
import { Spinner } from '@/lib/common/Spinner';
import { Alert } from '@/lib/common/Alert';

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

export default function ProfilePage() {
  const [subjectsProgress, setSubjectsProgress] = useState<SubjectProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = authStore((s) => s.user);

  useEffect(() => {
    apiClient
      .get<{ items: SubjectItem[] }>('/api/subjects')
      .then(async (data) => {
        const list = data.items ?? [];
        const results = await Promise.all(
          list.map(async (s) => {
            try {
              const p = await apiClient.get<{
                total_videos: number;
                completed_videos: number;
                percent_complete: number;
                last_video_id: string | null;
              }>(`/api/progress/subjects/${s.id}`);
              return {
                subject_id: s.id,
                title: s.title,
                ...p,
              };
            } catch {
              return null;
            }
          })
        );
        setSubjectsProgress(results.filter((r): r is SubjectProgress => r !== null));
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="mb-2">Profile</h1>
        {user && (
          <p className="text-neutral-600 dark:text-neutral-400 mb-8">
            {user.name} ({user.email})
          </p>
        )}
        <h2 className="text-lg font-medium mb-4">Progress by subject</h2>
        {loading && (
          <div className="flex items-center gap-2 py-4">
            <Spinner />
            <span>Loading...</span>
          </div>
        )}
        {error && (
          <Alert variant="error" className="mb-4">
            {error}
          </Alert>
        )}
        {!loading && !error && subjectsProgress.length === 0 && (
          <p className="text-neutral-500">No subjects or progress yet.</p>
        )}
        {!loading && subjectsProgress.length > 0 && (
          <ul className="space-y-4">
            {subjectsProgress.map((p) => (
              <li key={p.subject_id}>
                <Link
                  href={`/subjects/${p.subject_id}`}
                  className="block p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
                >
                  <div className="flex justify-between items-center">
                    <span>{p.title}</span>
                    <span className="text-sm font-medium">
                      {p.percent_complete}% ({p.completed_videos}/{p.total_videos})
                    </span>
                  </div>
                  {p.last_video_id && (
                    <p className="text-xs text-neutral-500 mt-1">
                      Last watched: video {p.last_video_id}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AuthGuard>
  );
}
