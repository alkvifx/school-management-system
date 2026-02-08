'use client';

import { AuthProvider } from '../context/auth.context';
import { Toaster } from 'sonner';
import { ServiceWorkerRegistration } from './ServiceWorkerRegistration';
import { PwaViewport } from './PwaViewport';
import { PwaInstallProvider } from '@/src/hooks/usePwaInstall';
import { PwaUpdateBanner } from './PwaUpdateBanner';
import { OfflineBanner } from './OfflineBanner';
import { useOnlineStatus } from '@/src/hooks/useOnlineStatus';

function AppContent({ children }) {
  const { isOnline, wasOffline } = useOnlineStatus();
  const showOfflineBanner = !(!isOnline && wasOffline);

  return (
    <main
      className="transition-[padding-top] duration-300 ease-out"
      style={{
        paddingTop: showOfflineBanner ? '44px' : '0px',
      }}
    >
      {children}
    </main>
  );
}

export function Providers({ children }) {
  return (
    <AuthProvider>
      <PwaInstallProvider>
        <PwaViewport />
        <ServiceWorkerRegistration />

        {/* Fixed top banners */}
        <PwaUpdateBanner />
        <OfflineBanner />

        {/* Content gets pushed down */}
        <AppContent>{children}</AppContent>

        <Toaster position="top-right" />
      </PwaInstallProvider>
    </AuthProvider>
  );
}
