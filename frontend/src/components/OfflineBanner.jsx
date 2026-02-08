'use client';

import { useOnlineStatus } from '@/src/hooks/useOnlineStatus';
import { WifiOff, Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';

export function OfflineBanner() {
  const { isOnline, wasOffline } = useOnlineStatus();

  if (!isOnline && wasOffline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'fixed top-0 left-0 right-0 z-[100]',
        'pt-[env(safe-area-inset-top)]',
        isOnline ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
      )}
      style={{
        height: '44px',
        // 👇 global CSS variable so layout can read this
        ['--top-banner-h']: '44px',
      }}
    >
      <div className="flex h-full items-center justify-center gap-2 px-4 text-sm font-medium">
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
