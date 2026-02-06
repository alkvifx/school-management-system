'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/src/context/auth.context';
import { ROLES } from '@/src/utils/constants';
import { cn } from '@/lib/utils';
import BottomNav from './BottomNav';
import { NotificationDropdown } from '@/src/components/NotificationDropdown';
import { UserCircle, LogOut } from 'lucide-react';

/**
 * PWA-only layout: header with title + actions, content, fixed bottom nav.
 * Lightweight transitions on mobile (no heavy Framer Motion) for smooth FPS.
 */
function getPageTitle(pathname) {
  const segments = pathname.split('/').filter(Boolean);
  const last = segments[segments.length - 1] || 'Home';
  const titles = {
    dashboard: 'Dashboard',
    students: 'Students',
    teachers: 'Teachers',
    classes: 'Classes',
    fees: 'Fees',
    attendance: 'Attendance',
    chat: 'Chat',
    'ai-help': 'AI Help',
    marks: 'Marks',
    leaderboard: 'Leaderboard',
    profile: 'Profile',
    notifications: 'Notifications',
    school: 'School',
    assign: 'Assignments',
    pages: 'Website',
    media: 'Media',
    monitoring: 'Silent Control',
    list: 'Fees',
    collect: 'Collect Fee',
    initialize: 'Initialize',
    structure: 'Structure',
    reminders: 'Reminders',
  };
  return titles[last] || last.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function PwaLayout({ children }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isLoginScreen =
    pathname === '/login' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password' ||
    pathname === '/verify-email';
  const showBottomNav = !!user && !isLoginScreen;
  const showHeader = !!user && !isLoginScreen;
  const showNotifications =
    user?.role === ROLES.TEACHER || user?.role === ROLES.STUDENT || user?.role === ROLES.PRINCIPAL;
  const profileHref =
    user?.role === ROLES.PRINCIPAL
      ? '/principal/profile'
      : user?.role === ROLES.TEACHER
        ? '/teacher/profile'
        : user?.role === ROLES.STUDENT
          ? '/student/profile'
          : user?.role === ROLES.SUPER_ADMIN
            ? '/super-admin/dashboard'
            : '/principal/profile';

  return (
    <div className="flex flex-col min-h-screen min-h-[100dvh] bg-gray-50 dark:bg-gray-950">
      {/* PWA header: safe area, title, notifications, profile / logout */}
      {showHeader && (
        <header
          className={cn(
            'sticky top-0 z-30 flex-shrink-0',
            'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md',
            'border-b border-slate-200 dark:border-slate-800',
            'pt-[env(safe-area-inset-top)]'
          )}
        >
          <div className="flex h-12 sm:h-14 items-center justify-between px-4 gap-2">
            <h1 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 truncate flex-1 min-w-0">
              {getPageTitle(pathname)}
            </h1>
            <div className="flex items-center gap-1 flex-shrink-0">
              {showNotifications && (
                <div className="touch-manipulation">
                  <NotificationDropdown />
                </div>
              )}
              <Link
                href={profileHref}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 touch-manipulation"
                aria-label="Profile"
              >
                <UserCircle className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </Link>
              <button
                type="button"
                onClick={() => logout()}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 touch-manipulation"
                aria-label="Logout"
              >
                <LogOut className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Main content: safe area and bottom nav spacing */}
      <main
        className={cn(
          'flex-1 overflow-y-auto overflow-x-hidden',
          'overscroll-behavior-y-contain',
          showBottomNav
            ? 'pb-[calc(env(safe-area-inset-bottom)+4.5rem)]'
            : 'pb-[env(safe-area-inset-bottom)]'
        )}
      >
        <div className="p-4 sm:p-5 min-h-full">{children}</div>
      </main>

      {showBottomNav && <BottomNav />}
    </div>
  );
}
