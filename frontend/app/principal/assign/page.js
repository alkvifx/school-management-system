'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/src/components/ProtectedRoute';
import { ROLES } from '@/src/utils/constants';
import { principalService } from '@/src/services/principal.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  UserCheck,
  Loader2,
  Users,
  GraduationCap,
  Building,
  ArrowRight,
  CheckCircle,
  UserPlus,
  BookOpen,
  RefreshCw,
  Search,
  Filter,
  Eye,
  Info,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';

export default function AssignPage() {
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignTeacherData, setAssignTeacherData] = useState({
    teacherId: '',
    classId: '',
  });
  const [assignStudentData, setAssignStudentData] = useState({
    studentId: '',
    classId: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('teacher');
  const [searchTeacher, setSearchTeacher] = useState('');
  const [searchStudent, setSearchStudent] = useState('');
  const [recentAssignments, setRecentAssignments] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [teachersData, studentsData, classesData] = await Promise.all([
        principalService.getTeachers(),
        principalService.getStudents(),
        principalService.getClasses(),
      ]);
      setTeachers(teachersData || []);
      setStudents(studentsData || []);
      setClasses(classesData || []);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTeacher = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const teacher = teachers.find(t => (t._id || t.id) === assignTeacherData.teacherId);
      const classItem = classes.find(c => (c._id || c.id) === assignTeacherData.classId);

      await principalService.assignTeacher(assignTeacherData.teacherId, assignTeacherData.classId);

      // Add to recent assignments
      setRecentAssignments(prev => [{
        type: 'teacher',
        teacherName: teacher?.user?.name || teacher?.name,
        className: classItem?.name,
        timestamp: new Date().toLocaleTimeString(),
      }, ...prev.slice(0, 4)]);

      toast.success('Teacher assigned successfully');
      setAssignTeacherData({ teacherId: '', classId: '' });
    } catch (error) {
      toast.error(error.message || 'Failed to assign teacher');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignStudent = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const student = students.find(s => (s._id || s.id) === assignStudentData.studentId);
      const classItem = classes.find(c => (c._id || c.id) === assignStudentData.classId);

      await principalService.assignStudent(assignStudentData.studentId, assignStudentData.classId);

      // Add to recent assignments
      setRecentAssignments(prev => [{
        type: 'student',
        studentName: student?.user?.name || student?.name,
        className: classItem?.name,
        timestamp: new Date().toLocaleTimeString(),
      }, ...prev.slice(0, 4)]);

      toast.success('Student assigned successfully');
      setAssignStudentData({ studentId: '', classId: '' });
    } catch (error) {
      toast.error(error.message || 'Failed to assign student');
    } finally {
      setSubmitting(false);
    }
  };

  const stats = {
    totalTeachers: teachers.length,
    totalStudents: students.length,
    totalClasses: classes.length,
    unassignedTeachers: teachers.filter(t => !t.classId && !t.class).length,
    unassignedStudents: students.filter(s => !s.classId && !s.class).length,
  };

  const filteredTeachers = teachers.filter(teacher => {
    const name = teacher.user?.name || teacher.name || '';
    const subject = teacher.subject || '';
    return (
      name.toLowerCase().includes(searchTeacher.toLowerCase()) ||
      subject.toLowerCase().includes(searchTeacher.toLowerCase())
    );
  });

  const filteredStudents = students.filter(student => {
    const name = student.user?.name || student.name || '';
    const rollNumber = student.rollNumber || '';
    return (
      name.toLowerCase().includes(searchStudent.toLowerCase()) ||
      rollNumber.toString().includes(searchStudent.toLowerCase())
    );
  });

  return (
    <ProtectedRoute allowedRoles={[ROLES.PRINCIPAL]}>
      <div className="min-h-screen bg-gray-50">
        <div className="p-4 md:p-6 space-y-4 md:space-y-6">
          {/* Header */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Assign Management</h1>
                <p className="text-gray-600 mt-1 text-sm md:text-base">Assign teachers and students to classes</p>
              </div>
              <Button
                onClick={fetchData}
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Data
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-blue-700">Teachers</p>
                      <h3 className="text-lg font-bold text-blue-900 mt-1">{stats.totalTeachers}</h3>
                    </div>
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-green-700">Students</p>
                      <h3 className="text-lg font-bold text-green-900 mt-1">{stats.totalStudents}</h3>
                    </div>
                    <div className="p-2 bg-green-100 rounded-full">
                      <GraduationCap className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-purple-700">Classes</p>
                      <h3 className="text-lg font-bold text-purple-900 mt-1">{stats.totalClasses}</h3>
                    </div>
                    <div className="p-2 bg-purple-100 rounded-full">
                      <Building className="h-4 w-4 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-amber-700">Unassigned Teachers</p>
                      <h3 className="text-lg font-bold text-amber-900 mt-1">{stats.unassignedTeachers}</h3>
                    </div>
                    <div className="p-2 bg-amber-100 rounded-full">
                      <UserPlus className="h-4 w-4 text-amber-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-red-700">Unassigned Students</p>
                      <h3 className="text-lg font-bold text-red-900 mt-1">{stats.unassignedStudents}</h3>
                    </div>
                    <div className="p-2 bg-red-100 rounded-full">
                      <GraduationCap className="h-4 w-4 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Left Column - Assignment Forms */}
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <UserCheck className="h-5 w-5 text-blue-600" />
                        Quick Assignments
                      </CardTitle>
                      <CardDescription>Quickly assign teachers and students to classes</CardDescription>
                    </div>
                    <Badge variant="outline">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid grid-cols-2 mb-6">
                      <TabsTrigger value="teacher" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Assign Teacher
                      </TabsTrigger>
                      <TabsTrigger value="student" className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        Assign Student
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="teacher" className="space-y-6">
                      {loading ? (
                        <div className="flex items-center justify-center py-12">
                          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        </div>
                      ) : (
                        <>
                          <div className="space-y-4">
                            <div>
                              <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                                <UserPlus className="h-4 w-4" />
                                Select Teacher
                              </Label>
                              <div className="relative mb-2">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <input
                                  type="text"
                                  placeholder="Search teachers..."
                                  value={searchTeacher}
                                  onChange={(e) => setSearchTeacher(e.target.value)}
                                  className="w-full pl-10 pr-3 py-2 border rounded-lg text-sm"
                                />
                              </div>
                              <Select
                                value={assignTeacherData.teacherId}
                                onValueChange={(value) =>
                                  setAssignTeacherData({ ...assignTeacherData, teacherId: value })
                                }
                                required
                              >
                                <SelectTrigger className="h-11">
                                  <SelectValue placeholder="Choose a teacher" />
                                </SelectTrigger>
                                <SelectContent className="max-h-64">
                                  {filteredTeachers.map((teacher) => (
                                    <SelectItem key={teacher._id || teacher.id} value={teacher._id || teacher.id}>
                                      <div className="flex items-center gap-3 py-2">
                                        <Avatar className="h-8 w-8">
                                          <AvatarImage src={teacher.photo?.url} />
                                          <AvatarFallback className="bg-blue-100 text-blue-700">
                                            {(teacher.user?.name || teacher.name)?.charAt(0)}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div>
                                          <div className="font-medium">{teacher.user?.name || teacher.name}</div>
                                          <div className="text-xs text-gray-500">{teacher.subject || 'No subject'}</div>
                                        </div>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="flex items-center justify-center">
                              <ArrowRight className="h-6 w-6 text-gray-400 rotate-90 md:rotate-0" />
                            </div>

                            <div>
                              <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                                <Building className="h-4 w-4" />
                                Select Class
                              </Label>
                              <Select
                                value={assignTeacherData.classId}
                                onValueChange={(value) =>
                                  setAssignTeacherData({ ...assignTeacherData, classId: value })
                                }
                                required
                              >
                                <SelectTrigger className="h-11">
                                  <SelectValue placeholder="Choose a class" />
                                </SelectTrigger>
                                <SelectContent className="max-h-64">
                                  {classes.map((classItem) => (
                                    <SelectItem key={classItem._id || classItem.id} value={classItem._id || classItem.id}>
                                      <div className="flex items-center gap-3 py-2">
                                        <div className="p-2 bg-blue-50 rounded-lg">
                                          <BookOpen className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <div>
                                          <div className="font-medium">{classItem.name}</div>
                                          <div className="text-xs text-gray-500">
                                            Section {classItem.section} • Grade {classItem.grade}
                                          </div>
                                        </div>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <Button
                            onClick={handleAssignTeacher}
                            disabled={submitting || !assignTeacherData.teacherId || !assignTeacherData.classId}
                            className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                          >
                            {submitting ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Assigning Teacher...
                              </>
                            ) : (
                              <>
                                <UserCheck className="mr-2 h-4 w-4" />
                                Assign Teacher to Class
                              </>
                            )}
                          </Button>
                        </>
                      )}
                    </TabsContent>

                    <TabsContent value="student" className="space-y-6">
                      {loading ? (
                        <div className="flex items-center justify-center py-12">
                          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        </div>
                      ) : (
                        <>
                          <div className="space-y-4">
                            <div>
                              <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                                <GraduationCap className="h-4 w-4" />
                                Select Student
                              </Label>
                              <div className="relative mb-2">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <input
                                  type="text"
                                  placeholder="Search students..."
                                  value={searchStudent}
                                  onChange={(e) => setSearchStudent(e.target.value)}
                                  className="w-full pl-10 pr-3 py-2 border rounded-lg text-sm"
                                />
                              </div>
                              <Select
                                value={assignStudentData.studentId}
                                onValueChange={(value) =>
                                  setAssignStudentData({ ...assignStudentData, studentId: value })
                                }
                                required
                              >
                                <SelectTrigger className="h-11">
                                  <SelectValue placeholder="Choose a student" />
                                </SelectTrigger>
                                <SelectContent className="max-h-64">
                                  {filteredStudents.map((student) => (
                                    <SelectItem key={student._id || student.id} value={student._id || student.id}>
                                      <div className="flex items-center gap-3 py-2">
                                        <Avatar className="h-8 w-8">
                                          <AvatarImage src={student.photo?.url} />
                                          <AvatarFallback className="bg-green-100 text-green-700">
                                            {(student.user?.name || student.name)?.charAt(0)}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div>
                                          <div className="font-medium">{student.user?.name || student.name}</div>
                                          <div className="text-xs text-gray-500">Roll: {student.rollNumber || 'N/A'}</div>
                                        </div>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="flex items-center justify-center">
                              <ArrowRight className="h-6 w-6 text-gray-400 rotate-90 md:rotate-0" />
                            </div>

                            <div>
                              <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                                <Building className="h-4 w-4" />
                                Select Class
                              </Label>
                              <Select
                                value={assignStudentData.classId}
                                onValueChange={(value) =>
                                  setAssignStudentData({ ...assignStudentData, classId: value })
                                }
                                required
                              >
                                <SelectTrigger className="h-11">
                                  <SelectValue placeholder="Choose a class" />
                                </SelectTrigger>
                                <SelectContent className="max-h-64">
                                  {classes.map((classItem) => (
                                    <SelectItem key={classItem._id || classItem.id} value={classItem._id || classItem.id}>
                                      <div className="flex items-center gap-3 py-2">
                                        <div className="p-2 bg-green-50 rounded-lg">
                                          <BookOpen className="h-4 w-4 text-green-600" />
                                        </div>
                                        <div>
                                          <div className="font-medium">{classItem.name}</div>
                                          <div className="text-xs text-gray-500">
                                            Section {classItem.section} • Grade {classItem.grade}
                                          </div>
                                        </div>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <Button
                            onClick={handleAssignStudent}
                            disabled={submitting || !assignStudentData.studentId || !assignStudentData.classId}
                            className="w-full h-11 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                          >
                            {submitting ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Assigning Student...
                              </>
                            ) : (
                              <>
                                <UserCheck className="mr-2 h-4 w-4" />
                                Assign Student to Class
                              </>
                            )}
                          </Button>
                        </>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Recent Assignments */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recent Assignments
                  </CardTitle>
                  <CardDescription>Recently assigned teachers and students</CardDescription>
                </CardHeader>
                <CardContent>
                  {recentAssignments.length === 0 ? (
                    <div className="text-center py-8">
                      <Info className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No recent assignments yet</p>
                      <p className="text-sm text-gray-400 mt-1">Assignments will appear here</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentAssignments.map((assignment, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className={`p-2 rounded-full ${assignment.type === 'teacher' ? 'bg-blue-100' : 'bg-green-100'}`}>
                            {assignment.type === 'teacher' ? (
                              <Users className="h-4 w-4 text-blue-600" />
                            ) : (
                              <GraduationCap className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">
                              {assignment.type === 'teacher' ? assignment.teacherName : assignment.studentName}
                            </p>
                            <p className="text-sm text-gray-500">
                              Assigned to {assignment.className} • {assignment.timestamp}
                            </p>
                          </div>
                          <Badge variant={assignment.type === 'teacher' ? 'default' : 'secondary'}>
                            {assignment.type === 'teacher' ? 'Teacher' : 'Student'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Stats & Info */}
            <div className="space-y-4 md:space-y-6">
              {/* Class Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Class Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {classes.slice(0, 5).map((classItem) => {
                    const studentCount = students.filter(s =>
                      (s.classId || s.class?._id) === (classItem._id || classItem.id)
                    ).length;
                    const teacherCount = teachers.filter(t =>
                      (t.classId || t.class?._id) === (classItem._id || classItem.id)
                    ).length;

                    return (
                      <div key={classItem._id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{classItem.name}</p>
                            <p className="text-xs text-gray-500">Section {classItem.section}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="font-bold">{studentCount}</p>
                              <p className="text-xs text-gray-500">students</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold">{teacherCount}</p>
                              <p className="text-xs text-gray-500">teachers</p>
                            </div>
                          </div>
                        </div>
                        <Progress value={(studentCount / stats.totalStudents) * 100} className="h-2" />
                      </div>
                    );
                  })}
                  {classes.length > 5 && (
                    <Button variant="ghost" size="sm" className="w-full">
                      View All Classes ({classes.length})
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <UserCheck className="h-5 w-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Eye className="mr-2 h-4 w-4" />
                    View All Unassigned
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Users className="mr-2 h-4 w-4" />
                    Bulk Assign Teachers
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <GraduationCap className="mr-2 h-4 w-4" />
                    Bulk Assign Students
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Advanced Filter
                  </Button>
                </CardContent>
              </Card>

              {/* Info Card */}
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <Info className="h-5 w-5 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Assignment Tips</h3>
                    </div>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start gap-2">
                        <div className="h-1.5 w-1.5 bg-blue-500 rounded-full mt-1.5" />
                        Assign one teacher per class for better management
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="h-1.5 w-1.5 bg-blue-500 rounded-full mt-1.5" />
                        Students can only be assigned to one class
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="h-1.5 w-1.5 bg-blue-500 rounded-full mt-1.5" />
                        Reassignments can be done anytime
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}