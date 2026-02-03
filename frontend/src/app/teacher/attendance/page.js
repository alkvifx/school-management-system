'use client';

import { useEffect, useState } from 'react';
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
import { ClipboardList, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function AttendancePage() {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents();
    }
  }, [selectedClass]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const data = await teacherService.getClasses();
      setClasses(data || []);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch classes');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const data = await teacherService.getStudents();
      const classStudents = data?.filter((s) => s.classId === selectedClass) || [];
      setStudents(classStudents);
      // Initialize attendance state
      const initialAttendance = {};
      classStudents.forEach((student) => {
        initialAttendance[student._id || student.id] = true; // Default to present
      });
      setAttendance(initialAttendance);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch students');
    }
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
        date: attendanceDate,
        classId: selectedClass,
        students: Object.keys(attendance).map((studentId) => ({
          studentId,
          status: attendance[studentId] ? 'present' : 'absent',
        })),
      };

      await teacherService.markAttendance(attendanceData);
      toast.success('Attendance marked successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to mark attendance');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={[ROLES.TEACHER]}>
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Mark Attendance</h1>

        <Card>
          <CardHeader>
            <CardTitle>Attendance Form</CardTitle>
            <CardDescription>Mark attendance for your students</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="class">Class</Label>
                  <Select value={selectedClass} onValueChange={setSelectedClass} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((classItem) => (
                        <SelectItem key={classItem._id || classItem.id} value={classItem._id || classItem.id}>
                          {classItem.name} (Grade {classItem.grade} - {classItem.section})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="date">Date</Label>
                  <input
                    id="date"
                    type="date"
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    required
                  />
                </div>
              </div>

              {selectedClass && students.length > 0 && (
                <div>
                  <Label>Students</Label>
                  <div className="mt-2 space-y-2 border rounded-lg p-4 max-h-96 overflow-y-auto">
                    {students.map((student) => (
                      <div key={student._id || student.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={student._id || student.id}
                          checked={attendance[student._id || student.id] || false}
                          onCheckedChange={(checked) =>
                            setAttendance({
                              ...attendance,
                              [student._id || student.id]: checked,
                            })
                          }
                        />
                        <label
                          htmlFor={student._id || student.id}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                        >
                          {student.name} (Roll: {student.rollNumber || 'N/A'})
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button type="submit" disabled={submitting || !selectedClass} className="w-full">
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Mark Attendance
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
