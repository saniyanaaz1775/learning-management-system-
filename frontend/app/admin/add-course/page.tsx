'use client';

import { useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/apiClient';
import { Button } from '@/lib/common/Button';
import { Alert } from '@/lib/common/Alert';
import { ConfirmDialog } from '@/lib/common/ConfirmDialog';
import { AuthGuard } from '@/components/Auth/AuthGuard';
import { toastStore } from '@/store/toastStore';

interface LessonRow {
  id: string;
  title: string;
  videoUrl: string;
  textNotes: string;
  assignmentQuestion: string;
}

const newLesson = (): LessonRow => ({
  id: crypto.randomUUID(),
  title: '',
  videoUrl: '',
  textNotes: '',
  assignmentQuestion: '',
});

export default function AddCoursePage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [sectionTitle, setSectionTitle] = useState('Lessons');
  const [lessons, setLessons] = useState<LessonRow[]>([newLesson()]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmRemoveLessonId, setConfirmRemoveLessonId] = useState<string | null>(null);

  function addLesson() {
    setLessons((prev) => [...prev, newLesson()]);
  }

  function removeLesson(id: string) {
    setLessons((prev) => (prev.length > 1 ? prev.filter((l) => l.id !== id) : prev));
    setConfirmRemoveLessonId(null);
  }

  function updateLesson(id: string, field: keyof LessonRow, value: string) {
    setLessons((prev) =>
      prev.map((l) => (l.id === id ? { ...l, [field]: value } : l))
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        sectionTitle: sectionTitle.trim() || 'Lessons',
        lessons: lessons
          .filter((l) => l.title.trim() && l.videoUrl.trim())
          .map((l) => ({
            title: l.title.trim(),
            videoUrl: l.videoUrl.trim(),
            textNotes: l.textNotes.trim() || undefined,
            assignmentQuestion: l.assignmentQuestion.trim() || undefined,
          })),
      };
      if (!payload.title) {
        setError('Course title is required.');
        return;
      }
      if (payload.lessons.length === 0) {
        setError('Add at least one lesson with a title and YouTube video URL.');
        return;
      }
      await apiClient.post('/api/admin/courses', payload);
      setSuccess('Course created. It will appear on the Courses page.');
      toastStore.getState().success('Course added successfully');
      setTitle('');
      setDescription('');
      setThumbnailUrl('');
      setDifficulty('');
      setSectionTitle('Lessons');
      setLessons([newLesson()]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create course';
      setError(msg);
      toastStore.getState().error(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <AuthGuard>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-8">
          <nav className="mb-4 text-sm text-neutral-500 dark:text-neutral-400">
            <Link href="/courses" className="hover:text-neutral-700 dark:hover:text-neutral-300">
              ← Courses
            </Link>
          </nav>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Add Course
          </h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Create a new course and add lessons. New courses appear on the Courses page.
          </p>
        </header>

        {error && (
          <Alert variant="error" className="mb-4">
            {error}
          </Alert>
        )}
        {success && (
          <Alert variant="success" className="mb-4">
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <section className="space-y-4 rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-900/30">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Course details
            </h2>
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Course title *
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 shadow-sm dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
                placeholder="e.g. Introduction to Python"
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="mt-1 block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 shadow-sm dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
                placeholder="Brief course description"
              />
            </div>
            <div>
              <label htmlFor="thumbnailUrl" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Thumbnail image URL
              </label>
              <input
                id="thumbnailUrl"
                type="url"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                className="mt-1 block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 shadow-sm dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
                placeholder="https://..."
              />
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                Optional. Not stored in the database yet.
              </p>
            </div>
            <div>
              <label htmlFor="difficulty" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Difficulty level
              </label>
              <select
                id="difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="mt-1 block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 shadow-sm dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
              >
                <option value="">—</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                Optional. Not stored in the database yet.
              </p>
            </div>
            <div>
              <label htmlFor="sectionTitle" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Section title for lessons
              </label>
              <input
                id="sectionTitle"
                type="text"
                value={sectionTitle}
                onChange={(e) => setSectionTitle(e.target.value)}
                className="mt-1 block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 shadow-sm dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
                placeholder="Lessons"
              />
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Lessons
              </h2>
              <Button type="button" variant="secondary" onClick={addLesson}>
                Add lesson
              </Button>
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Use a YouTube URL (e.g. https://www.youtube.com/watch?v=VIDEO_ID or https://youtu.be/VIDEO_ID).
            </p>
            {lessons.map((lesson) => (
              <div
                key={lesson.id}
                className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900/30"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Lesson {lessons.findIndex((l) => l.id === lesson.id) + 1}
                  </span>
                    <button
                    type="button"
                    onClick={() => setConfirmRemoveLessonId(lesson.id)}
                    className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Lesson title *
                    </label>
                    <input
                      type="text"
                      value={lesson.title}
                      onChange={(e) => updateLesson(lesson.id, 'title', e.target.value)}
                      className="mt-1 block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 shadow-sm dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
                      placeholder="e.g. Variables and types"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Video URL (YouTube) *
                    </label>
                    <input
                      type="url"
                      value={lesson.videoUrl}
                      onChange={(e) => updateLesson(lesson.id, 'videoUrl', e.target.value)}
                      className="mt-1 block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 shadow-sm dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Text notes
                    </label>
                    <textarea
                      value={lesson.textNotes}
                      onChange={(e) => updateLesson(lesson.id, 'textNotes', e.target.value)}
                      rows={2}
                      className="mt-1 block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 shadow-sm dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
                      placeholder="Optional notes for this lesson"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Assignment question
                    </label>
                    <input
                      type="text"
                      value={lesson.assignmentQuestion}
                      onChange={(e) => updateLesson(lesson.id, 'assignmentQuestion', e.target.value)}
                      className="mt-1 block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 shadow-sm dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
                      placeholder="Optional assignment for this lesson"
                    />
                  </div>
                </div>
              </div>
            ))}
          </section>

          <div className="flex gap-3">
            <Button type="submit" disabled={saving} loading={saving} loadingLabel="Saving…">
              Save course
            </Button>
            <Link href="/courses">
              <Button type="button" variant="secondary" disabled={saving}>
                Cancel
              </Button>
            </Link>
          </div>
        </form>

        <ConfirmDialog
          open={confirmRemoveLessonId !== null}
          title="Remove lesson"
          message="Remove this lesson from the form? You can add it again before saving."
          confirmLabel="Remove"
          cancelLabel="Keep"
          variant="danger"
          onConfirm={() => confirmRemoveLessonId && removeLesson(confirmRemoveLessonId)}
          onCancel={() => setConfirmRemoveLessonId(null)}
        />
      </div>
    </AuthGuard>
  );
}
