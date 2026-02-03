'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import ProtectedRoute from '@/src/components/ProtectedRoute';
import { ROLES } from '@/src/utils/constants';
import { teacherService } from '@/src/services/teacher.service';
import { profileService } from '@/src/services/profile.service';
import { useAuth } from '@/src/context/auth.context';
import { StatCard } from '@/src/components/dashboard/StatCard';
import { DashboardCard } from '@/src/components/dashboard/DashboardCard';
import { StatCardSkeleton } from '@/src/components/dashboard/LoadingSkeleton';
import {
  BookOpen,
  Users,
  ClipboardList,
  Award,
  ArrowRight,
  Calendar,
  Clock,
  ChevronRight,
  Sparkles,
  GraduationCap,
  Target,
  Zap,
  Shield,
  UserCheck,
  UserPlus,
  ListTodo,
  Lightbulb,
  Brain,
  Rocket,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// Quick Actions – only routes that exist (no admin-only)
const quickActions = [
  {
    href: '/teacher/classes',
    title: 'My Classes',
    description: 'View your assigned classes',
    icon: BookOpen,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-50',
    badgeColor: 'bg-blue-100 text-blue-800',
  },
  {
    href: '/teacher/students',
    title: 'Manage Students',
    description: 'Create & update students',
    icon: UserPlus,
    color: 'from-emerald-500 to-teal-500',
    bgColor: 'bg-gradient-to-br from-emerald-50 to-teal-50',
    badgeColor: 'bg-emerald-100 text-emerald-800',
  },
  {
    href: '/teacher/attendance',
    title: 'Mark Attendance',
    description: 'Record daily attendance',
    icon: UserCheck,
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-gradient-to-br from-amber-50 to-orange-50',
    badgeColor: 'bg-amber-100 text-amber-800',
  },
  {
    href: '/teacher/marks',
    title: 'Submit Marks',
    description: 'Enter and review grades',
    icon: Award,
    color: 'from-purple-500 to-violet-500',
    bgColor: 'bg-gradient-to-br from-purple-50 to-violet-50',
    badgeColor: 'bg-purple-100 text-purple-800',
  },
];

export default function TeacherDashboard() {
  const { user: authUser } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalClasses: 0,
    attendanceToday: 0,
    pendingTasks: 0,
    loading: true,
  });
  const [recentStudents, setRecentStudents] = useState([]);
  const [teacherName, setTeacherName] = useState(authUser?.name || 'Teacher');
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  const fetchDashboardData = async () => {
    try {
      setStats((prev) => ({ ...prev, loading: true }));

      const [dashboardRes, profileRes] = await Promise.allSettled([
        teacherService.getDashboardStats(),
        profileService.getProfile().catch(() => null),
      ]);

      const dashboard = dashboardRes.status === 'fulfilled' ? dashboardRes.value : null;
      const profile = profileRes.status === 'fulfilled' ? profileRes.value : null;

      if (profile?.name) setTeacherName(profile.name);
      else if (authUser?.name) setTeacherName(authUser.name);

      if (dashboard) {
        setStats({
          totalStudents: dashboard.totalStudents ?? 0,
          totalClasses: dashboard.totalClasses ?? 0,
          attendanceToday: dashboard.attendanceToday ?? 0,
          pendingTasks: dashboard.pendingTasks ?? 0,
          loading: false,
        });
        setRecentStudents(Array.isArray(dashboard.recentStudents) ? dashboard.recentStudents : []);
      } else {
        setStats((prev) => ({ ...prev, loading: false }));
        setRecentStudents([]);
        if (dashboardRes.status === 'rejected') {
          toast.error(dashboardRes.reason?.message || 'Failed to load dashboard');
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      toast.error('Failed to load dashboard data');
      setStats((prev) => ({ ...prev, loading: false }));
      setRecentStudents([]);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <ProtectedRoute allowedRoles={[ROLES.TEACHER]}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-6 lg:p-8 text-white shadow-xl">
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                      <GraduationCap className="h-8 w-8" />
                    </div>
                    <span className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full text-sm font-medium">
                      <Shield className="h-4 w-4" />
                      Teacher Portal
                    </span>
                  </div>
                  <h1 className="text-3xl lg:text-4xl font-bold mb-1">
                    {greeting}, {teacherName}
                  </h1>
                  <p className="text-blue-100 text-base lg:text-lg">
                    Here’s your overview for today.
                  </p>
                  <div className="flex flex-wrap items-center gap-4 mt-4">
                    <span className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-xl text-sm">
                      <Calendar className="h-4 w-4" />
                      {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-xl text-sm">
                      <Clock className="h-4 w-4" />
                      {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-white/30 flex-shrink-0">
                  <AvatarImage src={authUser?.profileImage?.url} />
                  <AvatarFallback className="bg-white/20 text-white text-2xl">
                    {teacherName?.charAt(0) || 'T'}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </motion.div>

          {/* Overview cards */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Target className="h-6 w-6 text-blue-600" />
                  Overview
                </h2>
                <p className="text-gray-600 text-sm mt-0.5">Key metrics from your classes</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchDashboardData}
                disabled={stats.loading}
                className="border-gray-300"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${stats.loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.loading ? (
                Array(4).fill(0).map((_, i) => <StatCardSkeleton key={i} />)
              ) : (
                <>
                  <StatCard
                    title="Total Students"
                    value={stats.totalStudents}
                    description="Across your classes"
                    icon={Users}
                    iconBg="bg-gradient-to-br from-emerald-500 to-teal-500"
                    loading={false}
                  />
                  <StatCard
                    title="Total Classes"
                    value={stats.totalClasses}
                    description={`${stats.totalClasses} assigned`}
                    icon={BookOpen}
                    iconBg="bg-gradient-to-br from-blue-500 to-cyan-500"
                    loading={false}
                  />
                  <StatCard
                    title="Attendance Today"
                    value={stats.attendanceToday}
                    description="Classes marked today"
                    icon={ClipboardList}
                    iconBg="bg-gradient-to-br from-amber-500 to-orange-500"
                    loading={false}
                  />
                  <StatCard
                    title="Pending Tasks"
                    value={stats.pendingTasks}
                    description="Notifications to review"
                    icon={ListTodo}
                    iconBg="bg-gradient-to-br from-purple-500 to-pink-500"
                    loading={false}
                  />
                </>
              )}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Quick Actions */}
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <DashboardCard
                title="Quick Actions"
                description="Frequently used features"
                icon={Zap}
                className="h-full"
                headerClassName="border-b border-gray-200 pb-5"
                iconColor="text-amber-600"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {quickActions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <Link
                        key={action.href}
                        href={action.href}
                        className="group block p-5 rounded-2xl border border-gray-200 hover:border-transparent hover:shadow-lg bg-white transition-all duration-300"
                      >
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-xl ${action.bgColor}`}>
                            <div className={`p-2 rounded-lg bg-gradient-to-br ${action.color} text-white`}>
                              <Icon size={22} />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 mb-1">{action.title}</h3>
                            <p className="text-sm text-gray-600 line-clamp-2">{action.description}</p>
                            <span className="inline-flex items-center gap-1 mt-2 text-sm font-medium text-blue-600 group-hover:text-blue-700">
                              Open <ArrowRight size={14} />
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </DashboardCard>
            </motion.div>

            {/* Recent Students */}
            <motion.div variants={itemVariants}>
              <DashboardCard
                title="Recent Students"
                description="Students in your classes"
                icon={Users}
                className="h-full"
                headerClassName="border-b border-gray-200 pb-5"
                iconColor="text-emerald-600"
              >
                {stats.loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100">
                        <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
                        <div className="flex-1">
                          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-2" />
                          <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentStudents.length > 0 ? (
                  <div className="space-y-2">
                    <AnimatePresence>
                      {recentStudents.slice(0, 8).map((student, index) => (
                        <motion.div
                          key={student._id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <Avatar className="h-10 w-10 flex-shrink-0">
                            <AvatarFallback className="bg-emerald-100 text-emerald-700 text-sm">
                              {(student.userId?.name || 'S').charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {student.userId?.name || 'Student'}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {student.classId?.name}-{student.classId?.section} • Roll {student.rollNumber}
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    <Link
                      href="/teacher/students"
                      className="flex items-center justify-center w-full py-3 mt-2 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                      View all students <ArrowRight size={14} className="ml-1" />
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No students in your classes yet</p>
                    <Link href="/teacher/students">
                      <Button variant="outline" size="sm" className="mt-3">
                        Add Student
                      </Button>
                    </Link>
                  </div>
                )}
              </DashboardCard>
            </motion.div>
          </div>

          {/* Inspiration strip */}
          <motion.div variants={itemVariants} className="mt-8">
            <div className="rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 p-6 text-white">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 p-3 rounded-xl">
                    <Lightbulb className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">"The art of teaching is the art of assisting discovery."</h3>
                    <p className="text-blue-100 text-sm mt-1">— Mark Van Doren</p>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center">
                    <Brain className="h-8 w-8" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-8 pt-6 border-t border-gray-200 flex flex-wrap items-center justify-between gap-2 text-sm text-gray-500">
            <span className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Secure Teacher Portal
            </span>
            <span className="flex items-center gap-2">
              <Rocket className="h-4 w-4" />
              Ready to make an impact
            </span>
          </motion.div>
        </motion.div>
      </div>
    </ProtectedRoute>
  );
}
