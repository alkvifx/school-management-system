import { ROLES, PROTECTED_ROUTES } from './constants';

/**
 * Common routes accessible to ALL authenticated users
 */
export const commonRoutes = [
  '/profile',
  '/change-password',
];

/**
 * Shared routes: Leaderboard and public student profile.
 * Accessible by STUDENT, TEACHER, and PRINCIPAL (same school enforced by API).
 */
const SHARED_LEADERBOARD_ROLES = [ROLES.STUDENT, ROLES.TEACHER, ROLES.PRINCIPAL];
const sharedLeaderboardPaths = [
  '/student/leaderboard',
  '/student/profile/', // viewing a student's public profile (e.g. /student/profile/abc123)
];

/** Shared routes: Notifications page. STUDENT, TEACHER, PRINCIPAL. */
const SHARED_NOTIFICATIONS_ROLES = [ROLES.STUDENT, ROLES.TEACHER, ROLES.PRINCIPAL];
const sharedNotificationsPaths = ['/notifications'];

function hasSharedLeaderboardAccess(userRole, pathname) {
  if (!SHARED_LEADERBOARD_ROLES.includes(userRole)) return false;
  return sharedLeaderboardPaths.some((p) => p.endsWith('/') ? pathname.startsWith(p) : pathname === p || pathname.startsWith(p + '/'));
}

function hasSharedNotificationsAccess(userRole, pathname) {
  if (!SHARED_NOTIFICATIONS_ROLES.includes(userRole)) return false;
  return sharedNotificationsPaths.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

/**
 * Check if user has access to a route
 * @param {string} userRole - User's role
 * @param {string} pathname - Current pathname
 * @returns {boolean}
 */
export function hasRouteAccess(userRole, pathname) {
  if (!userRole) return false;

  // ✅ Allow common routes (profile, change password, etc.)
  if (commonRoutes.some((route) => pathname.startsWith(route))) {
    return true;
  }

  // ✅ Leaderboard & student profile: STUDENT, TEACHER, PRINCIPAL (same school on backend)
  if (hasSharedLeaderboardAccess(userRole, pathname)) {
    return true;
  }

  // ✅ Notifications page: STUDENT, TEACHER, PRINCIPAL (same route for Web & PWA)
  if (hasSharedNotificationsAccess(userRole, pathname)) {
    return true;
  }

  // ✅ Allow role-specific protected routes
  const allowedRoutes = PROTECTED_ROUTES[userRole] || [];
  return allowedRoutes.some((route) => pathname.startsWith(route));
}

/**
 * Get the default route for a role
 * @param {string} role - User's role
 * @returns {string}
 */
export function getDefaultRoute(role) {
  const roleRoutes = {
    [ROLES.SUPER_ADMIN]: '/super-admin/dashboard',
    [ROLES.PRINCIPAL]: '/principal/dashboard',
    [ROLES.TEACHER]: '/teacher/dashboard',
    [ROLES.STUDENT]: '/student/dashboard',
  };
  return roleRoutes[role] || '/unauthorized';
}

/**
 * Check if route requires authentication
 * @param {string} pathname - Current pathname
 * @returns {boolean}
 */
export function requiresAuth(pathname) {
  const protectedPaths = [
    '/super-admin',
    '/principal',
    '/teacher',
    '/student',
    '/notifications',   // ✅ Notifications (Student/Teacher/Principal) – Web & PWA
    '/fees',            // ✅ fees routes (Principal/Teacher/Student)
    '/profile',          // ✅ now protected
    '/change-password',  // ✅ now protected
  ];
  return protectedPaths.some((path) => pathname.startsWith(path));
}
