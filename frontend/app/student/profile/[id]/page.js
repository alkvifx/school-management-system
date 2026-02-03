'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import ProtectedRoute from '@/src/components/ProtectedRoute';
import { ROLES } from '@/src/utils/constants';
import { getStudentPublicProfile } from '@/src/services/students.service';
import { ChevronLeft, Star, TrendingUp, BookOpen, Award } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

export default function PublicStudentProfilePage() {
  const params = useParams();
  const id = params?.id;
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await getStudentPublicProfile(id);
        if (cancelled) return;
        setProfile(data);
      } catch (e) {
        if (!cancelled) toast.error(e.message || 'Failed to load profile');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  return (
    <ProtectedRoute allowedRoles={[ROLES.STUDENT, ROLES.TEACHER, ROLES.PRINCIPAL]}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30">
        <div className="max-w-lg mx-auto px-4 py-6 pb-24">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/student/leaderboard">
              <Button variant="ghost" size="icon">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <span className="text-lg font-semibold text-gray-900">Profile</span>
          </div>

          {loading ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-24 w-24 rounded-full mx-auto" />
                <Skeleton className="h-6 w-48 mx-auto mt-2" />
                <Skeleton className="h-4 w-32 mx-auto mt-1" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ) : !profile ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                Profile not found or you don&apos;t have access.
              </CardContent>
            </Card>
          ) : (
            <Card className="overflow-hidden border-0 shadow-xl">
              <div className="bg-gradient-to-br from-amber-400/20 via-orange-50/50 to-white pt-8 pb-6 px-6">
                <div className="flex flex-col items-center">
                  <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                    <AvatarImage src={profile.profilePhoto} alt={profile.name} />
                    <AvatarFallback className="bg-amber-100 text-amber-800 text-2xl">
                      {(profile.name || '?').charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <h1 className="mt-4 text-xl font-bold text-gray-900">{profile.name || 'Student'}</h1>
                  {profile.classLabel && (
                    <p className="text-sm text-gray-500 mt-1">
                      {profile.classLabel}
                    </p>
                  )}
                </div>
              </div>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between rounded-xl bg-amber-50 border border-amber-100 p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-100">
                      <Star className="h-5 w-5 text-amber-600 fill-amber-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Stars</p>
                      <p className="text-2xl font-bold text-amber-700">{profile.totalStars ?? 0}</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-xs font-medium">Attendance</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">{profile.attendancePercentage ?? 0}%</p>
                  </div>
                  <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                      <BookOpen className="h-4 w-4" />
                      <span className="text-xs font-medium">Academic</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">{profile.academicScore ?? 0}%</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-4">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                      <Award className="h-4 w-4" />
                      <span className="text-xs font-medium">Class Rank</span>
                    </div>
                    <p className="text-lg font-bold text-amber-700">
                      {profile.classRank != null ? `#${profile.classRank}` : '—'}
                    </p>
                  </div>
                  <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-4">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                      <Award className="h-4 w-4" />
                      <span className="text-xs font-medium">School Rank</span>
                    </div>
                    <p className="text-lg font-bold text-amber-700">
                      {profile.schoolRank != null ? `#${profile.schoolRank}` : '—'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
