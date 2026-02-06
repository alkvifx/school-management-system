'use client';

import { AuthProvider } from '../context/auth.context';
import { Toaster } from 'sonner';
import { ServiceWorkerRegistration } from './ServiceWorkerRegistration';
import { PwaViewport } from './PwaViewport';
import { PwaInstallProvider } from '@/src/hooks/usePwaInstall';

export function Providers({ children }) {
  return (
    <AuthProvider>
      <PwaInstallProvider>
        <PwaViewport />
        <ServiceWorkerRegistration />
        {children}
        <Toaster position="top-right" />
      </PwaInstallProvider>
    </AuthProvider>
  );
}
