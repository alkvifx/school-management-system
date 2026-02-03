'use client';

import { useState, useEffect } from 'react';

/**
 * Detects if the app is running as an installed PWA (standalone mode).
 * Uses:
 * - window.matchMedia('(display-mode: standalone)') for standard PWA
 * - navigator.standalone for iOS Safari (add to home screen)
 * - display-mode: fullscreen/minimal-ui as fallbacks for some browsers
 * @returns {boolean} true when running as installed PWA
 */
export function useIsPWA() {
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkPWA = () => {
      // Standard: standalone display mode (Chrome, Edge, Android)
      const standalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        // iOS Safari: add to home screen
        !!window.navigator.standalone ||
        // Some browsers use fullscreen or minimal-ui when launched from home screen
        window.matchMedia('(display-mode: fullscreen)').matches ||
        window.matchMedia('(display-mode: minimal-ui)').matches;

      setIsPWA(!!standalone);
    };

    checkPWA();

    // Listen for display-mode changes (e.g. user switches to browser from PWA)
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handler = () => checkPWA();
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return isPWA;
}
