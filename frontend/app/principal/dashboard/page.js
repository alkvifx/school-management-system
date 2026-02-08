'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/src/context/auth.context';
import ProtectedRoute from '@/src/components/ProtectedRoute';
import { ROLES } from '@/src/utils/constants';
import { principalService } from '@/src/services/principal.service';
import {
  Users,
  GraduationCap,
  BookOpen,
  UserCheck,
  Calendar,
  FileText,
  Megaphone,
  MessageCircle,
  Image as ImageIcon,
  Bell,
  AlertTriangle,
  Search,
  ChevronRight,
  School,
} from 'lucide-react';

const PULSE_REFRESH_MS = 3 * 60 * 1000; // 3 min

export default function PrincipalDashboard() {
  const { user } = useAuth();

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

  const quickActions = useMemo(
    () => [
      {
        label: 'Add Student',
        href: '/principal/students',
        icon: GraduationCap,
      },
      {
        label: 'Create Notice',
        href: '/principal/notices',
        icon: Megaphone,
      },
      {
        label: 'View Fees',
        href: '/principal/fees',
        icon: FileText,
      },
      {
        label: 'Send Announcement',
        href: '/principal/notifications',
        icon: Bell,
      },
      {
        label: 'Mark Attendance',
        href: '/principal/classes',
        icon: Calendar,
      },
      {
        label: 'Open Chat',
        href: '/principal/ai',
        icon: MessageCircle,
      },
    ],
    []
  );

  const academicLinks = [
    { label: 'Classes', href: '/principal/classes', icon: BookOpen },
    { label: 'Teachers', href: '/principal/teachers', icon: Users },
    { label: 'Subjects', href: '/principal/subjects', icon: BookOpen },
    { label: 'Homework', href: '/principal/assign', icon: FileText },
    { label: 'Results', href: '/principal/result-analysis', icon: TrendingUpIcon },
  ];

  const adminLinks = [
    { label: 'Students', href: '/principal/students', icon: GraduationCap },
    { label: 'Fees', href: '/principal/fees', icon: FileText },
    { label: 'Admissions', href: '/principal/risks', icon: UserCheck },
    { label: 'Attendance', href: '/principal/monitoring', icon: Calendar },
  ];

  const communicationLinks = [
    { label: 'Announcements', href: '/principal/notifications', icon: Megaphone },
    { label: 'Notices', href: '/principal/notices', icon: FileText },
    { label: 'Chat', href: '/principal/ai', icon: MessageCircle },
  ];

  const mediaLinks = [
    { label: 'Gallery', href: '/gallery', icon: ImageIcon },
    { label: 'Events', href: '/principal/school', icon: Calendar },
    { label: 'Website Media', href: '/principal/website/media', icon: ImageIcon },
  ];

  const pendingTasks = useMemo(() => {
    const items = [];

    if (pulse?.teacher?.notMarkedYet > 0) {
      items.push({
        label: `${pulse.teacher.notMarkedYet} teachers have not marked attendance`,
        href: '/principal/attendance',
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

  const recentActions = [
    { label: 'Viewed attendance pulse', time: 'Today' },
    { label: 'Checked teacher list', time: 'Today' },
    { label: 'Sent announcement to parents', time: 'Yesterday' },
    { label: 'Reviewed fee summary', time: '2 days ago' },
  ];

  const principalInitial = user?.name?.charAt(0)?.toUpperCase() || 'P';

  return (
    <ProtectedRoute allowedRoles={[ROLES.PRINCIPAL]}>
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
          {/* Top header */}
          <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white sm:h-11 sm:w-11">
                <School className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Principal Dashboard
                </p>
                <h1 className="text-lg font-semibold text-gray-900 sm:text-xl">
                  {user?.school?.name || 'Your School'}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/principal/profile"
                className="hidden rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 sm:inline-flex items-center gap-1.5"
              >
                <span>Profile</span>
              </Link>
              <Link
                href="/principal/settings"
                className="hidden rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 sm:inline-flex items-center gap-1.5"
              >
                <span>Settings</span>
              </Link>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white sm:h-10 sm:w-10">
                {principalInitial}
              </div>
            </div>
          </header>

          {/* Search + key numbers */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 shadow-sm">
              <Search className="h-4 w-4 text-gray-400" />
              <input
                type="search"
                placeholder="Search students, teachers, classes, pages..."
                className="w-full border-none bg-transparent text-sm outline-none placeholder:text-gray-400"
              />
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs text-gray-600 sm:text-sm">
              <div className="rounded-xl bg-white px-3 py-2 shadow-sm">
                <p className="text-[11px] uppercase tracking-wide text-gray-400">Students</p>
                <p className="mt-1 text-base font-semibold text-gray-900">
                  {stats.loading ? '—' : stats.students}
                </p>
              </div>
              <div className="rounded-xl bg-white px-3 py-2 shadow-sm">
                <p className="text-[11px] uppercase tracking-wide text-gray-400">Teachers</p>
                <p className="mt-1 text-base font-semibold text-gray-900">
                  {stats.loading ? '—' : stats.teachers}
                </p>
              </div>
              <div className="rounded-xl bg-white px-3 py-2 shadow-sm">
                <p className="text-[11px] uppercase tracking-wide text-gray-400">Classes</p>
                <p className="mt-1 text-base font-semibold text-gray-900">
                  {stats.loading ? '—' : stats.classes}
                </p>
              </div>
            </div>
          </section>

          {/* Quick Actions grid */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">Quick actions</h2>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="group flex flex-col items-start rounded-2xl bg-white p-3 shadow-sm ring-1 ring-gray-100 transition hover:bg-gray-50 active:scale-[0.98]"
                  >
                    <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className="text-sm font-medium text-gray-900">{action.label}</p>
                    <span className="mt-0.5 text-[11px] text-gray-500 group-hover:text-gray-600">
                      Tap to open
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Sections: Academics / Administration / Communication / Media */}
          <section className="space-y-4">
            <DashboardSection title="Academics" links={academicLinks} />
            <DashboardSection title="Administration" links={adminLinks} />
            <DashboardSection title="Communication" links={communicationLinks} />
            <DashboardSection title="Media" links={mediaLinks} />
          </section>

          {/* Pulse + pending + recent */}
          <section className="grid gap-4 sm:grid-cols-2">
            {/* Pending tasks */}
            <div className="space-y-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-900">Pending tasks</h2>
              </div>
              <ul className="space-y-2 text-sm">
                {pendingTasks.map((task) => (
                  <li key={task.label}>
                    <Link
                      href={task.href}
                      className="flex items-start gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-50"
                    >
                      <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-500" />
                      <span className="text-gray-700">{task.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recent actions */}
            <div className="space-y-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-900">Recent actions</h2>
              </div>
              <ul className="space-y-2 text-sm">
                {recentActions.map((item) => (
                  <li
                    key={item.label}
                    className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-gray-50"
                  >
                    <span className="text-gray-700">{item.label}</span>
                    <span className="text-[11px] text-gray-400">{item.time}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Compact pulse summary (below the fold, no heavy visuals) */}
          <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-blue-600" />
                <h2 className="text-sm font-semibold text-gray-900">Today&apos;s pulse</h2>
              </div>
              {pulse && (
                <span className="text-xs text-gray-500">
                  {pulse.dayName}, {pulse.date}
                </span>
              )}
            </div>

            {pulseLoading ? (
              <p className="text-xs text-gray-500">Loading today&apos;s data…</p>
            ) : pulseError ? (
              <p className="text-xs text-red-500">{pulseError}</p>
            ) : !pulse ? (
              <p className="text-xs text-gray-500">No data for today yet.</p>
            ) : (
              <div className="grid gap-3 text-xs text-gray-700 sm:grid-cols-3">
                <div className="rounded-xl bg-gray-50 px-3 py-2">
                  <p className="text-[11px] uppercase tracking-wide text-gray-400">Student attendance</p>
                  <p className="mt-1 text-base font-semibold text-gray-900">
                    {pulse.student?.attendancePercentage ?? 0}%
                  </p>
                </div>
                <div className="rounded-xl bg-gray-50 px-3 py-2">
                  <p className="text-[11px] uppercase tracking-wide text-gray-400">Teacher marked</p>
                  <p className="mt-1 text-base font-semibold text-gray-900">
                    {pulse.teacher?.presentToday ?? 0}/{pulse.teacher?.totalTeachers ?? 0}
                  </p>
                </div>
                <div className="rounded-xl bg-gray-50 px-3 py-2">
                  <p className="text-[11px] uppercase tracking-wide text-gray-400">Alerts</p>
                  <p className="mt-1 text-base font-semibold text-gray-900">
                    {pulse.alerts?.length ?? 0}
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </ProtectedRoute>
  );
}

function DashboardSection({ title, links }) {
  return (
    <div className="space-y-2 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex min-w-[120px] flex-col items-start rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-xs text-gray-700 hover:bg-gray-100"
            >
              <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-lg bg-white text-blue-600">
                <Icon className="h-4 w-4" />
              </div>
              <span className="font-medium">{item.label}</span>
              <ChevronRight className="mt-1 h-3 w-3 text-gray-400" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function TrendingUpIcon(props) {
  return <ChevronRight {...props} />;
}
