'use client';

import { AuthProvider } from '../context/auth.context';
import { Toaster } from 'sonner';
import { ServiceWorkerRegistration } from './ServiceWorkerRegistration';
import { PwaViewport } from './PwaViewport';

export function Providers({ children }) {
  return (
    <AuthProvider>
      <PwaViewport />
      <ServiceWorkerRegistration />
      {children}
      <Toaster position="top-right" />
    </AuthProvider>
  );
}
