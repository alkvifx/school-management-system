'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProtectedRoute from '@/src/components/ProtectedRoute';
import { ROLES } from '@/src/utils/constants';
import { teacherService } from '@/src/services/teacher.service';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  BookOpen,
  Loader2,
  Users,
  Calendar,
  Clock,
  TrendingUp,
  ChevronRight,
  Search,
  Filter,
  GraduationCap,
  BarChart3,
  Eye,
  MessageSquare,
  FileText,
  Award,
  UserCheck,
  MoreVertical,
  Plus,
  BookMarked,
  Target,
  Zap,
  Sparkles,
  Shield,
  Brain,
  Layers,
  Clock4,
  ChartColumnIncreasing,
  UserPlus,
  Mail,
  Download,
  ArrowUpRight,
  Star,
  CheckCircle2,
  AlertCircle,
  Trophy
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

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

export default function TeacherClassesPage() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    avgAttendance: 0,
    avgScore: 0,
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [classes]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const data = await teacherService.getClasses();

      console.log(data)

      // Enhanced mock data with more details for demonstration
      const enhancedClasses = (data || []).map((classItem, index) => ({
        ...classItem,
        grade: classItem.name || '10',
        section: classItem.section || 'A',
        subject: ['Mathematics', 'Physics', 'Chemistry', 'Biology'][index % 4] || 'General',
        studentCount: Math.floor(Math.random() * 20) + 15,
        attendanceRate: 80 + Math.floor(Math.random() * 20),
        avgScore: 65 + Math.floor(Math.random() * 30),
        nextSession: ['Mon 9:00 AM', 'Tue 10:30 AM', 'Wed 2:00 PM', 'Thu 11:00 AM'][index % 4],
        recentActivity: ['Assignment due', 'Test scheduled', 'New material added', 'Parent meeting'][index % 4],
        color: ['blue', 'green', 'purple', 'orange', 'red', 'cyan'][index % 6],
        icon: [BookOpen, GraduationCap, Brain, Layers, Target, ChartColumnIncreasing][index % 6],
      }));

      setClasses(enhancedClasses);

    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    if (classes.length === 0) return;

    const totalStudents = classes.reduce((sum, cls) => sum + (cls.studentCount || 0), 0);
    const avgAttendance = classes.reduce((sum, cls) => sum + (cls.attendanceRate || 0), 0) / classes.length;
    const avgScore = classes.reduce((sum, cls) => sum + (cls.avgScore || 0), 0) / classes.length;

    setStats({
      totalClasses: classes.length,
      totalStudents,
      avgAttendance: Math.round(avgAttendance),
      avgScore: Math.round(avgScore),
    });
  };

  const filteredClasses = classes.filter(cls => {
    const matchesSearch =
      cls.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${cls.grade} ${cls.section}`.toLowerCase().includes(searchQuery.toLowerCase());

    if (filter === 'all') return matchesSearch;
    if (filter === 'high-attendance') return cls.attendanceRate >= 90 && matchesSearch;
    if (filter === 'high-performance') return cls.avgScore >= 80 && matchesSearch;
    if (filter === 'large-class') return cls.studentCount >= 25 && matchesSearch;

    return matchesSearch;
  });

  const getColorClasses = (color) => {
    const colorMap = {
      blue: {
        bg: 'bg-gradient-to-br from-blue-500 to-cyan-500',
        light: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        progress: 'bg-blue-600',
      },
      green: {
        bg: 'bg-gradient-to-br from-emerald-500 to-teal-500',
        light: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        progress: 'bg-emerald-600',
      },
      purple: {
        bg: 'bg-gradient-to-br from-purple-500 to-violet-500',
        light: 'bg-purple-50',
        text: 'text-purple-700',
        border: 'border-purple-200',
        progress: 'bg-purple-600',
      },
      orange: {
        bg: 'bg-gradient-to-br from-amber-500 to-orange-500',
        light: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        progress: 'bg-amber-600',
      },
      red: {
        bg: 'bg-gradient-to-br from-rose-500 to-pink-500',
        light: 'bg-rose-50',
        text: 'text-rose-700',
        border: 'border-rose-200',
        progress: 'bg-rose-600',
      },
      cyan: {
        bg: 'bg-gradient-to-br from-cyan-500 to-blue-500',
        light: 'bg-cyan-50',
        text: 'text-cyan-700',
        border: 'border-cyan-200',
        progress: 'bg-cyan-600',
      },
    };

    return colorMap[color] || colorMap.blue;
  };

  const getPerformanceBadge = (score) => {
    if (score >= 90) return { label: 'Excellent', color: 'bg-emerald-100 text-emerald-800' };
    if (score >= 80) return { label: 'Good', color: 'bg-blue-100 text-blue-800' };
    if (score >= 70) return { label: 'Average', color: 'bg-amber-100 text-amber-800' };
    return { label: 'Needs Improvement', color: 'bg-rose-100 text-rose-800' };
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
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-8 lg:mb-12">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 p-6 lg:p-8 text-white shadow-2xl">
              <div className="relative z-10">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="max-w-2xl">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                        <BookOpen className="h-8 w-8" />
                      </div>
                      <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
                        <Shield className="h-4 w-4" />
                        <span className="text-sm font-medium">My Classes</span>
                      </div>
                    </div>

                    <h1 className="text-4xl lg:text-5xl font-bold mb-3">
                      Manage Your
                      <span className="block bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                        Classes & Students
                      </span>
                    </h1>

                    <p className="text-blue-100 text-lg lg:text-xl">
                      Track performance, attendance, and engagement across all your classes
                    </p>

                    {/* Stats Overview */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                        <div className="flex items-center gap-3">
                          <BookOpen className="h-5 w-5" />
                          <div>
                            <p className="text-sm text-blue-200">Total Classes</p>
                            <p className="text-2xl font-bold">{stats.totalClasses}</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                        <div className="flex items-center gap-3">
                          <Users className="h-5 w-5" />
                          <div>
                            <p className="text-sm text-blue-200">Total Students</p>
                            <p className="text-2xl font-bold">{stats.totalStudents}</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                        <div className="flex items-center gap-3">
                          <UserCheck className="h-5 w-5" />
                          <div>
                            <p className="text-sm text-blue-200">Avg. Attendance</p>
                            <p className="text-2xl font-bold">{stats.avgAttendance}%</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                        <div className="flex items-center gap-3">
                          <TrendingUp className="h-5 w-5" />
                          <div>
                            <p className="text-sm text-blue-200">Avg. Score</p>
                            <p className="text-2xl font-bold">{stats.avgScore}%</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 lg:w-32 lg:h-32 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <Layers className="h-12 w-12 lg:h-16 lg:w-16" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-white/10 to-transparent rounded-full -translate-y-48 translate-x-48" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-white/5 to-transparent rounded-full translate-y-32 -translate-x-32" />
            </div>
          </motion.div>

          {/* Search and Filter Bar */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="bg-white rounded-2xl shadow-lg border p-4 lg:p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Search classes by name, subject, or grade..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-[180px] border-gray-300">
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        <SelectValue placeholder="Filter classes" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes</SelectItem>
                      <SelectItem value="high-attendance">High Attendance (90%+)</SelectItem>
                      <SelectItem value="high-performance">High Performance (80%+)</SelectItem>
                      <SelectItem value="large-class">Large Classes (25+ students)</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    onClick={fetchClasses}
                    disabled={loading}
                    className="border-gray-300 hover:border-gray-400"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Classes Grid */}
          <motion.div variants={itemVariants}>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-96 bg-gray-200 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : filteredClasses.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16 lg:py-24"
              >
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No Classes Found</h3>
                <p className="text-gray-600 max-w-md mx-auto mb-6">
                  {searchQuery || filter !== 'all'
                    ? "No classes match your search criteria. Try adjusting your filters."
                    : "You haven't been assigned any classes yet. Check back soon!"}
                </p>
                {(searchQuery || filter !== 'all') && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('');
                      setFilter('all');
                    }}
                    className="border-gray-300"
                  >
                    Clear Filters
                  </Button>
                )}
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {filteredClasses.map((classItem, index) => {
                    const Icon = classItem.icon || BookOpen;
                    const colors = getColorClasses(classItem.color);
                    const performance = getPerformanceBadge(classItem.avgScore);
                    const ClassIcon = classItem.icon || BookOpen;

                    return (
                      <motion.div
                        key={classItem._id || classItem.id}
                        variants={itemVariants}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ y: -4 }}
                        className="group"
                      >
                        <Card className="h-full border-2 border-gray-200 hover:border-blue-300 transition-all duration-300 hover:shadow-2xl overflow-hidden">
                          {/* Class Header */}
                          <CardHeader className={`pb-4 ${colors.light} relative overflow-hidden`}>
                            <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                              <div className={`w-full h-full rounded-full ${colors.bg}`} />
                            </div>

                            <div className="flex items-start justify-between mb-4 relative z-10">
                              <div className={`p-3 rounded-xl ${colors.light}`}>
                                <div className={`p-2 rounded-lg ${colors.bg} text-white`}>
                                  <ClassIcon className="h-6 w-6" />
                                </div>
                              </div>

                              <div className="flex flex-col items-end gap-2">
                                <Badge className={`${performance.color} font-medium`}>
                                  {performance.label}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  <TrendingUp className="h-3 w-3 mr-1" />
                                  {classItem.attendanceRate}% Attendance
                                </Badge>
                              </div>
                            </div>

                            <CardTitle className="text-2xl font-bold text-gray-900">
                              Grade {classItem.grade} - {classItem.section}
                            </CardTitle>
                            <CardDescription className="text-lg font-medium text-gray-700">
                              {classItem.subject}
                            </CardDescription>
                          </CardHeader>

                          {/* Class Content */}
                          <CardContent className="pt-6">
                            <div className="space-y-6">
                              {/* Key Metrics */}
                              <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-3 rounded-xl bg-gray-50">
                                  <div className="flex items-center justify-center gap-2 mb-2">
                                    <Users className="h-4 w-4 text-gray-600" />
                                    <span className="text-sm font-medium text-gray-600">Students</span>
                                  </div>
                                  <div className="text-2xl font-bold text-gray-900">{classItem.studentCount}</div>
                                </div>

                                <div className="text-center p-3 rounded-xl bg-gray-50">
                                  <div className="flex items-center justify-center gap-2 mb-2">
                                    <Award className="h-4 w-4 text-gray-600" />
                                    <span className="text-sm font-medium text-gray-600">Avg Score</span>
                                  </div>
                                  <div className="text-2xl font-bold text-gray-900">{classItem.avgScore}%</div>
                                </div>
                              </div>

                              {/* Progress Bars */}
                              <div className="space-y-3">
                                <div>
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium text-gray-700">Attendance</span>
                                    <span className="text-sm font-bold text-emerald-600">{classItem.attendanceRate}%</span>
                                  </div>
                                  <Progress value={classItem.attendanceRate} className="h-2" />
                                </div>

                                <div>
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium text-gray-700">Performance</span>
                                    <span className="text-sm font-bold text-blue-600">{classItem.avgScore}%</span>
                                  </div>
                                  <Progress value={classItem.avgScore} className="h-2" />
                                </div>
                              </div>

                              {/* Quick Info */}
                              <div className="space-y-3 pt-4 border-t border-gray-200">
                                <div className="flex items-center gap-3 text-sm">
                                  <Calendar className="h-4 w-4 text-gray-400" />
                                  <span className="text-gray-700">Next: <strong>{classItem.nextSession}</strong></span>
                                </div>

                                <div className="flex items-center gap-3 text-sm">
                                  <Clock4 className="h-4 w-4 text-gray-400" />
                                  <span className="text-gray-700">Recent: <strong>{classItem.recentActivity}</strong></span>
                                </div>
                              </div>
                            </div>
                          </CardContent>

                          {/* Class Footer */}
                          <CardFooter className="pt-0">
                            <div className="w-full">
                              <div className="flex items-center justify-between gap-3">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={`${colors.text} hover:${colors.light} flex-1`}
                                  asChild
                                >
                                  <Link href={`/teacher/classes/${classItem._id || classItem.id}`}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </Link>
                                </Button>

                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        className={`border-gray-300 hover:${colors.border}`}
                                        asChild
                                      >
                                        <Link href={`/teacher/classes/${classItem._id || classItem.id}/students`}>
                                          <Users className="h-4 w-4" />
                                        </Link>
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>View Students</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>

                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        className={`border-gray-300 hover:${colors.border}`}
                                        asChild
                                      >
                                        <Link href={`/teacher/classes/${classItem._id || classItem.id}/attendance`}>
                                          <UserCheck className="h-4 w-4" />
                                        </Link>
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Take Attendance</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>

                              {/* Quick Actions */}
                              <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-gray-500">Quick Actions:</span>
                                  <div className="flex items-center gap-2">
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-gray-500 hover:text-blue-600"
                                          >
                                            <MessageSquare className="h-3.5 w-3.5" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Message Class</TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>

                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-gray-500 hover:text-emerald-600"
                                          >
                                            <FileText className="h-3.5 w-3.5" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Assign Work</TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>

                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-gray-500 hover:text-purple-600"
                                          >
                                            <BarChart3 className="h-3.5 w-3.5" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>View Analytics</TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardFooter>

                          {/* Hover Effect Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity -z-10" />
                        </Card>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </motion.div>

          {/* Empty State - When there are no classes at all */}
          {!loading && classes.length === 0 && (
            <motion.div
              variants={itemVariants}
              className="mt-12"
            >
              <div className="bg-gradient-to-br from-gray-50 to-blue-50/50 rounded-3xl p-8 lg:p-12 text-center border-2 border-dashed border-gray-300">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mx-auto mb-6">
                    <BookOpen className="h-10 w-10 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">No Classes Assigned</h3>
                  <p className="text-gray-600 mb-6">
                    You haven't been assigned any classes yet. Once assigned, they will appear here where you can track performance, attendance, and manage students.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      variant="outline"
                      onClick={fetchClasses}
                      className="border-gray-300"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Check Again
                    </Button>
                    <Button className="bg-gradient-to-r from-blue-600 to-indigo-600">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Contact Admin
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Performance Insights */}
          {!loading && classes.length > 0 && (
            <motion.div
              variants={itemVariants}
              className="mt-12"
            >
              <Card className="border-0 shadow-xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl flex items-center gap-3">
                        <Sparkles className="h-6 w-6 text-blue-600" />
                        Performance Insights
                      </CardTitle>
                      <CardDescription>
                        Key metrics and trends across all your classes
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="font-normal">
                      <Zap className="mr-2 h-3 w-3" />
                      Real-time
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Top Performing Class */}
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="bg-emerald-100 p-2 rounded-xl">
                          <Trophy className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">Top Performing Class</h4>
                          <p className="text-sm text-emerald-600">Highest average score</p>
                        </div>
                      </div>
                      {classes.length > 0 && (
                        <>
                          <div className="text-3xl font-bold text-gray-900 mb-2">
                            Grade {classes[0].grade} - {classes[0].section}
                          </div>
                          <p className="text-emerald-700 font-medium">{classes[0].avgScore}% Average</p>
                          <Progress value={classes[0].avgScore} className="h-2 mt-3 bg-emerald-200" />
                        </>
                      )}
                    </div>

                    {/* Best Attendance */}
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-100 rounded-2xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="bg-blue-100 p-2 rounded-xl">
                          <UserCheck className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">Best Attendance</h4>
                          <p className="text-sm text-blue-600">Highest attendance rate</p>
                        </div>
                      </div>
                      {classes.length > 1 && (
                        <>
                          <div className="text-3xl font-bold text-gray-900 mb-2">
                            Grade {classes[1].grade} - {classes[1].section}
                          </div>
                          <p className="text-blue-700 font-medium">{classes[1].attendanceRate}% Attendance</p>
                          <Progress value={classes[1].attendanceRate} className="h-2 mt-3 bg-blue-200" />
                        </>
                      )}
                    </div>

                    {/* Total Students */}
                    <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-2xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="bg-purple-100 p-2 rounded-xl">
                          <Users className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">Student Impact</h4>
                          <p className="text-sm text-purple-600">Across all classes</p>
                        </div>
                      </div>
                      <div className="text-3xl font-bold text-gray-900 mb-2">
                        {stats.totalStudents} Students
                      </div>
                      <p className="text-purple-700 font-medium">{stats.totalClasses} Active Classes</p>
                      <div className="flex items-center gap-2 mt-3">
                        {classes.slice(0, 3).map((cls, i) => (
                          <div key={i} className="w-2 h-6 rounded-full bg-purple-500/60" />
                        ))}
                        {classes.length > 3 && (
                          <div className="text-xs text-purple-600">+{classes.length - 3} more</div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Footer */}
          <motion.div
            variants={itemVariants}
            className="mt-8 lg:mt-12 pt-6 border-t border-gray-200"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Teaching Excellence Portal
                </span>
                <span className="hidden sm:inline">•</span>
                <span>{classes.length} classes • {stats.totalStudents} students</span>
              </div>
              <div className="mt-3 sm:mt-0">
                <span className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Making a difference every day
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </ProtectedRoute>
  );
}

// Add missing icon component
const RefreshCw = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);