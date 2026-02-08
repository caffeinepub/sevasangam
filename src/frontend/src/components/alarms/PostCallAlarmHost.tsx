import { useEffect } from 'react';
import { usePostCallAlarm } from '../../hooks/usePostCallAlarm';
import PostCallAlarmModal from './PostCallAlarmModal';

export default function PostCallAlarmHost() {
  const { showAlarm, clearCallMarker, checkAndTriggerAlarm } = usePostCallAlarm();

  // Check for alarm on mount (dashboard navigation)
  useEffect(() => {
    checkAndTriggerAlarm();
  }, [checkAndTriggerAlarm]);

  return (
    <PostCallAlarmModal
      open={showAlarm}
      onDismiss={clearCallMarker}
    />
  );
}
