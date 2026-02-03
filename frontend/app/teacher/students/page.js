'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/src/components/ProtectedRoute';
import { ROLES } from '@/src/utils/constants';
import { teacherService } from '@/src/services/teacher.service';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { Users, UserPlus, Pencil, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/src/components/EmptyState';

const initialCreateForm = {
  name: '',
  email: '',
  password: '',
  classId: '',
  rollNumber: '',
  parentPhone: '',
};
const initialUpdateForm = { name: '', parentPhone: '' };

export default function TeacherStudentsPage() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [classFilter, setClassFilter] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(initialCreateForm);
  const [updateForm, setUpdateForm] = useState(initialUpdateForm);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [createErrors, setCreateErrors] = useState({});
  const [updateErrors, setUpdateErrors] = useState({});

  const fetchData = async () => {
    try {
      setLoading(true);
      const [studentsData, classesData] = await Promise.all([
        teacherService.getStudents(classFilter ? { classId: classFilter } : {}),
        teacherService.getClasses(),
      ]);
      setStudents(Array.isArray(studentsData) ? studentsData : []);
      setClasses(Array.isArray(classesData) ? classesData : []);
    } catch (error) {
      toast.error(error.message || 'Failed to load students');
      setStudents([]);
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [classFilter]);

  const validateCreate = () => {
    const err = {};
    if (!createForm.name?.trim()) err.name = 'Name is required';
    if (!createForm.email?.trim()) err.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createForm.email)) err.email = 'Invalid email';
    if (!createForm.password) err.password = 'Password is required';
    else if (createForm.password.length < 6) err.password = 'Password must be at least 6 characters';
    if (!createForm.classId) err.classId = 'Select a class';
    if (createForm.rollNumber === '' || createForm.rollNumber === null) err.rollNumber = 'Roll number is required';
    else if (isNaN(Number(createForm.rollNumber)) || Number(createForm.rollNumber) < 1)
      err.rollNumber = 'Enter a valid roll number';
    if (!createForm.parentPhone?.trim()) err.parentPhone = 'Parent phone is required';
    setCreateErrors(err);
    return Object.keys(err).length === 0;
  };

  const validateUpdate = () => {
    const err = {};
    if (!updateForm.name?.trim()) err.name = 'Name is required';
    if (!updateForm.parentPhone?.trim()) err.parentPhone = 'Parent phone is required';
    setUpdateErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!validateCreate()) return;
    try {
      setSubmitting(true);
      await teacherService.createStudent({
        name: createForm.name.trim(),
        email: createForm.email.trim().toLowerCase(),
        password: createForm.password,
        classId: createForm.classId,
        rollNumber: Number(createForm.rollNumber),
        parentPhone: createForm.parentPhone.trim(),
      });
      toast.success('Student created successfully');
      setCreateOpen(false);
      setCreateForm(initialCreateForm);
      setCreateErrors({});
      fetchData();
    } catch (error) {
      toast.error(error.message || 'Failed to create student');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !validateUpdate()) return;
    try {
      setSubmitting(true);
      await teacherService.updateStudent(selectedStudent._id, {
        name: updateForm.name.trim(),
        parentPhone: updateForm.parentPhone.trim(),
      });
      toast.success('Student updated successfully');
      setUpdateOpen(false);
      setSelectedStudent(null);
      setUpdateForm(initialUpdateForm);
      setUpdateErrors({});
      fetchData();
    } catch (error) {
      toast.error(error.message || 'Failed to update student');
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (student) => {
    setSelectedStudent(student);
    setUpdateForm({
      name: student.userId?.name || '',
      parentPhone: student.parentPhone || '',
    });
    setUpdateErrors({});
    setUpdateOpen(true);
  };

  return (
    <ProtectedRoute allowedRoles={[ROLES.TEACHER]}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <Link
                href="/teacher/dashboard"
                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Users className="h-7 w-7 text-blue-600" />
                Students
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Create and update students in your classes. Delete is admin-only.
              </p>
            </div>
            <Button onClick={() => { setCreateForm(initialCreateForm); setCreateErrors({}); setCreateOpen(true); }}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Student
            </Button>
          </div>

          {/* Class filter */}
          {classes.length > 0 && (
            <div className="mb-6">
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Filter by class</Label>
              <Select value={classFilter || 'all'} onValueChange={(v) => setClassFilter(v === 'all' ? '' : v)}>
                <SelectTrigger className="w-full sm:w-56">
                  <SelectValue placeholder="All classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All classes</SelectItem>
                  {classes.map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.name}-{c.section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* List */}
          {loading ? (
            <Card>
              <CardContent className="py-12 flex flex-col items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
                <p className="text-gray-600">Loading students...</p>
              </CardContent>
            </Card>
          ) : students.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <EmptyState
                  icon={Users}
                  title="No students found"
                  description={classFilter ? 'No students in this class. Try another filter or add a student.' : 'Add your first student to get started.'}
                  actionLabel="Add Student"
                  onAction={() => setCreateOpen(true)}
                />
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {/* Mobile cards */}
              <div className="block sm:hidden space-y-3">
                {students.map((student) => (
                  <Card key={student._id} className="overflow-hidden">
                    <CardContent className="p-4 flex items-center gap-4">
                      <Avatar className="h-12 w-12 flex-shrink-0">
                        <AvatarFallback className="bg-blue-100 text-blue-700">
                          {(student.userId?.name || 'S').charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{student.userId?.name || 'Student'}</p>
                        <p className="text-sm text-gray-500 truncate">{student.userId?.email}</p>
                        <p className="text-xs text-gray-500">
                          {student.classId?.name}-{student.classId?.section} • Roll {student.rollNumber}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => openEdit(student)} aria-label="Edit student">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {/* Desktop table */}
              <Card className="hidden sm:block overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Student</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Class</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Roll</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Parent Phone</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => (
                        <tr key={student._id} className="border-b last:border-0 hover:bg-gray-50/50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                <AvatarFallback className="bg-blue-100 text-blue-700 text-sm">
                                  {(student.userId?.name || 'S').charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-gray-900">{student.userId?.name || 'Student'}</p>
                                <p className="text-xs text-gray-500">{student.userId?.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-700">
                            {student.classId?.name}-{student.classId?.section}
                          </td>
                          <td className="py-3 px-4 text-gray-700">{student.rollNumber}</td>
                          <td className="py-3 px-4 text-gray-700">{student.parentPhone || '—'}</td>
                          <td className="py-3 px-4 text-right">
                            <Button variant="outline" size="sm" onClick={() => openEdit(student)}>
                              <Pencil className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Create Student Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Student</DialogTitle>
            <DialogDescription>Create a new student in one of your classes. All fields are required.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <Label htmlFor="create-name">Full name</Label>
              <Input
                id="create-name"
                value={createForm.name}
                onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. John Doe"
                className="mt-1"
              />
              {createErrors.name && <p className="text-xs text-red-600 mt-1">{createErrors.name}</p>}
            </div>
            <div>
              <Label htmlFor="create-email">Email</Label>
              <Input
                id="create-email"
                type="email"
                value={createForm.email}
                onChange={(e) => setCreateForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="student@example.com"
                className="mt-1"
              />
              {createErrors.email && <p className="text-xs text-red-600 mt-1">{createErrors.email}</p>}
            </div>
            <div>
              <Label htmlFor="create-password">Password</Label>
              <Input
                id="create-password"
                type="password"
                value={createForm.password}
                onChange={(e) => setCreateForm((p) => ({ ...p, password: e.target.value }))}
                placeholder="Min 6 characters"
                className="mt-1"
              />
              {createErrors.password && <p className="text-xs text-red-600 mt-1">{createErrors.password}</p>}
            </div>
            <div>
              <Label>Class</Label>
              <Select
                value={createForm.classId}
                onValueChange={(v) => setCreateForm((p) => ({ ...p, classId: v }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.name}-{c.section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {createErrors.classId && <p className="text-xs text-red-600 mt-1">{createErrors.classId}</p>}
            </div>
            <div>
              <Label htmlFor="create-roll">Roll number</Label>
              <Input
                id="create-roll"
                type="number"
                min={1}
                value={createForm.rollNumber}
                onChange={(e) => setCreateForm((p) => ({ ...p, rollNumber: e.target.value }))}
                placeholder="e.g. 1"
                className="mt-1"
              />
              {createErrors.rollNumber && <p className="text-xs text-red-600 mt-1">{createErrors.rollNumber}</p>}
            </div>
            <div>
              <Label htmlFor="create-parent">Parent / Guardian phone</Label>
              <Input
                id="create-parent"
                type="tel"
                value={createForm.parentPhone}
                onChange={(e) => setCreateForm((p) => ({ ...p, parentPhone: e.target.value }))}
                placeholder="e.g. +91 9876543210"
                className="mt-1"
              />
              {createErrors.parentPhone && <p className="text-xs text-red-600 mt-1">{createErrors.parentPhone}</p>}
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Create Student
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Update Student Dialog */}
      <Dialog open={updateOpen} onOpenChange={(open) => { if (!open) { setSelectedStudent(null); setUpdateForm(initialUpdateForm); setUpdateErrors({}); } setUpdateOpen(open); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>Update name and parent phone. Delete is admin-only.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <Label htmlFor="update-name">Full name</Label>
              <Input
                id="update-name"
                value={updateForm.name}
                onChange={(e) => setUpdateForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. John Doe"
                className="mt-1"
              />
              {updateErrors.name && <p className="text-xs text-red-600 mt-1">{updateErrors.name}</p>}
            </div>
            <div>
              <Label htmlFor="update-parent">Parent / Guardian phone</Label>
              <Input
                id="update-parent"
                type="tel"
                value={updateForm.parentPhone}
                onChange={(e) => setUpdateForm((p) => ({ ...p, parentPhone: e.target.value }))}
                placeholder="e.g. +91 9876543210"
                className="mt-1"
              />
              {updateErrors.parentPhone && <p className="text-xs text-red-600 mt-1">{updateErrors.parentPhone}</p>}
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setUpdateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  );
}
