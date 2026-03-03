'use client';

import { useEffect, useRef, useCallback } from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';

interface VideoPlayerProps {
  videoId: string;
  startPositionSeconds: number;
  onProgress: (currentTime: number) => void;
  onCompleted: () => void;
}

export function VideoPlayer({
  videoId,
  startPositionSeconds,
  onProgress,
  onCompleted,
}: VideoPlayerProps) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearIntervalRef = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearIntervalRef();
  }, [clearIntervalRef]);

  const onPlayerReady: YouTubeProps['onReady'] = (event) => {
    const player = event.target;
    if (startPositionSeconds > 0) {
      player.seekTo(startPositionSeconds, true);
    }
  };

  const onPlayerStateChange: YouTubeProps['onStateChange'] = (event) => {
    const player = event.target;
    const state = event.data;
    if (state === 1) {
      clearIntervalRef();
      intervalRef.current = setInterval(() => {
        const t = player.getCurrentTime();
        if (typeof t === 'number') onProgress(t);
      }, 5000);
    } else if (state === 2 || state === 0) {
      clearIntervalRef();
      if (state === 0) {
        onCompleted();
      } else {
        const t = player.getCurrentTime();
        if (typeof t === 'number') onProgress(t);
      }
    }
  };

  const opts: YouTubeProps['opts'] = {
    width: '100%',
    height: '100%',
    playerVars: {
      start: Math.round(startPositionSeconds),
      autoplay: 0,
    },
  };

  return (
    <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
      <YouTube
        videoId={videoId}
        opts={opts}
        onReady={onPlayerReady}
        onStateChange={onPlayerStateChange}
        className="w-full h-full [&>div]:w-full [&>div]:h-full [&>iframe]:w-full [&>iframe]:h-full"
      />
    </div>
  );
}
