'use client';

import { AuthProvider } from '../context/auth.context';
import { Toaster } from 'sonner';
import { ServiceWorkerRegistration } from './ServiceWorkerRegistration';
import { PwaViewport } from './PwaViewport';
import { PwaInstallProvider } from '@/src/hooks/usePwaInstall';
import { PwaUpdateBanner } from './PwaUpdateBanner';
import { OfflineBanner } from './OfflineBanner';
import { useOnlineStatus } from '@/src/hooks/useOnlineStatus';

function AppContent({ children, isOnline, showBackOnline }) {
  const showBanner = !isOnline || showBackOnline;

  return (
    <main
      className="transition-[padding-top] duration-300 ease-out"
      style={{
        // When banner is visible, reserve space for it + safe-area inset.
        // When hidden, still respect safe-area inset on notch devices.
        paddingTop: showBanner
          ? 'calc(var(--app-top-banner-height, 44px) + env(safe-area-inset-top))'
          : 'env(safe-area-inset-top)',
      }}
    >
      {children}
    </main>
  );
}

export function Providers({ children }) {
  const { isOnline, wasOffline } = useOnlineStatus();
  const showBackOnline = isOnline && wasOffline;

  return (
    <AuthProvider>
      <PwaInstallProvider>
        <PwaViewport />
        <ServiceWorkerRegistration />

        {/* Fixed top banners */}
        <PwaUpdateBanner />
        <OfflineBanner isOnline={isOnline} showBackOnline={showBackOnline} />

        {/* Content gets pushed down */}
        <AppContent isOnline={isOnline} showBackOnline={showBackOnline}>
          {children}
        </AppContent>

        <Toaster position="top-right" />
      </PwaInstallProvider>
    </AuthProvider>
  );
}
