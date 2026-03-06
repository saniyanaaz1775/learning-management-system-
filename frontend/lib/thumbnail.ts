/**
 * Get YouTube thumbnail URL from a video URL.
 * Supports: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID
 * Returns maxresdefault.jpg for best quality; falls back to hqdefault if needed (caller can use as-is).
 */
export function getYouTubeThumbnailFromUrl(videoUrl: string | null | undefined): string | null {
  if (!videoUrl || typeof videoUrl !== 'string') return null;
  const trimmed = videoUrl.trim();
  if (!trimmed) return null;

  let videoId: string | null = null;

  // https://www.youtube.com/watch?v=VIDEO_ID
  const watchMatch = trimmed.match(/(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/);
  if (watchMatch) videoId = watchMatch[1];

  // https://youtu.be/VIDEO_ID
  if (!videoId) {
    const shortMatch = trimmed.match(/(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (shortMatch) videoId = shortMatch[1];
  }

  // https://www.youtube.com/embed/VIDEO_ID
  if (!videoId) {
    const embedMatch = trimmed.match(/(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    if (embedMatch) videoId = embedMatch[1];
  }

  if (!videoId) return null;
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

/**
 * Resolve the thumbnail URL for a course card:
 * - If videoUrl is YouTube → use YouTube thumbnail (maxresdefault).
 * - If not YouTube but manual thumbnail URL is provided → use it.
 * - Otherwise return null (caller shows neutral placeholder).
 */
export function getCourseCardThumbnail(
  videoUrl: string | null | undefined,
  manualThumbnail: string | null | undefined
): string | null {
  const fromYouTube = getYouTubeThumbnailFromUrl(videoUrl);
  if (fromYouTube) return fromYouTube;
  if (manualThumbnail && typeof manualThumbnail === 'string' && manualThumbnail.trim())
    return manualThumbnail.trim();
  return null;
}
