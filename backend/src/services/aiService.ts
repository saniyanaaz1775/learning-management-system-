/**
 * Hugging Face Inference API service for the AI learning assistant.
 * Uses the Router OpenAI-compatible chat completions API (router.huggingface.co/v1/chat/completions).
 * All requests use the backend API key; never exposed to the frontend.
 * Works in development and production (e.g. Render).
 */

const HUGGINGFACE_CHAT_URL = 'https://router.huggingface.co/v1/chat/completions';

/** Try these in order; :fastest picks best available provider. */
const MODEL_IDS = [
  'meta-llama/Llama-3.1-8B-Instruct:fastest',
  'HuggingFaceH4/zephyr-7b-beta:fastest',
  'mistralai/Mistral-7B-Instruct-v0.2:fastest',
  'google/gemma-2-9b-it:fastest',
];

const SYSTEM_PROMPT =
  'You are a helpful learning assistant for SkillSphere LMS. Answer student questions about courses, coding, and concepts clearly and concisely.';

export interface AskAIInput {
  question: string;
  course?: string;
  lesson?: string;
  code?: string;
}

export interface AskAIResult {
  answer: string;
}

function getAuthHeader(apiKey: string): string {
  const key = (apiKey || '').trim();
  if (!key) throw new Error('HUGGINGFACE_API_KEY is not set');
  return `Bearer ${key}`;
}

/**
 * Build the user message content, including optional context.
 */
function buildUserContent(input: AskAIInput): string {
  const parts: string[] = [];
  if (input.course) {
    parts.push(`Context: The student is learning in the course "${input.course}".`);
  }
  if (input.lesson) {
    parts.push(`Current lesson: "${input.lesson}".`);
  }
  if (input.code) {
    parts.push(`Relevant code snippet:\n\`\`\`\n${input.code}\n\`\`\``);
  }
  parts.push(`Student question: ${input.question}`);
  return parts.join('\n\n');
}

/**
 * Extract reply text from OpenAI-style chat completions response.
 * Response: { choices: [ { message: { content: "..." } } ] }
 */
function extractContent(data: unknown): string {
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    const choices = obj.choices;
    if (Array.isArray(choices) && choices.length > 0) {
      const first = choices[0] as Record<string, unknown>;
      const message = first.message as { content?: string } | undefined;
      if (message && typeof message.content === 'string' && message.content.trim()) {
        return message.content.trim();
      }
    }
  }
  return '';
}

/**
 * Try one model; returns content or throws.
 */
async function chatWithModel(
  modelId: string,
  messages: { role: 'system' | 'user'; content: string }[],
  authHeader: string
): Promise<string> {
  const res = await fetch(HUGGINGFACE_CHAT_URL, {
    method: 'POST',
    headers: {
      Authorization: authHeader,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: modelId,
      messages,
      max_tokens: 1024,
    }),
  });

  if (res.status === 429) {
    throw new Error('AI assistant is temporarily busy (rate limit). Please try again in a moment.');
  }
  if (res.status === 503) {
    throw new Error('AI model is loading. Please try again in a few seconds.');
  }
  if (!res.ok) {
    const text = await res.text();
    console.error('[AI] Hugging Face API error:', res.status, modelId, text.slice(0, 500));
    let message = 'AI assistant is temporarily unavailable. Please try again later.';
    try {
      const json = JSON.parse(text) as { error?: string; message?: string };
      const err = json.error ?? json.message;
      if (typeof err === 'string' && err.length > 0) message = err;
    } catch {
      // use default
    }
    throw new Error(message);
  }

  const data = (await res.json()) as unknown;
  const content = extractContent(data);
  if (!content) {
    console.error('[AI] Unexpected response shape:', JSON.stringify(data).slice(0, 500));
    throw new Error('AI assistant did not return a response. Please try again.');
  }
  return content;
}

/**
 * Call Hugging Face Router chat completions API; tries multiple models until one succeeds.
 */
export async function askAI(input: AskAIInput, apiKey: string): Promise<AskAIResult> {
  const userContent = buildUserContent(input);
  const authHeader = getAuthHeader(apiKey);
  const messages = [
    { role: 'system' as const, content: SYSTEM_PROMPT },
    { role: 'user' as const, content: userContent },
  ];

  let lastError: Error | null = null;
  for (const modelId of MODEL_IDS) {
    try {
      const content = await chatWithModel(modelId, messages, authHeader);
      return { answer: content };
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
      // Retry with next model on model-specific or server errors (not auth/rate limit)
      if (lastError.message.includes('rate limit') || lastError.message.includes('not configured')) {
        throw lastError;
      }
    }
  }
  throw lastError ?? new Error('AI assistant is temporarily unavailable. Please try again later.');
}
