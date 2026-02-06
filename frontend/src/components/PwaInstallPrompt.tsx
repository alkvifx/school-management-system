/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePwaInstall } from '@/src/hooks/usePwaInstall';

export type PwaInstallPromptProps = {
  delayMs?: number;
  debug?: boolean;
};

export default function PwaInstallPrompt({
  delayMs = 2500,
  debug = true,
}: PwaInstallPromptProps) {
  const {
    bipEvent,
    isInstalled,
    isIos,
    isStandalone,
    iosSafariNeedsManualSteps,
    isInstallable,
    hasUserGesture,
    hasDismissed,
    swStatus,
    envInfo,
    blockedReason,
    isPrompting,
    promptInstall,
    dismissPopup,
  } = usePwaInstall();

  const [visible, setVisible] = useState(false);
  const showTimerRef = useRef<number | null>(null);

  // Decide when to show (2-3 seconds after landing).
  useEffect(() => {
    const canShow =
      !isInstalled &&
      !hasDismissed &&
      (iosSafariNeedsManualSteps || bipEvent !== null) &&
      hasUserGesture;

    if (!canShow) {
      setVisible(false);
      if (showTimerRef.current) window.clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
      return;
    }

    if (visible) return;
    if (showTimerRef.current) return;

    showTimerRef.current = window.setTimeout(() => {
      setVisible(true);
      showTimerRef.current = null;
    }, delayMs);

    return () => {
      if (showTimerRef.current) window.clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    };
  }, [bipEvent, delayMs, hasDismissed, iosSafariNeedsManualSteps, isInstalled, hasUserGesture, visible]);

  const shouldRenderPrompt =
    visible &&
    !isInstalled &&
    !hasDismissed &&
    (iosSafariNeedsManualSteps || bipEvent);

  if (!debug && !shouldRenderPrompt) return null;

  return (
    <>
      {debug && (
        <div className="fixed bottom-4 left-4 z-50 max-w-xs rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 shadow-lg">
          <div className="font-semibold">PWA Debug</div>
          <div className="mt-1 space-y-1">
            <div>isInstallable: {String(isInstallable)}</div>
            <div>isIOS: {String(isIos)}</div>
            <div>isStandalone: {String(isStandalone)}</div>
            <div>blockedReason: {blockedReason ?? 'none'}</div>
            <div>hasBeforeInstallPrompt: {String(bipEvent !== null)}</div>
            <div>hasUserGesture: {String(hasUserGesture)}</div>
            <div>hasDismissed: {String(hasDismissed)}</div>
            <div>isInstalled: {String(isInstalled)}</div>
            <div>swStatus: {swStatus}</div>
            <div>secureContext: {String(envInfo.isSecureContext)}</div>
            <div>manifestLink: {envInfo.hasManifestLink ? 'yes' : 'no'}</div>
          </div>
        </div>
      )}

      {shouldRenderPrompt && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label="Install app"
        >
          {/* Backdrop */}
          <button
            type="button"
            onClick={() => {
              setVisible(false);
              dismissPopup();
            }}
            aria-label="Dismiss install prompt"
            className="absolute inset-0 bg-black/40"
          />

          {/* Modal */}
          <div className="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white p-4 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                <span className="text-lg font-bold">P</span>
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900">
                  Install this app
                </p>
                {iosSafariNeedsManualSteps ? (
                  <p className="mt-1 text-sm text-gray-600">
                    On iPhone/iPad, tap{' '}
                    <span className="font-semibold">Share</span> then{' '}
                    <span className="font-semibold">Add to Home Screen</span>.
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-gray-600">
                    Get a faster, full-screen experience and quick access from
                    your home screen.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              setVisible(false);
              dismissPopup();
            }}
            className="inline-flex h-9 items-center justify-center rounded-lg px-3 text-sm font-semibold text-gray-700 hover:bg-gray-100"
          >
            Not now
          </button>

          {!iosSafariNeedsManualSteps && (
            <button
              type="button"
              onClick={promptInstall}
              disabled={isPrompting}
              className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              Install App
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
