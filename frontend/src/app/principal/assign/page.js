'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/src/components/ProtectedRoute';
import { ROLES } from '@/src/utils/constants';
import { principalService } from '@/src/services/principal.service';
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
import { UserCheck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

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
      await principalService.assignTeacher(assignTeacherData.teacherId, assignTeacherData.classId);
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
      await principalService.assignStudent(assignStudentData.studentId, assignStudentData.classId);
      toast.success('Student assigned successfully');
      setAssignStudentData({ studentId: '', classId: '' });
    } catch (error) {
      toast.error(error.message || 'Failed to assign student');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={[ROLES.PRINCIPAL]}>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Assign</h1>
          <p className="text-gray-600 mt-1">Assign teachers and students to classes</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Assign Teacher */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Assign Teacher to Class
              </CardTitle>
              <CardDescription>Link a teacher to a class</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-900" />
                </div>
              ) : (
                <form onSubmit={handleAssignTeacher} className="space-y-4">
                  <div>
                    <Label htmlFor="teacher">Teacher</Label>
                    <Select
                      value={assignTeacherData.teacherId}
                      onValueChange={(value) =>
                        setAssignTeacherData({ ...assignTeacherData, teacherId: value })
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select teacher" />
                      </SelectTrigger>
                      <SelectContent>
                        {teachers.map((teacher) => (
                          <SelectItem key={teacher._id || teacher.id} value={teacher._id || teacher.id}>
                            {teacher.name} ({teacher.subject || 'N/A'})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="class-teacher">Class</Label>
                    <Select
                      value={assignTeacherData.classId}
                      onValueChange={(value) =>
                        setAssignTeacherData({ ...assignTeacherData, classId: value })
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((classItem) => (
                          <SelectItem
                            key={classItem._id || classItem.id}
                            value={classItem._id || classItem.id}
                          >
                            {classItem.name} (Grade {classItem.grade} - {classItem.section})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" disabled={submitting} className="w-full">
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Assigning...
                      </>
                    ) : (
                      'Assign Teacher'
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Assign Student */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Assign Student to Class
              </CardTitle>
              <CardDescription>Link a student to a class</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-900" />
                </div>
              ) : (
                <form onSubmit={handleAssignStudent} className="space-y-4">
                  <div>
                    <Label htmlFor="student">Student</Label>
                    <Select
                      value={assignStudentData.studentId}
                      onValueChange={(value) =>
                        setAssignStudentData({ ...assignStudentData, studentId: value })
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select student" />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map((student) => (
                          <SelectItem key={student._id || student.id} value={student._id || student.id}>
                            {student.name} (Roll: {student.rollNumber || 'N/A'})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="class-student">Class</Label>
                    <Select
                      value={assignStudentData.classId}
                      onValueChange={(value) =>
                        setAssignStudentData({ ...assignStudentData, classId: value })
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((classItem) => (
                          <SelectItem
                            key={classItem._id || classItem.id}
                            value={classItem._id || classItem.id}
                          >
                            {classItem.name} (Grade {classItem.grade} - {classItem.section})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" disabled={submitting} className="w-full">
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Assigning...
                      </>
                    ) : (
                      'Assign Student'
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
