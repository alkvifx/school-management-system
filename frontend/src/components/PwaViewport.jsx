'use client';

import { useEffect } from 'react';
import { useIsPWA } from '@/src/hooks/useIsPWA';

/**
 * When running as PWA: prevent pull-to-refresh, disable zoom, enable safe-area.
 * Applies body class and viewport meta so iOS/Android treat the app as native-like.
 */
export function PwaViewport() {
  const isPWA = useIsPWA();

  useEffect(() => {
    if (!isPWA || typeof document === 'undefined') return;

    const body = document.body;
    const html = document.documentElement;

    // Prevent pull-to-refresh (overscroll) and improve touch behavior
    body.style.overscrollBehaviorY = 'none';
    body.style.touchAction = 'pan-y';
    html.classList.add('pwa-active');

    // Viewport: disable zoom for app-like feel, viewport-fit=cover for notch/safe-area
    let meta = document.querySelector('meta[name="viewport"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'viewport';
      document.head.appendChild(meta);
    }
    const previousContent = meta.getAttribute('content') || '';
    meta.setAttribute(
      'content',
      [
        'width=device-width',
        'initial-scale=1',
        'maximum-scale=1',
        'user-scalable=no',
        'viewport-fit=cover',
      ].join(', ')
    );

    return () => {
      body.style.overscrollBehaviorY = '';
      body.style.touchAction = '';
      html.classList.remove('pwa-active');
      if (previousContent) meta.setAttribute('content', previousContent);
    };
  }, [isPWA]);

  return null;
}
