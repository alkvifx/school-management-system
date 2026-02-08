'use client';

import { usePathname } from 'next/navigation';
import { useIsPWA } from '@/src/hooks/useIsPWA';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PwaLayout from '@/src/components/layout/PwaLayout';

export function ConditionalLayout({ children }) {
  const pathname = usePathname();
  const isPWA = useIsPWA();

  // PWA mode: use PwaLayout for /notifications (no role layout wraps it); role routes use PwaLayout from their own layouts
  if (isPWA) {
    const isNotificationsRoute = pathname === '/notifications' || pathname.startsWith('/notifications/');
    if (isNotificationsRoute) {
      return <PwaLayout>{children}</PwaLayout>;
    }
    return (
      <main className="min-h-screen overflow-x-hidden overflow-y-auto">
        {children}
      </main>
    );
  }

  // Web: don't show Navbar/Footer for authenticated routes
  const isAuthRoute = pathname.startsWith('/super-admin') ||
    pathname.startsWith('/principal') ||
    pathname.startsWith('/teacher') ||
    pathname.startsWith('/student') ||
    pathname === '/notifications' ||
    pathname.startsWith('/unauthorized') ||
    pathname.startsWith('/login');

  if (isAuthRoute) {
    return (
      <main className="min-h-screen overflow-x-hidden overflow-y-auto">
        {children}
      </main>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
