'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/src/context/auth.context';
import ProtectedRoute from '@/src/components/ProtectedRoute';
import { ROLES } from '@/src/utils/constants';
import { principalService } from '@/src/services/principal.service';
import {
  Megaphone,
  GraduationCap,
  Users,
  FileText,
  TrendingUp,
  MessageCircle,
  School,
  AlertTriangle,
  Bell,
  Download,
} from 'lucide-react';
import { usePwaInstall } from '@/src/hooks/usePwaInstall';
import { useIsPWA } from '@/src/hooks/useIsPWA';
import { cn } from '@/lib/utils';

const PULSE_REFRESH_MS = 3 * 60 * 1000; // 3 min

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

const QUICK_ACTIONS = [
  { label: 'Notices', href: '/principal/notices', icon: Megaphone },
  { label: 'Students', href: '/principal/students', icon: GraduationCap },
  { label: 'Teachers', href: '/principal/teachers', icon: Users },
  { label: 'Fees', href: '/principal/fees', icon: FileText },
  { label: 'Results', href: '/principal/result-analysis', icon: TrendingUp },
  { label: 'Chat', href: '/principal/ai', icon: MessageCircle },
];

export default function PrincipalDashboard() {
  const { user } = useAuth();
  const isPWA = useIsPWA();
  const { isInstallable, promptInstall, isInstalled } = usePwaInstall();
  const [stats, setStats] = useState({
    teachers: 0,
    students: 0,
    classes: 0,
    loading: true,
  });
  const [pulse, setPulse] = useState(null);
  const [pulseLoading, setPulseLoading] = useState(true);
  const [pulseError, setPulseError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [teachers, students, classes] = await Promise.all([
          principalService.getTeachers(),
          principalService.getStudents(),
          principalService.getClasses(),
        ]);
        setStats({
          teachers: teachers?.length || 0,
          students: students?.length || 0,
          classes: classes?.length || 0,
          loading: false,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        setStats((prev) => ({ ...prev, loading: false }));
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchPulse = async () => {
      try {
        setPulseError(null);
        const data = await principalService.getPulseToday();
        setPulse(data);
      } catch (error) {
        console.error('Error fetching pulse:', error);
        setPulseError(error.message || "Failed to load today's pulse");
        setPulse(null);
      } finally {
        setPulseLoading(false);
      }
    };
    fetchPulse();
    const onFocus = () => fetchPulse();
    window.addEventListener('focus', onFocus);
    const interval = setInterval(fetchPulse, PULSE_REFRESH_MS);
    return () => {
      window.removeEventListener('focus', onFocus);
      clearInterval(interval);
    };
  }, []);

  const pendingTasks = useMemo(() => {
    const items = [];
    if (pulse?.teacher?.notMarkedYet > 0) {
      items.push({
        label: `${pulse.teacher.notMarkedYet} teachers have not marked attendance`,
        href: '/principal/classes',
      });
    }
    if (pulse?.alerts?.length) {
      items.push({
        label: `${pulse.alerts.length} alerts need attention`,
        href: '/principal/risks',
      });
    }
    if (!items.length) {
      items.push({
        label: 'No urgent tasks. You are all caught up.',
        href: '/principal/dashboard',
      });
    }
    return items;
  }, [pulse]);

  const schoolName = user?.school?.name || 'Your School';

  return (
    <ProtectedRoute allowedRoles={[ROLES.PRINCIPAL]}>
      <div
        className="app-bg-texture min-h-screen"
        style={{ fontFamily: 'var(--principal-body)' }}
      >
        <div className="relative z-10 mx-auto max-w-2xl px-4 pb-24 pt-4 sm:pb-6 sm:pt-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* Compact header: school name + PWA Install (web layout only; PWA uses PwaLayout header) */}
            {!isPWA && (
              <motion.header
                variants={itemVariants}
                className="flex min-h-[44px] items-center justify-between gap-3"
              >
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--principal-radius-sm)] text-white"
                    style={{ backgroundColor: 'hsl(var(--principal-accent))' }}
                  >
                    <School className="h-5 w-5" />
                  </div>
                  <h1
                    className="truncate text-lg font-semibold"
                    style={{
                      color: 'hsl(var(--principal-text))',
                      fontFamily: 'var(--principal-display)',
                    }}
                  >
                    {schoolName}
                  </h1>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  {isInstallable && !isInstalled && (
                    <button
                      type="button"
                      onClick={() => promptInstall()}
                      className="flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-[var(--principal-radius-sm)] px-3 transition-colors active:scale-[0.97]"
                      style={{
                        backgroundColor: 'hsl(var(--principal-accent-muted))',
                        color: 'hsl(var(--principal-accent))',
                      }}
                      aria-label="Install app"
                    >
                      <Download className="h-5 w-5" />
                      <span className="hidden text-sm font-medium sm:inline">Install</span>
                    </button>
                  )}
                  <Link
                    href="/principal/profile"
                    className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-[var(--principal-radius-sm)] transition-colors active:scale-[0.97]"
                    style={{
                      backgroundColor: 'hsl(var(--principal-surface))',
                      color: 'hsl(var(--principal-text-muted))',
                      boxShadow: 'var(--principal-shadow)',
                    }}
                    aria-label="Profile"
                  >
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold text-white"
                      style={{ backgroundColor: 'hsl(var(--principal-accent))' }}
                    >
                      {user?.name?.charAt(0)?.toUpperCase() || 'P'}
                    </span>
                  </Link>
                </div>
              </motion.header>
            )}

            {/* Stats row */}
            <motion.section variants={itemVariants} className="grid grid-cols-3 gap-3">
              {[
                { label: 'Students', value: stats.students, loading: stats.loading },
                { label: 'Teachers', value: stats.teachers, loading: stats.loading },
                { label: 'Classes', value: stats.classes, loading: stats.loading },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-[var(--principal-radius)] px-3 py-3 text-center"
                  style={{
                    backgroundColor: 'hsl(var(--principal-surface))',
                    boxShadow: 'var(--principal-shadow)',
                  }}
                >
                  <p
                    className="text-[11px] font-medium uppercase tracking-wider"
                    style={{ color: 'hsl(var(--principal-text-muted))' }}
                  >
                    {stat.label}
                  </p>
                  <p
                    className="mt-0.5 text-xl font-semibold"
                    style={{
                      color: 'hsl(var(--principal-text))',
                      fontFamily: 'var(--principal-display)',
                    }}
                  >
                    {stat.loading ? '—' : stat.value}
                  </p>
                </div>
              ))}
            </motion.section>

            {/* Quick Actions grid */}
            <motion.section variants={itemVariants}>
              <h2
                className="mb-3 text-sm font-semibold"
                style={{
                  color: 'hsl(var(--principal-text))',
                  fontFamily: 'var(--principal-display)',
                }}
              >
                Quick Actions
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {QUICK_ACTIONS.map((action, i) => {
                  const Icon = action.icon;
                  return (
                    <motion.div
                      key={action.label}
                      variants={itemVariants}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link
                        href={action.href}
                        className={cn(
                          'group flex min-h-[88px] flex-col items-start justify-between rounded-[var(--principal-radius-lg)] p-4 transition-all',
                          'active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2'
                        )}
                        style={{
                          backgroundColor: 'hsl(var(--principal-surface))',
                          boxShadow: 'var(--principal-shadow)',
                          ['--tw-ring-color']: 'hsl(var(--principal-accent))',
                        }}
                      >
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-[var(--principal-radius-sm)]"
                          style={{ backgroundColor: 'hsl(var(--principal-accent-muted))' }}
                        >
                          <Icon
                            className="h-5 w-5"
                            style={{ color: 'hsl(var(--principal-accent))' }}
                          />
                        </div>
                        <span
                          className="text-sm font-medium"
                          style={{ color: 'hsl(var(--principal-text))' }}
                        >
                          {action.label}
                        </span>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </motion.section>

            {/* Today's Pulse */}
            <motion.section
              variants={itemVariants}
              className="rounded-[var(--principal-radius-lg)] p-4"
              style={{
                backgroundColor: 'hsl(var(--principal-surface))',
                boxShadow: 'var(--principal-shadow)',
              }}
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell
                    className="h-4 w-4"
                    style={{ color: 'hsl(var(--principal-accent))' }}
                  />
                  <h2
                    className="text-sm font-semibold"
                    style={{
                      color: 'hsl(var(--principal-text))',
                      fontFamily: 'var(--principal-display)',
                    }}
                  >
                    Today&apos;s pulse
                  </h2>
                </div>
                {pulse && (
                  <span
                    className="text-xs"
                    style={{ color: 'hsl(var(--principal-text-muted))' }}
                  >
                    {pulse.dayName}, {pulse.date}
                  </span>
                )}
              </div>
              {pulseLoading ? (
                <p
                  className="text-xs"
                  style={{ color: 'hsl(var(--principal-text-muted))' }}
                >
                  Loading today&apos;s data…
                </p>
              ) : pulseError ? (
                <p className="text-xs text-red-600">{pulseError}</p>
              ) : !pulse ? (
                <p
                  className="text-xs"
                  style={{ color: 'hsl(var(--principal-text-muted))' }}
                >
                  No data for today yet.
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div
                    className="rounded-[var(--principal-radius-sm)] px-3 py-2"
                    style={{ backgroundColor: 'hsl(var(--principal-accent-muted))' }}
                  >
                    <p
                      className="text-[10px] uppercase tracking-wider"
                      style={{ color: 'hsl(var(--principal-text-muted))' }}
                    >
                      Student attendance
                    </p>
                    <p
                      className="mt-0.5 font-semibold"
                      style={{
                        color: 'hsl(var(--principal-text))',
                        fontFamily: 'var(--principal-display)',
                      }}
                    >
                      {pulse.student?.attendancePercentage ?? 0}%
                    </p>
                  </div>
                  <div
                    className="rounded-[var(--principal-radius-sm)] px-3 py-2"
                    style={{ backgroundColor: 'hsl(var(--principal-sage-muted))' }}
                  >
                    <p
                      className="text-[10px] uppercase tracking-wider"
                      style={{ color: 'hsl(var(--principal-text-muted))' }}
                    >
                      Teacher marked
                    </p>
                    <p
                      className="mt-0.5 font-semibold"
                      style={{
                        color: 'hsl(var(--principal-text))',
                        fontFamily: 'var(--principal-display)',
                      }}
                    >
                      {pulse.teacher?.presentToday ?? 0}/{pulse.teacher?.totalTeachers ?? 0}
                    </p>
                  </div>
                  <div
                    className="rounded-[var(--principal-radius-sm)] px-3 py-2"
                    style={{ backgroundColor: 'hsl(var(--principal-accent-muted))' }}
                  >
                    <p
                      className="text-[10px] uppercase tracking-wider"
                      style={{ color: 'hsl(var(--principal-text-muted))' }}
                    >
                      Alerts
                    </p>
                    <p
                      className="mt-0.5 font-semibold"
                      style={{
                        color: 'hsl(var(--principal-text))',
                        fontFamily: 'var(--principal-display)',
                      }}
                    >
                      {pulse.alerts?.length ?? 0}
                    </p>
                  </div>
                </div>
              )}
            </motion.section>

            {/* Pending tasks */}
            <motion.section
              variants={itemVariants}
              className="rounded-[var(--principal-radius-lg)] p-4"
              style={{
                backgroundColor: 'hsl(var(--principal-surface))',
                boxShadow: 'var(--principal-shadow)',
              }}
            >
              <h2
                className="mb-3 text-sm font-semibold"
                style={{
                  color: 'hsl(var(--principal-text))',
                  fontFamily: 'var(--principal-display)',
                }}
              >
                Pending tasks
              </h2>
              <ul className="space-y-1">
                {pendingTasks.map((task) => (
                  <li key={task.label}>
                    <Link
                      href={task.href}
                      className="flex items-start gap-2 rounded-[var(--principal-radius-sm)] px-2 py-2 transition-colors active:bg-opacity-80"
                      style={{
                        backgroundColor: task.label.startsWith('No urgent')
                          ? 'transparent'
                          : 'hsl(var(--principal-accent-muted))',
                      }}
                    >
                      <AlertTriangle
                        className="mt-0.5 h-4 w-4 shrink-0"
                        style={{
                          color: task.label.startsWith('No urgent')
                            ? 'hsl(var(--principal-sage))'
                            : 'hsl(var(--principal-accent))',
                        }}
                      />
                      <span
                        className="text-sm"
                        style={{ color: 'hsl(var(--principal-text))' }}
                      >
                        {task.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.section>
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
