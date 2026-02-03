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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  Users,
  Loader2,
  Edit,
  Trash2,
  Search,
  Filter,
  GraduationCap,
  Clock,
  Mail,
  UserPlus,
  Shield,
  BookOpen,
  Award,
  Eye
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
import { motion } from 'framer-motion';

export default function TeachersPage() {
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState(null);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    subject: '',
    qualification: '',
    experience: '',
    otp: '',
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTeachers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredTeachers(teachers);
    } else {
      const filtered = teachers.filter(teacher => {
        const name = teacher.user?.name || teacher.name || '';
        const email = teacher.user?.email || teacher.email || '';
        const subject = teacher.subject || '';
        return (
          name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          subject.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
      setFilteredTeachers(filtered);
    }
  }, [searchQuery, teachers]);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const data = await principalService.getTeachers();
      setTeachers(data || []);
      setFilteredTeachers(data || []);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch teachers');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (teacher = null) => {
    if (teacher) {
      setEditingTeacher(teacher);
      setFormData({
        name: teacher.user?.name || teacher.name || '',
        email: teacher.user?.email || teacher.email || '',
        password: '',
        subject: teacher.subject || '',
        qualification: teacher.qualification || '',
        experience: teacher.experience || '',
      });
      setPhotoFile(null);
    } else {
      setEditingTeacher(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        subject: '',
        qualification: '',
        experience: '',
      });
      setPhotoFile(null);
    }
    setStep(1);
    setDialogOpen(true);
  };

  const handleCreateTeacher = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await principalService.createTeacher({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        subject: formData.subject,
        qualification: formData.qualification,
        experience: formData.experience,
      });

      toast.success('OTP sent to teacher email');
      setStep(2);
    } catch (error) {
      toast.error(error.message || 'Failed to create teacher');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await authService.verifyEmailOTP(formData.email, formData.otp);
      toast.success('Teacher verified successfully');
      setDialogOpen(false);
      setStep(1);
      setFormData({
        name: '',
        email: '',
        password: '',
        subject: '',
        qualification: '',
        experience: '',
        otp: '',
      });
      fetchTeachers();
    } catch (error) {
      toast.error(error.message || 'Invalid OTP');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateTeacher = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await principalService.updateTeacher(
        editingTeacher._id || editingTeacher.id,
        { ...formData, photo: photoFile }
      );
      toast.success('Teacher updated successfully');
      setDialogOpen(false);
      fetchTeachers();
    } catch (error) {
      toast.error(error.message || 'Failed to update teacher');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await principalService.deleteTeacher(teacherToDelete._id || teacherToDelete.id);
      toast.success('Teacher deleted successfully');
      setDeleteDialogOpen(false);
      setTeacherToDelete(null);
      fetchTeachers();
    } catch (error) {
      toast.error(error.message || 'Failed to delete teacher');
    }
  };

  const stats = {
    total: teachers.length,
    active: teachers.filter(t => !(t.isDeleted || t.deleted)).length,
    deleted: teachers.filter(t => t.isDeleted || t.deleted).length
  };

  return (
    <ProtectedRoute allowedRoles={[ROLES.PRINCIPAL]}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Teachers Management</h1>
              <p className="text-gray-600 mt-1">Manage and oversee all teaching staff</p>
            </div>
            <Button
              onClick={() => handleOpenDialog()}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg"
            >
              <UserPlus className="mr-1 h-4 w-4" />
              Add New Teacher
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700">Total Teachers</p>
                    <h3 className="text-2xl font-bold text-blue-900 mt-2">{stats.total}</h3>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700">Active</p>
                    <h3 className="text-2xl font-bold text-green-900 mt-2">{stats.active}</h3>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Inactive</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-2">{stats.deleted}</h3>
                  </div>
                  <div className="p-3 bg-gray-100 rounded-full">
                    <Clock className="h-6 w-6 text-gray-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4 items-center justify-between"
        >
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search teachers by name, email, or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-gray-300 focus:border-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" onClick={fetchTeachers}>
              Refresh
            </Button>
          </div>
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="space-y-4">
            <TableSkeleton rows={5} />
          </div>
        ) : filteredTeachers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <EmptyState
              icon={Users}
              title={searchQuery ? "No matching teachers found" : "No teachers yet"}
              description={
                searchQuery
                  ? "Try a different search term or clear the search"
                  : "Add your first teacher to get started"
              }
              actionLabel="Add New Teacher"
              onAction={() => handleOpenDialog()}
            />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-blue-600" />
                      Teaching Staff
                    </CardTitle>
                    <CardDescription>
                      {filteredTeachers.length} teacher{filteredTeachers.length !== 1 ? 's' : ''} found
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="px-3 py-1">
                    <Users className="h-3 w-3 mr-1" />
                    {stats.active} Active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/50">
                        <TableHead className="font-semibold text-gray-700">Teacher</TableHead>
                        <TableHead className="font-semibold text-gray-700">Contact</TableHead>
                        <TableHead className="font-semibold text-gray-700">Subject</TableHead>
                        <TableHead className="font-semibold text-gray-700">Qualification</TableHead>
                        <TableHead className="font-semibold text-gray-700">Experience</TableHead>
                        <TableHead className="font-semibold text-gray-700">Status</TableHead>
                        <TableHead className="font-semibold text-gray-700 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTeachers.map((teacher, index) => {
                        const teacherName = teacher.user?.name || teacher.name;
                        const teacherEmail = teacher.user?.email || teacher.email;
                        const isDeleted = teacher.isDeleted || teacher.deleted;

                        return (
                          <TableRow
                            key={teacher._id || teacher.id}
                            className="hover:bg-gray-50/50 transition-colors duration-150"
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                                  <AvatarImage src={teacher.photo?.url} />
                                  <AvatarFallback className="bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700">
                                    {teacherName?.charAt(0)?.toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-gray-900">{teacherName}</p>
                                  <p className="text-xs text-gray-500">ID: {teacher._id?.slice(-6)}</p>
                                </div>
                              </div>
                            </TableCell>

                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <Mail className="h-3 w-3 text-gray-400" />
                                  <span className="text-sm">{teacherEmail}</span>
                                </div>
                              </div>
                            </TableCell>

                            <TableCell>
                              <div className="flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-blue-500" />
                                <span className="font-medium">{teacher.subject || 'N/A'}</span>
                              </div>
                            </TableCell>

                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Award className="h-4 w-4 text-amber-500" />
                                <span>{teacher.qualification || 'N/A'}</span>
                              </div>
                            </TableCell>

                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-green-500" />
                                <span>{teacher.experience || '0'} years</span>
                              </div>
                            </TableCell>

                            <TableCell>
                              <Badge
                                variant={isDeleted ? "destructive" : "default"}
                                className={isDeleted ? "bg-red-100 text-red-800 hover:bg-red-100" : "bg-green-100 text-green-800 hover:bg-green-100"}
                              >
                                {isDeleted ? 'Inactive' : 'Active'}
                              </Badge>
                            </TableCell>

                            <TableCell>
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleOpenDialog(teacher)}
                                  className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setTeacherToDelete(teacher);
                                    setDeleteDialogOpen(true);
                                  }}
                                  className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-gray-100"
                                >
                                  <Eye className="h-4 w-4" />
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
          </motion.div>
        )}

        {/* Create / Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto p-0 border-0">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
              <DialogHeader>
                <DialogTitle className="text-white text-xl">
                  {editingTeacher ? 'Edit Teacher' : 'Create New Teacher'}
                </DialogTitle>
                <DialogDescription className="text-blue-100">
                  {editingTeacher
                    ? 'Update teacher profile and information'
                    : step === 1 ? 'Add a new teacher to your school' : 'Verify email address'}
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-2 mb-6">
                {[1, 2].map((num) => (
                  <div key={num} className="flex items-center gap-2">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      step >= num ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
                    }`}>
                      {num}
                    </div>
                    {num < 2 && (
                      <div className={`h-1 w-6 ${
                        step >= num + 1 ? 'bg-blue-600' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>

              <form
                onSubmit={
                  editingTeacher
                    ? handleUpdateTeacher
                    : step === 1
                    ? handleCreateTeacher
                    : handleVerifyOtp
                }
                className="space-y-4"
              >
                {step === 1 && (
                  <>
                    <div className="space-y-6">
                      <div>
                        <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                          <UserPlus className="h-4 w-4" />
                          Personal Information
                        </Label>
                        <Input
                          placeholder="Full name"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className="h-11"
                          required
                        />
                      </div>

                      <div>
                        <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email Address
                        </Label>
                        <Input
                          type="email"
                          placeholder="teacher@example.com"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          className="h-11"
                          required
                        />
                      </div>

                      {!editingTeacher && (
                        <div>
                          <Label className="text-sm font-medium mb-2">
                            Temporary Password
                          </Label>
                          <Input
                            type="password"
                            placeholder="Set initial password"
                            value={formData.password}
                            onChange={(e) =>
                              setFormData({ ...formData, password: e.target.value })
                            }
                            className="h-11"
                            required
                          />
                          <p className="text-xs text-gray-500 mt-2">
                            Teacher will be prompted to change this on first login
                          </p>
                        </div>
                      )}

                      <Separator />

                      <div>
                        <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          Professional Details
                        </Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-xs">Subject</Label>
                            <Input
                              placeholder="e.g., Mathematics"
                              value={formData.subject}
                              onChange={(e) =>
                                setFormData({ ...formData, subject: e.target.value })
                              }
                              className="h-10"
                              required
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Experience (years)</Label>
                            <Input
                              type="number"
                              placeholder="0"
                              value={formData.experience}
                              onChange={(e) =>
                                setFormData({ ...formData, experience: e.target.value })
                              }
                              className="h-10"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs">Qualification</Label>
                        <Input
                          placeholder="e.g., M.Ed, B.Sc"
                          value={formData.qualification}
                          onChange={(e) =>
                            setFormData({ ...formData, qualification: e.target.value })
                          }
                          className="h-10"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* OTP STEP */}
                {!editingTeacher && step === 2 && (
                  <div className="space-y-6">
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
                        value={formData.otp}
                        onChange={(e) =>
                          setFormData({ ...formData, otp: e.target.value })
                        }
                        placeholder="Enter 6-digit OTP"
                        className="h-11 text-center text-lg tracking-widest"
                        maxLength={6}
                        required
                      />
                    </div>
                  </div>
                )}

                {editingTeacher && (
                  <div className="space-y-4">
                    <Label>Update Profile Photo</Label>
                    <FileUpload
                      label=""
                      accept="image/*"
                      maxSize={5}
                      currentFile={editingTeacher.photo?.url}
                      onFileSelect={setPhotoFile}
                    />
                  </div>
                )}

                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : editingTeacher ? (
                      'Update Teacher'
                    ) : step === 1 ? (
                      'Send OTP'
                    ) : (
                      'Verify & Create Teacher'
                    )}
                  </Button>
                </div>
              </form>
            </div>
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
              Delete Teacher
            </div>
          }
          description={`Are you sure you want to delete "${
            teacherToDelete?.user?.name || teacherToDelete?.name
          }"? This action will deactivate their account and cannot be undone.`}
          confirmText="Delete Teacher"
          variant="destructive"
        />
      </div>
    </ProtectedRoute>
  );
}