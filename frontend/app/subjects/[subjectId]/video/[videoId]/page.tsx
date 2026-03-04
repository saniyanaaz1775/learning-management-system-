'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/apiClient';
import { VideoPlayer } from '@/components/Video/VideoPlayer';
import { sendProgress, flushProgress } from '@/lib/progress';
import { sidebarStore } from '@/store/sidebarStore';
import { toastStore } from '@/store/toastStore';
import { Spinner } from '@/lib/common/Spinner';
import { Alert } from '@/lib/common/Alert';

type Video = {
  id: string;
  title: string;
  description: string | null;
  youtube_video_id: string;
  order_index: number;
  duration_seconds: number | null;
  section_id: string;
  created_at: string;
  updated_at: string;
};

type VideoMetaResponse = {
  video: Video;
  previous_video_id: string | null;
  next_video_id: string | null;
  locked: boolean;
};

type VideoProgress = {
  last_position_seconds: number;
  is_completed: boolean;
};

export default function VideoPage() {
  const params = useParams();
  const router = useRouter();
  const subjectId = String(params.subjectId);
  const videoId = String(params.videoId);
  const [meta, setMeta] = useState<VideoMetaResponse | null>(null);
  const [progress, setProgress] = useState<VideoProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completing, setCompleting] = useState(false);
  const markVideoCompleted = sidebarStore((s) => s.markVideoCompleted);

  useEffect(() => {
    Promise.all([
      apiClient.get<VideoMetaResponse>(`/api/videos/${videoId}`),
      apiClient.get<VideoProgress>(`/api/progress/videos/${videoId}`),
    ])
      .then(([m, p]) => {
        setMeta(m);
        setProgress(p);
      })
      .catch((e) => {
        const msg = e instanceof Error ? e.message : 'Failed to load';
        setError(msg);
        toastStore.getState().error(msg);
      })
      .finally(() => setLoading(false));
  }, [videoId]);

  function handleProgress(currentTime: number) {
    if (meta && !meta.locked) {
      sendProgress(videoId, { last_position_seconds: Math.floor(currentTime) }, (vid, body) =>
        apiClient.post(`/api/progress/videos/${vid}`, body).then(() => {}, () => {})
      );
    }
  }

  async function handleCompleted() {
    setCompleting(true);
    try {
      markVideoCompleted(videoId);
      flushProgress(videoId, (vid, body) =>
        apiClient.post(`/api/progress/videos/${vid}`, { ...body, is_completed: true }).then(() => {}, () => {})
      );
      await apiClient.post(`/api/progress/videos/${videoId}`, { last_position_seconds: 0, is_completed: true });
      toastStore.getState().success('Lesson completed');
      if (meta?.next_video_id) {
        router.push(`/subjects/${subjectId}/video/${meta.next_video_id}`);
      }
    } catch {
      toastStore.getState().error('Failed to save progress');
    } finally {
      setCompleting(false);
    }
  }

  if (loading || !meta) {
    return (
      <div className="p-8 flex items-center gap-2">
        {loading && <Spinner />}
        <span>{loading ? 'Loading...' : ''}</span>
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-8">
        <Alert variant="error">{error}</Alert>
      </div>
    );
  }
  if (meta.locked) {
    return (
      <div className="mx-auto max-w-xl px-4 py-8 sm:px-6">
        <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-neutral-700 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-neutral-300">
          Complete the previous lesson to unlock this one.
        </p>
      </div>
    );
  }

  const v = meta.video;
  const startPosition = progress?.last_position_seconds ?? 0;
  const startAdjusted = Math.max(0, startPosition - 3);
  const tree = sidebarStore.getState().tree;
  const sectionItem = tree?.sections?.find((s) => s.section.id === v.section_id);
  const sectionTitle = sectionItem?.section?.title ?? 'Module';
  const courseTitle = tree?.subject?.title ?? 'Course';

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
        <Link href="/" className="hover:text-neutral-700 dark:hover:text-neutral-300">
          Courses
        </Link>
        <span aria-hidden>/</span>
        <Link href={`/subjects/${subjectId}`} className="hover:text-neutral-700 dark:hover:text-neutral-300">
          {courseTitle}
        </Link>
        <span aria-hidden>/</span>
        <Link href={`/subjects/${subjectId}/modules/${v.section_id}`} className="hover:text-neutral-700 dark:hover:text-neutral-300">
          {sectionTitle}
        </Link>
        <span aria-hidden>/</span>
        <span className="text-neutral-900 dark:text-white">{v.title}</span>
      </nav>
      <h1 className="mb-4 text-xl font-semibold tracking-tight text-neutral-900 dark:text-white">
        {v.title}
      </h1>
      <div className="mb-4 rounded-xl overflow-hidden shadow-md">
        <VideoPlayer
          videoId={v.youtube_video_id}
          startPositionSeconds={startAdjusted}
          onProgress={handleProgress}
          onCompleted={handleCompleted}
        />
      </div>
      {v.description ? (
        <p className="mt-4 whitespace-pre-wrap text-sm text-neutral-600 dark:text-neutral-400">
          {v.description}
        </p>
      ) : null}
      <div className="mt-6 flex gap-4">
        {meta.previous_video_id ? (
          <button
            type="button"
            disabled={completing}
            onClick={() => router.push(`/subjects/${subjectId}/video/${meta.previous_video_id}`)}
            className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 disabled:pointer-events-none dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            Previous lesson
          </button>
        ) : null}
        {meta.next_video_id ? (
          <button
            type="button"
            disabled={completing}
            onClick={() => router.push(`/subjects/${subjectId}/video/${meta.next_video_id}`)}
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50 disabled:pointer-events-none dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            Next lesson
          </button>
        ) : (
          <span className="text-sm text-neutral-500">No next lesson</span>
        )}
      </div>
    </div>
  );
}
