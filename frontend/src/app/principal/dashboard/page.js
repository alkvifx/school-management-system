'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/src/components/ProtectedRoute';
import { ROLES } from '@/src/utils/constants';
import { principalService } from '@/src/services/principal.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, GraduationCap, BookOpen, TrendingUp } from 'lucide-react';
import { Loader2 } from 'lucide-react';

export default function PrincipalDashboard() {
  const [stats, setStats] = useState({
    teachers: 0,
    students: 0,
    classes: 0,
    loading: true,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [teachers, students, classes] = await Promise.all([
          principalService.getTeachers(),
          principalService.getStudents(),
          principalService.getClasses(),
        ]);
        setStats({
          teachers: teachers?.length || 0,
          students: students?.length || 0,
          classes: classes?.length || 0,
          loading: false,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        setStats({ ...stats, loading: false });
      }
    };
    fetchStats();
  }, []);

  return (
    <ProtectedRoute allowedRoles={[ROLES.PRINCIPAL]}>
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Principal Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.loading ? '...' : stats.teachers}</div>
              <p className="text-xs text-muted-foreground">Active teachers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.loading ? '...' : stats.students}</div>
              <p className="text-xs text-muted-foreground">Enrolled students</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.loading ? '...' : stats.classes}</div>
              <p className="text-xs text-muted-foreground">Active classes</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your school</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <a
                href="/principal/teachers"
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <h3 className="font-semibold mb-2">Manage Teachers</h3>
                <p className="text-sm text-gray-600">Create and manage teachers</p>
              </a>
              <a
                href="/principal/students"
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <h3 className="font-semibold mb-2">Manage Students</h3>
                <p className="text-sm text-gray-600">Create and manage students</p>
              </a>
              <a
                href="/principal/classes"
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <h3 className="font-semibold mb-2">Manage Classes</h3>
                <p className="text-sm text-gray-600">Create and manage classes</p>
              </a>
              <a
                href="/principal/assign"
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <h3 className="font-semibold mb-2">Assign</h3>
                <p className="text-sm text-gray-600">Assign teachers and students</p>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
