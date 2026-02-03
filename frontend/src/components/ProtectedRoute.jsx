'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../context/auth.context';
import { hasRouteAccess, requiresAuth, getDefaultRoute } from '../utils/routeProtection';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    // Check if route requires authentication
    if (requiresAuth(pathname)) {
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }

      // Check if user has access to this route
      if (user && !hasRouteAccess(user.role, pathname)) {
        router.push('/unauthorized');
        return;
      }

      // Check if specific roles are allowed
      if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
        router.push('/unauthorized');
        return;
      }
    }
  }, [user, loading, isAuthenticated, pathname, router, allowedRoles]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  if (!isAuthenticated && requiresAuth(pathname)) {
    return null;
  }

    if (user && !hasRouteAccess(user.role, pathname)) {
      return null;
    }

  return <>{children}</>;
}
