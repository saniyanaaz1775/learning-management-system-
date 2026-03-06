'use client';

import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/apiClient';
import { Button } from '@/lib/common/Button';
import { Spinner } from '@/lib/common/Spinner';
import { Alert } from '@/lib/common/Alert';

const LANGUAGES = [
  { value: 'python', label: 'Python' },
  { value: 'c', label: 'C' },
  { value: 'cpp', label: 'C++' },
  { value: 'java', label: 'Java' },
  { value: 'javascript', label: 'JavaScript' },
] as const;

type LanguageValue = (typeof LANGUAGES)[number]['value'];

/** Detect language from code using simple heuristics. Returns null if not confident. */
function detectLanguage(code: string): LanguageValue | null {
  const t = code.trim();
  if (!t) return null;
  if (/#include\s*<\s*iostream\s*>/.test(t) || /using\s+namespace\s+std\s*;/.test(t)) return 'cpp';
  if (/#include\s*<\s*stdio\.h\s*>/.test(t) || /#include\s*<\s*stdlib\.h\s*>/.test(t) || /#include\s*<\s*string\.h\s*>/.test(t)) return 'c';
  if (/\bpublic\s+class\s+\w+/.test(t)) return 'java';
  if (/\bdef\s+\w+\s*\(/.test(t) || /^import\s+\w+/m.test(t) || /^from\s+\w+\s+import/m.test(t)) return 'python';
  if (/console\.log\s*\(/.test(t) || /\bfunction\s*\w*\s*\(/.test(t) || /=>\s*\{/.test(t) || /\b(const|let|var)\s+\w+\s*=/.test(t)) return 'javascript';
  return null;
}

interface RunResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  error?: string;
}

export function OnlineCompiler() {
  const [code, setCode] = useState(
    'print("Hello, World!")'
  );
  const [stdin, setStdin] = useState('');
  const [language, setLanguage] = useState<string>('python');
  const [output, setOutput] = useState<RunResult | null>(null);
  const [runError, setRunError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCodeChange = useCallback((value: string) => {
    setCode(value);
    const detected = detectLanguage(value);
    if (detected) setLanguage(detected);
  }, []);

  const handleRun = useCallback(async () => {
    setRunError(null);
    setOutput(null);
    setLoading(true);
    try {
      const result = await apiClient.post<RunResult>('/api/execute/run', {
        language,
        code,
        stdin: stdin || undefined,
      });
      setOutput(result);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to run code';
      setRunError(msg);
      setOutput({
        stdout: '',
        stderr: msg,
        exitCode: -1,
        error: msg,
      });
    } finally {
      setLoading(false);
    }
  }, [language, code, stdin]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2">
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Language
          </span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
          >
            {LANGUAGES.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
        <Button
          variant="primary"
          onClick={handleRun}
          loading={loading}
          disabled={loading}
          className="rounded-lg"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <Spinner />
              Running…
            </span>
          ) : (
            'Run Code'
          )}
        </Button>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Code
        </label>
        <textarea
          value={code}
          onChange={(e) => handleCodeChange(e.target.value)}
          placeholder="Enter your code..."
          rows={16}
          className="w-full rounded-xl border border-neutral-300 bg-neutral-50 p-4 font-mono text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100"
          spellCheck={false}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Standard input (optional)
        </label>
        <textarea
          value={stdin}
          onChange={(e) => setStdin(e.target.value)}
          placeholder="Input for your program (e.g. test data)"
          rows={4}
          className="w-full rounded-xl border border-neutral-300 bg-neutral-50 p-4 font-mono text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500 dark:border-neutral-600 dark:bg-neutral-900 dark:text-neutral-100"
          spellCheck={false}
        />
      </div>

      {runError && (
        <Alert variant="error" className="rounded-xl">
          {runError}
        </Alert>
      )}

      <div>
        <label className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Output
        </label>
        <div className="min-h-[120px] rounded-xl border border-neutral-200 bg-neutral-100 p-4 dark:border-neutral-700 dark:bg-neutral-800/50">
          {loading ? (
            <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
              <Spinner />
              <span>Running your code…</span>
            </div>
          ) : output ? (
            <div className="space-y-2 font-mono text-sm">
              {output.stdout && (
                <pre className="whitespace-pre-wrap break-words text-neutral-800 dark:text-neutral-200">
                  {output.stdout}
                </pre>
              )}
              {output.stderr && (
                <pre className="whitespace-pre-wrap break-words text-red-600 dark:text-red-400">
                  {output.stderr}
                </pre>
              )}
              {output.exitCode !== undefined && output.exitCode !== 0 && (
                <p className="text-neutral-500 dark:text-neutral-400">
                  Exit code: {output.exitCode}
                </p>
              )}
              {!output.stdout && !output.stderr && output.error && (
                <p className="text-red-600 dark:text-red-400">{output.error}</p>
              )}
              {!output.stdout && !output.stderr && !output.error && (
                <p className="text-neutral-500 dark:text-neutral-400">(No output)</p>
              )}
            </div>
          ) : (
            <p className="text-neutral-500 dark:text-neutral-400">
              Click &quot;Run Code&quot; to see output here.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
