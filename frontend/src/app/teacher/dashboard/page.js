'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import ProtectedRoute from '@/src/components/ProtectedRoute';
import { ROLES } from '@/src/utils/constants';
import { teacherService } from '@/src/services/teacher.service';
import { profileService } from '@/src/services/profile.service';
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
  TrendingUp,
  Bell,
  Clock,
  ChevronRight,
  Sparkles,
  GraduationCap,
  Target,
  BarChart3,
  MessageSquare,
  FileText,
  Star,
  TrendingDown,
  Zap,
  Shield,
  BookMarked,
  UserCheck,
  ChartLine,
  CalendarDays,
  Trophy,
  Lightbulb,
  Brain,
  HeartHandshake,
  Rocket,
  Mic,
  PenTool,
  Layers,
  FileCheck,
  Clock4,
  CheckCircle2,
  AlertCircle,
  Megaphone,
  Coffee
} from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const quickActions = [
  {
    href: '/teacher/classes',
    title: 'My Classes',
    description: 'Manage your assigned classes',
    icon: BookOpen,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-50',
    badge: '3 Active',
    badgeColor: 'bg-blue-100 text-blue-800'
  },
  {
    href: '/teacher/attendance',
    title: 'Mark Attendance',
    description: 'Record daily attendance',
    icon: UserCheck,
    color: 'from-emerald-500 to-teal-500',
    bgColor: 'bg-gradient-to-br from-emerald-50 to-teal-50',
    badge: 'Today',
    badgeColor: 'bg-emerald-100 text-emerald-800'
  },
  {
    href: '/teacher/marks',
    title: 'Submit Marks',
    description: 'Enter and review grades',
    icon: Award,
    color: 'from-purple-500 to-violet-500',
    bgColor: 'bg-gradient-to-br from-purple-50 to-violet-50',
    badge: '2 Pending',
    badgeColor: 'bg-purple-100 text-purple-800'
  },
  {
    href: '/teacher/assignments',
    title: 'Assignments',
    description: 'Create and grade tasks',
    icon: FileText,
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-gradient-to-br from-amber-50 to-orange-50',
    badge: '4 New',
    badgeColor: 'bg-amber-100 text-amber-800'
  },
  {
    href: '/teacher/schedule',
    title: 'Schedule',
    description: 'View your timetable',
    icon: CalendarDays,
    color: 'from-rose-500 to-pink-500',
    bgColor: 'bg-gradient-to-br from-rose-50 to-pink-50',
    badge: 'Updated',
    badgeColor: 'bg-rose-100 text-rose-800'
  },
  {
    href: '/teacher/analytics',
    title: 'Analytics',
    description: 'Performance insights',
    icon: BarChart3,
    color: 'from-indigo-500 to-blue-500',
    bgColor: 'bg-gradient-to-br from-indigo-50 to-blue-50',
    badge: 'Trending ↑',
    badgeColor: 'bg-indigo-100 text-indigo-800'
  },
];

export default function TeacherDashboard() {
  const [stats, setStats] = useState({
    classes: 0,
    students: 0,
    assignments: 0,
    attendanceRate: 0,
    avgScore: 0,
    pendingTasks: 0,
    loading: true,
  });

  const [greeting, setGreeting] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [timeOfDay, setTimeOfDay] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good Morning');
      setTimeOfDay('morning');
    } else if (hour < 18) {
      setGreeting('Good Afternoon');
      setTimeOfDay('afternoon');
    } else {
      setGreeting('Good Evening');
      setTimeOfDay('evening');
    }

    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setStats(prev => ({ ...prev, loading: true }));
      setLoadingActivity(true);

      const [dashboardRes, profileRes] = await Promise.allSettled([
        teacherService.getDashboardStats(),
        profileService.getProfile().catch(() => null),
      ]);

      const dashboard = dashboardRes.status === 'fulfilled' ? dashboardRes.value : null;
      const profile = profileRes.status === 'fulfilled' ? profileRes.value : null;

      setTeacherName(profile?.name || 'Teacher');

      if (dashboard) {
        setStats({
          classes: dashboard.totalClasses ?? 0,
          students: dashboard.totalStudents ?? 0,
          attendanceRate: dashboard.attendanceToday != null ? (dashboard.totalStudents > 0 ? Math.round((dashboard.attendanceToday / dashboard.totalStudents) * 1000) / 10 : 0) : 0,
          pendingTasks: dashboard.pendingTasks ?? 0,
          loading: false,
        });
        const recent = Array.isArray(dashboard.recentStudents) ? dashboard.recentStudents : [];
        setRecentActivity(
          recent.slice(0, 5).map((s, i) => ({
            id: s._id || i,
            action: `${s.userId?.name ?? 'Student'} – ${s.classId?.name ?? ''}-${s.classId?.section ?? ''}`,
            subject: 'Student',
            time: '',
            type: 'student',
          }))
        );
      } else {
        setStats(prev => ({ ...prev, loading: false }));
        setRecentActivity([]);
        if (dashboardRes.status === 'rejected') {
          toast.error(dashboardRes.reason?.message || 'Failed to load dashboard');
        }
      }
      setUpcomingClasses([]);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
      setStats(prev => ({ ...prev, loading: false }));
      setRecentActivity([]);
      setUpcomingClasses([]);
    } finally {
      setLoadingActivity(false);
    }
  };

  const getGreetingIcon = () => {
    switch (timeOfDay) {
      case 'morning':
        return <Coffee className="h-5 w-5" />;
      case 'afternoon':
        return <Sun className="h-5 w-5" />;
      case 'evening':
        return <Moon className="h-5 w-5" />;
      default:
        return <Sparkles className="h-5 w-5" />;
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'grading':
        return <FileCheck className="h-4 w-4 text-blue-600" />;
      case 'upload':
        return <Upload className="h-4 w-4 text-emerald-600" />;
      case 'announcement':
        return <Megaphone className="h-4 w-4 text-amber-600" />;
      case 'update':
        return <PenTool className="h-4 w-4 text-purple-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <ProtectedRoute allowedRoles={[ROLES.TEACHER]}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8"
        >
          {/* Hero Header */}
          <motion.div variants={itemVariants} className="mb-8 lg:mb-12">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-6 lg:p-8 text-white shadow-2xl">
              <div className="relative z-10">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="max-w-2xl">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                        <GraduationCap className="h-8 w-8" />
                      </div>
                      <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
                        <Shield className="h-4 w-4" />
                        <span className="text-sm font-medium">Teacher Portal</span>
                      </div>
                    </div>

                    <h1 className="text-4xl lg:text-5xl font-bold mb-3">
                      <span className="block">{greeting},</span>
                      <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                        {teacherName || 'Educator'}
                      </span>
                    </h1>

                    <p className="text-blue-100 text-lg lg:text-xl max-w-xl">
                      Ready to inspire the next generation? Your dashboard is updated with today's insights.
                    </p>

                    <div className="flex flex-wrap items-center gap-4 mt-6">
                      <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm">
                        <Calendar className="h-4 w-4" />
                        <span className="font-medium">
                          {new Date().toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm">
                        <Clock className="h-4 w-4" />
                        <span className="font-medium">
                          {new Date().toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex lg:flex-col items-center gap-4">
                    <Avatar className="h-24 w-24 lg:h-32 lg:w-32 border-4 border-white/30">
                      <AvatarImage src="/api/placeholder/128/128" />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-3xl">
                        {teacherName?.charAt(0) || 'T'}
                      </AvatarFallback>
                    </Avatar>

                    <div className="text-center lg:text-right">
                      <div className="text-blue-100 text-sm mb-1">Daily Streak</div>
                      <div className="flex items-center justify-center lg:justify-end gap-2">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((day) => (
                            <div key={day} className={`w-2 h-6 rounded-full mx-0.5 ${day <= 4 ? 'bg-white' : 'bg-white/30'}`} />
                          ))}
                        </div>
                        <span className="font-bold text-xl">4 days</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-white/10 to-transparent rounded-full -translate-y-48 translate-x-48" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-white/5 to-transparent rounded-full translate-y-32 -translate-x-32" />
              <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-white/5 rounded-full blur-3xl" />
            </div>
          </motion.div>

          {/* Stats Overview */}
          <motion.div variants={itemVariants} className="mb-8 lg:mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <Target className="h-7 w-7 text-blue-600" />
                  Overview
                </h2>
                <p className="text-gray-600 mt-1">Key metrics and performance indicators</p>
              </div>
              <Button
                variant="outline"
                onClick={fetchDashboardData}
                disabled={stats.loading}
                className="border-gray-300 hover:border-gray-400"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${stats.loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.loading ? (
                Array(4).fill(0).map((_, i) => <StatCardSkeleton key={i} />)
              ) : (
                <>
                  <motion.div variants={itemVariants}>
                    <StatCard
                      title="Classes Assigned"
                      value={stats.classes}
                      description={`${stats.classes} active class${stats.classes !== 1 ? 'es' : ''}`}
                      icon={BookOpen}
                      trend="+2 this semester"
                      iconBg="bg-gradient-to-br from-blue-500 to-cyan-500"
                      trendUp={true}
                      loading={stats.loading}
                    />
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <StatCard
                      title="Total Students"
                      value={stats.students}
                      description="Across all classes"
                      icon={Users}
                      trend="↑ 12% growth"
                      iconBg="bg-gradient-to-br from-emerald-500 to-teal-500"
                      trendUp={true}
                      loading={stats.loading}
                    />
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <StatCard
                      title="Attendance Rate"
                      value={`${stats.attendanceRate}%`}
                      description="Current month average"
                      icon={UserCheck}
                      trend="↑ 2.5% from last month"
                      iconBg="bg-gradient-to-br from-amber-500 to-orange-500"
                      trendUp={true}
                      loading={stats.loading}
                    />
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <StatCard
                      title="Avg. Score"
                      value={stats.avgScore}
                      description="Class performance"
                      icon={Trophy}
                      trend="↑ 5.2 points"
                      iconBg="bg-gradient-to-br from-purple-500 to-pink-500"
                      trendUp={true}
                      loading={stats.loading}
                      isPercentage={false}
                    />
                  </motion.div>
                </>
              )}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Quick Actions */}
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <DashboardCard
                title="Quick Access"
                description="Jump to frequently used features"
                icon={Zap}
                className="h-full"
                headerClassName="border-b border-gray-200 pb-5"
                iconColor="text-amber-600"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <AnimatePresence>
                    {quickActions.map((action, index) => {
                      const Icon = action.icon;
                      return (
                        <motion.div
                          key={action.href}
                          variants={itemVariants}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ y: -4, scale: 1.02 }}
                          className="relative"
                        >
                          <Link
                            href={action.href}
                            className="group block h-full p-5 rounded-2xl border border-gray-200 hover:border-transparent transition-all duration-300 bg-white hover:shadow-xl shadow-sm"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className={`p-3 rounded-xl ${action.bgColor}`}>
                                <div className={`p-2 rounded-lg bg-gradient-to-br ${action.color} text-white`}>
                                  <Icon size={22} />
                                </div>
                              </div>

                              {action.badge && (
                                <Badge className={`${action.badgeColor} text-xs font-medium`}>
                                  {action.badge}
                                </Badge>
                              )}
                            </div>

                            <h3 className="font-bold text-gray-900 mb-2 text-lg">{action.title}</h3>
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{action.description}</p>

                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-blue-600 group-hover:text-blue-700">
                                Access →
                              </span>
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <ArrowRight size={16} className="text-blue-500" />
                              </div>
                            </div>

                            {/* Hover gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity -z-10" />
                          </Link>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </DashboardCard>
            </motion.div>

            {/* Upcoming Schedule */}
            <motion.div variants={itemVariants}>
              <DashboardCard
                title="Today's Schedule"
                description="Your upcoming classes"
                icon={Clock}
                className="h-full"
                headerClassName="border-b border-gray-200 pb-5"
                iconColor="text-emerald-600"
              >
                <div className="space-y-4">
                  <AnimatePresence>
                    {upcomingClasses.map((classItem, index) => (
                      <motion.div
                        key={classItem.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group p-4 rounded-xl border border-gray-200 bg-white hover:bg-gradient-to-r hover:from-white hover:to-emerald-50/50 transition-all duration-300 hover:border-emerald-200 cursor-pointer"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-semibold text-gray-900 bg-gray-100 px-2 py-1 rounded">
                                {classItem.time}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {classItem.duration}
                              </Badge>
                            </div>
                            <h4 className="font-bold text-gray-900 mb-1">{classItem.subject}</h4>
                            <p className="text-sm text-gray-600">Class {classItem.class}</p>
                          </div>
                          <div className="flex flex-col items-end">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 mb-2 animate-pulse" />
                            <ChevronRight size={16} className="text-gray-400 group-hover:text-emerald-600 transition-colors" />
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Starts in</span>
                            <span className="text-sm font-medium text-gray-900">
                              {classItem.time.includes('AM') ? 'Morning' : 'Afternoon'} session
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* No classes placeholder */}
                  {upcomingClasses.length === 0 && !loadingActivity && (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No classes scheduled for today</p>
                      <p className="text-sm text-gray-400 mt-1">Enjoy your day off!</p>
                    </div>
                  )}
                </div>

                {/* View All Schedule */}
                <div className="mt-6 pt-5 border-t border-gray-200">
                  <Link
                    href="/teacher/schedule"
                    className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all hover:shadow-sm"
                  >
                    <CalendarDays className="h-4 w-4 mr-2" />
                    View Weekly Schedule
                    <ChevronRight size={16} className="ml-auto" />
                  </Link>
                </div>
              </DashboardCard>
            </motion.div>
          </div>

          {/* Recent Activity & Performance */}
          <motion.div variants={itemVariants} className="mt-8 lg:mt-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {/* Recent Activity */}
              <DashboardCard
                title="Recent Activity"
                description="Your latest actions"
                icon={Activity}
                className="h-full"
                headerClassName="border-b border-gray-200 pb-5"
                iconColor="text-blue-600"
              >
                <div className="space-y-4">
                  <AnimatePresence>
                    {loadingActivity ? (
                      Array(3).fill(0).map((_, i) => (
                        <div key={i} className="p-4 rounded-xl border border-gray-200 bg-white">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse" />
                            <div className="flex-1">
                              <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                              <div className="h-3 bg-gray-200 rounded animate-pulse w-24" />
                            </div>
                          </div>
                        </div>
                      ))
                    ) : recentActivity.length > 0 ? (
                      recentActivity.map((activity, index) => (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="group p-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                                {getActivityIcon(activity.type)}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className="font-medium text-gray-900">{activity.action}</p>
                                <span className="text-xs text-gray-500 whitespace-nowrap">{activity.time}</span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{activity.subject}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                          <Activity className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500">No recent activity</p>
                        <p className="text-sm text-gray-400 mt-1">Start by creating your first class</p>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </DashboardCard>

              {/* Performance Metrics */}
              <DashboardCard
                title="Performance Insights"
                description="Your teaching analytics"
                icon={ChartLine}
                className="h-full"
                headerClassName="border-b border-gray-200 pb-5"
                iconColor="text-purple-600"
              >
                <div className="space-y-6">
                  {/* Attendance Progress */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">Attendance Rate</span>
                      <span className="text-sm font-bold text-emerald-600">{stats.attendanceRate}%</span>
                    </div>
                    <Progress value={stats.attendanceRate} className="h-2" />
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500">Target: 95%</span>
                      <span className="text-xs text-emerald-600">↑ 2.5% from last month</span>
                    </div>
                  </div>

                  {/* Assignment Completion */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">Assignment Completion</span>
                      <span className="text-sm font-bold text-blue-600">78%</span>
                    </div>
                    <Progress value={78} className="h-2" />
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500">5 pending reviews</span>
                      <span className="text-xs text-blue-600">Due tomorrow</span>
                    </div>
                  </div>

                  {/* Student Performance */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">Avg. Student Score</span>
                      <span className="text-sm font-bold text-amber-600">{stats.avgScore}/100</span>
                    </div>
                    <Progress value={stats.avgScore} className="h-2" />
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500">Class average</span>
                      <span className="text-xs text-amber-600">↑ 5.2 points improvement</span>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                    <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                      <div className="text-2xl font-bold text-blue-700">{stats.pendingTasks}</div>
                      <div className="text-xs text-blue-600 font-medium">Pending Tasks</div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl">
                      <div className="text-2xl font-bold text-emerald-700">{stats.assignments}</div>
                      <div className="text-xs text-emerald-600 font-medium">Assignments</div>
                    </div>
                  </div>
                </div>
              </DashboardCard>
            </div>
          </motion.div>

          {/* Daily Inspiration */}
          <motion.div
            variants={itemVariants}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 lg:mt-12"
          >
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 p-6 lg:p-8 text-white">
              <div className="relative z-10">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="max-w-2xl">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                        <Lightbulb className="h-6 w-6" />
                      </div>
                      <span className="text-sm font-medium text-blue-100">Daily Inspiration</span>
                    </div>
                    <h3 className="text-2xl lg:text-3xl font-bold mb-3">
                      "The art of teaching is the art of assisting discovery."
                    </h3>
                    <p className="text-blue-100 text-lg">
                      — Mark Van Doren
                    </p>
                    <div className="flex items-center gap-4 mt-6">
                      <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Teaching Tip
                      </Badge>
                      <span className="text-blue-100 text-sm">
                        Today's focus: Active learning strategies
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 lg:w-32 lg:h-32 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <Brain className="h-12 w-12 lg:h-16 lg:w-16" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-white/10 to-transparent rounded-full -translate-y-24 translate-x-24" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-white/5 to-transparent rounded-full translate-y-16 -translate-x-16" />
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div
            variants={itemVariants}
            className="mt-8 lg:mt-12 pt-6 border-t border-gray-200"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Secure Teacher Portal
                </span>
                <span className="hidden sm:inline">•</span>
                <span>Last sync: Just now</span>
              </div>
              <div className="mt-3 sm:mt-0">
                <span className="flex items-center gap-2">
                  <Rocket className="h-4 w-4" />
                  Ready to make an impact
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </ProtectedRoute>
  );
}

// Add missing icon components
const Sun = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const Moon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

const Activity = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const Upload = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

const RefreshCw = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);