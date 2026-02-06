/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

// Chrome/Edge/Android expose this event (not in standard TS libs).
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

type SwStatus = 'checking' | 'registered' | 'not-registered' | 'unsupported' | 'error';

type PwaInstallContextValue = {
  bipEvent: BeforeInstallPromptEvent | null;
  isInstalled: boolean;
  isIos: boolean;
  isSafari: boolean;
  isStandalone: boolean;
  iosSafariNeedsManualSteps: boolean;
  supportsPrompt: boolean;
  isInstallable: boolean;
  hasUserGesture: boolean;
  hasDismissed: boolean;
  swStatus: SwStatus;
  isPrompting: boolean;
  lastChoice: { outcome: 'accepted' | 'dismissed'; platform: string } | null;
  envInfo: {
    isSecureContext: boolean;
    hasManifestLink: boolean;
    manifestHref: string;
  };
  blockedReason: string | null;
  promptInstall: () => Promise<{ outcome: 'accepted' | 'dismissed' | 'no-event' | 'ios' }>;
  dismissPopup: () => void;
  iosGuideOpen: boolean;
  openIosGuide: () => void;
  closeIosGuide: () => void;
};

const DISMISS_TTL_MS = 1000 * 60 * 60 * 24 * 7;
const STORAGE_KEY = 'pwa_install_prompt_dismissed_v2';
const LEGACY_STORAGE_KEY = 'pwa_install_prompt_dismissed_v1';

function detectIos(): boolean {
  if (typeof window === 'undefined') return false;
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function detectStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  if ((window.navigator as any).standalone) return true;
  return window.matchMedia?.('(display-mode: standalone)').matches ?? false;
}

function detectSafari(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent;
  return /safari/i.test(ua) && !/crios|fxios|edgios|opr\//i.test(ua);
}

const PwaInstallContext = createContext<PwaInstallContextValue | null>(null);

export function PwaInstallProvider({ children }: { children: React.ReactNode }) {
  const [bipEvent, setBipEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [hasUserGesture, setHasUserGesture] = useState(false);
  const [hasDismissed, setHasDismissed] = useState(false);
  const [swStatus, setSwStatus] = useState<SwStatus>('checking');
  const [isPrompting, setIsPrompting] = useState(false);
  const [lastChoice, setLastChoice] = useState<{ outcome: 'accepted' | 'dismissed'; platform: string } | null>(null);
  const [iosGuideOpen, setIosGuideOpen] = useState(false);

  const didInitRef = useRef(false);

  const isIos = useMemo(() => detectIos(), []);
  const isStandalone = useMemo(() => detectStandalone(), []);
  const isSafari = useMemo(() => detectSafari(), []);

  const iosSafariNeedsManualSteps = useMemo(() => {
    return isIos && isSafari && !isStandalone;
  }, [isIos, isSafari, isStandalone]);

  const envInfo = useMemo(() => {
    if (typeof window === 'undefined') {
      return { isSecureContext: false, hasManifestLink: false, manifestHref: '' };
    }
    const manifestLink = document.querySelector('link[rel="manifest"]');
    const hostname = window.location.hostname;
    const isSecure = window.isSecureContext || hostname === 'localhost' || hostname === '127.0.0.1';
    return {
      isSecureContext: isSecure,
      hasManifestLink: !!manifestLink,
      manifestHref: manifestLink?.getAttribute('href') || '',
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (didInitRef.current) return;
    didInitRef.current = true;

    try {
      if (LEGACY_STORAGE_KEY !== STORAGE_KEY) {
        window.localStorage.removeItem(LEGACY_STORAGE_KEY);
      }
    } catch {
      // ignore
    }

    let dismissed = false;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        if (raw === '1') {
          window.localStorage.removeItem(STORAGE_KEY);
        } else {
          const parsed = JSON.parse(raw);
          if (
            parsed &&
            typeof parsed.dismissedAt === 'number' &&
            Date.now() - parsed.dismissedAt < DISMISS_TTL_MS
          ) {
            dismissed = true;
          } else {
            window.localStorage.removeItem(STORAGE_KEY);
          }
        }
      }
    } catch {
      dismissed = false;
    }
    setHasDismissed(dismissed);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const refreshInstalled = () => setIsInstalled(detectStandalone());
    refreshInstalled();
    window.addEventListener('appinstalled', refreshInstalled);
    const mm = window.matchMedia?.('(display-mode: standalone)');
    mm?.addEventListener?.('change', refreshInstalled);
    return () => {
      window.removeEventListener('appinstalled', refreshInstalled);
      mm?.removeEventListener?.('change', refreshInstalled);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) {
      setSwStatus('unsupported');
      return;
    }
    setSwStatus('checking');
    navigator.serviceWorker
      .getRegistration()
      .then((reg) => setSwStatus(reg ? 'registered' : 'not-registered'))
      .catch(() => setSwStatus('error'));
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (iosSafariNeedsManualSteps) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setBipEvent(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler as EventListener);
    return () => window.removeEventListener('beforeinstallprompt', handler as EventListener);
  }, [iosSafariNeedsManualSteps]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const onGesture = () => {
      setHasUserGesture(true);
      cleanup();
    };

    const cleanup = () => {
      window.removeEventListener('click', onGesture, true);
      window.removeEventListener('touchstart', onGesture, true);
      window.removeEventListener('keydown', onGesture, true);
      window.removeEventListener('scroll', onGesture, true);
    };

    window.addEventListener('click', onGesture, true);
    window.addEventListener('touchstart', onGesture, true);
    window.addEventListener('keydown', onGesture, true);
    window.addEventListener('scroll', onGesture, true);

    return cleanup;
  }, []);

  const supportsPrompt = iosSafariNeedsManualSteps || bipEvent !== null;
  const isInstallable = supportsPrompt && !isInstalled;

  const blockedReason = useMemo(() => {
    if (isInstalled) return 'already-installed';
    if (!envInfo.isSecureContext) return 'insecure-context';
    if (!envInfo.hasManifestLink) return 'missing-manifest';
    if (swStatus === 'unsupported') return 'no-service-worker-support';
    if (swStatus === 'not-registered') return 'service-worker-not-registered';
    if (!supportsPrompt) return 'no-beforeinstallprompt';
    return null;
  }, [envInfo.hasManifestLink, envInfo.isSecureContext, isInstalled, supportsPrompt, swStatus]);

  const persistDismissed = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ dismissedAt: Date.now() }));
    } catch {
      // ignore
    }
  };

  const dismissPopup = useCallback(() => {
    setHasDismissed(true);
    persistDismissed();
  }, []);

  const promptInstall = useCallback(async () => {
    if (iosSafariNeedsManualSteps) {
      setIosGuideOpen(true);
      return { outcome: 'ios' as const };
    }
    if (!bipEvent) return { outcome: 'no-event' as const };
    setIsPrompting(true);
    try {
      await bipEvent.prompt();
      const choice = await bipEvent.userChoice;
      setLastChoice(choice);
      setBipEvent(null);
      if (choice.outcome === 'dismissed') {
        setHasDismissed(true);
        persistDismissed();
      }
      return { outcome: choice.outcome };
    } finally {
      setIsPrompting(false);
    }
  }, [bipEvent, iosSafariNeedsManualSteps]);

  const value: PwaInstallContextValue = {
    bipEvent,
    isInstalled,
    isIos,
    isSafari,
    isStandalone,
    iosSafariNeedsManualSteps,
    supportsPrompt,
    isInstallable,
    hasUserGesture,
    hasDismissed,
    swStatus,
    isPrompting,
    lastChoice,
    envInfo,
    blockedReason,
    promptInstall,
    dismissPopup,
    iosGuideOpen,
    openIosGuide: () => setIosGuideOpen(true),
    closeIosGuide: () => setIosGuideOpen(false),
  };

  return <PwaInstallContext.Provider value={value}>{children}</PwaInstallContext.Provider>;
}

export function usePwaInstall() {
  const ctx = useContext(PwaInstallContext);
  if (!ctx) {
    throw new Error('usePwaInstall must be used within a PwaInstallProvider');
  }
  return ctx;
}
