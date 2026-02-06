'use client';

import { useOnlineStatus } from '@/src/hooks/useOnlineStatus';
import { WifiOff, Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Shows "You are offline" when offline and optional "Back online" when reconnected.
 */
export function OfflineBanner() {
  const { isOnline, wasOffline } = useOnlineStatus();

  if (isOnline && !wasOffline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'fixed top-0 left-0 right-0 z-[99]',
        'pt-[env(safe-area-inset-top)]',
        isOnline
          ? 'bg-emerald-600 text-white'
          : 'bg-amber-600 text-white'
      )}
    >
      <div className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium">
        {isOnline ? (
          <>
            <Wifi className="h-4 w-4" />
            Back online
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4" />
            You are offline. Some features may be limited.
          </>
        )}
      </div>
    </div>
  );
}
