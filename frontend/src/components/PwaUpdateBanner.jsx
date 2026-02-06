'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Shows when a new service worker is waiting (new app version).
 * User can refresh to get the update or dismiss (will show again on next load).
 */
export function PwaUpdateBanner() {
  const [show, setShow] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    navigator.serviceWorker.ready.then((registration) => {
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setWaitingWorker(newWorker);
            setShow(true);
          }
        });
      });
    });

    // Check if there's already a waiting worker
    navigator.serviceWorker.getRegistration().then((reg) => {
      if (reg?.waiting) {
        setWaitingWorker(reg.waiting);
        setShow(true);
      }
    });
  }, []);

  const handleRefresh = () => {
    setShow(false);
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
    // Reload to use new assets (SW may already have called skipWaiting)
    window.location.reload();
  };

  const handleDismiss = () => {
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      role="alert"
      className={cn(
        'fixed top-0 left-0 right-0 z-[100]',
        'pt-[env(safe-area-inset-top)]',
        'bg-blue-600 text-white shadow-lg'
      )}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3 max-w-lg mx-auto">
        <p className="text-sm font-medium flex-1 min-w-0">
          New update available. Refresh to get the latest version.
        </p>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={handleRefresh}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white/20 hover:bg-white/30 px-3 py-2 text-sm font-medium transition-colors touch-manipulation"
            aria-label="Refresh to update"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="p-2 rounded-lg hover:bg-white/20 transition-colors touch-manipulation"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
