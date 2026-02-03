'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import ProtectedRoute from '@/src/components/ProtectedRoute';
import { ROLES } from '@/src/utils/constants';
import { principalService } from '@/src/services/principal.service';
import {
  EyeOff,
  ChevronLeft,
  Users,
  BookOpen,
  BarChart3,
  Loader2,
  ChevronDown,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const statusConfig = {
  compliant: { label: 'Fully compliant', color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle2 },
  warning: { label: 'Delays detected', color: 'bg-amber-100 text-amber-800', icon: AlertTriangle },
  risk: { label: 'High-risk pattern', color: 'bg-red-100 text-red-800', icon: XCircle },
};

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
}

export default function SilentControlPage() {
  const [tab, setTab] = useState('teachers');
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const fetchAll = async () => {
    try {
      setError(null);
      setLoading(true);
      const [tRes, cRes, sRes] = await Promise.all([
        principalService.getMonitoringTeachers(),
        principalService.getMonitoringClasses(),
        principalService.getMonitoringSummary(),
      ]);
      setTeachers(tRes?.teachers ?? []);
      setClasses(cRes?.classes ?? []);
      setSummary(sRes ?? null);
    } catch (e) {
      setError(e.message || 'Failed to load monitoring');
      toast.error('Failed to load Silent Control data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  return (
    <ProtectedRoute allowedRoles={[ROLES.PRINCIPAL]}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50/50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/principal/dashboard">
              <Button variant="ghost" size="icon">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <EyeOff className="h-6 w-6 text-slate-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Silent Control</h1>
                <p className="text-sm text-gray-500">Activity & compliance overview</p>
              </div>
            </div>
          </div>

          {error && (
            <Card className="mb-6 border-amber-200 bg-amber-50/50">
              <CardContent className="py-4 flex items-center justify-between">
                <p className="text-amber-800 text-sm">{error}</p>
                <Button variant="outline" size="sm" onClick={fetchAll}>Retry</Button>
              </CardContent>
            </Card>
          )}

          <Tabs value={tab} onValueChange={setTab} className="space-y-4">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="teachers" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Teachers
              </TabsTrigger>
              <TabsTrigger value="classes" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Classes
              </TabsTrigger>
              <TabsTrigger value="summary" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Summary
              </TabsTrigger>
            </TabsList>

            <TabsContent value="teachers" className="space-y-4">
              {loading ? (
                <Card>
                  <CardContent className="py-12 flex justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Teacher activity</CardTitle>
                    <p className="text-sm text-gray-500">Last login, attendance & marks (read-only)</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {teachers.length === 0 ? (
                        <p className="text-sm text-gray-500 py-4 text-center">No teachers in school.</p>
                      ) : (
                        teachers.map((t) => {
                          const config = statusConfig[t.status] || statusConfig.compliant;
                          const Icon = config.icon;
                          const isExpanded = expandedId === t.teacherId;
                          return (
                            <motion.div
                              key={t.teacherId}
                              layout
                              className={cn(
                                'rounded-xl border transition-colors',
                                isExpanded ? 'border-slate-300 bg-slate-50/50' : 'border-gray-200 bg-white'
                              )}
                            >
                              <button
                                type="button"
                                onClick={() => setExpandedId(isExpanded ? null : t.teacherId)}
                                className="w-full flex items-center gap-3 p-4 text-left"
                              >
                                <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium', config.color)}>
                                  <Icon className="h-3.5 w-3.5" />
                                  {config.label}
                                </span>
                                <span className="font-semibold text-gray-900 truncate flex-1">{t.name ?? '—'}</span>
                                <span className="text-sm text-gray-500">
                                  Att. today: {t.attendanceMarkedToday ?? 0} · Marks: {t.marksUploadedToday ?? 0}
                                </span>
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
                                )}
                              </button>
                              {isExpanded && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="px-4 pb-4 pt-0 border-t border-gray-100"
                                >
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 text-sm">
                                    <div className="flex items-center gap-2 text-gray-600">
                                      <Clock className="h-4 w-4" />
                                      Last login: {formatDate(t.lastLoginAt)}
                                    </div>
                                    <div>Last attendance: {formatDate(t.lastAttendanceAt)}</div>
                                    <div>Last activity: {formatDate(t.lastActivityAt)}</div>
                                    {t.assignedClasses?.length > 0 && (
                                      <div className="sm:col-span-2">
                                        Classes: {t.assignedClasses.map((c) => `${c.name}${c.section}`).join(', ')}
                                      </div>
                                    )}
                                    {(t.flags?.attendanceLate || t.flags?.attendanceMultipleEdits || t.flags?.studentUpdatesHigh) && (
                                      <div className="sm:col-span-2 flex flex-wrap gap-2">
                                        {t.flags.attendanceLate && (
                                          <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-xs">Attendance after deadline</span>
                                        )}
                                        {t.flags.attendanceMultipleEdits && (
                                          <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-xs">Multiple attendance entries today</span>
                                        )}
                                        {t.flags.studentUpdatesHigh && (
                                          <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-xs">High student update count</span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </motion.div>
                          );
                        })
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="classes" className="space-y-4">
              {loading ? (
                <Card>
                  <CardContent className="py-12 flex justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Class-level compliance</CardTitle>
                    <p className="text-sm text-gray-500">Attendance marked today & late count</p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {classes.length === 0 ? (
                        <p className="text-sm text-gray-500 col-span-2 py-4 text-center">No classes.</p>
                      ) : (
                        classes.map((c) => (
                          <div
                            key={c.classId}
                            className="rounded-xl border border-gray-200 bg-white p-4 flex items-center justify-between"
                          >
                            <span className="font-medium text-gray-900">{c.label}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">
                                Att. marked: {c.attendanceMarkedToday ?? 0}
                                {c.attendanceLateCount > 0 && (
                                  <span className="text-amber-600 ml-1">({c.attendanceLateCount} late)</span>
                                )}
                              </span>
                              <span
                                className={cn(
                                  'px-2 py-0.5 rounded text-xs font-medium',
                                  (c.complianceScore ?? 100) >= 80 ? 'bg-emerald-100 text-emerald-800' :
                                  (c.complianceScore ?? 0) >= 60 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                                )}
                              >
                                {c.complianceScore ?? 0}%
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="summary" className="space-y-4">
              {loading ? (
                <Card>
                  <CardContent className="py-12 flex justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Feature usage (last 30 days)</CardTitle>
                    <p className="text-sm text-gray-500">Module usage count & last used</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {summary?.modules?.length === 0 ? (
                        <p className="text-sm text-gray-500 py-4 text-center">No usage data yet.</p>
                      ) : (
                        (summary?.modules ?? []).map((m) => (
                          <div
                            key={m.id}
                            className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3"
                          >
                            <span className="font-medium text-gray-900">{m.name}</span>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>Used: {m.usageCount ?? 0}</span>
                              <span>Last: {formatDate(m.lastUsed)}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  );
}
