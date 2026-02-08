import { useState, useCallback } from 'react';

interface CallMarker {
  timestamp: number;
  triggered: boolean;
}

const CALL_MARKER_KEY = 'seva_sangam_call_marker';
const CALL_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes - after this, marker is considered stale

export function usePostCallAlarm() {
  const [showAlarm, setShowAlarm] = useState(false);

  // Mark that a call has been initiated
  const markCallStarted = useCallback(() => {
    const marker: CallMarker = {
      timestamp: Date.now(),
      triggered: false,
    };
    sessionStorage.setItem(CALL_MARKER_KEY, JSON.stringify(marker));
  }, []);

  // Clear the call marker
  const clearCallMarker = useCallback(() => {
    sessionStorage.removeItem(CALL_MARKER_KEY);
    setShowAlarm(false);
  }, []);

  // Check if we should show the alarm (can be called explicitly)
  const checkAndTriggerAlarm = useCallback(() => {
    const markerStr = sessionStorage.getItem(CALL_MARKER_KEY);
    if (!markerStr) return;

    try {
      const marker: CallMarker = JSON.parse(markerStr);
      
      // Check if marker is stale
      if (Date.now() - marker.timestamp > CALL_TIMEOUT_MS) {
        sessionStorage.removeItem(CALL_MARKER_KEY);
        return;
      }

      // If not yet triggered, show the alarm
      if (!marker.triggered) {
        marker.triggered = true;
        sessionStorage.setItem(CALL_MARKER_KEY, JSON.stringify(marker));
        setShowAlarm(true);
      }
    } catch (error) {
      console.error('Error parsing call marker:', error);
      sessionStorage.removeItem(CALL_MARKER_KEY);
    }
  }, []);

  return {
    showAlarm,
    markCallStarted,
    clearCallMarker,
    checkAndTriggerAlarm,
  };
}
