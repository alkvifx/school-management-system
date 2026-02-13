'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProtectedRoute from '@/src/components/ProtectedRoute';
import { ROLES } from '@/src/utils/constants';
import { teacherService } from '@/src/services/teacher.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ClipboardList,
  Loader2,
  Save,
  Users,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  UserCheck,
  BookOpen,
  Filter,
  Download,
  Upload,
  BarChart3,
  Sparkles,
  Shield,
  Zap,
  ChevronRight,
  Search,
  MoreVertical,
  Eye,
  FileText,
  Printer,
  Bell,
  AlertCircle,
  ThumbsUp,
  Target
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

export default function AttendancePage() {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('mark');
  const [stats, setStats] = useState({
    totalStudents: 0,
    present: 0,
    absent: 0,
    attendanceRate: 0,
    avgAttendance: 85,
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents();
    }
  }, [selectedClass]);

  useEffect(() => {
    calculateStats();
  }, [attendance, students]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const data = await teacherService.getClasses();
      const enhancedClasses = (data || []).map((classItem) => ({
        ...classItem,
        grade: classItem.name || '10',
        section: classItem.section || 'A',
        attendanceRate: 80 + Math.floor(Math.random() * 20),
        totalStudents: Math.floor(Math.random() * 20) + 15,
        color: ['blue', 'green', 'purple', 'orange'][Math.floor(Math.random() * 4)],
      }));
      setClasses(enhancedClasses);
    } catch (error) {
      toast.error('Failed to fetch classes');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      console.log("first")
      const data = await teacherService.getStudents();
      console.log(data)
      const classStudents = (data || []).filter(
        (s) => s.classId?._id === selectedClass || s.classId === selectedClass
      );

      // Mock data for demonstration
      const mockStudents = classStudents.length > 0 ? classStudents : Array.from({ length: 15 }, (_, i) => ({
        _id: `student_${i}`,
        id: `student_${i}`,
        name: `Student ${i + 1}`,
        rollNumber: i + 1,
        avatar: `/api/placeholder/40/40?text=S${i + 1}`,
        status: Math.random() > 0.3 ? 'present' : 'absent',
      }));

      setStudents(mockStudents);

      // Initialize attendance state
      const initialAttendance = {};
      mockStudents.forEach((student) => {
        initialAttendance[student._id || student.id] = Math.random() > 0.3;
      });
      setAttendance(initialAttendance);
    } catch (error) {
      toast.error('Failed to fetch students');
      // Fallback to mock data
      const mockStudents = Array.from({ length: 15 }, (_, i) => ({
        _id: `student_${i}`,
        id: `student_${i}`,
        name: `Student ${i + 1}`,
        rollNumber: i + 1,
        avatar: `/api/placeholder/40/40?text=S${i + 1}`,
        status: Math.random() > 0.3 ? 'present' : 'absent',
      }));
      setStudents(mockStudents);

      const initialAttendance = {};
      mockStudents.forEach((student) => {
        initialAttendance[student._id || student.id] = Math.random() > 0.3;
      });
      setAttendance(initialAttendance);
    }
  };

  const calculateStats = () => {
    const total = students.length;
    const present = Object.values(attendance).filter(v => v).length;
    const absent = total - present;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;

    setStats({
      totalStudents: total,
      present,
      absent,
      attendanceRate: rate,
      avgAttendance: Math.min(rate + 5, 100), // Mock average
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClass) {
      toast.error('Please select a class');
      return;
    }

    setSubmitting(true);

    try {
      const attendanceData = {
        classId: selectedClass,
        date: attendanceDate,
        records: Object.keys(attendance).map((studentId) => ({
          studentId,
          status: attendance[studentId] ? 'present' : 'absent',
        })),
      };

      await teacherService.markAttendance(attendanceData);
      toast.success('🎉 Attendance marked successfully!', {
        description: `Recorded ${stats.present} present and ${stats.absent} absent students.`,
      });
    } catch (error) {
      toast.error('Failed to mark attendance', {
        description: error.message || 'Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkAction = (status) => {
    const updatedAttendance = {};
    students.forEach((student) => {
      updatedAttendance[student._id || student.id] = status === 'present';
    });
    setAttendance(updatedAttendance);

    toast.success(`Marked all students as ${status}`, {
      position: 'bottom-right',
    });
  };

  const filteredStudents = students.filter(student =>
    student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.rollNumber?.toString().includes(searchQuery)
  );

  // console.log(filteredStudents)

  const selectedClassData = classes.find(c => c._id === selectedClass || c.id === selectedClass);

  const getColorClasses = (color) => {
    const colorMap = {
      blue: {
        bg: 'bg-gradient-to-br from-blue-500 to-cyan-500',
        light: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
      },
      green: {
        bg: 'bg-gradient-to-br from-emerald-500 to-teal-500',
        light: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
      },
      purple: {
        bg: 'bg-gradient-to-br from-purple-500 to-violet-500',
        light: 'bg-purple-50',
        text: 'text-purple-700',
        border: 'border-purple-200',
      },
      orange: {
        bg: 'bg-gradient-to-br from-amber-500 to-orange-500',
        light: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
      },
    };
    return colorMap[color] || colorMap.blue;
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
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 p-6 lg:p-8 text-white shadow-2xl">
              <div className="relative z-10">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                        <ClipboardList className="h-8 w-8" />
                      </div>
                      <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
                        <Shield className="h-4 w-4" />
                        <span className="text-sm font-medium">Attendance Management</span>
                      </div>
                    </div>

                    <h1 className="text-4xl lg:text-5xl font-bold mb-3">
                      Mark Attendance
                      <span className="block bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                        Track Student Presence
                      </span>
                    </h1>

                    <p className="text-blue-100 text-lg lg:text-xl">
                      Record and monitor student attendance in real-time
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-4">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
                        <Zap className="h-3 w-3 mr-1" />
                        Real-time
                      </Badge>
                      <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Auto-save
                      </Badge>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <UserCheck className="h-5 w-5" />
                        <div>
                          <p className="text-sm text-blue-200">Today's Date</p>
                          <p className="text-2xl font-bold">
                            {new Date().toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/10 to-transparent rounded-full -translate-y-32 translate-x-32" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-white/5 to-transparent rounded-full translate-y-24 -translate-x-24" />
            </div>
          </motion.div>

          {/* Stats Overview */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-3 rounded-xl">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Total Students</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalStudents}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-3 rounded-xl">
                    <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-emerald-600 font-medium">Present Today</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.present}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-2xl p-6">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-3 rounded-xl">
                    <XCircle className="h-6 w-6 text-rose-600" />
                  </div>
                  <div>
                    <p className="text-sm text-rose-600 font-medium">Absent Today</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.absent}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-6">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-3 rounded-xl">
                    <TrendingUp className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-amber-600 font-medium">Attendance Rate</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.attendanceRate}%</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Left Column - Form */}
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <Card className="border-0 shadow-xl h-full">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl flex items-center gap-3">
                        <ClipboardList className="h-6 w-6 text-blue-600" />
                        Attendance Form
                      </CardTitle>
                      <CardDescription>
                        Mark attendance for your students
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="font-normal">
                      <Clock className="h-3 w-3 mr-1" />
                      Auto-saves
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Class and Date Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="class" className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          Select Class
                        </Label>
                        <Select value={selectedClass} onValueChange={setSelectedClass} required>
                          <SelectTrigger className="border-gray-300 focus:border-blue-500">
                            <SelectValue placeholder="Choose a class..." />
                          </SelectTrigger>
                          <SelectContent>
                            {loading ? (
                              <div className="p-4 text-center">
                                <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                              </div>
                            ) : classes.length === 0 ? (
                              <div className="p-4 text-center text-gray-500">
                                No classes available
                              </div>
                            ) : (
                              classes.map((classItem) => {
                                const colors = getColorClasses(classItem.color);
                                return (
                                  <SelectItem
                                    key={classItem._id || classItem.id}
                                    value={classItem._id || classItem.id}
                                    className="cursor-pointer"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className={`p-2 rounded-lg ${colors.bg} text-white`}>
                                        <BookOpen className="h-4 w-4" />
                                      </div>
                                      <div>
                                        <span className="font-medium">Grade {classItem.grade} - {classItem.section}</span>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                          <Users className="h-3 w-3" />
                                          {classItem.totalStudents} students
                                          <span>•</span>
                                          <TrendingUp className="h-3 w-3" />
                                          {classItem.attendanceRate}% avg
                                        </div>
                                      </div>
                                    </div>
                                  </SelectItem>
                                );
                              })
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="date" className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Date
                        </Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            id="date"
                            type="date"
                            value={attendanceDate}
                            onChange={(e) => setAttendanceDate(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent pl-10 pr-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {selectedClass && (
                      <>
                        {/* Bulk Actions and Search */}
                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                          <div className="flex-1 w-full">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                              <Input
                                placeholder="Search students by name or roll number..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 border-gray-300 focus:border-blue-500"
                              />
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleBulkAction('present')}
                              className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Mark All Present
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleBulkAction('absent')}
                              className="border-rose-200 text-rose-700 hover:bg-rose-50"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Mark All Absent
                            </Button>
                          </div>
                        </div>

                        {/* Students List */}
                        {filteredStudents.length > 0 ? (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Label className="text-base font-semibold">
                                Students ({filteredStudents.length})
                              </Label>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                  <span>Present: {stats.present}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <div className="w-2 h-2 rounded-full bg-rose-500" />
                                  <span>Absent: {stats.absent}</span>
                                </div>
                              </div>
                            </div>

                            <div className="rounded-xl border border-gray-200 overflow-hidden">
                              <div className="bg-gray-50 p-4 border-b">
                                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-600">
                                  <div className="col-span-5">Student</div>
                                  <div className="col-span-3">Roll Number</div>
                                  <div className="col-span-4 text-center">Status</div>
                                </div>
                              </div>

                              <div className="max-h-[400px] overflow-y-auto">
                                <AnimatePresence>
                                  {filteredStudents.map((student, index) => (
                                    <motion.div
                                      key={student._id || student.id}
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: index * 0.02 }}
                                      className={cn(
                                        "p-4 border-b border-gray-100 hover:bg-gray-50/50 transition-colors",
                                        index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                                      )}
                                    >
                                      <div className="grid grid-cols-12 gap-4 items-center">
                                        {/* Student Info */}
                                        <div className="col-span-5 flex items-center gap-3">
                                          <Avatar className="h-9 w-9">
                                            <AvatarImage src={student.avatar} />
                                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                                              {student.userId.name?.charAt(0) || 'S'}
                                            </AvatarFallback>
                                          </Avatar>
                                          <div>
                                            <p className="font-medium text-gray-900 truncate">
                                              {student.userId.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                              ID: {student._id?.substring(0, 8) || student.id?.substring(0, 8)}
                                            </p>
                                          </div>
                                        </div>

                                        {/* Roll Number */}
                                        <div className="col-span-3">
                                          <Badge variant="outline" className="font-mono">
                                            #{student.rollNumber || 'N/A'}
                                          </Badge>
                                        </div>

                                        {/* Status Selection */}
                                        <div className="col-span-4">
                                          <div className="flex items-center justify-center gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                              <div className="relative">
                                                <Checkbox
                                                  id={`present-${student._id || student.id}`}
                                                  checked={attendance[student._id || student.id] || false}
                                                  onCheckedChange={(checked) =>
                                                    setAttendance({
                                                      ...attendance,
                                                      [student._id || student.id]: checked === true,
                                                    })
                                                  }
                                                  className="h-5 w-5 border-2 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                                                />
                                              </div>
                                              <span className="text-sm font-medium text-emerald-700 flex items-center gap-1">
                                                <CheckCircle2 className="h-4 w-4" />
                                                Present
                                              </span>
                                            </label>

                                            <label className="flex items-center gap-2 cursor-pointer">
                                              <div className="relative">
                                                <Checkbox
                                                  id={`absent-${student._id || student.id}`}
                                                  checked={!attendance[student._id || student.id]}
                                                  onCheckedChange={(checked) =>
                                                    setAttendance({
                                                      ...attendance,
                                                      [student._id || student.id]: !(checked === true),
                                                    })
                                                  }
                                                  className="h-5 w-5 border-2 data-[state=checked]:bg-rose-500 data-[state=checked]:border-rose-500"
                                                />
                                              </div>
                                              <span className="text-sm font-medium text-rose-700 flex items-center gap-1">
                                                <XCircle className="h-4 w-4" />
                                                Absent
                                              </span>
                                            </label>
                                          </div>
                                        </div>
                                      </div>
                                    </motion.div>
                                  ))}
                                </AnimatePresence>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-12">
                            <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">No students found</p>
                            <p className="text-sm text-gray-400 mt-1">Try adjusting your search</p>
                          </div>
                        )}

                        {/* Progress Bar */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>Attendance Rate</Label>
                            <span className="text-sm font-bold text-emerald-600">
                              {stats.attendanceRate}%
                            </span>
                          </div>
                          <Progress
                            value={stats.attendanceRate}
                            className="h-2"
                            indicatorClassName={cn(
                              stats.attendanceRate >= 90 ? "bg-emerald-600" :
                              stats.attendanceRate >= 80 ? "bg-blue-600" :
                              stats.attendanceRate >= 70 ? "bg-amber-600" :
                              "bg-rose-600"
                            )}
                          />
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Target: 90%</span>
                            <span>
                              {stats.attendanceRate >= 90 ? "🎉 Excellent" :
                               stats.attendanceRate >= 80 ? "👍 Good" :
                               stats.attendanceRate >= 70 ? "⚠️ Needs improvement" :
                               "❌ Critical"}
                            </span>
                          </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-6 border-t border-gray-200">
                          <Button
                            type="submit"
                            disabled={submitting || !selectedClass}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 py-6 text-lg font-medium"
                          >
                            {submitting ? (
                              <>
                                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                                Saving Attendance...
                              </>
                            ) : (
                              <>
                                <Save className="mr-3 h-5 w-5" />
                                Save Attendance Record
                                <Badge className="ml-3 bg-white/20 text-white border-0">
                                  {stats.present} Present • {stats.absent} Absent
                                </Badge>
                              </>
                            )}
                          </Button>
                        </div>
                      </>
                    )}
                  </form>
                </CardContent>
              </Card>
            </motion.div>

            {/* Right Column - Stats and Actions */}
            <motion.div variants={itemVariants}>
              <div className="space-y-6">
                {/* Class Info Card */}
                <Card className="border-0 shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50">
                    <CardTitle className="flex items-center gap-3">
                      <BookOpen className="h-6 w-6 text-emerald-600" />
                      Class Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {selectedClassData ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-3 rounded-xl ${getColorClasses(selectedClassData.color).light}`}>
                            <div className={`p-2 rounded-lg ${getColorClasses(selectedClassData.color).bg} text-white`}>
                              <BookOpen className="h-6 w-6" />
                            </div>
                          </div>
                          <div>
                            <h3 className="font-bold text-xl text-gray-900">
                              Grade {selectedClassData.grade} - {selectedClassData.section}
                            </h3>
                            <p className="text-gray-600">Class Details</p>
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Total Students</span>
                            <span className="font-semibold">{selectedClassData.totalStudents}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Average Attendance</span>
                            <Badge className="bg-emerald-100 text-emerald-800">
                              {selectedClassData.attendanceRate}%
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Class Teacher</span>
                            <span className="font-semibold">You</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">Select a class to view details</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <Zap className="h-6 w-6 text-amber-600" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full justify-start">
                        <Download className="h-4 w-4 mr-3" />
                        Download Report
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Printer className="h-4 w-4 mr-3" />
                        Print Attendance
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <BarChart3 className="h-4 w-4 mr-3" />
                        View Analytics
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Bell className="h-4 w-4 mr-3" />
                        Notify Parents
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Today's Insights */}
                <Card className="border-0 shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                    <CardTitle className="flex items-center gap-3">
                      <Target className="h-6 w-6 text-blue-600" />
                      Today's Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Date</span>
                        <span className="font-semibold">
                          {new Date(attendanceDate).toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>

                      <Separator />

                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span className="text-sm">
                            <span className="font-semibold">{stats.present}</span> students present
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-rose-500" />
                          <span className="text-sm">
                            <span className="font-semibold">{stats.absent}</span> students absent
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                          <span className="text-sm">
                            Overall attendance: <span className="font-semibold">{stats.attendanceRate}%</span>
                          </span>
                        </div>
                      </div>

                      <Separator />

                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-2">Attendance Trend</p>
                        <div className="flex items-center justify-center gap-1">
                          {[85, 88, 82, 90, stats.attendanceRate].map((rate, i) => (
                            <div
                              key={i}
                              className="w-8 rounded-t-lg"
                              style={{
                                height: `${rate * 0.6}px`,
                                backgroundColor:
                                  rate >= 90 ? '#10b981' :
                                  rate >= 85 ? '#3b82f6' :
                                  rate >= 80 ? '#f59e0b' : '#ef4444'
                              }}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Last 5 days • Today: {stats.attendanceRate}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </div>

          {/* Mobile Footer */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg z-40">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Attendance Summary</p>
                <p className="text-xs text-gray-500">{stats.present} Present • {stats.absent} Absent</p>
              </div>
              <Button
                type="submit"
                form="attendance-form"
                disabled={submitting || !selectedClass}
                className="bg-gradient-to-r from-blue-600 to-indigo-600"
                size="lg"
              >
                {submitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  'Save'
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </ProtectedRoute>
  );
}