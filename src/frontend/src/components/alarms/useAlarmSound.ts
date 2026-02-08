import { useEffect, useRef } from 'react';

const ALARM_SOUND_URL = '/assets/service-call-ring.mp3';
const ALARM_DURATION_MS = 2500; // 2.5 seconds

export function useAlarmSound(shouldPlay: boolean) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!shouldPlay) return;

    // Create audio element
    const audio = new Audio(ALARM_SOUND_URL);
    audioRef.current = audio;

    // Attempt to play
    const playPromise = audio.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          // Audio started playing successfully
          // Stop after duration
          timeoutRef.current = setTimeout(() => {
            audio.pause();
            audio.currentTime = 0;
          }, ALARM_DURATION_MS);
        })
        .catch((error) => {
          // Autoplay was prevented
          console.warn('Alarm sound autoplay prevented:', error);
        });
    }

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [shouldPlay]);
}
