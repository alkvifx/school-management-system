'use client';

import { useEffect } from 'react';

/**
 * Registers the PWA service worker. Update prompts are shown via PwaUpdateBanner
 * (no confirm dialog). Push notification messages are forwarded to the app.
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        // Check for updates periodically so new deployments are picked up
        setInterval(() => reg.update(), 60 * 1000);
      })
      .catch((err) => {
        console.error('Service Worker registration failed:', err);
      });

    // When a new controller takes over (after skipWaiting), reload to use new assets
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });

    // Forward push / notification events from SW to the app
    navigator.serviceWorker.addEventListener('message', (event) => {
      const data = event?.data;
      if (data?.type === 'NOTIFICATION_CLICK' && data?.url) {
        window.location.href = data.url;
      }
    });
  }, []);

  return null;
}
