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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StatCard } from '@/src/components/dashboard/StatCard';
import {
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6366f1'];

export default function FeeStatisticsPage() {
  const { user } = useAuth();
  const [statistics, setStatistics] = useState(null);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    fetchStatistics();
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

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const filters = selectedClass ? { classId: selectedClass } : {};
      const data = await feesService.getFeeStatistics(filters);
      setStatistics(data);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  const chartData = statistics
    ? [
        { name: 'Paid', value: statistics.paidCount || 0 },
        { name: 'Partial', value: statistics.partialCount || 0 },
        { name: 'Unpaid', value: statistics.unpaidCount || 0 },
        { name: 'Overdue', value: statistics.overdueCount || 0 },
      ]
    : [];

  const amountData = statistics
    ? [
        { name: 'Total', amount: statistics.totalAmount || 0 },
        { name: 'Paid', amount: statistics.paidAmount || 0 },
        { name: 'Pending', amount: statistics.pendingAmount || 0 },
        { name: 'Late Fine', amount: statistics.lateFineCollected || 0 },
      ]
    : [];

  return (
    <ProtectedRoute allowedRoles={[ROLES.PRINCIPAL, ROLES.TEACHER]}>
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Fee Statistics</h1>
            <p className="text-gray-600 mt-1">Overview of fee collection and payment status</p>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Student Status Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard
                title="Total Students"
                value={statistics?.totalStudents || 0}
                icon={Users}
                loading={loading}
              />
              <StatCard
                title="Paid"
                value={statistics?.paidCount || 0}
                icon={CheckCircle2}
                className="text-green-600"
                loading={loading}
              />
              <StatCard
                title="Partial"
                value={statistics?.partialCount || 0}
                icon={Clock}
                className="text-yellow-600"
                loading={loading}
              />
              <StatCard
                title="Unpaid"
                value={statistics?.unpaidCount || 0}
                icon={XCircle}
                className="text-red-600"
                loading={loading}
              />
            </div>

            {/* Amount Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard
                title="Total Amount"
                value={`₹${(statistics?.totalAmount || 0).toLocaleString('en-IN')}`}
                icon={DollarSign}
                loading={loading}
              />
              <StatCard
                title="Paid Amount"
                value={`₹${(statistics?.paidAmount || 0).toLocaleString('en-IN')}`}
                icon={TrendingUp}
                className="text-green-600"
                loading={loading}
              />
              <StatCard
                title="Pending Amount"
                value={`₹${(statistics?.pendingAmount || 0).toLocaleString('en-IN')}`}
                icon={AlertTriangle}
                className="text-red-600"
                loading={loading}
              />
              <StatCard
                title="Late Fine Collected"
                value={`₹${(statistics?.lateFineCollected || 0).toLocaleString('en-IN')}`}
                icon={DollarSign}
                className="text-orange-600"
                loading={loading}
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Amount Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={amountData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                      />
                      <Bar dataKey="amount" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
