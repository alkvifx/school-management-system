'use client';

import { useEffect, useRef, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOnlineStatus } from '@/src/hooks/useOnlineStatus';

export function OfflineBanner() {
  const { isOnline, wasOffline } = useOnlineStatus();

  const [showBackOnline, setShowBackOnline] = useState(false);
  const timerRef = useRef(null);

  // Trigger "Back online" for 3s after reconnect
  useEffect(() => {
    if (isOnline && wasOffline) {
      setShowBackOnline(true);

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setShowBackOnline(false);
        timerRef.current = null;
      }, 3000);
    }

    // If user goes offline again, kill back-online banner
    if (!isOnline) {
      if (timerRef.current) clearTimeout(timerRef.current);
      setShowBackOnline(false);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isOnline, wasOffline]);

  const showOffline = !isOnline;
  const showBack = isOnline && showBackOnline;
  const isVisible = showOffline || showBack;

  if (!isVisible) return null;

  const Icon = showOffline ? WifiOff : Wifi;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'fixed inset-x-0 top-0 z-[100] flex justify-center pointer-events-none'
      )}
      style={{
        height: 'var(--app-top-banner-height, 44px)',
      }}
    >
      <div
        className={cn(
          'pointer-events-auto mt-[env(safe-area-inset-top)]',
          'inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2',
          'rounded-b-2xl shadow-sm',
          'text-xs sm:text-sm font-medium',
          showOffline ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white',
          'transition-transform transition-opacity duration-200 ease-out',
          'motion-reduce:transition-none motion-reduce:transform-none'
        )}
      >
        <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
        <span className="truncate">
          {showOffline
            ? 'You are offline. Some features may be limited.'
            : 'Back online.'}
        </span>
      </div>
    </div>
  );
}
