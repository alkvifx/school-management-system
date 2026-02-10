'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/src/context/auth.context';
import { ROLES } from '@/src/utils/constants';
import { cn } from '@/lib/utils';
import BottomNav from './BottomNav';
import { NotificationDropdown } from '@/src/components/NotificationDropdown';
import { usePwaInstall } from '@/src/hooks/usePwaInstall';
import { UserCircle, LogOut, Download, School } from 'lucide-react';

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
  const { isInstallable, promptInstall, isInstalled } = usePwaInstall();

  const isPrincipalDashboard = user?.role === ROLES.PRINCIPAL && pathname === '/principal/dashboard';
  const headerTitle = isPrincipalDashboard
    ? (user?.school?.name || 'Your School')
    : getPageTitle(pathname);

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
    <div className="flex flex-col min-h-screen min-h-[100dvh] bg-transparent">
      {/* PWA header: safe area, title (or school name on dashboard), PWA Install, notifications, profile / logout */}
      {showHeader && (
        <header
          className="sticky top-0 z-30 flex-shrink-0 backdrop-blur-md pt-[env(safe-area-inset-top)] bg-[hsl(var(--app-surface))]/95 border-b border-[hsl(var(--app-border))]"
        >
          <div className="flex h-12 sm:h-14 min-h-[44px] items-center justify-between gap-2 px-4">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              {isPrincipalDashboard && (
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white"
                  style={{ backgroundColor: 'hsl(var(--app-accent))' }}
                >
                  <School className="h-4 w-4" />
                </div>
              )}
              <h1
                className="truncate text-base font-semibold text-[hsl(var(--app-text))] sm:text-lg"
                style={{ fontFamily: 'var(--app-display)' }}
              >
                {headerTitle}
              </h1>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {isInstallable && !isInstalled && (
                <button
                  type="button"
                  onClick={() => promptInstall()}
                  className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg transition-colors active:scale-95"
                  style={{
                    backgroundColor: 'hsl(var(--app-accent-muted))',
                    color: 'hsl(var(--app-accent))',
                  }}
                  aria-label="Install app"
                >
                  <Download className="h-5 w-5" />
                </button>
              )}
              {showNotifications && (
                <div className="touch-manipulation">
                  <NotificationDropdown />
                </div>
              )}
              <Link
                href={profileHref}
                className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg text-[hsl(var(--app-text-muted))] transition-colors touch-manipulation hover:text-[hsl(var(--app-text))]"
                aria-label="Profile"
              >
                <UserCircle className="h-5 w-5" />
              </Link>
              <button
                type="button"
                onClick={() => logout()}
                className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg text-[hsl(var(--app-text-muted))] transition-colors touch-manipulation hover:text-[hsl(var(--app-text))]"
                aria-label="Logout"
              >
                <LogOut className="h-5 w-5" />
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
