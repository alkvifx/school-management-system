'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProtectedRoute from '@/src/components/ProtectedRoute';
import { ROLES } from '@/src/utils/constants';
import { teacherService } from '@/src/services/teacher.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Award,
  Loader2,
  Save,
  BookOpen,
  Users,
  TrendingUp,
  BarChart3,
  Target,
  Calculator,
  Percent,
  Sparkles,
  Shield,
  Zap,
  Search,
  Filter,
  Download,
  Printer,
  Eye,
  FileText,
  Clock,
  Calendar,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Star,
  Trophy,
  Brain,
  Lightbulb,
  GraduationCap,
  MoreVertical,
  Upload,
  RefreshCw,
  Bell,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
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
import { Slider } from '@/components/ui/slider';

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

const examTypes = [
  { value: 'mid_term', label: 'Mid-Term Exam', color: 'blue' },
  { value: 'final', label: 'Final Exam', color: 'purple' },
  { value: 'unit_test', label: 'Unit Test', color: 'green' },
  { value: 'quiz', label: 'Quiz', color: 'orange' },
  { value: 'assignment', label: 'Assignment', color: 'red' },
  { value: 'project', label: 'Project', color: 'cyan' },
];

const subjects = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'Computer Science',
  'History',
  'Geography',
  'Economics',
  'Physical Education'
];

export default function MarksPage() {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [formData, setFormData] = useState({
    examType: '',
    subject: '',
    maxMarks: 100,
    marks: {},
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    totalStudents: 0,
    marksEntered: 0,
    avgMarks: 0,
    highestMarks: 0,
    lowestMarks: 0,
  });
  const [activeTab, setActiveTab] = useState('entry');
  const [showAnalytics, setShowAnalytics] = useState(true);

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
  }, [formData.marks, students]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const data = await teacherService.getClasses();
      const enhancedClasses = (data || []).map((classItem) => ({
        ...classItem,
        grade: classItem.name || '10',
        section: classItem.section || 'A',
        avgMarks: 65 + Math.floor(Math.random() * 30),
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
      const data = await teacherService.getStudents();
      const classStudents = (data || []).filter((s) =>
        s.classId?._id === selectedClass || s.classId === selectedClass
      );

      // Mock data for demonstration
      const mockStudents = classStudents.length > 0 ? classStudents : Array.from({ length: 15 }, (_, i) => ({
        _id: `student_${i}`,
        id: `student_${i}`,
        name: `Student ${i + 1}`,
        rollNumber: i + 1,
        avatar: `/api/placeholder/40/40?text=S${i + 1}`,
        previousMarks: 60 + Math.floor(Math.random() * 35),
        grade: ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)],
      }));

      setStudents(mockStudents);

      // Initialize marks state
      const initialMarks = {};
      mockStudents.forEach((student) => {
        initialMarks[student._id || student.id] = '';
      });
      setFormData({ ...formData, marks: initialMarks });
    } catch (error) {
      toast.error('Failed to fetch students');
      // Fallback to mock data
      const mockStudents = Array.from({ length: 15 }, (_, i) => ({
        _id: `student_${i}`,
        id: `student_${i}`,
        name: `Student ${i + 1}`,
        rollNumber: i + 1,
        avatar: `/api/placeholder/40/40?text=S${i + 1}`,
        previousMarks: 60 + Math.floor(Math.random() * 35),
        grade: ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)],
      }));
      setStudents(mockStudents);

      const initialMarks = {};
      mockStudents.forEach((student) => {
        initialMarks[student._id || student.id] = '';
      });
      setFormData({ ...formData, marks: initialMarks });
    }
  };

  const calculateStats = () => {
    const enteredMarks = Object.values(formData.marks).filter(mark => mark !== '' && !isNaN(mark));
    const numericMarks = enteredMarks.map(mark => parseFloat(mark));

    const total = students.length;
    const entered = enteredMarks.length;
    const avg = entered > 0 ? numericMarks.reduce((a, b) => a + b, 0) / entered : 0;
    const highest = entered > 0 ? Math.max(...numericMarks) : 0;
    const lowest = entered > 0 ? Math.min(...numericMarks) : 0;

    setStats({
      totalStudents: total,
      marksEntered: entered,
      avgMarks: Math.round(avg * 100) / 100,
      highestMarks: Math.round(highest * 100) / 100,
      lowestMarks: Math.round(lowest * 100) / 100,
    });
  };

  const handleMarksChange = (studentId, value) => {
    const numValue = parseFloat(value);
    if (value === '' || (!isNaN(numValue) && numValue >= 0 && numValue <= formData.maxMarks)) {
      setFormData({
        ...formData,
        marks: {
          ...formData.marks,
          [studentId]: value,
        },
      });
    }
  };

  const handleBulkAction = (action) => {
    const updatedMarks = {};
    students.forEach((student) => {
      switch (action) {
        case 'clear':
          updatedMarks[student._id || student.id] = '';
          break;
        case 'average':
          updatedMarks[student._id || student.id] = Math.floor(Math.random() * 30) + 70;
          break;
        case 'pass':
          updatedMarks[student._id || student.id] = Math.floor(Math.random() * 20) + 40;
          break;
      }
    });
    setFormData({ ...formData, marks: updatedMarks });

    toast.success(`${action.charAt(0).toUpperCase() + action.slice(1)} marks applied`, {
      position: 'bottom-right',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClass || !formData.examType || !formData.subject) {
      toast.error('Please fill all required fields');
      return;
    }

    if (stats.marksEntered === 0) {
      toast.error('Please enter marks for at least one student');
      return;
    }

    setSubmitting(true);

    try {
      const marksData = {
        examType: formData.examType,
        subject: formData.subject,
        classId: selectedClass,
        maxMarks: formData.maxMarks,
        marks: Object.keys(formData.marks)
          .filter((studentId) => formData.marks[studentId] && !isNaN(parseFloat(formData.marks[studentId])))
          .map((studentId) => ({
            studentId,
            marks: parseFloat(formData.marks[studentId]),
          })),
      };

      await teacherService.submitMarks(marksData);
      toast.success('🎉 Marks submitted successfully!', {
        description: `${stats.marksEntered} marks recorded with average of ${stats.avgMarks}`,
      });

      // Reset form
      setFormData({ examType: '', subject: '', maxMarks: 100, marks: {} });
      setSelectedClass('');
    } catch (error) {
      toast.error('Failed to submit marks', {
        description: error.message || 'Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredStudents = students.filter(student =>
    student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.rollNumber?.toString().includes(searchQuery)
  );

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
      red: {
        bg: 'bg-gradient-to-br from-rose-500 to-pink-500',
        light: 'bg-rose-50',
        text: 'text-rose-700',
        border: 'border-rose-200',
      },
      cyan: {
        bg: 'bg-gradient-to-br from-cyan-500 to-blue-500',
        light: 'bg-cyan-50',
        text: 'text-cyan-700',
        border: 'border-cyan-200',
      },
    };
    return colorMap[color] || colorMap.blue;
  };

  const getGradeColor = (marks) => {
    const percentage = (marks / formData.maxMarks) * 100;
    if (percentage >= 90) return 'text-emerald-600 bg-emerald-50';
    if (percentage >= 80) return 'text-blue-600 bg-blue-50';
    if (percentage >= 70) return 'text-amber-600 bg-amber-50';
    if (percentage >= 60) return 'text-orange-600 bg-orange-50';
    return 'text-rose-600 bg-rose-50';
  };

  const getGrade = (marks) => {
    const percentage = (marks / formData.maxMarks) * 100;
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
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
                        <Award className="h-8 w-8" />
                      </div>
                      <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
                        <Shield className="h-4 w-4" />
                        <span className="text-sm font-medium">Marks Management</span>
                      </div>
                    </div>

                    <h1 className="text-4xl lg:text-5xl font-bold mb-3">
                      Submit Marks
                      <span className="block bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                        Evaluate Student Performance
                      </span>
                    </h1>

                    <p className="text-blue-100 text-lg lg:text-xl">
                      Enter and analyze student marks with intelligent insights
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-4">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
                        <Zap className="h-3 w-3 mr-1" />
                        Auto-calculate
                      </Badge>
                      <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Smart Analytics
                      </Badge>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <Calculator className="h-5 w-5" />
                        <div>
                          <p className="text-sm text-blue-200">Ready to Submit</p>
                          <p className="text-2xl font-bold">{stats.marksEntered}/{stats.totalStudents}</p>
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
                    <p className="text-sm text-emerald-600 font-medium">Marks Entered</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.marksEntered}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-6">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-3 rounded-xl">
                    <TrendingUp className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-amber-600 font-medium">Average Marks</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.avgMarks}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-3 rounded-xl">
                    <Trophy className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-purple-600 font-medium">Highest Marks</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.highestMarks}</p>
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
                        <Calculator className="h-6 w-6 text-blue-600" />
                        Marks Entry Form
                      </CardTitle>
                      <CardDescription>
                        Enter marks for your students with intelligent grading
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="font-normal">
                      <Percent className="h-3 w-3 mr-1" />
                      Max: {formData.maxMarks}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Class, Exam, Subject Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
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
                                        <GraduationCap className="h-4 w-4" />
                                      </div>
                                      <div>
                                        <span className="font-medium">Grade {classItem.grade} - {classItem.section}</span>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                          <Users className="h-3 w-3" />
                                          {classItem.totalStudents} students
                                          <span>•</span>
                                          <TrendingUp className="h-3 w-3" />
                                          {classItem.avgMarks} avg marks
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
                        <Label className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Exam Type
                        </Label>
                        <Select
                          value={formData.examType}
                          onValueChange={(value) => setFormData({ ...formData, examType: value })}
                          required
                        >
                          <SelectTrigger className="border-gray-300 focus:border-blue-500">
                            <SelectValue placeholder="Select exam type..." />
                          </SelectTrigger>
                          <SelectContent>
                            {examTypes.map((exam) => (
                              <SelectItem key={exam.value} value={exam.value}>
                                <div className="flex items-center gap-3">
                                  <div className={`p-1.5 rounded ${getColorClasses(exam.color).light}`}>
                                    <div className={`p-1 rounded ${getColorClasses(exam.color).bg} text-white`}>
                                      <Award className="h-3 w-3" />
                                    </div>
                                  </div>
                                  <span>{exam.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Brain className="h-4 w-4" />
                          Subject
                        </Label>
                        <Select
                          value={formData.subject}
                          onValueChange={(value) => setFormData({ ...formData, subject: value })}
                          required
                        >
                          <SelectTrigger className="border-gray-300 focus:border-blue-500">
                            <SelectValue placeholder="Select subject..." />
                          </SelectTrigger>
                          <SelectContent>
                            {subjects.map((subject) => (
                              <SelectItem key={subject} value={subject}>
                                <div className="flex items-center gap-3">
                                  <div className="p-1.5 rounded bg-blue-50">
                                    <BookOpen className="h-3 w-3 text-blue-600" />
                                  </div>
                                  <span>{subject}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Max Marks Slider */}
                    <div className="space-y-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <Label className="flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          Maximum Marks
                        </Label>
                        <Badge variant="outline" className="font-mono">
                          {formData.maxMarks} points
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <Slider
                          value={[formData.maxMarks]}
                          onValueChange={([value]) => setFormData({ ...formData, maxMarks: value })}
                          min={50}
                          max={200}
                          step={5}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>50</span>
                          <span>100</span>
                          <span>150</span>
                          <span>200</span>
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
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <MoreVertical className="h-4 w-4 mr-2" />
                                  Bulk Actions
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleBulkAction('average')}>
                                  <TrendingUp className="h-4 w-4 mr-2" />
                                  Apply Average Marks
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleBulkAction('pass')}>
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                  Apply Passing Marks
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleBulkAction('clear')}>
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Clear All Marks
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        {/* Students List with Marks */}
                        {filteredStudents.length > 0 ? (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Label className="text-base font-semibold">
                                Student Marks ({stats.marksEntered}/{filteredStudents.length} entered)
                              </Label>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Star className="h-3 w-3 text-amber-500" />
                                  <span>Avg: {stats.avgMarks}</span>
                                </div>
                                <span>•</span>
                                <div className="flex items-center gap-1">
                                  <Trophy className="h-3 w-3 text-purple-500" />
                                  <span>High: {stats.highestMarks}</span>
                                </div>
                              </div>
                            </div>

                            <div className="rounded-xl border border-gray-200 overflow-hidden">
                              <div className="bg-gray-50 p-4 border-b">
                                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-600">
                                  <div className="col-span-4">Student</div>
                                  <div className="col-span-2">Roll No</div>
                                  <div className="col-span-2 text-center">Previous</div>
                                  <div className="col-span-3 text-center">Marks</div>
                                  <div className="col-span-1 text-center">Grade</div>
                                </div>
                              </div>

                              <div className="max-h-[400px] overflow-y-auto">
                                <AnimatePresence>
                                  {filteredStudents.map((student, index) => {
                                    const marks = formData.marks[student._id || student.id];
                                    const percentage = marks ? (parseFloat(marks) / formData.maxMarks) * 100 : 0;
                                    const gradeColor = marks ? getGradeColor(parseFloat(marks)) : 'bg-gray-50 text-gray-400';

                                    return (
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
                                          <div className="col-span-4 flex items-center gap-3">
                                            <Avatar className="h-9 w-9">
                                              <AvatarImage src={student.avatar} />
                                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                                                {student.name?.charAt(0) || 'S'}
                                              </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                              <p className="font-medium text-gray-900 truncate text-sm">
                                                {student.name}
                                              </p>
                                              <p className="text-xs text-gray-500 truncate">
                                                ID: {student._id?.substring(0, 6) || student.id?.substring(0, 6)}
                                              </p>
                                            </div>
                                          </div>

                                          {/* Roll Number */}
                                          <div className="col-span-2">
                                            <Badge variant="outline" className="font-mono text-xs">
                                              #{student.rollNumber || 'N/A'}
                                            </Badge>
                                          </div>

                                          {/* Previous Marks */}
                                          <div className="col-span-2">
                                            <div className="flex items-center justify-center">
                                              <TooltipProvider>
                                                <Tooltip>
                                                  <TooltipTrigger>
                                                    <div className={cn(
                                                      "px-2 py-1 rounded text-xs font-medium",
                                                      getGradeColor(student.previousMarks || 0)
                                                    )}>
                                                      {student.previousMarks || 'N/A'}
                                                    </div>
                                                  </TooltipTrigger>
                                                  <TooltipContent>
                                                    Previous marks: {student.previousMarks || 'N/A'}
                                                  </TooltipContent>
                                                </Tooltip>
                                              </TooltipProvider>
                                            </div>
                                          </div>

                                          {/* Marks Input */}
                                          <div className="col-span-3">
                                            <div className="relative">
                                              <Input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                max={formData.maxMarks}
                                                placeholder="Enter marks"
                                                value={marks || ''}
                                                onChange={(e) => handleMarksChange(student._id || student.id, e.target.value)}
                                                className={cn(
                                                  "text-center font-medium",
                                                  marks && "border-blue-300 bg-blue-50/50"
                                                )}
                                              />
                                              {marks && (
                                                <div className="absolute -bottom-5 left-0 right-0">
                                                  <Progress
                                                    value={percentage}
                                                    className="h-1"
                                                    indicatorClassName={cn(
                                                      percentage >= 90 ? "bg-emerald-500" :
                                                      percentage >= 80 ? "bg-blue-500" :
                                                      percentage >= 70 ? "bg-amber-500" :
                                                      percentage >= 60 ? "bg-orange-500" :
                                                      "bg-rose-500"
                                                    )}
                                                  />
                                                </div>
                                              )}
                                            </div>
                                          </div>

                                          {/* Grade */}
                                          <div className="col-span-1">
                                            <div className="flex items-center justify-center">
                                              <Badge
                                                variant="outline"
                                                className={cn(
                                                  "font-bold text-xs",
                                                  gradeColor,
                                                  !marks && "border-dashed"
                                                )}
                                              >
                                                {marks ? getGrade(parseFloat(marks)) : '-'}
                                              </Badge>
                                            </div>
                                          </div>
                                        </div>
                                      </motion.div>
                                    );
                                  })}
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

                        {/* Performance Overview */}
                        <div className="space-y-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4">
                          <div className="flex items-center justify-between">
                            <Label className="flex items-center gap-2">
                              <BarChart3 className="h-4 w-4" />
                              Performance Overview
                            </Label>
                            <Badge variant="outline" className="text-xs">
                              {stats.avgMarks}/{formData.maxMarks} avg
                            </Badge>
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-emerald-600">{stats.highestMarks}</div>
                              <div className="text-xs text-gray-600">Highest</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-600">{stats.avgMarks}</div>
                              <div className="text-xs text-gray-600">Average</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-rose-600">{stats.lowestMarks}</div>
                              <div className="text-xs text-gray-600">Lowest</div>
                            </div>
                          </div>

                          <Progress
                            value={(stats.avgMarks / formData.maxMarks) * 100}
                            className="h-2"
                            indicatorClassName={cn(
                              (stats.avgMarks / formData.maxMarks) * 100 >= 90 ? "bg-emerald-500" :
                              (stats.avgMarks / formData.maxMarks) * 100 >= 80 ? "bg-blue-500" :
                              (stats.avgMarks / formData.maxMarks) * 100 >= 70 ? "bg-amber-500" :
                              (stats.avgMarks / formData.maxMarks) * 100 >= 60 ? "bg-orange-500" :
                              "bg-rose-500"
                            )}
                          />
                        </div>

                        {/* Submit Button */}
                        <div className="pt-6 border-t border-gray-200">
                          <Button
                            type="submit"
                            disabled={submitting || !selectedClass || stats.marksEntered === 0}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 py-6 text-lg font-medium"
                          >
                            {submitting ? (
                              <>
                                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                                Submitting Marks...
                              </>
                            ) : (
                              <>
                                <Save className="mr-3 h-5 w-5" />
                                Submit Marks
                                <Badge className="ml-3 bg-white/20 text-white border-0">
                                  {stats.marksEntered} entries • {stats.avgMarks} avg
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
                              <GraduationCap className="h-6 w-6" />
                            </div>
                          </div>
                          <div>
                            <h3 className="font-bold text-xl text-gray-900">
                              Grade {selectedClassData.grade} - {selectedClassData.section}
                            </h3>
                            <p className="text-gray-600">Class Performance</p>
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Total Students</span>
                            <span className="font-semibold">{selectedClassData.totalStudents}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Average Marks</span>
                            <Badge className="bg-emerald-100 text-emerald-800">
                              {selectedClassData.avgMarks}%
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Subject</span>
                            <span className="font-semibold">{formData.subject || 'Not selected'}</span>
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
                        Download Template
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Upload className="h-4 w-4 mr-3" />
                        Import from Excel
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Printer className="h-4 w-4 mr-3" />
                        Print Marksheet
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <BarChart3 className="h-4 w-4 mr-3" />
                        Generate Report
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Grading Scale */}
                <Card className="border-0 shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                    <CardTitle className="flex items-center gap-3">
                      <Target className="h-6 w-6 text-blue-600" />
                      Grading Scale
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      {[
                        { range: '90-100%', grade: 'A+', color: 'bg-emerald-100 text-emerald-800' },
                        { range: '80-89%', grade: 'A', color: 'bg-blue-100 text-blue-800' },
                        { range: '70-79%', grade: 'B', color: 'bg-amber-100 text-amber-800' },
                        { range: '60-69%', grade: 'C', color: 'bg-orange-100 text-orange-800' },
                        { range: '50-59%', grade: 'D', color: 'bg-rose-100 text-rose-800' },
                        { range: 'Below 50%', grade: 'F', color: 'bg-gray-100 text-gray-800' },
                      ].map((item) => (
                        <div key={item.grade} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${item.color.split(' ')[0]}`} />
                            <span className="text-sm">{item.range}</span>
                          </div>
                          <Badge className={item.color}>
                            {item.grade}
                          </Badge>
                        </div>
                      ))}
                    </div>

                    <Separator className="my-4" />

                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-2">Current Distribution</p>
                      <div className="flex items-center justify-center gap-1">
                        {['emerald', 'blue', 'amber', 'orange', 'rose', 'gray'].map((color, i) => (
                          <div
                            key={color}
                            className="w-6 h-6 rounded"
                            style={{
                              backgroundColor: `var(--${color}-100)`,
                              height: `${20 + (i * 5)}px`
                            }}
                            title={`${25 - (i * 4)}% students`}
                          />
                        ))}
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
                <p className="text-sm font-medium text-gray-900">Marks Summary</p>
                <p className="text-xs text-gray-500">{stats.marksEntered} entered • {stats.avgMarks} avg</p>
              </div>
              <Button
                type="submit"
                form="marks-form"
                disabled={submitting || !selectedClass || stats.marksEntered === 0}
                className="bg-gradient-to-r from-blue-600 to-indigo-600"
                size="lg"
              >
                {submitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  'Submit'
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </ProtectedRoute>
  );
}