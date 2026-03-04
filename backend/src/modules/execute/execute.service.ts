/**
 * Code execution via Judge0 CE API (https://ce.judge0.com).
 * No code runs on our server; we only proxy to Judge0.
 * Submit -> poll until done -> return stdout, stderr, compile_output.
 */

const JUDGE0_BASE = process.env.JUDGE0_BASE_URL ?? 'https://ce.judge0.com';
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY ?? '';
const POLL_INTERVAL_MS = 500;
const POLL_MAX_WAIT_MS = 30_000;

/** Judge0 language IDs for our supported languages. */
export const JUDGE0_LANGUAGE_IDS: Record<string, number> = {
  python: 71,      // Python (3.8.1)
  c: 50,           // C (GCC 9.2.0)
  cpp: 54,         // C++ (GCC 9.2.0)
  java: 62,        // Java (OpenJDK 13.0.1)
  javascript: 63,  // JavaScript (Node.js 12.14.0)
};

export interface ExecuteInput {
  language: string;
  code: string;
  stdin: string;
}

export interface ExecuteResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  error?: string;
}

interface Judge0SubmissionResponse {
  token?: string;
  error?: string;
}

interface Judge0Status {
  id: number;
  description?: string;
}

interface Judge0ResultResponse {
  status: Judge0Status;
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  message: string | null;
  exit_code: number | null;
}

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (JUDGE0_API_KEY) {
    headers['X-Auth-Token'] = JUDGE0_API_KEY;
  }
  return headers;
}

/**
 * For Java only: ensure code has a public class Main so it compiles as Main.java.
 * - If there is a "public class Something", replace it with "public class Main".
 * - If there is no public class at all, wrap the code in "public class Main { ... }".
 */
function transformJavaCode(code: string): string {
  if (/\bpublic\s+class\s+\w+/.test(code)) {
    return code.replace(/\bpublic\s+class\s+\w+/, 'public class Main');
  }
  return `public class Main {\n${code}\n}`;
}

export async function executeCode(input: ExecuteInput): Promise<ExecuteResult> {
  let { language, code, stdin } = input;

  if (language === 'java') {
    code = transformJavaCode(code);
  }

  const languageId = JUDGE0_LANGUAGE_IDS[language];
  if (languageId == null) {
    throw new Error(`Unsupported language: ${language}`);
  }

  const submitUrl = `${JUDGE0_BASE}/submissions?base64_encoded=false&wait=false`;
  const submitRes = await fetch(submitUrl, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      source_code: code,
      language_id: languageId,
      stdin: stdin || '',
    }),
  });

  if (!submitRes.ok) {
    const text = await submitRes.text();
    if (submitRes.status === 401) {
      throw new Error('Judge0 API requires authentication. Set JUDGE0_API_KEY in backend .env.');
    }
    throw new Error(`Judge0 submit error: ${submitRes.status} ${text.slice(0, 200)}`);
  }

  const submitData = (await submitRes.json()) as Judge0SubmissionResponse;
  const token = submitData.token;
  if (!token) {
    throw new Error(submitData.error ?? 'No submission token received');
  }

  const getUrl = `${JUDGE0_BASE}/submissions/${token}?base64_encoded=false`;
  const start = Date.now();

  while (Date.now() - start < POLL_MAX_WAIT_MS) {
    const getRes = await fetch(getUrl, { method: 'GET', headers: getHeaders() });
    if (!getRes.ok) {
      const text = await getRes.text();
      throw new Error(`Judge0 get result error: ${getRes.status} ${text.slice(0, 200)}`);
    }

    const result = (await getRes.json()) as Judge0ResultResponse;
    const statusId = result.status?.id ?? 0;

    if (statusId !== 1 && statusId !== 2) {
      const stdout = result.stdout ?? '';
      const stderr = result.stderr ?? '';
      const compileOutput = result.compile_output ?? '';
      const combinedStderr = compileOutput
        ? (compileOutput + (stderr ? '\n' + stderr : '')).trim()
        : stderr;
      const exitCode = result.exit_code ?? (statusId === 3 ? 0 : -1);
      const message = result.message ?? '';

      return {
        stdout,
        stderr: combinedStderr || message,
        exitCode,
        ...(message && statusId !== 3 ? { error: result.status?.description ?? message } : {}),
      };
    }

    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }

  throw new Error('Execution timed out');
}
