import { useState, useEffect, useCallback } from 'react';

interface DeviceMotionEventWithPermission extends DeviceMotionEvent {
  requestPermission?: () => Promise<'granted' | 'denied'>;
}

interface DeviceMotionData {
  acceleration: {
    x: number | null;
    y: number | null;
    z: number | null;
  } | null;
  accelerationIncludingGravity: {
    x: number | null;
    y: number | null;
    z: number | null;
  } | null;
  rotationRate: {
    alpha: number | null;
    beta: number | null;
    gamma: number | null;
  } | null;
  interval: number | null;
}

export function useDeviceMotion() {
  const [motionData, setMotionData] = useState<DeviceMotionData>({
    acceleration: null,
    accelerationIncludingGravity: null,
    rotationRate: null,
    interval: null
  });
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');

  // Check if DeviceMotionEvent is supported
  useEffect(() => {
    setIsSupported(typeof DeviceMotionEvent !== 'undefined');
  }, []);

  // Handle device motion events
  const handleDeviceMotion = useCallback((event: DeviceMotionEvent) => {
    setMotionData({
      acceleration: event.acceleration,
      accelerationIncludingGravity: event.accelerationIncludingGravity,
      rotationRate: event.rotationRate,
      interval: event.interval
    });
  }, []);

  // Request permission for device motion (iOS 13+)
  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      console.warn('DeviceMotionEvent is not supported');
      return 'denied';
    }

    try {
      // Check if permission is required (iOS 13+)
      const DeviceMotionEventConstructor = DeviceMotionEvent as unknown as DeviceMotionEventWithPermission & {
        requestPermission?: () => Promise<'granted' | 'denied'>;
      };
      
      if (typeof DeviceMotionEventConstructor.requestPermission === 'function') {
        const permissionState = await DeviceMotionEventConstructor.requestPermission();
        setPermission(permissionState);
        
        if (permissionState === 'granted') {
          window.addEventListener('devicemotion', handleDeviceMotion);
        }
        
        return permissionState;
      } else {
        // Permission not required (Android, older iOS)
        setPermission('granted');
        window.addEventListener('devicemotion', handleDeviceMotion);
        return 'granted';
      }
    } catch (error) {
      console.error('Error requesting device motion permission:', error);
      setPermission('denied');
      return 'denied';
    }
  }, [isSupported, handleDeviceMotion]);

  // Start listening when permission is granted
  useEffect(() => {
    if (permission === 'granted' && isSupported) {
      window.addEventListener('devicemotion', handleDeviceMotion);
      
      return () => {
        window.removeEventListener('devicemotion', handleDeviceMotion);
      };
    }
  }, [permission, isSupported, handleDeviceMotion]);

  return {
    ...motionData,
    isSupported,
    permission,
    requestPermission
  };
}
