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
  BookOpen,
  Loader2,
  Edit,
  Trash2,
  Users,
  User,
  Search,
  Filter,
  GraduationCap,
  Building,
  Calendar,
  ChevronDown,
  ChevronUp,
  Eye,
  RefreshCw,
  Mail,
  Phone
} from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/src/components/ConfirmDialog';
import { EmptyState } from '@/src/components/EmptyState';
import { LoadingSkeleton, TableSkeleton } from '@/src/components/LoadingSkeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

export default function ClassesPage() {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState(null);
  const [editingClass, setEditingClass] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    section: '',
    classTeacherId: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedClass, setExpandedClass] = useState(null);
  const [mobileView, setMobileView] = useState(false);

  useEffect(() => {
    fetchData();
    const checkMobile = () => setMobileView(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [classesData, teachersData, studentsData] = await Promise.all([
        principalService.getClasses(),
        principalService.getTeachers(),
        principalService.getStudents(),
      ]);
      setClasses(classesData || []);
      setTeachers(teachersData || []);
      setStudents(studentsData || []);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (classItem = null) => {
    if (classItem) {
      setEditingClass(classItem);
      setFormData({
        name: classItem.name || '',
        grade: classItem.grade || '',
        section: classItem.section || '',
        classTeacherId: classItem.classTeacherId || classItem.classTeacher?._id || '',
      });
    } else {
      setEditingClass(null);
      setFormData({
        name: '',
        grade: '',
        section: '',
        classTeacherId: '',
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingClass) {
        await principalService.updateClass(editingClass._id || editingClass.id, formData);
        toast.success('Class updated successfully');
      } else {
        await principalService.createClass(formData);
        toast.success('Class created successfully');
      }
      setDialogOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.message || 'Failed to save class');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await principalService.deleteClass(classToDelete._id || classToDelete.id);
      toast.success('Class deleted successfully');
      setDeleteDialogOpen(false);
      setClassToDelete(null);
      fetchData();
    } catch (error) {
      toast.error(error.message || 'Failed to delete class');
    }
  };

  const studentCountByClass = students.reduce((acc, student) => {
    const classId = student.classId || student.class?._id;
    if (!classId) return acc;
    acc[classId] = (acc[classId] || 0) + 1;
    return acc;
  }, {});

  const filteredClasses = classes.filter(classItem =>
    classItem.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    classItem.section.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (classItem.grade && classItem.grade.toString().includes(searchQuery))
  );

  const stats = {
    total: classes.length,
    totalStudents: students.length,
    averageStudents: classes.length > 0
      ? Math.round(students.length / classes.length)
      : 0,
    unassignedTeachers: classes.filter(c => !c.classTeacherId && !c.classTeacher?._id).length
  };

  const ClassCard = ({ classItem }) => {
    const [expanded, setExpanded] = useState(false);
    const classTeacher = teachers.find(
      t => (t._id || t.id) === (classItem.classTeacherId || classItem.classTeacher?._id)
    );
    const studentCount = studentCountByClass[classItem._id || classItem.id] || 0;
    const classStudents = students.filter(s =>
      (s.classId || s.class?._id) === (classItem._id || classItem.id)
    );

    return (
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <CardContent className="p-0">
          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{classItem.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        Section {classItem.section}
                      </Badge>
                      {classItem.grade && (
                        <Badge variant="secondary" className="text-xs">
                          Grade {classItem.grade}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpanded(!expanded)}
                    className="h-8 w-8 p-0"
                  >
                    {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">Class Teacher</p>
                    {classTeacher ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={classTeacher.photo?.url} />
                          <AvatarFallback className="text-xs">
                            {classTeacher.user?.name?.charAt(0) || classTeacher.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-sm font-medium truncate">
                          {classTeacher.user?.name || classTeacher.name}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">Not assigned</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">Students</p>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-500" />
                      <p className="text-sm font-bold">{studentCount}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenDialog(classItem)}
                    className="h-8 px-3 flex-1"
                  >
                    <Edit className="h-3 w-3 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setClassToDelete(classItem);
                      setDeleteDialogOpen(true);
                    }}
                    className="h-8 px-3 flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3 mr-2" />
                    Delete
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-3 flex-1"
                    onClick={() => {
                      // View class details - implement navigation if needed
                      toast.info(`Viewing ${classItem.name} details`);
                    }}
                  >
                    <Eye className="h-3 w-3 mr-2" />
                    View
                  </Button>
                </div>
              </div>
            </div>

            {expanded && (
              <div className="mt-4 pt-4 border-t space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Class Students ({studentCount})
                  </h4>
                  {studentCount > 0 ? (
                    <div className="space-y-2">
                      {classStudents.slice(0, 3).map(student => {
                        const studentName = student.user?.name || student.name;
                        return (
                          <div key={student._id} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={student.photo?.url} />
                                <AvatarFallback className="text-xs">
                                  {studentName?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="truncate">{studentName}</span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              Roll: {student.rollNumber || 'N/A'}
                            </Badge>
                          </div>
                        );
                      })}
                      {studentCount > 3 && (
                        <p className="text-xs text-gray-500 text-center">
                          + {studentCount - 3} more students
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 text-center">No students assigned yet</p>
                  )}
                </div>

                {classTeacher && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Teacher Details
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Subject:</span>
                        <span className="text-sm font-medium">{classTeacher.subject || 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Email:</span>
                        <span className="text-sm font-medium truncate">
                          {classTeacher.user?.email || classTeacher.email}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Experience:</span>
                        <span className="text-sm font-medium">{classTeacher.experience || 'N/A'} years</span>
                      </div>
                    </div>
                  </div>
                )}
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
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Classes Management</h1>
                <p className="text-gray-600 mt-1 text-sm md:text-base">Organize and manage all academic classes</p>
              </div>
              <Button
                onClick={() => handleOpenDialog()}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-sm"
                size="sm"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Class
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs md:text-sm font-medium text-blue-700">Total Classes</p>
                      <h3 className="text-lg md:text-2xl font-bold text-blue-900 mt-1">{stats.total}</h3>
                    </div>
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Building className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs md:text-sm font-medium text-green-700">Total Students</p>
                      <h3 className="text-lg md:text-2xl font-bold text-green-900 mt-1">{stats.totalStudents}</h3>
                    </div>
                    <div className="p-2 bg-green-100 rounded-full">
                      <GraduationCap className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs md:text-sm font-medium text-amber-700">Avg. Students</p>
                      <h3 className="text-lg md:text-2xl font-bold text-amber-900 mt-1">{stats.averageStudents}</h3>
                    </div>
                    <div className="p-2 bg-amber-100 rounded-full">
                      <Users className="h-4 w-4 md:h-5 md:w-5 text-amber-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs md:text-sm font-medium text-purple-700">No Teacher</p>
                      <h3 className="text-lg md:text-2xl font-bold text-purple-900 mt-1">{stats.unassignedTeachers}</h3>
                    </div>
                    <div className="p-2 bg-purple-100 rounded-full">
                      <User className="h-4 w-4 md:h-5 md:w-5 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Search and Filter */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search classes by name, section, or grade..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm" onClick={fetchData} className="flex-1">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
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
                      <div className="h-12 w-12 bg-gray-200 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/3" />
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredClasses.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No classes found"
              description={searchQuery ? "No matching classes found" : "Create your first class to get started"}
              actionLabel="Create Class"
              onAction={() => handleOpenDialog()}
            />
          ) : mobileView ? (
            // Mobile View - Card Layout
            <div className="space-y-3">
              {filteredClasses.map((classItem) => (
                <ClassCard key={classItem._id || classItem.id} classItem={classItem} />
              ))}
            </div>
          ) : (
            // Desktop View - Table Layout
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                      All Classes
                    </CardTitle>
                    <CardDescription>
                      {filteredClasses.length} class{filteredClasses.length !== 1 ? 'es' : ''} • {stats.totalStudents} total students
                    </CardDescription>
                  </div>
                  <Badge variant="outline">
                    <Building className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead>Class Name</TableHead>
                        <TableHead>Section</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead>Class Teacher</TableHead>
                        <TableHead>Students</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredClasses.map((classItem) => {
                        const classTeacher = teachers.find(
                          t => (t._id || t.id) === (classItem.classTeacherId || classItem.classTeacher?._id)
                        );
                        const studentCount = studentCountByClass[classItem._id || classItem.id] || 0;

                        return (
                          <TableRow key={classItem._id || classItem.id} className="hover:bg-gray-50">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                  <BookOpen className="h-4 w-4 text-blue-600" />
                                </div>
                                <div>
                                  <p className="font-bold">{classItem.name}</p>
                                  <p className="text-xs text-gray-500">ID: {classItem._id?.slice(-6)}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{classItem.section}</Badge>
                            </TableCell>
                            <TableCell>
                              {classItem.grade ? (
                                <Badge variant="secondary">Grade {classItem.grade}</Badge>
                              ) : (
                                <span className="text-gray-400">N/A</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {classTeacher ? (
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={classTeacher.photo?.url} />
                                    <AvatarFallback className="text-xs">
                                      {classTeacher.user?.name?.charAt(0) || classTeacher.name?.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="text-sm font-medium">{classTeacher.user?.name || classTeacher.name}</p>
                                    <p className="text-xs text-gray-500">{classTeacher.subject || 'N/A'}</p>
                                  </div>
                                </div>
                              ) : (
                                <Badge variant="outline" className="bg-gray-100 text-gray-600">
                                  Not assigned
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="relative">
                                  <Users className="h-5 w-5 text-blue-500" />
                                  {studentCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                                      {studentCount}
                                    </span>
                                  )}
                                </div>
                                <div>
                                  <p className="font-bold">{studentCount}</p>
                                  <p className="text-xs text-gray-500">students</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleOpenDialog(classItem)}
                                  className="h-8 w-8 p-0 hover:bg-blue-50"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setClassToDelete(classItem);
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
            <DialogContent className="max-w-md p-0">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 md:p-6 text-white">
                <DialogHeader>
                  <DialogTitle className="text-white">
                    {editingClass ? 'Edit Class' : 'Create New Class'}
                  </DialogTitle>
                  <DialogDescription className="text-blue-100">
                    {editingClass ? 'Update class details' : 'Add a new class to your school'}
                  </DialogDescription>
                </DialogHeader>
              </div>

              <div className="p-4 md:p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        Class Information
                      </Label>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Class Name</Label>
                          <Input
                            placeholder="e.g., Science Stream"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="h-10"
                            required
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Section</Label>
                          <Input
                            placeholder="e.g., A"
                            value={formData.section}
                            onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                            className="h-10"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs">Grade/Level</Label>
                      <Input
                        placeholder="e.g., 10 (Optional)"
                        value={formData.grade}
                        onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                        className="h-10"
                      />
                    </div>

                    <Separator />

                    {editingClass && (
                      <div>
                        <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Assign Class Teacher
                        </Label>
                        <Select
                          value={formData.classTeacherId}
                          onValueChange={(value) => setFormData({ ...formData, classTeacherId: value })}
                        >
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select class teacher (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Not Assigned">Not Assigned</SelectItem>
                            {teachers.map((teacher) => (
                              <SelectItem key={teacher._id || teacher.id} value={teacher._id || teacher.id}>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src={teacher.photo?.url} />
                                    <AvatarFallback className="text-xs">
                                      {teacher.user?.name?.charAt(0) || teacher.name?.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium">{teacher.user?.name || teacher.name}</div>
                                    <div className="text-xs text-gray-500">{teacher.subject}</div>
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : editingClass ? (
                      'Update Class'
                    ) : (
                      'Create Class'
                    )}
                  </Button>
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
                Delete Class
              </div>
            }
            description={
              <div className="space-y-2">
                <p>Are you sure you want to delete "{classToDelete?.name}"?</p>
                <p className="text-sm text-gray-600">
                  This action will remove all class assignments and cannot be undone.
                </p>
              </div>
            }
            confirmText="Delete Class"
            variant="destructive"
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}