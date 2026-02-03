'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/src/context/auth.context';
import { useIsPWA } from '@/src/hooks/useIsPWA';
import { ROLE_ROUTES } from '@/src/utils/constants';

// Public routes allowed when PWA and not authenticated (no landing page in PWA)
const PWA_PUBLIC_ALLOWED = ['/login', '/forgot-password', '/reset-password', '/verify-email'];

/**
 * When app is in PWA mode:
 * - Do NOT show landing (/) → redirect to /login or dashboard by auth
 * - If not logged in: only allow login (and auth flows); redirect "/" and other public pages to /login
 * - If logged in: redirect "/" and "/login" to role dashboard
 * No-op when not in PWA (website flow unchanged).
 */
export function PwaRedirectGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const isPWA = useIsPWA();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!isPWA || loading) return;

    const isAuthenticated = !!user;
    const isAllowedPublic = PWA_PUBLIC_ALLOWED.some((p) => pathname === p || pathname.startsWith(p + '/'));

    // PWA + not authenticated: only allow login/auth pages
    if (!isAuthenticated) {
      if (pathname === '/' || !isAllowedPublic) {
        router.replace('/login');
      }
      return;
    }

    // PWA + authenticated: do not show landing or login
    const dashboardPath = ROLE_ROUTES[user?.role];
    if (pathname === '/' || pathname === '/login') {
      if (dashboardPath) router.replace(dashboardPath);
    }
  }, [isPWA, loading, user, pathname, router]);

  // Avoid flash of landing page when PWA opens at "/" (show minimal loader until redirect)
  if (isPWA && !loading && pathname === '/' && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-gray-400 text-sm">Opening...</div>
      </div>
    );
  }

  return children;
}
