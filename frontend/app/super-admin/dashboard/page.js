'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import ProtectedRoute from '@/src/components/ProtectedRoute';
import { ROLES } from '@/src/utils/constants';
import { superAdminService } from '@/src/services/superAdmin.service';
import { StatCard } from '@/src/components/dashboard/StatCard';
import { DashboardCard } from '@/src/components/dashboard/DashboardCard';
import { StatCardSkeleton } from '@/src/components/dashboard/LoadingSkeleton';
import { School, UserCog, TrendingUp, ArrowRight } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const quickActions = [
  {
    href: '/super-admin/schools',
    title: 'Manage Schools',
    description: 'Create and manage schools',
    icon: School,
  },
  {
    href: '/super-admin/principals',
    title: 'Manage Principals',
    description: 'Create and assign principals',
    icon: UserCog,
  },
];

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState({
    schools: 0,
    principals: 0,
    loading: true,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [schools, principals] = await Promise.all([
          superAdminService.getSchools(),
          superAdminService.getPrincipals(),
        ]);
        setStats({
          schools: schools?.length || 0,
          principals: principals?.length || 0,
          loading: false,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        setStats((prev) => ({ ...prev, loading: false }));
      }
    };
    fetchStats();
  }, []);

  return (
    <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <motion.div variants={containerVariants} className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Super Admin Dashboard
          </h1>
          <p className="text-gray-600">Manage schools and principals across the system</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {stats.loading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <StatCard
                title="Total Schools"
                value={stats.schools}
                description="Active schools in system"
                icon={School}
              />
              <StatCard
                title="Total Principals"
                value={stats.principals}
                description="Registered principals"
                icon={UserCog}
              />
              <StatCard
                title="System Status"
                value="Active"
                description="All systems operational"
                icon={TrendingUp}
                className="text-green-600"
              />
              <StatCard
                title="Quick Actions"
                value={quickActions.length.toString()}
                description="Available actions"
                icon={School}
              />
            </>
          )}
        </div>

        {/* Quick Actions */}
        <DashboardCard
          title="Quick Actions"
          description="Manage schools and principals efficiently"
          className="mb-8"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.div
                  key={action.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    href={action.href}
                    className="group block p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 bg-white"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-3 rounded-lg bg-gradient-to-br from-blue-900 to-blue-700 text-white group-hover:scale-110 transition-transform">
                        <Icon size={24} />
                      </div>
                      <ArrowRight
                        size={20}
                        className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all"
                      />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </DashboardCard>
      </motion.div>
    </ProtectedRoute>
  );
}
