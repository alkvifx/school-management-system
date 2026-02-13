// StudentDashboard.js
'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import ProtectedRoute from '@/src/components/ProtectedRoute';
import { ROLES } from '@/src/utils/constants';
import { studentService } from '@/src/services/student.service';
import { leaderboardService } from '@/src/services/leaderboard.service';
import { StatCard } from '@/src/components/dashboard/StatCard';
import { DashboardCard } from '@/src/components/dashboard/DashboardCard';
import { StatCardSkeleton } from '@/src/components/dashboard/LoadingSkeleton';
import { FeesStatusBanner } from '@/src/components/fees/FeesStatusBanner';
import { useStudentFeeStatus } from '@/src/hooks/useStudentFeeStatus';
import { NoticeBanner } from '@/src/components/notices/NoticeBanner';
import { useDashboardNotices } from '@/src/hooks/useDashboardNotices';
import {
  ClipboardList,
  Award,
  User,
  ArrowRight,
  Loader2,
  TrendingUp,
  Calendar,
  Clock,
  Bell,
  BookOpen,
  GraduationCap,
  Target,
  Trophy,
  Sparkles,
  Shield,
  Zap,
  Brain,
  Lightbulb,
  Star,
  Users,
  BarChart3,
  MessageSquare,
  FileText,
  Download,
  Eye,
  Heart,
  Rocket,
  Coffee,
  Sun,
  Moon,
  Activity,
  CheckCircle2,
  AlertCircle,
  Clock4,
  CalendarDays,
  Target as TargetIcon,
  BrainCircuit,
  Flame,
  Crown,
  Medal,
  TrendingUp as TrendingUpIcon,
  ChevronRight,
  Settings,
  BookMarked,
  Calculator,
  Microscope,
  Globe,
  Music,
  Paintbrush,
  Dumbbell,
  Languages,
  Code,
  Atom
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

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
    href: '/student/leaderboard',
    title: 'Leaderboard',
    description: 'Stars, ranks & classmates',
    icon: Trophy,
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-gradient-to-br from-amber-50 to-orange-50',
    badge: '⭐',
    badgeColor: 'bg-amber-100 text-amber-800'
  },
  {
    href: '/student/attendance',
    title: 'Attendance Tracker',
    description: 'Monitor your daily presence',
    icon: ClipboardList,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-50',
    badge: null,
    badgeColor: 'bg-emerald-100 text-emerald-800'
  },
  {
    href: '/student/marks',
    title: 'Performance Hub',
    description: 'View grades & analytics',
    icon: Award,
    color: 'from-purple-500 to-violet-500',
    bgColor: 'bg-gradient-to-br from-purple-50 to-violet-50',
    badge: 'A+',
    badgeColor: 'bg-purple-100 text-purple-800'
  },
  {
    href: '/student/timetable',
    title: 'Smart Schedule',
    description: 'Your weekly timetable',
    icon: CalendarDays,
    color: 'from-emerald-500 to-teal-500',
    bgColor: 'bg-gradient-to-br from-emerald-50 to-teal-50',
    badge: 'Today',
    badgeColor: 'bg-emerald-100 text-emerald-800'
  },
  {
    href: '/student/assignments',
    title: 'Assignments',
    description: 'Pending work & deadlines',
    icon: BookOpen,
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-gradient-to-br from-amber-50 to-orange-50',
    badge: '3 New',
    badgeColor: 'bg-amber-100 text-amber-800'
  },
  {
    href: '/student/resources',
    title: 'Study Resources',
    description: 'Notes & materials',
    icon: FileText,
    color: 'from-rose-500 to-pink-500',
    bgColor: 'bg-gradient-to-br from-rose-50 to-pink-50',
    badge: 'Updated',
    badgeColor: 'bg-rose-100 text-rose-800'
  },
  {
    href: '/student/chat',
    title: 'Class Chat',
    description: 'Connect with classmates',
    icon: MessageSquare,
    color: 'from-indigo-500 to-blue-500',
    bgColor: 'bg-gradient-to-br from-indigo-50 to-blue-50',
    badge: '12 Online',
    badgeColor: 'bg-indigo-100 text-indigo-800'
  },
];

const subjects = [
  { name: 'Mathematics', icon: Calculator, color: 'from-blue-500 to-cyan-500', score: 92 },
  { name: 'Physics', icon: Atom, color: 'from-purple-500 to-violet-500', score: 88 },
  { name: 'Chemistry', icon: Microscope, color: 'from-emerald-500 to-teal-500', score: 85 },
  { name: 'English', icon: Languages, color: 'from-amber-500 to-orange-500', score: 90 },
  { name: 'Computer Science', icon: Code, color: 'from-rose-500 to-pink-500', score: 95 },
];

export default function StudentDashboard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');
  const [timeOfDay, setTimeOfDay] = useState('');
  const [stats, setStats] = useState({
    attendance: 0,
    overallScore: 0,
    streak: 0,
    assignments: 2,
    rank: null,
    totalStudents: 0,
    improvement: '',
    totalStars: 0
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [showNotifications, setShowNotifications] = useState(false);
  const [dismissedFeeBanner, setDismissedFeeBanner] = useState(false);
  const [todaysSchedule, setTodaysSchedule] = useState([
    { time: '09:00', subject: 'Mathematics', room: 'Room 301', teacher: 'Mr. Sharma' },
    { time: '10:30', subject: 'Physics', room: 'Lab 202', teacher: 'Ms. Verma' },
    { time: '12:00', subject: 'English', room: 'Room 105', teacher: 'Mr. Johnson' },
    { time: '01:30', subject: 'Computer Science', room: 'Lab 303', teacher: 'Mr. Gupta' },
  ]);

  // Fetch fee status with polling every 90 seconds and refetch on focus
  const { status: feeStatus, loading: feeLoading, refetch: refetchFeeStatus } = useStudentFeeStatus({
    pollInterval: 90000, // 90 seconds
    refetchOnFocus: true,
  });

  // Fetch dashboard notices with polling every 120 seconds and refetch on focus
  const { notices, loading: noticesLoading } = useDashboardNotices({
    pollInterval: 120000, // 120 seconds
    refetchOnFocus: true,
    limit: 3,
  });

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

    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await studentService.getProfile();
      setProfile(data);

      try {
        const rankData = await leaderboardService.getMyRank('weekly');
        setStats((prev) => ({
          ...prev,
          totalStars: rankData.totalStars ?? 0,
          attendance: rankData.attendancePercentage ?? 0,
          overallScore: rankData.academicScore ?? 0,
          rank: rankData.classRank ?? rankData.schoolRank ?? null,
          improvement: prev.rank != null && rankData.classRank != null && rankData.classRank < prev.rank ? '↑ Ranks' : ''
        }));
      } catch (_) {
        setStats((prev) => ({ ...prev, totalStars: 0, attendance: 0, overallScore: 0, rank: null }));
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getGreetingIcon = () => {
    switch (timeOfDay) {
      case 'morning': return <Sun className="h-5 w-5" />;
      case 'afternoon': return <Coffee className="h-5 w-5" />;
      case 'evening': return <Moon className="h-5 w-5" />;
      default: return <Sparkles className="h-5 w-5" />;
    }
  };

  const getStreakMessage = (streak) => {
    if (streak >= 14) return "🔥 Fire streak! Keep it up!";
    if (streak >= 7) return "🎯 Excellent consistency!";
    if (streak >= 3) return "👍 Good going!";
    return "💪 Start your streak today!";
  };

  return (
    <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
      <div className="app-bg-texture min-h-screen">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8"
        >
          {/* Hero Header */}
          <motion.div variants={itemVariants} className="mb-8 lg:mb-12">
            <div
              className="relative overflow-hidden rounded-[var(--app-radius-lg)] p-6 lg:p-8 text-white shadow-[var(--app-shadow-lg)]"
              style={{ backgroundColor: 'hsl(var(--app-accent))' }}
            >
              <div className="relative z-10">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="max-w-2xl">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                        <GraduationCap className="h-8 w-8" />
                      </div>
                      <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
                        <Shield className="h-4 w-4" />
                        <span className="text-sm font-medium">Student Portal</span>
                      </div>
                    </div>

                    <h1 className="text-4xl lg:text-5xl font-bold mb-3">
                      {greeting},
                      <span className="block bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                        {profile?.user?.name || profile?.name || 'Champion'}!
                      </span>
                    </h1>

                    <p className="text-white/90 text-lg lg:text-xl">
                      Ready to conquer today's learning journey?
                    </p>

                    {/* Stats Overview */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                      <div className="bg-white/10 backdrop-blur-sm rounded-[var(--app-radius)] p-4">
                        <div className="flex items-center gap-3">
                          <Target className="h-5 w-5" />
                          <div>
                            <p className="text-sm text-white/80">Overall Score</p>
                            <p className="text-2xl font-bold">{stats.overallScore}%</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-[var(--app-radius)] p-4">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="h-5 w-5" />
                          <div>
                            <p className="text-sm text-white/80">Attendance</p>
                            <p className="text-2xl font-bold">{stats.attendance}%</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-[var(--app-radius)] p-4">
                        <div className="flex items-center gap-3">
                          <Flame className="h-5 w-5" />
                          <div>
                            <p className="text-sm text-white/80">Streak</p>
                            <p className="text-2xl font-bold">{stats.streak} days</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-[var(--app-radius)] p-4">
                        <div className="flex items-center gap-3">
                          <Crown className="h-5 w-5" />
                          <div>
                            <p className="text-sm text-white/80">Class Rank</p>
                            <p className="text-2xl font-bold">{stats.rank != null ? `#${stats.rank}` : '—'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center lg:items-end gap-4">
                    <Avatar className="h-24 w-24 lg:h-32 lg:w-32 border-4 border-white/30">
                      <AvatarImage src="/api/placeholder/128/128" />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-3xl">
                        {profile?.name?.charAt(0) || 'S'}
                      </AvatarFallback>
                    </Avatar>

                    <div className="text-center lg:text-right">
                      <div className="text-white/90 text-sm mb-2">Learning Streak</div>
                      <div className="flex items-center justify-center lg:justify-end gap-2">
                        <div className="flex">
                          {[...Array(7)].map((_, i) => (
                            <div
                              key={i}
                              className={cn(
                                "w-2 h-6 rounded-full mx-0.5",
                                i < stats.streak
                                  ? "bg-gradient-to-b from-yellow-400 to-orange-500"
                                  : "bg-white/30"
                              )}
                            />
                          ))}
                        </div>
                        <Badge className="bg-white/20 text-white border-0">
                          {stats.streak} days
                        </Badge>
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

          {/* Fees Status Banner */}
          {!dismissedFeeBanner && (
            <motion.div variants={itemVariants} className="mb-6">
              <FeesStatusBanner
                status={feeStatus}
                loading={feeLoading}
                onDismiss={() => setDismissedFeeBanner(true)}
              />
            </motion.div>
          )}

          {/* Notice Banner */}
          <motion.div variants={itemVariants} className="mb-6">
            <NoticeBanner
              notices={notices}
              loading={noticesLoading}
            />
          </motion.div>

          {/* Stats Overview */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {loading ? (
                Array(4).fill(0).map((_, i) => <StatCardSkeleton key={i} />)
              ) : (
                <>
                  <StatCard
                    title="Academic Score"
                    value={`${stats.overallScore}%`}
                    description="Overall performance"
                    icon={Trophy}
                    trend="up"
                    trendValue={stats.improvement}
                    iconBg="bg-gradient-to-br from-amber-500 to-orange-500"
                  />
                  <StatCard
                    title="Attendance"
                    value={`${stats.attendance}%`}
                    description="This month"
                    icon={CheckCircle2}
                    trend="up"
                    trendValue="↑ 2%"
                    iconBg="bg-gradient-to-br from-emerald-500 to-teal-500"
                  />
                  <StatCard
                    title="Class Rank"
                    value={stats.rank != null ? `#${stats.rank}` : '—'}
                    description={stats.totalStars > 0 ? `${stats.totalStars} stars` : 'Stars & rank'}
                    icon={Crown}
                    trend="up"
                    trendValue={stats.improvement || (stats.totalStars > 0 ? '⭐' : '')}
                    iconBg="bg-gradient-to-br from-purple-500 to-pink-500"
                  />
                  <StatCard
                    title="Active Streak"
                    value={`${stats.streak} days`}
                    description={getStreakMessage(stats.streak)}
                    icon={Flame}
                    trend="up"
                    trendValue="🔥 Hot"
                    iconBg="bg-gradient-to-br from-red-500 to-orange-500"
                  />
                </>
              )}
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Left Column - Quick Actions */}
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <DashboardCard
                title="Quick Access"
                description="Everything you need, instantly"
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
                            className="group block h-full p-5 rounded-[var(--app-radius-lg)] border border-[hsl(var(--app-border))] transition-all duration-300 bg-[hsl(var(--app-surface))] hover:shadow-[var(--app-shadow-lg)] shadow-[var(--app-shadow)]"
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
                              <span className="text-sm font-medium text-[hsl(var(--app-accent))]">
                                Explore →
                              </span>
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <ChevronRight size={16} className="text-[hsl(var(--app-accent))]" />
                              </div>
                            </div>

                            {/* Hover gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[hsl(var(--app-accent))]/5 opacity-0 group-hover:opacity-100 rounded-[var(--app-radius-lg)] transition-opacity -z-10" />
                          </Link>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </DashboardCard>
            </motion.div>

            {/* Right Column - Today's Schedule */}
            <motion.div variants={itemVariants}>
              <DashboardCard
                title="Today's Schedule"
                description="Your classes for today"
                icon={Calendar}
                className="h-full"
                headerClassName="border-b border-gray-200 pb-5"
                iconColor="text-emerald-600"
              >
                <div className="space-y-4">
                  <AnimatePresence>
                    {todaysSchedule.map((classItem, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group p-4 rounded-[var(--app-radius)] border border-[hsl(var(--app-border))] bg-[hsl(var(--app-surface))] hover:bg-[hsl(var(--app-sage-muted))]/50 transition-all duration-300"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="font-mono">
                                {classItem.time}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {classItem.room}
                              </Badge>
                            </div>
                            <h4 className="font-bold text-gray-900 mb-1">{classItem.subject}</h4>
                            <p className="text-sm text-gray-600">{classItem.teacher}</p>
                          </div>
                          <div className="flex flex-col items-end">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 mb-2 animate-pulse" />
                            <ChevronRight size={16} className="text-[hsl(var(--app-text-muted))] group-hover:text-[hsl(var(--app-sage))] transition-colors" />
                          </div>
                        </div>

                        {/* Countdown Timer */}
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Starts in</span>
                            <span className="text-sm font-medium text-gray-900">
                              {classItem.time.includes('09') ? 'Morning' : 'Afternoon'} session
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* View Full Schedule */}
                <div className="mt-6 pt-5 border-t border-gray-200">
                  <Link
                    href="/student/timetable"
                    className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-[hsl(var(--app-text))] bg-[hsl(var(--app-accent-muted))] hover:opacity-90 rounded-[var(--app-radius)] transition-all min-h-[44px]"
                  >
                    <CalendarDays className="h-4 w-4 mr-2" />
                    View Weekly Schedule
                    <ChevronRight size={16} className="ml-auto" />
                  </Link>
                </div>
              </DashboardCard>
            </motion.div>
          </div>

          {/* Subjects Performance */}
          <motion.div variants={itemVariants} className="mt-8">
            <DashboardCard
              title="Subject Performance"
              description="Your scores across subjects"
              icon={BarChart3}
              className="h-full"
              headerClassName="border-b border-gray-200 pb-5"
              iconColor="text-blue-600"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {subjects.map((subject, index) => {
                  const Icon = subject.icon;
                  return (
                    <motion.div
                      key={subject.name}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -4 }}
                      className="group"
                    >
                      <div className="p-5 rounded-2xl border border-gray-200 bg-white hover:shadow-lg transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                          <div className={`p-3 rounded-xl bg-gradient-to-br ${subject.color} text-white`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <Badge className={cn(
                            "text-xs font-bold",
                            subject.score >= 90 ? "bg-emerald-100 text-emerald-800" :
                            subject.score >= 80 ? "bg-blue-100 text-blue-800" :
                            subject.score >= 70 ? "bg-amber-100 text-amber-800" :
                            "bg-rose-100 text-rose-800"
                          )}>
                            {subject.score}%
                          </Badge>
                        </div>

                        <h4 className="font-bold text-gray-900 mb-2">{subject.name}</h4>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs text-gray-600">
                            <span>Progress</span>
                            <span>{subject.score}%</span>
                          </div>
                          <Progress
                            value={subject.score}
                            className="h-2"
                            indicatorClassName={cn(
                              subject.score >= 90 ? "bg-emerald-500" :
                              subject.score >= 80 ? "bg-blue-500" :
                              subject.score >= 70 ? "bg-amber-500" :
                              "bg-rose-500"
                            )}
                          />
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Grade</span>
                            <span className="font-medium">
                              {subject.score >= 90 ? 'A+' :
                               subject.score >= 80 ? 'A' :
                               subject.score >= 70 ? 'B' :
                               subject.score >= 60 ? 'C' : 'D'}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <Link
                            href={`/student/subjects/${subject.name.toLowerCase().replace(/\s+/g, '-')}`}
                            className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
                          >
                            View Details
                            <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </DashboardCard>
          </motion.div>

          {/* Bottom Section - Upcoming & Motivation */}
          <motion.div variants={itemVariants} className="mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {/* Upcoming Deadlines */}
              <DashboardCard
                title="Upcoming Deadlines"
                description="Stay on top of your assignments"
                icon={Clock}
                className="h-full"
                headerClassName="border-b border-gray-200 pb-5"
                iconColor="text-amber-600"
              >
                <div className="space-y-4">
                  {[
                    { task: 'Physics Project', due: 'Tomorrow', subject: 'Physics', priority: 'high' },
                    { task: 'Math Worksheet', due: 'In 2 days', subject: 'Mathematics', priority: 'medium' },
                    { task: 'English Essay', due: 'In 3 days', subject: 'English', priority: 'low' },
                    { task: 'Chemistry Lab Report', due: 'Next Week', subject: 'Chemistry', priority: 'medium' },
                  ].map((assignment, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-2 rounded-lg",
                          assignment.priority === 'high' ? "bg-red-50" :
                          assignment.priority === 'medium' ? "bg-amber-50" :
                          "bg-blue-50"
                        )}>
                          {assignment.priority === 'high' ? (
                            <AlertCircle className="h-4 w-4 text-red-600" />
                          ) : assignment.priority === 'medium' ? (
                            <Clock4 className="h-4 w-4 text-amber-600" />
                          ) : (
                            <Clock className="h-4 w-4 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{assignment.task}</p>
                          <p className="text-sm text-gray-600">{assignment.subject}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{assignment.due}</p>
                        <Badge variant="outline" className="text-xs mt-1">
                          {assignment.priority} priority
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </DashboardCard>

              {/* Daily Motivation */}
              <DashboardCard
                title="Daily Motivation"
                description="Fuel for your learning journey"
                icon={Brain}
                className="h-full"
                headerClassName="border-b border-gray-200 pb-5"
                iconColor="text-purple-600"
              >
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 p-6">
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-white/80 p-3 rounded-xl backdrop-blur-sm">
                        <Lightbulb className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">Today's Learning Tip</h4>
                        <p className="text-sm text-purple-600">Active Recall Technique</p>
                      </div>
                    </div>

                    <p className="text-lg italic text-gray-700 mb-4">
                      "The beautiful thing about learning is that no one can take it away from you."
                    </p>
                    <p className="text-sm text-gray-600 mb-6">— B.B. King</p>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-purple-500" />
                        <span className="text-sm text-gray-700">Review previous notes for 15 minutes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-purple-500" />
                        <span className="text-sm text-gray-700">Practice 5 math problems</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-purple-500" />
                        <span className="text-sm text-gray-700">Read one chapter ahead</span>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-purple-200">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-purple-600">Learning Progress</span>
                        <span className="text-sm font-medium text-purple-700">65% completed</span>
                      </div>
                      <Progress value={65} className="h-2 mt-2" indicatorClassName="bg-purple-500" />
                    </div>
                  </div>

                  {/* Decorative elements */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full -translate-y-16 translate-x-16" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-100/20 to-transparent rounded-full translate-y-12 -translate-x-12" />
                </div>
              </DashboardCard>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div
            variants={itemVariants}
            className="mt-8 lg:mt-12 pt-6 border-t border-[hsl(var(--app-border))]"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-[hsl(var(--app-text-muted))]">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Secure Student Portal
                </span>
                <span className="hidden sm:inline">•</span>
                <span>Last updated: Just now</span>
              </div>
              <div className="mt-3 sm:mt-0">
                <span className="flex items-center gap-2">
                  <Rocket className="h-4 w-4" />
                  Ready to achieve greatness
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </ProtectedRoute>
  );
}