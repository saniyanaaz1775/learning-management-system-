'use client';

import { useState, useRef, useEffect } from 'react';
import { apiClient } from '@/lib/apiClient';
import { aiHelperStore } from '@/store/aiHelperStore';
import { Spinner } from '@/lib/common/Spinner';

type Message = { role: 'user' | 'assistant'; text: string };

const FALLBACK_MESSAGE = 'AI assistant is temporarily unavailable. Please try again later.';

/** Sparkle / AI icon for the floating button (SaaS-style) */
function AIIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg className="h-6 w-6 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    );
  }
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
      />
    </svg>
  );
}

export function AIHelperBot() {
  const open = aiHelperStore((s) => s.openPanel);
  const setOpenPanel = aiHelperStore((s) => s.setOpenPanel);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const course = aiHelperStore((s) => s.course);
  const lesson = aiHelperStore((s) => s.lesson);
  const code = aiHelperStore((s) => s.code);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const question = input.trim();
    if (!question || loading) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: question }]);
    setLoading(true);

    try {
      const body: { question: string; course?: string; lesson?: string; code?: string } = { question };
      if (course) body.course = course;
      if (lesson) body.lesson = lesson;
      if (code) body.code = code;

      const data = await apiClient.post<{ answer?: string }>('/api/ai/help', body);
      const answer =
        typeof data?.answer === 'string' && data.answer.trim() ? data.answer.trim() : FALLBACK_MESSAGE;
      setMessages((prev) => [...prev, { role: 'assistant', text: answer }]);
    } catch (err) {
      const message = err instanceof Error ? err.message : FALLBACK_MESSAGE;
      setMessages((prev) => [...prev, { role: 'assistant', text: message }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpenPanel(!open)}
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-neutral-800 text-white shadow-lg ring-2 ring-neutral-700/50 transition-all duration-200 hover:scale-105 hover:bg-neutral-700 hover:shadow-xl hover:ring-neutral-600 sm:bottom-6 sm:right-6 dark:bg-neutral-700 dark:ring-neutral-600/50 dark:hover:bg-neutral-600 dark:hover:ring-neutral-500"
        aria-label={open ? 'Close AI assistant' : 'Open AI assistant'}
      >
        <AIIcon open={open} />
      </button>

      <div
        className="fixed bottom-24 right-4 left-4 z-50 mx-auto flex max-w-[400px] flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl transition-all duration-200 ease-out sm:left-auto sm:right-6 sm:mx-0 dark:border-neutral-700 dark:bg-neutral-900"
        style={{
          height: 'min(70vh, 520px)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transform: open ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.98)',
        }}
        aria-hidden={!open}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-700">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
            SkillSphere AI Assistant
          </h2>
          <button
            type="button"
            onClick={() => setOpenPanel(false)}
            className="rounded-lg p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && !loading && (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Ask questions about your courses, coding problems, or concepts. I’m here to help.
            </p>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                  m.role === 'user'
                    ? 'bg-neutral-800 text-white dark:bg-neutral-700'
                    : 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100'
                }`}
              >
                <span className="whitespace-pre-wrap break-words">{m.text}</span>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-2xl bg-neutral-100 px-4 py-2.5 dark:bg-neutral-800">
                <Spinner />
                <span className="text-sm text-neutral-500 dark:text-neutral-400">Thinking…</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form
          onSubmit={handleSend}
          className="shrink-0 border-t border-neutral-200 p-3 dark:border-neutral-700"
        >
          <div className="flex items-center gap-3 flex-wrap">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="h-10 min-h-[40px] flex-1 min-w-0 rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white dark:placeholder:text-neutral-400"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="h-10 min-h-[40px] shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-offset-neutral-900"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
