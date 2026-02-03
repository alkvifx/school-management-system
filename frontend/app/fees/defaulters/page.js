'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/src/components/ProtectedRoute';
import { ROLES } from '@/src/utils/constants';
import { feesService } from '@/src/services/fees.service';
import { principalService } from '@/src/services/principal.service';
import { teacherService } from '@/src/services/teacher.service';
import { useAuth } from '@/src/context/auth.context';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FeeStatusBadge } from '@/src/components/fees/FeeStatusBadge';
import { Bell, Loader2 } from 'lucide-react';
import { EmptyState } from '@/src/components/EmptyState';
import { AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function FeeDefaultersPage() {
  const { user } = useAuth();
  const [defaulters, setDefaulters] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingReminder, setSendingReminder] = useState(null);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    fetchDefaulters();
  }, [selectedClass]);

  const fetchClasses = async () => {
    try {
      const service = user?.role === ROLES.PRINCIPAL ? principalService : teacherService;
      const data = await service.getClasses();
      setClasses(data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchDefaulters = async () => {
    try {
      setLoading(true);
      const filters = selectedClass ? { classId: selectedClass } : {};
      const data = await feesService.getFeeDefaulters(filters);
      setDefaulters(data || []);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch defaulters');
    } finally {
      setLoading(false);
    }
  };

  const handleSendReminder = async (studentId) => {
    try {
      setSendingReminder(studentId);
      await feesService.sendFeeReminders({
        targetType: 'individual',
        studentIds: [studentId],
      });
      toast.success('Reminder sent successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to send reminder');
    } finally {
      setSendingReminder(null);
    }
  };

  const isPrincipal = user?.role === ROLES.PRINCIPAL;

  return (
    <ProtectedRoute allowedRoles={[ROLES.PRINCIPAL, ROLES.TEACHER]}>
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Fee Defaulters</h1>
            <p className="text-gray-600 mt-1">Students with pending fee payments</p>
          </div>
          <div className="w-full sm:w-auto">
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Classes</SelectItem>
                {classes.map((cls) => (
                  <SelectItem key={cls._id || cls.id} value={cls._id || cls.id}>
                    {cls.name}
                    {cls.section && ` - ${cls.section}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <Card>
            <CardContent className="p-6">
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
                ))}
              </div>
            </CardContent>
          </Card>
        ) : defaulters.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <EmptyState
                icon={AlertCircle}
                title="No Defaulters Found"
                description={
                  selectedClass
                    ? 'No students with pending fees in the selected class'
                    : 'No students with pending fees'
                }
              />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Defaulters List ({defaulters.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Pending Amount</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Late Fine</TableHead>
                      <TableHead>Status</TableHead>
                      {isPrincipal && <TableHead>Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {defaulters.map((defaulter) => {
                      const student = defaulter.student || defaulter;
                      const feeInfo = defaulter.feeInfo || defaulter;
                      const isOverdue =
                        feeInfo.dueDate && new Date(feeInfo.dueDate) < new Date();

                      return (
                        <TableRow key={student._id || student.id}>
                          <TableCell className="font-medium">
                            {student.name || 'N/A'}
                            {student.rollNumber && (
                              <span className="text-sm text-gray-500 ml-2">
                                (Roll: {student.rollNumber})
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            {student.classId?.name || 'N/A'}
                            {student.classId?.section && ` - ${student.classId.section}`}
                          </TableCell>
                          <TableCell className="font-semibold text-red-600">
                            ₹{(feeInfo.pendingAmount || 0).toLocaleString('en-IN')}
                          </TableCell>
                          <TableCell>
                            {feeInfo.dueDate ? (
                              <span
                                className={
                                  isOverdue ? 'text-red-600 font-semibold' : 'text-gray-600'
                                }
                              >
                                {format(new Date(feeInfo.dueDate), 'PP')}
                              </span>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell className="text-orange-600">
                            ₹{(feeInfo.lateFine || 0).toLocaleString('en-IN')}
                          </TableCell>
                          <TableCell>
                            <FeeStatusBadge
                              status={isOverdue ? 'OVERDUE' : feeInfo.status || 'UNPAID'}
                            />
                          </TableCell>
                          {isPrincipal && (
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleSendReminder(student._id || student.id)
                                }
                                disabled={sendingReminder === (student._id || student.id)}
                              >
                                {sendingReminder === (student._id || student.id) ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <Bell className="h-4 w-4 mr-1" />
                                    Remind
                                  </>
                                )}
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ProtectedRoute>
  );
}
