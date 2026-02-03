'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/src/components/ProtectedRoute';
import { ROLES } from '@/src/utils/constants';
import { principalService } from '@/src/services/principal.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Plus,
  GraduationCap,
  Loader2,
  Edit,
  Trash2,
  Search,
  Filter,
  Users,
  UserPlus,
  Phone,
  Mail,
  BookOpen,
  Shield,
  ChevronDown,
  ChevronUp,
  Eye,
  Clock,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/src/components/ConfirmDialog';
import { EmptyState } from '@/src/components/EmptyState';
import { LoadingSkeleton, TableSkeleton } from '@/src/components/LoadingSkeleton';
import { FileUpload } from '@/src/components/FileUpload';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { authService } from '@/src/services/auth.service';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [selectedClass, setSelectedClass] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    rollNumber: '',
    parentName: '',
    parentPhone: '',
    classId: '',
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [resending, setResending] = useState(false);
  const [mobileView, setMobileView] = useState(false);

  useEffect(() => {
    fetchData();
    const checkMobile = () => setMobileView(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (resendTimer === 0) return;

    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [resendTimer]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [studentsData, classesData] = await Promise.all([
        principalService.getStudents(),
        principalService.getClasses(),
      ]);
      setStudents(studentsData || []);
      setClasses(classesData || []);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (student = null) => {
    if (student) {
      setEditingStudent(student);
      setFormData({
        name: student.user?.name || student.name || '',
        email: student.user?.email || student.email || '',
        password: '',
        rollNumber: student.rollNumber || '',
        parentName: student.parentName || '',
        parentPhone: student.parentPhone || '',
        classId: student.classId || '',
      });
      setPhotoFile(null);
    } else {
      setEditingStudent(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        rollNumber: '',
        parentName: '',
        parentPhone: '',
        classId: '',
      });
      setPhotoFile(null);
    }
    setStep(1);
    setDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingStudent) {
        await principalService.updateStudent(
          editingStudent._id || editingStudent.id,
          {
            ...formData,
            photo: photoFile,
          }
        );
        toast.success('Student updated successfully');
        setDialogOpen(false);
        fetchData();
      } else {
        await principalService.createStudent(formData);
        toast.success('OTP sent to student email');
        setStep(2);
        return;
      }
    } catch (error) {
      toast.error(error.message || 'Failed to save student');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyStudentOtp = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await authService.verifyEmailOTP(formData.email, otp);
      toast.success('Student email verified');
      setDialogOpen(false);
      setStep(1);
      setOtp('');
      fetchData();
    } catch (error) {
      toast.error(error.message || 'Invalid OTP');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;

    try {
      setResending(true);
      await authService.resendEmailOTP(formData.email);
      toast.success('OTP resent to email');
      setResendTimer(30);
    } catch (error) {
      toast.error(error.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  const handleDelete = async () => {
    try {
      await principalService.deleteStudent(studentToDelete._id || studentToDelete.id);
      toast.success('Student deleted successfully');
      setDeleteDialogOpen(false);
      setStudentToDelete(null);
      fetchData();
    } catch (error) {
      toast.error(error.message || 'Failed to delete student');
    }
  };

  const filteredStudents = selectedClass === 'all'
    ? students
    : students.filter(s => (s.classId || s.class?._id) === selectedClass);

  const stats = {
    total: students.length,
    active: students.filter(s => !(s.isDeleted || s.deleted)).length,
    deleted: students.filter(s => s.isDeleted || s.deleted).length
  };

  const StudentCard = ({ student }) => {
    const [expanded, setExpanded] = useState(false);
    const studentName = student.user?.name || student.name;
    const studentEmail = student.user?.email || student.email;
    const isDeleted = student.isDeleted || student.deleted;
    const className = classes.find(c => (c._id || c.id) === (student.classId || student.class?._id));

    return (
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <CardContent className="p-0">
          <div className="p-4">
            <div className="flex items-start gap-3">
              <Avatar className="h-12 w-12 border-2 border-white shadow">
                <AvatarImage src={student.photo?.url} />
                <AvatarFallback className="bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700">
                  {studentName?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 truncate">{studentName}</h3>
                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                      <Mail className="h-3 w-3" />
                      <span className="truncate">{studentEmail}</span>
                    </p>
                  </div>
                  <Badge
                    variant={isDeleted ? "destructive" : "default"}
                    className={isDeleted ? "bg-red-100 text-red-800 hover:bg-red-100" : "bg-green-100 text-green-800 hover:bg-green-100"}
                  >
                    {isDeleted ? 'Inactive' : 'Active'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                  <div>
                    <p className="text-gray-500">Roll No.</p>
                    <p className="font-medium">{student.rollNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Class</p>
                    <p className="font-medium">{className ? `${className.name}` : 'N/A'}</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenDialog(student)}
                    className="h-8 px-3"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setStudentToDelete(student);
                      setDeleteDialogOpen(true);
                    }}
                    className="h-8 px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpanded(!expanded)}
                    className="h-8 px-3 ml-auto"
                  >
                    {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>

            {expanded && (
              <div className="mt-4 pt-4 border-t space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">Parent Name</p>
                    <p className="text-sm font-medium">{student.parentName || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">Parent Phone</p>
                    <p className="text-sm font-medium flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {student.parentPhone || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Class Details</p>
                  <p className="text-sm">
                    {className ? `${className.name} - Grade ${className.grade} (${className.section})` : 'Not assigned'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Student ID</p>
                  <p className="text-sm font-mono text-gray-600">{student._id?.slice(-8) || 'N/A'}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <ProtectedRoute allowedRoles={[ROLES.PRINCIPAL]}>
      <div className="min-h-screen bg-gray-50">
        <div className="p-4 md:p-6 space-y-4 md:space-y-6">
          {/* Header */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Students Management</h1>
                <p className="text-gray-600 mt-1 text-sm md:text-base">Manage and oversee all student records</p>
              </div>
              <Button
                onClick={() => handleOpenDialog()}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-sm"
                size="sm"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Add Student
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-700">Total Students</p>
                      <h3 className="text-xl md:text-2xl font-bold text-blue-900 mt-1">{stats.total}</h3>
                    </div>
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Users className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-700">Active</p>
                      <h3 className="text-xl md:text-2xl font-bold text-green-900 mt-1">{stats.active}</h3>
                    </div>
                    <div className="p-2 bg-green-100 rounded-full">
                      <Shield className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-amber-700">Classes</p>
                      <h3 className="text-xl md:text-2xl font-bold text-amber-900 mt-1">{classes.length}</h3>
                    </div>
                    <div className="p-2 bg-amber-100 rounded-full">
                      <BookOpen className="h-5 w-5 md:h-6 md:w-6 text-amber-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search students by name, email, or roll number..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 text-sm"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <Select value={selectedClass} onValueChange={setSelectedClass}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Filter by class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Classes</SelectItem>
                        {classes.map((classItem) => (
                          <SelectItem key={classItem._id || classItem.id} value={classItem._id || classItem.id}>
                            {classItem.name} (Grade {classItem.grade})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm" onClick={fetchData} className="flex-1 sm:flex-none">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <div className="h-12 w-12 bg-gray-200 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/3" />
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredStudents.length === 0 ? (
            <EmptyState
              icon={GraduationCap}
              title="No students found"
              description={selectedClass !== 'all' ? "No students in this class yet" : "Add your first student to get started"}
              actionLabel="Add Student"
              onAction={() => handleOpenDialog()}
            />
          ) : mobileView ? (
            // Mobile View - Card Layout
            <div className="space-y-3">
              {filteredStudents.map((student) => (
                <StudentCard key={student._id || student.id} student={student} />
              ))}
            </div>
          ) : (
            // Desktop View - Table Layout
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-blue-600" />
                      Student Directory
                    </CardTitle>
                    <CardDescription>
                      {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''} found
                    </CardDescription>
                  </div>
                  <Badge variant="outline">
                    <Shield className="h-3 w-3 mr-1" />
                    {stats.active} Active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead>Student</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Parent</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.map((student) => {
                        const studentName = student.user?.name || student.name;
                        const studentEmail = student.user?.email || student.email;
                        const isDeleted = student.isDeleted || student.deleted;
                        const className = classes.find(c => (c._id || c.id) === (student.classId || student.class?._id));

                        return (
                          <TableRow key={student._id || student.id} className="hover:bg-gray-50">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={student.photo?.url} />
                                  <AvatarFallback className="bg-gradient-to-br from-blue-100 to-indigo-100">
                                    {studentName?.charAt(0)?.toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{studentName}</p>
                                  <p className="text-sm text-gray-500">Roll: {student.rollNumber || 'N/A'}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <Mail className="h-3 w-3" />
                                  <span className="text-sm">{studentEmail}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {className ? (
                                <div className="space-y-1">
                                  <p className="font-medium">{className.name}</p>
                                  <p className="text-xs text-gray-500">Grade {className.grade} - {className.section}</p>
                                </div>
                              ) : 'N/A'}
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <p className="font-medium">{student.parentName || 'N/A'}</p>
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {student.parentPhone || 'N/A'}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={isDeleted ? "destructive" : "default"}
                                className={isDeleted ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}
                              >
                                {isDeleted ? 'Inactive' : 'Active'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleOpenDialog(student)}
                                  className="h-8 w-8 p-0 hover:bg-blue-50"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setStudentToDelete(student);
                                    setDeleteDialogOpen(true);
                                  }}
                                  className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Create/Edit Dialog */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto p-0">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 md:p-6 text-white">
                <DialogHeader>
                  <DialogTitle className="text-white">
                    {editingStudent ? 'Edit Student' : 'Create New Student'}
                  </DialogTitle>
                  <DialogDescription className="text-blue-100">
                    {editingStudent ? 'Update student profile' : step === 1 ? 'Add new student record' : 'Verify email address'}
                  </DialogDescription>
                </DialogHeader>
              </div>

              <ScrollArea className="h-[calc(90vh-200px)] p-4 md:p-6">
                {step === 1 && (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                          <UserPlus className="h-4 w-4" />
                          Student Information
                        </Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs">Full Name</Label>
                            <Input
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              className="h-10"
                              required
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Roll Number</Label>
                            <Input
                              value={formData.rollNumber}
                              onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                              className="h-10"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Contact Details
                        </Label>
                        <div className="space-y-3">
                          <div>
                            <Label className="text-xs">Email Address</Label>
                            <Input
                              type="email"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              className="h-10"
                              required
                            />
                          </div>
                          {!editingStudent && (
                            <div>
                              <Label className="text-xs">Password</Label>
                              <Input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="h-10"
                                required
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          Academic Details
                        </Label>
                        <div className="space-y-3">
                          <div>
                            <Label className="text-xs">Class</Label>
                            <Select
                              value={formData.classId}
                              onValueChange={(value) => setFormData({ ...formData, classId: value })}
                            >
                              <SelectTrigger className="h-10">
                                <SelectValue placeholder="Select class" />
                              </SelectTrigger>
                              <SelectContent>
                                {classes.map((classItem) => (
                                  <SelectItem key={classItem._id || classItem.id} value={classItem._id || classItem.id}>
                                    {classItem.name} (Grade {classItem.grade})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Parent Information
                        </Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs">Parent Name</Label>
                            <Input
                              value={formData.parentName}
                              onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                              className="h-10"
                              required
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Parent Phone</Label>
                            <Input
                              type="tel"
                              value={formData.parentPhone}
                              onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                              className="h-10"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      {editingStudent && (
                        <div className="pt-2">
                          <Label>Update Profile Photo</Label>
                          <FileUpload
                            label=""
                            accept="image/*"
                            maxSize={5}
                            currentFile={editingStudent.photo?.url}
                            onFileSelect={setPhotoFile}
                          />
                        </div>
                      )}
                    </div>

                    <Button type="submit" disabled={submitting} className="w-full h-11 mt-6">
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : editingStudent ? (
                        'Update Student'
                      ) : (
                        'Send OTP'
                      )}
                    </Button>
                  </form>
                )}

                {step === 2 && (
                  <form onSubmit={handleVerifyStudentOtp} className="space-y-4">
                    <div className="text-center py-4">
                      <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <Mail className="h-8 w-8 text-green-600" />
                      </div>
                      <h3 className="font-semibold text-lg">Verify Email Address</h3>
                      <p className="text-gray-600 text-sm mt-2">
                        A 6-digit OTP has been sent to {formData.email}
                      </p>
                    </div>

                    <div>
                      <Label>Enter OTP Code</Label>
                      <Input
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="Enter 6-digit OTP"
                        className="h-12 text-center text-lg tracking-widest"
                        maxLength={6}
                        required
                      />
                      <div className="text-center mt-2">
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          disabled={resendTimer > 0 || resending}
                          className="text-sm text-blue-600 hover:underline disabled:text-gray-400"
                        >
                          {resending
                            ? 'Resending...'
                            : resendTimer > 0
                            ? `Resend OTP in ${resendTimer}s`
                            : 'Resend OTP'}
                        </button>
                      </div>
                    </div>

                    <Button type="submit" disabled={submitting} className="w-full h-11">
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        'Verify & Create Student'
                      )}
                    </Button>
                  </form>
                )}
              </ScrollArea>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation */}
          <ConfirmDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            onConfirm={handleDelete}
            title={
              <div className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-red-600" />
                Delete Student
              </div>
            }
            description={`Are you sure you want to delete "${
              studentToDelete?.user?.name || studentToDelete?.name
            }"? This action will deactivate their account and cannot be undone.`}
            confirmText="Delete Student"
            variant="destructive"
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}