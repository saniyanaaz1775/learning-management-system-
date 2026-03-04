'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { apiClient } from '@/lib/apiClient';
import { Button } from '@/lib/common/Button';
import { Spinner } from '@/lib/common/Spinner';

export interface CodeHelperBotProps {
  code: string;
  language: string;
  errorOutput: string;
}

interface ChatResult {
  reply: string;
}

export function CodeHelperBot({ code, language, errorOutput }: CodeHelperBotProps) {
  const [question, setQuestion] = useState('');
  const [reply, setReply] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const sendInProgressRef = useRef(false);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const speakReply = useCallback(() => {
    if (!reply || typeof window === 'undefined' || !window.speechSynthesis) return;
    stopSpeaking();
    const utterance = new SpeechSynthesisUtterance(reply);
    utterance.rate = 0.9;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  }, [reply, stopSpeaking]);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSend = useCallback(async () => {
    const q = question.trim();
    if (!q) return;
    if (loading || sendInProgressRef.current) return;
    sendInProgressRef.current = true;
    setError(null);
    setReply(null);
    setLoading(true);
    try {
      const result = await apiClient.post<ChatResult>('/api/execute/chat', {
        code,
        language,
        errorOutput: errorOutput || '',
        question: q,
      });
      setReply(result.reply);
      setQuestion('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to get help');
    } finally {
      setLoading(false);
      sendInProgressRef.current = false;
    }
  }, [code, language, errorOutput, question]);

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
      <h3 className="mb-3 text-sm font-semibold text-neutral-900 dark:text-white">
        CodeHelperBot
      </h3>
      <p className="mb-3 text-xs text-neutral-500 dark:text-neutral-400">
        Ask about your code or errors. I&apos;ll give hints first; ask for &quot;corrected code&quot; if you want the full solution.
      </p>
      <div className="mb-3 flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && !loading && handleSend()}
          placeholder="e.g. Why am I getting this error?"
          className="min-w-0 flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
          disabled={loading}
        />
        <Button
          variant="primary"
          onClick={handleSend}
          disabled={loading || !question.trim()}
          className="shrink-0 rounded-lg"
        >
          {loading ? <Spinner /> : 'Ask for Help'}
        </Button>
      </div>
      {error && (
        <p className="mb-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      <div className="min-h-[80px] rounded-lg border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-700 dark:bg-neutral-800/50">
        {loading ? (
          <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
            <Spinner />
            <span className="text-sm">CodeHelperBot is thinking…</span>
          </div>
        ) : reply ? (
          <>
            <div className="whitespace-pre-wrap break-words text-sm text-neutral-800 dark:text-neutral-200">
              {reply}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                variant="secondary"
                onClick={speakReply}
                disabled={isSpeaking}
                className="rounded-lg text-sm"
              >
                🔊 Explain by Voice
              </Button>
              {isSpeaking && (
                <Button
                  variant="secondary"
                  onClick={stopSpeaking}
                  className="rounded-lg text-sm"
                >
                  Stop
                </Button>
              )}
            </div>
          </>
        ) : (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Ask a question about your code to get help.
          </p>
        )}
      </div>
    </div>
  );
}
