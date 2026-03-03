const pending = new Map<string, { last_position_seconds: number; is_completed?: boolean; timer: ReturnType<typeof setTimeout> }>();
const DEFAULT_INTERVAL_MS = 15000;

export function sendProgress(
  videoId: string,
  payload: { last_position_seconds: number; is_completed?: boolean },
  post: (videoId: string, body: { last_position_seconds: number; is_completed?: boolean }) => Promise<void>,
  intervalMs: number = DEFAULT_INTERVAL_MS
): void {
  const key = videoId;
  const existing = pending.get(key);
  if (existing) clearTimeout(existing.timer);
  if (payload.is_completed === true) {
    pending.delete(key);
    post(videoId, payload);
    return;
  }
  const timer = setTimeout(() => {
    pending.delete(key);
    post(videoId, { last_position_seconds: payload.last_position_seconds });
  }, intervalMs);
  pending.set(key, { last_position_seconds: payload.last_position_seconds, is_completed: payload.is_completed, timer });
}

export function flushProgress(
  videoId: string,
  post: (videoId: string, body: { last_position_seconds: number; is_completed?: boolean }) => Promise<void>
): void {
  const existing = pending.get(videoId);
  if (existing) {
    clearTimeout(existing.timer);
    pending.delete(videoId);
    post(videoId, { last_position_seconds: existing.last_position_seconds, is_completed: existing.is_completed });
  }
}
