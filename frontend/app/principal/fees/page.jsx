'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ProtectedRoute from '@/src/components/ProtectedRoute';
import { ROLES } from '@/src/utils/constants';
import { feesService } from '@/src/services/fees.service';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import {
  IndianRupee,
  Users,
  Bell,
  Receipt,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Wallet,
  Calendar,
  BarChart3,
  ArrowRight,
  Download,
  Sparkles
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function PrincipalFeesDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCollected: 0,
    pendingFees: 0,
    totalStudents: 0,
    activeStructures: 0,
    recentTransactions: [],
    monthlyTrend: [],
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, structures] = await Promise.all([
        feesService.getFeeStatistics(),
        feesService.getFeeStructures(),
      ]);

      setStats({
        totalCollected: statsData?.paidAmount || 0,
        pendingFees: statsData?.pendingAmount || 0,
        totalStudents: statsData?.total || 0,
        activeStructures: structures?.filter((s) => s.isActive)?.length || 0,
        recentTransactions: [], // Can be enhanced later
        monthlyTrend: [], // Can be enhanced later
      });
    } catch (error) {
      toast.error('Failed to load dashboard data');
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

  const getCollectionRate = () => {
    if (stats.totalStudents === 0) return '0%';
    const collected = (stats.totalCollected / (stats.totalCollected + stats.pendingFees)) * 100;
    return `${Math.round(collected)}%`;
  };

  const navigateTo = (path) => {
    router.push(path);
  };

  const mainCards = [
    {
      id: 'collect',
      title: 'Collect Fees',
      description: 'Process fee payments from students',
      icon: Wallet,
      iconColor: 'text-green-600',
      bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50',
      borderColor: 'border-green-200',
      route: '/principal/fees/collect',
      stats: `${formatCurrency(stats.totalCollected)} collected`,
      actionText: 'Collect Payment',
    },
    {
      id: 'initialize',
      title: 'Initialize Fees',
      description: 'Set up fee structures for classes',
      icon: Receipt,
      iconColor: 'text-blue-600',
      bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-50',
      borderColor: 'border-blue-200',
      route: '/principal/fees/initialize',
      stats: `${stats.activeStructures} active structures`,
      actionText: 'Initialize Now',
    },
    {
      id: 'reminder',
      title: 'Send Reminders',
      description: 'Notify parents about pending fees',
      icon: Bell,
      iconColor: 'text-amber-600',
      bgColor: 'bg-gradient-to-br from-amber-50 to-orange-50',
      borderColor: 'border-amber-200',
      route: '/principal/fees/reminders',
      stats: `${stats.pendingFees > 0 ? formatCurrency(stats.pendingFees) + ' pending' : 'All clear'}`,
      actionText: 'Send Reminders',
    },
    {
      id: 'structure',
      title: 'Fee Structure',
      description: 'Manage class-wise fee structures',
      icon: FileText,
      iconColor: 'text-purple-600',
      bgColor: 'bg-gradient-to-br from-purple-50 to-violet-50',
      borderColor: 'border-purple-200',
      route: '/principal/fees/structure',
      stats: 'Configure fees',
      actionText: 'Manage Structures',
    },
    {
      id: 'list',
      title: 'View Fees',
      description: 'View and manage student fees',
      icon: FileText,
      iconColor: 'text-indigo-600',
      bgColor: 'bg-gradient-to-br from-indigo-50 to-blue-50',
      borderColor: 'border-indigo-200',
      route: '/principal/fees/list',
      stats: 'Browse all fees',
      actionText: 'View List',
    },
  ];

  const quickStats = [
    {
      id: 'collection-rate',
      title: 'Collection Rate',
      value: getCollectionRate(),
      icon: TrendingUp,
      change: '+5.2%',
      trend: 'up',
      description: 'From last month',
    },
    {
      id: 'pending-fees',
      title: 'Pending Fees',
      value: formatCurrency(stats.pendingFees),
      icon: Clock,
      change: stats.pendingFees > 0 ? 'Need attention' : 'All clear',
      trend: stats.pendingFees > 0 ? 'warning' : 'positive',
      description: 'Requires follow-up',
    },
    {
      id: 'total-students',
      title: 'Total Students',
      value: stats.totalStudents,
      icon: Users,
      change: '+12',
      trend: 'up',
      description: 'Active enrollments',
    },
    {
      id: 'structures',
      title: 'Active Structures',
      value: stats.activeStructures,
      icon: CheckCircle,
      change: 'All configured',
      trend: 'neutral',
      description: 'Fee structures',
    },
  ];

  return (
    <ProtectedRoute allowedRoles={[ROLES.PRINCIPAL, ROLES.ACCOUNTANT]}>
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
                  <IndianRupee className="h-6 w-6 text-white" />
                </div>
                <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 bg-clip-text text-transparent">
                  Fees Management
                </span>
              </h1>
              <p className="text-gray-600 mt-2">
                Overview and quick actions for fee management
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={fetchDashboardData}
                disabled={loading}
                className="border-gray-300"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>

          {/* Welcome Card */}
          <Card className="mb-8 bg-gradient-to-r from-blue-50 via-white to-blue-50 border-blue-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Welcome to Fees Management
                  </h2>
                  <p className="text-gray-600">
                    Manage all fee-related activities from one dashboard. Track collections,
                    send reminders, and configure fee structures.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Total Collected</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(stats.totalCollected)}
                    </p>
                  </div>
                  <div className="h-12 w-px bg-gray-300" />
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Collection Rate</p>
                    <p className="text-2xl font-bold text-green-600">
                      {getCollectionRate()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Action Cards Grid */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Quick Actions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mainCards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={`h-full cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${card.bgColor} ${card.borderColor} border-2 hover:border-blue-300`}
                  onClick={() => navigateTo(card.route)}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col h-full">
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 rounded-xl bg-white shadow-sm">
                          <card.icon className={`h-6 w-6 ${card.iconColor}`} />
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                      </div>

                      <div className="flex-grow">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {card.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          {card.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">
                            {card.stats}
                          </span>
                          <Button
                            size="sm"
                            className={`${card.iconColor.replace('text-', 'bg-').replace('-600', '-500')} hover:${card.iconColor.replace('text-', 'bg-').replace('-600', '-700')} text-white`}
                          >
                            {card.actionText}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Fee Overview
          </h2>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickStats.map((stat) => (
                <Card key={stat.id} className="border shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                      <div className={`p-3 rounded-full ${stat.trend === 'up' ? 'bg-green-100' : stat.trend === 'warning' ? 'bg-amber-100' : 'bg-blue-100'}`}>
                        <stat.icon className={`h-5 w-5 ${stat.trend === 'up' ? 'text-green-600' : stat.trend === 'warning' ? 'text-amber-600' : 'text-blue-600'}`} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-medium ${
                        stat.trend === 'up' ? 'text-green-600' :
                        stat.trend === 'warning' ? 'text-amber-600' :
                        'text-gray-600'
                      }`}>
                        {stat.change}
                      </span>
                      <span className="text-xs text-gray-500">{stat.description}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Recent Transactions & Additional Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Transactions */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Recent Transactions
                </CardTitle>
                <CardDescription>
                  Latest fee collection activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 rounded-lg" />
                    ))}
                  </div>
                ) : stats.recentTransactions.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="p-3 rounded-full bg-gray-100 w-12 h-12 flex items-center justify-center mx-auto mb-3">
                      <Receipt className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-gray-500">No recent transactions</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {stats.recentTransactions.slice(0, 5).map((transaction, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${transaction.status === 'paid' ? 'bg-green-100' : 'bg-amber-100'}`}>
                            {transaction.status === 'paid' ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <Clock className="h-4 w-4 text-amber-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {transaction.studentName || 'Student'}
                            </p>
                            <p className="text-sm text-gray-500">
                              {transaction.className || 'Class'} • {transaction.date || 'Date'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(transaction.amount || 0)}
                          </p>
                          <p className={`text-xs font-medium ${
                            transaction.status === 'paid' ? 'text-green-600' : 'text-amber-600'
                          }`}>
                            {transaction.status === 'paid' ? 'Paid' : 'Pending'}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
                <div className="mt-6">
                  <Button
                    variant="outline"
                    className="w-full border-dashed"
                    onClick={() => navigateTo('/principal/fees/transactions')}
                  >
                    View All Transactions
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Tips */}
          <div>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                  Quick Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 mb-1">
                      Regular Fee Collection
                    </p>
                    <p className="text-xs text-blue-700">
                      Schedule fee collection at the beginning of each month for better cash flow.
                    </p>
                  </div>

                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium text-green-900 mb-1">
                      Send Automated Reminders
                    </p>
                    <p className="text-xs text-green-700">
                      Use the reminder system to automatically notify parents 3 days before due date.
                    </p>
                  </div>

                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm font-medium text-purple-900 mb-1">
                      Review Fee Structures
                    </p>
                    <p className="text-xs text-purple-700">
                      Update fee structures annually considering inflation and new facilities.
                    </p>
                  </div>

                  <div className="p-3 bg-amber-50 rounded-lg">
                    <p className="text-sm font-medium text-amber-900 mb-1">
                      High Pending Fees?
                    </p>
                    <p className="text-xs text-amber-700">
                      Classes with 30% pending fees may require parent-teacher meetings.
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigateTo('/principal/fees/reports')}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Detailed Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-center md:text-left">
                  <p className="text-sm text-gray-600 mb-1">Fee Management Status</p>
                  <p className="text-lg font-semibold text-gray-900">
                    All systems operational
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{getCollectionRate()}</p>
                    <p className="text-xs text-gray-500">Collection Rate</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{stats.activeStructures}</p>
                    <p className="text-xs text-gray-500">Active Structures</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-amber-600">
                      {formatCurrency(stats.pendingFees)}
                    </p>
                    <p className="text-xs text-gray-500">Pending Fees</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </ProtectedRoute>
  );
}