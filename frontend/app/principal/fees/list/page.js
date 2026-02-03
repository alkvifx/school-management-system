'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/src/components/ProtectedRoute';
import { ROLES } from '@/src/utils/constants';
import { feesService } from '@/src/services/fees.service';
import { principalService } from '@/src/services/principal.service';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  RefreshCw,
  Search,
  Filter,
  Download,
  IndianRupee,
  Users,
  FileText,
} from 'lucide-react';
import { FeeStatusBadge } from '@/src/components/fees/FeeStatusBadge';
import { EmptyState } from '@/src/components/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

export default function FeeListPage() {
  const [activeTab, setActiveTab] = useState('class');
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear().toString());

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (activeTab === 'class' && selectedClass) {
      fetchClassFees();
    } else if (activeTab === 'defaulters') {
      fetchDefaulters();
    }
  }, [activeTab, selectedClass, statusFilter, academicYear]);

  const fetchClasses = async () => {
    try {
      const data = await principalService.getClasses();
      setClasses(data || []);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch classes');
    }
  };

  const fetchClassFees = async () => {
    if (!selectedClass) return;
    try {
      setLoading(true);
      const filters = {};
      if (statusFilter !== 'all') filters.status = statusFilter;
      if (academicYear) filters.academicYear = academicYear;

      const data = await feesService.getClassFees(selectedClass, filters);
      setFees(data || []);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch fees');
      setFees([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDefaulters = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (selectedClass) filters.classId = selectedClass;

      const data = await feesService.getFeeDefaulters(filters);
      setFees(data || []);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch defaulters');
      setFees([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const filteredFees = fees.filter((fee) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const studentName = fee.studentId?.userId?.name?.toLowerCase() || '';
    const rollNumber = fee.studentId?.rollNumber?.toString() || '';
    return studentName.includes(term) || rollNumber.includes(term);
  });

  const getStats = () => {
    return {
      total: fees.length,
      paid: fees.filter((f) => f.status === 'PAID').length,
      partial: fees.filter((f) => f.status === 'PARTIAL').length,
      unpaid: fees.filter((f) => f.status === 'UNPAID').length,
      overdue: fees.filter((f) => f.status === 'OVERDUE').length,
      totalAmount: fees.reduce((sum, f) => sum + (f.totalAmount || 0), 0),
      paidAmount: fees.reduce((sum, f) => sum + (f.paidAmount || 0), 0),
      pendingAmount: fees.reduce((sum, f) => sum + (f.pendingAmount || 0), 0),
    };
  };

  const stats = getStats();

  return (
    <ProtectedRoute allowedRoles={[ROLES.PRINCIPAL, ROLES.TEACHER]}>
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Fee List</h1>
              <p className="text-gray-600 mt-2">View and manage student fees</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={fetchClassFees} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList>
              <TabsTrigger value="class">By Class</TabsTrigger>
              <TabsTrigger value="defaulters">Defaulters</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Class</label>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All Classes">All Classes</SelectItem>
                      {classes.map((cls) => (
                        <SelectItem key={cls._id || cls.id} value={cls._id || cls.id}>
                          {cls.name}
                          {cls.section && ` - ${cls.section}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {activeTab === 'class' && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="PAID">Paid</SelectItem>
                        <SelectItem value="PARTIAL">Partial</SelectItem>
                        <SelectItem value="UNPAID">Unpaid</SelectItem>
                        <SelectItem value="OVERDUE">Overdue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Academic Year
                  </label>
                  <Input
                    type="text"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    placeholder="e.g., 2024-2025"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Student name or roll..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          {fees.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-gray-600">Total Records</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-gray-600">Paid Amount</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(stats.paidAmount)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-gray-600">Pending Amount</p>
                  <p className="text-2xl font-bold text-amber-600">
                    {formatCurrency(stats.pendingAmount)}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Fees Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                {activeTab === 'class' ? 'Class Fees' : 'Fee Defaulters'}
              </CardTitle>
              <CardDescription>
                {activeTab === 'class'
                  ? 'View all fee records for the selected class'
                  : 'Students with pending or overdue fees'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : filteredFees.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="No Fees Found"
                  description={
                    activeTab === 'class'
                      ? 'Select a class to view fee records'
                      : 'No defaulters found'
                  }
                />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Roll No.</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Academic Year</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Paid</TableHead>
                        <TableHead>Pending</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredFees.map((fee) => (
                        <TableRow key={fee._id || fee.id}>
                          <TableCell className="font-medium">
                            {fee.studentId?.userId?.name || 'N/A'}
                          </TableCell>
                          <TableCell>{fee.studentId?.rollNumber || 'N/A'}</TableCell>
                          <TableCell>
                            {fee.classId?.name || 'N/A'}
                            {fee.classId?.section && ` - ${fee.classId.section}`}
                          </TableCell>
                          <TableCell>{fee.academicYear || 'N/A'}</TableCell>
                          <TableCell>{formatCurrency(fee.totalAmount)}</TableCell>
                          <TableCell className="text-green-600">
                            {formatCurrency(fee.paidAmount)}
                          </TableCell>
                          <TableCell className="text-amber-600">
                            {formatCurrency(fee.pendingAmount)}
                          </TableCell>
                          <TableCell>
                            {fee.dueDate
                              ? format(new Date(fee.dueDate), 'dd MMM yyyy')
                              : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <FeeStatusBadge status={fee.status} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
