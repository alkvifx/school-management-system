'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Role-based bottom nav items for PWA.
 * Dashboard, Students (or Classes), Attendance, Fees, Profile.
 * Hidden on login and when not in PWA (caller responsibility).
 */
const BOTTOM_NAV_BY_ROLE = {
  [ROLES.PRINCIPAL]: [
    { href: '/principal/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/student/leaderboard', label: 'Leaderboard', icon: Award },
    { href: '/notifications', label: 'Notifications', icon: Bell },
    { href: '/principal/students', label: 'Students', icon: Users },
    { href: '/principal/classes', label: 'Classes', icon: ClipboardList },
    { href: '/principal/fees', label: 'Fees', icon: CreditCard },
    { href: '/principal/profile', label: 'Profile', icon: UserCircle },
  ],
  [ROLES.TEACHER]: [
    { href: '/teacher/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/student/leaderboard', label: 'Leaderboard', icon: Award },
    { href: '/notifications', label: 'Notifications', icon: Bell },
    { href: '/teacher/students', label: 'Students', icon: Users },
    { href: '/teacher/attendance', label: 'Attendance', icon: ClipboardList },
    { href: '/teacher/chat', label: 'Chat', icon: MessageCircle },
    { href: '/teacher/profile', label: 'Profile', icon: UserCircle },
  ],
  [ROLES.STUDENT]: [
    { href: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/student/leaderboard', label: 'Leaderboard', icon: Award },
    { href: '/notifications', label: 'Notifications', icon: Bell },
    { href: '/student/attendance', label: 'Attendance', icon: ClipboardList },
    { href: '/student/fees', label: 'Fees', icon: CreditCard },
    { href: '/student/profile', label: 'Profile', icon: UserCircle },
  ],
  // Super-admin: keep sidebar in PWA or minimal bottom nav (Dashboard + Profile if needed)
  [ROLES.SUPER_ADMIN]: [
    { href: '/super-admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/super-admin/schools', label: 'Schools', icon: Users },
    { href: '/super-admin/principals', label: 'Principals', icon: UserCircle },
  ],
};

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user?.role) return null;

  const items = BOTTOM_NAV_BY_ROLE[user.role];
  if (!items?.length) return null;

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40',
        'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md',
        'border-t border-gray-200 dark:border-gray-800',
        'safe-area-inset-bottom pb-[env(safe-area-inset-bottom)]',
        'shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]'
      )}
      role="navigation"
      aria-label="Bottom navigation"
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 min-w-0 py-2 px-1',
                'text-xs font-medium transition-colors',
                'touch-manipulation active:scale-95',
                isActive
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon
                className={cn('w-6 h-6 mb-0.5 flex-shrink-0', isActive && 'stroke-[2.5]')}
                aria-hidden
              />
              <span className="truncate w-full text-center">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
