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
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Role-based bottom nav for PWA – full feature parity with web Sidebar.
 * Primary: up to 4 items; rest in "More" so every feature is reachable.
 */
const BOTTOM_NAV_BY_ROLE = {
  [ROLES.PRINCIPAL]: {
    primary: [
      { href: '/principal/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/principal/students', label: 'Students', icon: Users },
      { href: '/principal/classes', label: 'Classes', icon: ClipboardList },
      { href: '/principal/fees', label: 'Fees', icon: CreditCard },
    ],
    secondary: [
      { href: '/principal/school', label: 'School', icon: Building2 },
      { href: '/principal/teachers', label: 'Teachers', icon: Users },
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

  const primary = config.primary.slice(0, 4);
  const secondary = config.secondary || [];

  const hasMore = secondary.length > 0 && primary.length >= 3;
  const basePrimary = hasMore ? primary.slice(0, 3) : primary;

  const displayItems = hasMore
    ? [
        ...basePrimary,
        {
          href: '#more',
          label: 'More',
          icon: BookOpen,
          isMore: true,
        },
      ]
    : basePrimary;

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40',
        'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md',
        'border-t border-slate-200 dark:border-slate-800',
        'safe-area-inset-bottom pb-[env(safe-area-inset-bottom)]',
        'shadow-[0_-2px_4px_rgba(15,23,42,0.06)]'
      )}
      role="navigation"
      aria-label="Bottom navigation"
    >
      <div className="relative mx-auto flex h-16 max-w-lg items-center justify-around px-1">
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
                  'flex flex-1 min-w-0 flex-col items-center justify-center px-1 py-1.5',
                  'text-[11px] font-medium transition-colors',
                  'touch-manipulation active:scale-95',
                  anySecondaryActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                )}
                aria-haspopup="menu"
                aria-expanded={moreOpen}
              >
                <Icon
                  className={cn(
                    'mb-0.5 h-6 w-6 flex-shrink-0',
                    anySecondaryActive && 'stroke-[2.5]'
                  )}
                  aria-hidden
                />
                <span className="w-full truncate text-center max-[360px]:hidden">
                  More
                </span>
                <span
                  className={cn(
                    'mt-0.5 h-0.5 w-5 rounded-full',
                    anySecondaryActive ? 'bg-blue-600' : 'bg-transparent'
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
                'flex flex-1 min-w-0 flex-col items-center justify-center px-1 py-1.5',
                'text-[11px] font-medium transition-colors',
                'touch-manipulation active:scale-95',
                isActive
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon
                className={cn(
                  'mb-0.5 h-6 w-6 flex-shrink-0',
                  isActive && 'stroke-[2.5]'
                )}
                aria-hidden
              />
              <span className="w-full truncate text-center max-[360px]:hidden">
                {item.label}
              </span>
              <span
                className={cn(
                  'mt-0.5 h-0.5 w-5 rounded-full',
                  isActive ? 'bg-blue-600' : 'bg-transparent'
                )}
              />
            </Link>
          );
        })}

        {hasMore && moreOpen && secondary.length > 0 && (
          <div className="absolute bottom-16 left-1/2 z-40 w-full max-w-xs -translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
            <div className="flex flex-col gap-1 text-sm text-slate-800">
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
                      'flex items-center gap-2 rounded-xl px-2 py-2',
                      active ? 'bg-slate-100' : 'hover:bg-slate-50'
                    )}
                  >
                    <Icon className="h-4 w-4 text-slate-500" />
                    <span className="flex-1 text-left text-[13px]">{item.label}</span>
                    {active && (
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
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
