'use client';

import { useState, useEffect } from 'react';

/**
 * Tracks online/offline status and reconnection for PWA.
 * Use for offline banner and retry logic.
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      setIsOnline(true);
      setWasOffline(true);
    };

    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-hide "Back online" after 3s
  useEffect(() => {
    if (!wasOffline || !isOnline) return;
    const t = setTimeout(() => setWasOffline(false), 3000);
    return () => clearTimeout(t);
  }, [wasOffline, isOnline]);

  return { isOnline, wasOffline };
}
