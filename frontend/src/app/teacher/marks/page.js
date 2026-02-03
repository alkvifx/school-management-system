'use client';

import { useEffect, useState } from 'react';
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
import { Award, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function MarksPage() {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [formData, setFormData] = useState({
    examType: '',
    subject: '',
    marks: {},
  });
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
      // Initialize marks state
      const initialMarks = {};
      classStudents.forEach((student) => {
        initialMarks[student._id || student.id] = '';
      });
      setFormData({ ...formData, marks: initialMarks });
    } catch (error) {
      toast.error(error.message || 'Failed to fetch students');
    }
  };

  const handleMarksChange = (studentId, value) => {
    setFormData({
      ...formData,
      marks: {
        ...formData.marks,
        [studentId]: value,
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClass || !formData.examType || !formData.subject) {
      toast.error('Please fill all required fields');
      return;
    }

    setSubmitting(true);

    try {
      const marksData = {
        examType: formData.examType,
        subject: formData.subject,
        classId: selectedClass,
        marks: Object.keys(formData.marks)
          .filter((studentId) => formData.marks[studentId])
          .map((studentId) => ({
            studentId,
            marks: parseFloat(formData.marks[studentId]),
          })),
      };

      await teacherService.submitMarks(marksData);
      toast.success('Marks submitted successfully');
      setFormData({ examType: '', subject: '', marks: {} });
      setSelectedClass('');
    } catch (error) {
      toast.error(error.message || 'Failed to submit marks');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={[ROLES.TEACHER]}>
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Submit Marks</h1>

        <Card>
          <CardHeader>
            <CardTitle>Marks Entry Form</CardTitle>
            <CardDescription>Enter marks for your students</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <Label htmlFor="examType">Exam Type</Label>
                  <Input
                    id="examType"
                    value={formData.examType}
                    onChange={(e) => setFormData({ ...formData, examType: e.target.value })}
                    placeholder="e.g., Mid-term, Final"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g., Mathematics"
                    required
                  />
                </div>
              </div>

              {selectedClass && students.length > 0 && (
                <div>
                  <Label>Student Marks</Label>
                  <div className="mt-2 space-y-3 border rounded-lg p-4 max-h-96 overflow-y-auto">
                    {students.map((student) => (
                      <div key={student._id || student.id} className="flex items-center gap-4">
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {student.name} (Roll: {student.rollNumber || 'N/A'})
                          </p>
                        </div>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          placeholder="Marks"
                          value={formData.marks[student._id || student.id] || ''}
                          onChange={(e) => handleMarksChange(student._id || student.id, e.target.value)}
                          className="w-32"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button type="submit" disabled={submitting || !selectedClass} className="w-full">
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Submit Marks
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
