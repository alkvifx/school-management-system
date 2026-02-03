'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import ProtectedRoute from '@/src/components/ProtectedRoute';
import { ROLES } from '@/src/utils/constants';
import { useAuth } from '@/src/context/auth.context';
import { studentService } from '@/src/services/student.service';
import { profileService } from '@/src/services/profile.service';
import { leaderboardService } from '@/src/services/leaderboard.service';
import { Trophy, Medal, Award, Star, ChevronLeft, Users, Building2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const rankIcons = {
  1: Trophy,
  2: Medal,
  3: Award,
};

function RankIcon({ rank }) {
  const Icon = rankIcons[rank];
  if (!Icon) return <span className="text-lg font-bold w-8 text-center">#{rank}</span>;
  const color = rank === 1 ? 'text-amber-500' : rank === 2 ? 'text-gray-400' : 'text-amber-700';
  return <Icon className={cn('h-7 w-7', color)} aria-hidden />;
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [myRank, setMyRank] = useState(null);
  const [scope, setScope] = useState('class');
  const [period, setPeriod] = useState('weekly');
  const [data, setData] = useState({ entries: [], periodKey: null });
  const [loading, setLoading] = useState(true);
  const [loadingBoard, setLoadingBoard] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (user?.role === ROLES.STUDENT) {
          const p = await studentService.getProfile();
          if (cancelled) return;
          setProfile({
            id: p.id,
            class: p.class,
            school: p.school,
            name: p?.user?.name,
          });
        } else {
          const p = await profileService.getProfile();
          if (cancelled) return;
          const schoolId = p?.school?.id || p?.schoolId;
          const firstClass = p?.teacher?.assignedClasses?.[0];
          setProfile({
            id: null,
            class: firstClass ? { id: firstClass._id, name: firstClass.name, section: firstClass.section } : null,
            school: p?.school ? { id: p.school.id, name: p.school.name } : null,
            name: p?.name,
          });
        }
      } catch (e) {
        if (!cancelled) toast.error('Failed to load profile');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.role]);

  useEffect(() => {
    if (!profile?.school?.id) return;
    const classId = scope === 'class' ? profile.class?.id : null;
    if (scope === 'class' && !classId) {
      setData({ entries: [], periodKey: null });
      setLoadingBoard(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setLoadingBoard(true);
        const promises = [
          user?.role === ROLES.STUDENT ? leaderboardService.getMyRank(period) : Promise.resolve({ isStudent: false }),
          scope === 'class'
            ? leaderboardService.getClassLeaderboard(classId, period)
            : leaderboardService.getSchoolLeaderboard(profile.school.id, period),
        ];
        const [rankRes, boardRes] = await Promise.all(promises);
        if (cancelled) return;
        setMyRank(rankRes);
        setData({ entries: boardRes?.entries || [], periodKey: boardRes?.periodKey });
      } catch (e) {
        if (!cancelled) toast.error('Failed to load leaderboard');
        setData({ entries: [], periodKey: null });
      } finally {
        if (!cancelled) setLoadingBoard(false);
      }
    })();
    return () => { cancelled = true; };
  }, [profile, scope, period, user?.role]);

  const currentStudentId = user?.role === ROLES.STUDENT ? profile?.id : null;
  const isStudent = myRank?.isStudent !== false;

  return (
    <ProtectedRoute allowedRoles={[ROLES.STUDENT, ROLES.TEACHER, ROLES.PRINCIPAL]}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30">
        <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
          <div className="flex items-center gap-3 mb-6">
            <Link href={user?.role === ROLES.STUDENT ? '/student/dashboard' : user?.role === ROLES.PRINCIPAL ? '/principal/dashboard' : '/teacher/dashboard'}>
              <Button variant="ghost" size="icon">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
              <p className="text-sm text-gray-500">Stars & ranks</p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
            </div>
          ) : !profile?.school?.id ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                No school assigned. You need a school to view the leaderboard.
              </CardContent>
            </Card>
          ) : (
            <>
              {isStudent && myRank && (
                <Card className="mb-6 border-amber-200 bg-gradient-to-br from-amber-50/80 to-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Star className="h-5 w-5 text-amber-500" />
                      Your rank this {period === 'weekly' ? 'week' : 'month'}
                    </CardTitle>
                    <CardDescription>
                      {period === 'weekly' ? 'Weekly' : 'Monthly'} • {scope === 'class' ? 'Class' : 'School'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Stars</span>
                        <span className="text-xl font-bold text-amber-600">{myRank.totalStars ?? 0}</span>
                      </div>
                      {scope === 'class' && myRank.classRank != null && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">Class rank</span>
                          <span className="text-xl font-bold">#{myRank.classRank}</span>
                        </div>
                      )}
                      {scope === 'school' && myRank.schoolRank != null && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">School rank</span>
                          <span className="text-xl font-bold">#{myRank.schoolRank}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Attendance</span>
                        <span className="font-semibold">{myRank.attendancePercentage ?? 0}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Academic</span>
                        <span className="font-semibold">{myRank.academicScore ?? 0}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Tabs value={period} onValueChange={setPeriod} className="mb-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="weekly">Weekly</TabsTrigger>
                  <TabsTrigger value="monthly">Monthly</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex rounded-lg border border-gray-200 bg-gray-100 p-1 mb-4">
                <button
                  type="button"
                  onClick={() => setScope('class')}
                  disabled={!profile?.class?.id}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50',
                    scope === 'class' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  <Users className="h-4 w-4" />
                  Class
                </button>
                <button
                  type="button"
                  onClick={() => setScope('school')}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors',
                    scope === 'school' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  <Building2 className="h-4 w-4" />
                  School
                </button>
              </div>

              {data.periodKey && (
                <p className="text-xs text-gray-500 mb-2">Period: {data.periodKey}</p>
              )}

              {loadingBoard ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
                </div>
              ) : (
                <div className="space-y-2">
                  <AnimatePresence mode="wait">
                    {data.entries.length === 0 ? (
                      <motion.div
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500"
                      >
                        No entries yet. Stars are calculated daily.
                      </motion.div>
                    ) : (
                      data.entries.map((entry, index) => {
                        const isMe = currentStudentId && entry.studentId && String(entry.studentId) === String(currentStudentId);
                        return (
                          <motion.div
                            key={entry.studentId || index}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className={cn(
                              'flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors',
                              isMe
                                ? 'border-amber-400 bg-amber-50/80 shadow-sm'
                                : 'border-gray-200 bg-white hover:bg-gray-50'
                            )}
                          >
                            <div className="flex w-10 items-center justify-center shrink-0">
                              <RankIcon rank={entry.rank} />
                            </div>
                            <Avatar className="h-10 w-10 shrink-0">
                              <AvatarImage src={null} />
                              <AvatarFallback className="bg-amber-100 text-amber-800">
                                {(entry.name || '?').charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-900 truncate">
                                  {entry.name || 'Student'}
                                </span>
                                {isMe && (
                                  <span className="shrink-0 rounded bg-amber-200 px-1.5 py-0.5 text-xs font-medium text-amber-800">
                                    You
                                  </span>
                                )}
                              </div>
                              {entry.class && (
                                <p className="text-xs text-gray-500 truncate">{entry.class}</p>
                              )}
                            </div>
                            <div className="shrink-0 flex items-center gap-1 text-amber-600">
                              <Star className="h-4 w-4 fill-current" />
                              <span className="font-bold">{entry.totalStars}</span>
                            </div>
                            <div className="hidden sm:flex shrink-0 flex-col items-end text-xs text-gray-500">
                              <span>Att. {entry.attendancePercentage}%</span>
                              <span>Acad. {entry.academicScore}%</span>
                            </div>
                            {entry.studentId && (
                              <Link
                                href={`/student/profile/${entry.studentId}`}
                                className="shrink-0 text-sm font-medium text-amber-600 hover:text-amber-700"
                              >
                                View
                              </Link>
                            )}
                          </motion.div>
                        );
                      })
                    )}
                  </AnimatePresence>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
