/**
 * CodeHelperBot: uses Google Gemini API (free tier) to explain errors and give hints.
 * API key is read from process.env.GEMINI_API_KEY; no key is exposed to the client.
 */

// v1beta + gemini-2.0-flash works with free keys from https://aistudio.google.com/apikey
const GEMINI_BASE = process.env.GEMINI_API_URL ?? 'https://generativelanguage.googleapis.com/v1beta';
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? 'gemini-2.0-flash';
const MAX_QUESTION_LENGTH = 2000;
const MAX_CODE_LENGTH = 8000;
const MAX_ERROR_LENGTH = 2000;

function getGeminiKey(): string {
  const key = process.env.GEMINI_API_KEY ?? '';
  if (!key.trim()) {
    throw new Error(
      'GEMINI_API_KEY is not set. Add GEMINI_API_KEY=your-key to backend .env (get a free key at https://aistudio.google.com/apikey).'
    );
  }
  return key.trim();
}

export interface ChatInput {
  code: string;
  language: string;
  errorOutput: string;
  question: string;
}

export interface ChatResult {
  reply: string;
}

const SYSTEM_PROMPT = `You are CodeHelperBot, a friendly coding tutor for students. You will receive:
1. The student's code
2. The programming language
3. Any error message or program output (stdout/stderr)
4. The student's question

Guidelines:
- Explain errors in simple, student-friendly language. Avoid jargon unless you define it.
- Give hints and guide the student to find the fix themselves first. Do not immediately dump the full solution unless they ask for "full code", "corrected code", or "solution".
- If they ask for the corrected code or full solution, then provide it clearly (e.g. in a code block).
- Keep responses concise and focused. Use short paragraphs or bullet points when helpful.
- If there is no error/output provided, you can still help with general questions about their code or the language.`;

function buildUserMessage(input: ChatInput): string {
  const parts: string[] = [];
  parts.push(`Language: ${input.language}`);
  parts.push('');
  parts.push('Code:');
  parts.push('```');
  parts.push(input.code.slice(0, MAX_CODE_LENGTH));
  if (input.code.length > MAX_CODE_LENGTH) parts.push('...(truncated)');
  parts.push('```');
  if (input.errorOutput.trim()) {
    parts.push('');
    parts.push('Error / output:');
    parts.push(input.errorOutput.slice(0, MAX_ERROR_LENGTH));
    if (input.errorOutput.length > MAX_ERROR_LENGTH) parts.push('...(truncated)');
  }
  parts.push('');
  parts.push('Student question: ' + input.question.slice(0, MAX_QUESTION_LENGTH));
  return parts.join('\n');
}

export async function getBotReply(input: ChatInput): Promise<ChatResult> {
  const apiKey = getGeminiKey();
  const userMessage = buildUserMessage(input);
  const fullPrompt = `${SYSTEM_PROMPT}\n\n---\n\n${userMessage}`;

  const url = `${GEMINI_BASE}/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: {
          maxOutputTokens: 1024,
          temperature: 0.5,
        },
      }),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Network error';
    throw new Error(`Gemini API request failed: ${msg}`);
  }

  const errBody = await res.text();
  if (!res.ok) {
    if (res.status === 400) {
      throw new Error(`Gemini API error: Invalid request. ${errBody.slice(0, 150)}`);
    }
    if (res.status === 401 || res.status === 403) {
      throw new Error('Gemini API key is invalid or unauthorized. Check GEMINI_API_KEY in .env.');
    }
    if (res.status === 429) {
      throw new Error('Gemini rate limit exceeded. Please try again in a moment.');
    }
    throw new Error(`Gemini API error: ${res.status} ${errBody.slice(0, 200)}`);
  }

  let data: { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  try {
    data = JSON.parse(errBody);
  } catch {
    throw new Error('Invalid response from Gemini API.');
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!text) {
    throw new Error('Gemini returned no text. Try rephrasing your question.');
  }
  return { reply: text };
}
