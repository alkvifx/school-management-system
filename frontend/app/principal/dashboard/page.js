'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import ProtectedRoute from '@/src/components/ProtectedRoute';
import { ROLES } from '@/src/utils/constants';
import { principalService } from '@/src/services/principal.service';
import { StatCard } from '@/src/components/dashboard/StatCard';
import { DashboardCard } from '@/src/components/dashboard/DashboardCard';
import { StatCardSkeleton } from '@/src/components/dashboard/LoadingSkeleton';
import {
  Users,
  GraduationCap,
  BookOpen,
  UserCheck,
  ArrowRight,
  TrendingUp,
  Calendar,
  FileText,
  Settings,
  School,
  ChevronRight,
  Sparkles,
  PhoneOutgoingIcon,
  BookImage,
  Activity,
  AlertTriangle,
  Bell,
  Loader2,
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100 }
  }
};

const quickActions = [
   {
    href: '/principal/school',
    title: 'Manage School',
    description: 'Add, remove or update school information',
    icon: School,
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-gradient-to-br from-purple-50 to-pink-50',
    count: null
  },
  {
    href: '/principal/teachers',
    title: 'Manage Teachers',
    description: 'Add, remove or update teacher profiles',
    icon: Users,
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-gradient-to-br from-purple-50 to-pink-50',
    count: null
  },
  {
    href: '/principal/students',
    title: 'Student Management',
    description: 'View and manage all students',
    icon: GraduationCap,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-50',
    count: null
  },
  {
    href: '/principal/classes',
    title: 'Class Schedule',
    description: 'Organize classes and timetable',
    icon: Calendar,
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50',
    count: null
  },
  {
    href: '/principal/assign',
    title: 'Assign Roles',
    description: 'Assign teachers and students',
    icon: UserCheck,
    color: 'from-orange-500 to-red-500',
    bgColor: 'bg-gradient-to-br from-orange-50 to-red-50',
    count: null
  },
  {
    href: '/principal/reports',
    title: 'Reports',
    description: 'View analytics and insights',
    icon: FileText,
    color: 'from-indigo-500 to-blue-500',
    bgColor: 'bg-gradient-to-br from-indigo-50 to-blue-50',
    count: null
  },
  {
    href: '/principal/notifications',
    title: 'Send Notifications',
    description: 'Send notifications to teachers and students',
    icon: Settings,
    color: 'from-gray-600 to-gray-800',
    bgColor: 'bg-gradient-to-br from-gray-50 to-gray-100',
    count: null
  },
  {
    href: '/principal/website/media',
    title: 'Website Media',
    description: 'Manage website media and content',
    icon: BookImage,
    color: 'from-green-600 to-green-800',
    bgColor: 'bg-gradient-to-br from-gray-50 to-gray-100',
    count: null
  },
  {
    href: '/principal/ai',
    title: 'AI Tools',
    description: 'AI-powered templates & insights',
    icon: Sparkles,
    color: 'from-yellow-400 to-orange-400',
    bgColor: 'bg-gradient-to-br from-yellow-50 to-orange-50',
    count: null
  }
];

const PULSE_REFRESH_MS = 3 * 60 * 1000; // 3 min

export default function PrincipalDashboard() {
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
        const [teachers, students, classes, dashboard] = await Promise.all([
          principalService.getTeachers(),
          principalService.getStudents(),
          principalService.getClasses(),
          // principalService.getPrincipalDashboard(),
        ]);
        setStats({
          teachers: teachers?.length || 0,
          students: students?.length || 0,
          classes: classes?.length || 0,
          loading: false,
          dashboard,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        setStats((prev) => ({ ...prev, loading: false }));
      }
    };
    fetchStats();
  }, []);

  const fetchPulse = async () => {
    try {
      setPulseError(null);
      const data = await principalService.getPulseToday();
      setPulse(data);
    } catch (error) {
      console.error('Error fetching pulse:', error);
      setPulseError(error.message || 'Failed to load today\'s pulse');
      setPulse(null);
    } finally {
      setPulseLoading(false);
    }
  };

  useEffect(() => {
    fetchPulse();
    const onFocus = () => fetchPulse();
    window.addEventListener('focus', onFocus);
    const interval = setInterval(fetchPulse, PULSE_REFRESH_MS);
    return () => {
      window.removeEventListener('focus', onFocus);
      clearInterval(interval);
    };
  }, []);

  // console.log(stats)

  return (
    <ProtectedRoute allowedRoles={[ROLES.PRINCIPAL]}>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 p-4 sm:p-6 lg:p-8"
      >
        <div className="max-w-7xl mx-auto">
          {/* Header with Welcome */}
          <motion.div
            variants={cardVariants}
            className="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 p-6 sm:p-8 text-white shadow-xl"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-20 -translate-x-20" />

            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <School className="w-8 h-8" />
                    <Sparkles className="w-6 h-6 text-yellow-300" />
                  </div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">
                    Welcome Back, Principal!
                  </h1>
                  <p className="text-blue-100 text-lg opacity-90">
                    Here's what's happening in your school today
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <p className="text-sm text-blue-100 mb-1">School Status</p>
                  <p className="text-2xl font-bold">All Systems Active</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-sm text-green-300">Operational</span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-white">
                    <div className="bg-blue-600/70 p-2 rounded">
                      <div className="text-xs">AI Alerts</div>
                      <div className="font-bold text-xl">{stats.dashboard?.aiAlerts ?? '—'}</div>
                    </div>
                    <div className="bg-white/10 p-2 rounded">
                      <div className="text-xs">Pending Complaints</div>
                      <div className="font-bold text-xl">{stats.dashboard?.pendingComplaints ?? '—'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Aaj School Ka Pulse – Today's School Health */}
          <motion.div variants={cardVariants} className="mb-8">
            <div className="rounded-2xl border border-gray-200 bg-white shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-4 sm:px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-white">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-lg font-bold">Aaj School Ka Pulse</h2>
                </div>
                {pulse && (
                  <span className="text-slate-300 text-sm">
                    {pulse.dayName}, {pulse.date}
                  </span>
                )}
              </div>
              <div className="p-4 sm:p-6">
                {pulseLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                    <p className="text-gray-500 text-sm">Loading today&apos;s pulse…</p>
                  </div>
                ) : pulseError ? (
                  <div className="py-8 text-center">
                    <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
                    <p className="text-gray-600">{pulseError}</p>
                    <button
                      type="button"
                      onClick={() => { setPulseLoading(true); fetchPulse(); }}
                      className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      Retry
                    </button>
                  </div>
                ) : !pulse ? (
                  <div className="py-8 text-center text-gray-500 text-sm">
                    No data for today yet.
                  </div>
                ) : (
                  <>
                    {/* Big attendance % + date */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Today&apos;s attendance</p>
                        <p className={`text-4xl sm:text-5xl font-bold ${
                          (pulse.student?.attendancePercentage ?? 0) >= 85 ? 'text-emerald-600' :
                          (pulse.student?.attendancePercentage ?? 0) >= 70 ? 'text-amber-600' : 'text-red-600'
                        }`}>
                          {pulse.student?.attendancePercentage ?? 0}%
                        </p>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <p>{pulse.dayName}</p>
                        <p>{pulse.date}</p>
                      </div>
                    </div>

                    {/* Student + Teacher cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                      <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4">
                        <div className="flex items-center gap-2 text-gray-700 mb-3">
                          <GraduationCap className="w-5 h-5 text-blue-600" />
                          <span className="font-semibold">Student attendance</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 mb-1">
                          Total: {pulse.student?.totalStudents ?? 0}
                        </p>
                        <div className="flex flex-wrap gap-3 text-sm">
                          <span className="text-emerald-600 font-medium">
                            Present: {pulse.student?.present ?? 0}
                          </span>
                          <span className="text-red-600 font-medium">
                            Absent: {pulse.student?.absent ?? 0}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Marked: {pulse.student?.totalMarked ?? 0} students
                        </p>
                      </div>
                      <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4">
                        <div className="flex items-center gap-2 text-gray-700 mb-3">
                          <Users className="w-5 h-5 text-purple-600" />
                          <span className="font-semibold">Teacher attendance</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 mb-1">
                          Total: {pulse.teacher?.totalTeachers ?? 0}
                        </p>
                        <div className="flex flex-wrap gap-3 text-sm">
                          <span className="text-emerald-600 font-medium">
                            Marked today: {pulse.teacher?.presentToday ?? 0}
                          </span>
                          {(pulse.teacher?.notMarkedYet ?? 0) > 0 && (
                            <span className="text-amber-600 font-medium">
                              Not marked: {pulse.teacher.notMarkedYet}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Top 3 lowest attendance classes */}
                    {pulse.student?.classWiseBreakdown?.length > 0 && (
                      <div className="mb-6">
                        <p className="text-sm font-semibold text-gray-700 mb-2">Lowest attendance classes (today)</p>
                        <div className="flex flex-wrap gap-2">
                          {pulse.student.classWiseBreakdown.map((c) => (
                            <span
                              key={c.classId}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${
                                (c.attendancePct ?? 100) < 70 ? 'bg-red-100 text-red-800' :
                                (c.attendancePct ?? 100) < 85 ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              <AlertTriangle className="w-4 h-4 shrink-0" />
                              {c.label} → {c.attendancePct ?? 0}%
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Alerts panel */}
                    {pulse.alerts?.length > 0 ? (
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <Bell className="w-4 h-4 text-amber-500" />
                          Key alerts
                        </p>
                        <ul className="space-y-2">
                          {pulse.alerts.map((a, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50/80 px-3 py-2 text-sm text-amber-900"
                            >
                              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                              <span>{a.message}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
                        No alerts for today.
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </motion.div>

          {/* Stats Overview */}
          <motion.div variants={cardVariants} className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">School Overview</h2>
                <p className="text-gray-600">Key metrics and statistics</p>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-blue-600">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm font-medium">Updated in real-time</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {stats.loading ? (
                <>
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                  <StatCardSkeleton />
                </>
              ) : (
                <>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:border-blue-200">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                          <Users className="w-6 h-6" />
                        </div>
                        <div className="flex items-center gap-1 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                          <TrendingUp className="w-4 h-4" />
                          <span>+12%</span>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">Total Teachers</p>
                      <p className="text-3xl font-bold text-gray-900 mb-2">{stats.teachers}</p>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: '75%' }}
                          transition={{ duration: 1, delay: 0.3 }}
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                        />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:border-blue-200">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                          <GraduationCap className="w-6 h-6" />
                        </div>
                        <div className="flex items-center gap-1 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                          <TrendingUp className="w-4 h-4" />
                          <span>+24%</span>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">Total Students</p>
                      <p className="text-3xl font-bold text-gray-900 mb-2">{stats.students}</p>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: '85%' }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                        />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:border-blue-200">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 text-white">
                          <BookOpen className="w-6 h-6" />
                        </div>
                        <div className="flex items-center gap-1 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                          <TrendingUp className="w-4 h-4" />
                          <span>+8%</span>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">Total Classes</p>
                      <p className="text-3xl font-bold text-gray-900 mb-2">{stats.classes}</p>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: '60%' }}
                          transition={{ duration: 1, delay: 0.7 }}
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                        />
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
            </div>
          </motion.div>

          {/* Quick Actions Grid */}
          <motion.div variants={cardVariants} className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
                <p className="text-gray-600">Access frequently used features</p>
              </div>
              <Link
                href="/principal/all-tools"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 group"
              >
                View all tools
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <motion.div
                    key={action.href}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: index * 0.1 }}
                    whileHover={{
                      y: -5,
                      scale: 1.02,
                      transition: { type: "spring", stiffness: 400, damping: 25 }
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link
                      href={action.href}
                      className={`block rounded-2xl p-5 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group relative overflow-hidden ${action.bgColor}`}
                    >
                      {/* Background gradient */}
                      <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-gradient-to-br ${action.color}`} />

                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-4">
                          <div className={`p-3 rounded-xl bg-gradient-to-br ${action.color} text-white shadow-md`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <ArrowRight
                            className="w-5 h-5 text-gray-400 group-hover:text-gray-700 group-hover:translate-x-1 transition-all"
                          />
                        </div>

                        <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-gray-800 transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3">
                          {action.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-500 group-hover:text-gray-700 transition-colors">
                            Click to access →
                          </span>
                          {action.count !== null && (
                            <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${action.color} text-white`}>
                              {action.count}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Recent Activity / Upcoming Events */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div variants={cardVariants}>
              <DashboardCard
                title="Recent Activity"
                description="Latest updates from your school"
                className="h-full"
              >
                <div className="space-y-4">
                  {[
                    { title: 'New teacher joined', time: '2 hours ago', color: 'bg-blue-500' },
                    { title: 'Student attendance report generated', time: '4 hours ago', color: 'bg-green-500' },
                    { title: 'Class schedule updated', time: '1 day ago', color: 'bg-purple-500' },
                    { title: 'New assignment posted', time: '2 days ago', color: 'bg-orange-500' },
                  ].map((activity, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className={`w-3 h-3 ${activity.color} rounded-full`} />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{activity.title}</p>
                        <p className="text-sm text-gray-500">{activity.time}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  ))}
                </div>
              </DashboardCard>
            </motion.div>

            <motion.div variants={cardVariants}>
              <DashboardCard
                title="Upcoming Events"
                description="What's happening next"
                className="h-full"
              >
                <div className="space-y-4">
                  {[
                    { title: 'Parent-Teacher Meeting', date: 'Tomorrow, 10:00 AM', type: 'meeting' },
                    { title: 'Annual Sports Day', date: 'Nov 25, 9:00 AM', type: 'event' },
                    { title: 'Monthly Staff Meeting', date: 'Nov 28, 3:00 PM', type: 'meeting' },
                    { title: 'Exam Schedule Review', date: 'Dec 1, 11:00 AM', type: 'review' },
                  ].map((event, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-100">
                      <div className="flex flex-col items-center justify-center p-2 bg-white rounded-lg border border-gray-200 min-w-12">
                        <span className="text-sm font-bold text-gray-900">
                          {event.type === 'meeting' ? '🎯' : event.type === 'event' ? '🏆' : '📝'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{event.title}</p>
                        <p className="text-sm text-gray-600">{event.date}</p>
                      </div>
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors">
                        View
                      </button>
                    </div>
                  ))}
                </div>
              </DashboardCard>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </ProtectedRoute>
  );
}