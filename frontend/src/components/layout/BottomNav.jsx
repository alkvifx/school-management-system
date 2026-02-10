'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/src/context/auth.context';
import { ROLES } from '@/src/utils/constants';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  CreditCard,
  UserCircle,
  BookOpen,
  Bell,
  MessageCircle,
  Award,
  Bot,
  Building2,
  FileText,
  Image,
  UserCheck,
  EyeOff,
  MoreHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Role-based bottom nav for PWA.
 * Principal: clean 4-item nav (Dashboard, Students, Fees, More) – minimal, thumb-friendly.
 */
const BOTTOM_NAV_BY_ROLE = {
  [ROLES.PRINCIPAL]: {
    primary: [
      { href: '/principal/dashboard', label: 'Home', icon: LayoutDashboard },
      { href: '/principal/students', label: 'Students', icon: Users },
      { href: '/principal/fees', label: 'Fees', icon: CreditCard },
      { href: '#more', label: 'More', icon: MoreHorizontal, isMore: true },
    ],
    secondary: [
      { href: '/principal/teachers', label: 'Teachers', icon: Users },
      { href: '/principal/classes', label: 'Classes', icon: ClipboardList },
      { href: '/principal/notices', label: 'Notices', icon: FileText },
      { href: '/principal/result-analysis', label: 'Results', icon: Award },
      { href: '/principal/ai', label: 'Chat', icon: MessageCircle },
      { href: '/principal/school', label: 'School', icon: Building2 },
      { href: '/principal/assign', label: 'Assignments', icon: UserCheck },
      { href: '/principal/website/pages', label: 'Website', icon: FileText },
      { href: '/principal/website/media', label: 'Media', icon: Image },
      { href: '/principal/monitoring', label: 'Silent Control', icon: EyeOff },
      { href: '/student/leaderboard', label: 'Leaderboard', icon: Award },
      { href: '/notifications', label: 'Notifications', icon: Bell },
      { href: '/principal/profile', label: 'Profile', icon: UserCircle },
    ],
  },
  [ROLES.TEACHER]: {
    primary: [
      { href: '/teacher/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/teacher/students', label: 'Students', icon: Users },
      { href: '/teacher/attendance', label: 'Attendance', icon: ClipboardList },
      { href: '/teacher/chat', label: 'Chat', icon: MessageCircle },
    ],
    secondary: [
      { href: '/student/leaderboard', label: 'Leaderboard', icon: Award },
      { href: '/teacher/classes', label: 'My Classes', icon: BookOpen },
      { href: '/teacher/marks', label: 'Marks', icon: Award },
      { href: '/teacher/ai-help', label: 'AI Help', icon: Bot },
      { href: '/notifications', label: 'Notifications', icon: Bell },
      { href: '/teacher/profile', label: 'Profile', icon: UserCircle },
    ],
  },
  [ROLES.STUDENT]: {
    primary: [
      { href: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/student/attendance', label: 'Attendance', icon: ClipboardList },
      { href: '/student/fees', label: 'Fees', icon: CreditCard },
      { href: '/student/leaderboard', label: 'Leaderboard', icon: Award },
    ],
    secondary: [
      { href: '/student/chat', label: 'Chat', icon: MessageCircle },
      { href: '/student/marks', label: 'Marks', icon: Award },
      { href: '/student/ai-help', label: 'AI Help', icon: Bot },
      { href: '/notifications', label: 'Notifications', icon: Bell },
      { href: '/student/profile', label: 'Profile', icon: UserCircle },
    ],
  },
  [ROLES.SUPER_ADMIN]: {
    primary: [
      { href: '/super-admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/super-admin/schools', label: 'Schools', icon: Users },
      { href: '/super-admin/principals', label: 'Principals', icon: UserCircle },
    ],
    secondary: [],
  },
};

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [moreOpen, setMoreOpen] = useState(false);

  if (!user?.role) return null;

  const config = BOTTOM_NAV_BY_ROLE[user.role];
  if (!config?.primary?.length) return null;

  const displayItems = config.primary;
  const secondary = config.secondary || [];
  const hasMore = secondary.length > 0 && displayItems.some((i) => i.isMore);
  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40',
        'backdrop-blur-md',
        'border-t border-[hsl(var(--app-border))] safe-area-inset-bottom pb-[env(safe-area-inset-bottom)]',
        'bg-[hsl(var(--app-surface))]/95 shadow-[0_-2px_8px_hsl(220_20%_85%/0.3)]'
      )}
      role="navigation"
      aria-label="Bottom navigation"
    >
      <div className="relative mx-auto flex h-[72px] max-w-lg items-center justify-around gap-1 px-2">
        {displayItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            !item.isMore &&
            (pathname === item.href || pathname.startsWith(item.href + '/'));

          if (item.isMore) {
            const anySecondaryActive = secondary.some(
              (s) => pathname === s.href || pathname.startsWith(s.href + '/')
            );

            return (
              <button
                key="__more"
                type="button"
                onClick={() => setMoreOpen((v) => !v)}
                className={cn(
                  'flex min-h-[52px] min-w-[52px] flex-1 flex-col items-center justify-center gap-1 rounded-xl',
                  'text-[12px] font-medium transition-all touch-manipulation active:scale-95',
                  anySecondaryActive
                    ? 'text-[hsl(var(--app-accent))]'
                    : 'text-[hsl(var(--app-text-muted))]'
                )}
                aria-haspopup="menu"
                aria-expanded={moreOpen}
              >
                <Icon
                className={cn(
                  'h-6 w-6 flex-shrink-0',
                  anySecondaryActive && 'stroke-[2.5]'
                )}
                  aria-hidden
                />
                <span className="max-[360px]:hidden">{item.label}</span>
                <span
                  className={cn(
                    'h-0.5 w-6 rounded-full',
                    anySecondaryActive ? 'bg-[hsl(var(--app-accent))]' : 'bg-transparent'
                  )}
                />
              </button>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex min-h-[52px] min-w-[52px] flex-1 flex-col items-center justify-center gap-1 rounded-xl',
                'text-[12px] font-medium transition-all touch-manipulation active:scale-95',
                isActive
                  ? 'text-[hsl(var(--app-accent))]'
                  : 'text-[hsl(var(--app-text-muted))]'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon
                className={cn(
                  'h-6 w-6 flex-shrink-0',
                  isActive && 'stroke-[2.5]'
                )}
                aria-hidden
              />
              <span className="max-[360px]:hidden">{item.label}</span>
              <span
                className={cn(
                  'h-0.5 w-6 rounded-full',
                  isActive ? 'bg-[hsl(var(--app-accent))]' : 'bg-transparent'
                )}
              />
            </Link>
          );
        })}

        {hasMore && moreOpen && secondary.length > 0 && (
          <div className="absolute bottom-full left-1/2 z-40 mb-2 w-full max-w-xs -translate-x-1/2 rounded-[var(--app-radius-lg)] border border-[hsl(var(--app-border))] bg-[hsl(var(--app-surface))] p-2 shadow-[var(--app-shadow-lg)]">
            <div className="flex flex-col gap-1 text-sm text-[hsl(var(--app-text))]">
              {secondary.map((item) => {
                const Icon = item.icon;
                const active =
                  pathname === item.href || pathname.startsWith(item.href + '/');

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className={cn(
                      'flex min-h-[44px] items-center gap-3 rounded-xl px-3 py-2',
                      active
                        ? 'bg-[hsl(var(--app-accent-muted))]'
                        : 'hover:bg-[hsl(var(--app-bg))]'
                    )}
                  >
                    <Icon
                      className="h-4 w-4 shrink-0 text-[hsl(var(--app-accent))]"
                    />
                    <span className="flex-1 text-left text-[13px]">{item.label}</span>
                    {active && (
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--app-accent))]" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
