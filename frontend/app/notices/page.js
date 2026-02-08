'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/context/auth.context';
import ProtectedRoute from '@/src/components/ProtectedRoute';
import { ROLES } from '@/src/utils/constants';
import { noticeService } from '@/src/services/notice.service';
import { useSocket } from '@/src/hooks/useSocket';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Megaphone, Pin, Calendar, Loader2, FileText, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const NOTICES_CACHE_KEY = 'notices_list_cache';
const CACHE_TTL_MS = 2 * 60 * 1000; // 2 min

function getCached() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(NOTICES_CACHE_KEY);
    if (!raw) return null;
    const { data, at } = JSON.parse(raw);
    if (Date.now() - at > CACHE_TTL_MS) return null;
    return data;
  } catch {
    return null;
  }
}

function setCached(data) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(NOTICES_CACHE_KEY, JSON.stringify({ data, at: Date.now() }));
  } catch {}
}

export default function NoticesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [markingId, setMarkingId] = useState(null);
  const [apiResponse, setApiResponse] = useState(null);
  const { socket } = useSocket();

  // Principal: redirect to principal notices (must run before ProtectedRoute)
  useEffect(() => {
    if (user?.role === ROLES.PRINCIPAL) {
      router.replace('/principal/notices');
    }
  }, [user?.role, router]);

  const fetchNotices = useCallback(async (page = 1) => {
    if (user?.role === ROLES.PRINCIPAL) return;
    try {
      setLoading(true);
      const data = await noticeService.getMyNotices({ page, limit: 20 });
      if (process.env.NODE_ENV === 'development') {
        console.log('[notices] API response:', data);
      }
      setApiResponse(data);
      const noticesList = data?.notices || data?.data?.notices || [];
      const paginationData = data?.pagination || data?.data?.pagination || { page: 1, limit: 20, total: 0, pages: 0 };
      setNotices(noticesList);
      setPagination(paginationData);
      if (page === 1) setCached(noticesList);
    } catch (err) {
      toast.error(err.message || 'Failed to load notices');
      const cached = getCached();
      if (cached) setNotices(cached);
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  useEffect(() => {
    if (user?.role === ROLES.TEACHER || user?.role === ROLES.STUDENT) {
      fetchNotices(1);
    } else if (!user?.role) {
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [user?.role, fetchNotices]);

  useEffect(() => {
    if (!socket || user?.role !== ROLES.TEACHER && user?.role !== ROLES.STUDENT) return;
    const onNotice = ({ notice } = {}) => {
      if (notice) {
        setNotices((prev) => {
          const exists = prev.some((n) => (n._id || n.id) === (notice._id || notice.id));
          if (exists) return prev;
          return [{ ...notice, isReadByUser: false }, ...prev];
        });
      }
    };
    socket.on('notice:new', onNotice);
    return () => socket.off('notice:new', onNotice);
  }, [socket, user?.role]);

  const handleMarkAsRead = async (noticeId) => {
    setMarkingId(noticeId);
    try {
      await noticeService.markAsRead(noticeId);
      setNotices((prev) =>
        prev.map((n) =>
          (n._id || n.id) === noticeId ? { ...n, isReadByUser: true } : n
        )
      );
    } catch {
      toast.error('Failed to mark as read');
    } finally {
      setMarkingId(null);
    }
  };

  const openNotice = (notice) => {
    if (!(notice.isReadByUser ?? false)) {
      handleMarkAsRead(notice._id || notice.id);
    }
  };

  // Principal gets redirect in useEffect; show spinner until redirect
  if (user?.role === ROLES.PRINCIPAL) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={[ROLES.TEACHER, ROLES.STUDENT]}>
      <div className="space-y-6 min-h-[calc(100vh-120px)] p-4 overflow-visible">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} aria-label="Back">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notices</h1>
            <p className="text-sm text-gray-500 mt-0.5">Announcements from your school</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5" />
              All notices
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* {process.env.NODE_ENV === 'development' && apiResponse && (
              <pre className="mb-4 max-h-64 overflow-auto rounded-md bg-gray-50 p-3 text-xs text-gray-700 border">
                {JSON.stringify(apiResponse, null, 2)}
              </pre>
            )} */}
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : notices.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16 text-gray-500"
              >
                <FileText className="h-14 w-14 mx-auto mb-4 text-gray-300" />
                <p className="font-medium">No notices yet</p>
                <p className="text-sm mt-1">When your principal sends a notice, it will appear here.</p>
              </motion.div>
            ) : (
              <ScrollArea className="max-h-[calc(100vh-220px)] pr-4">
                <div className="space-y-3">
                  <AnimatePresence>
                    {notices.map((notice, i) => {
                      const isUnread = !(notice.isReadByUser ?? false);
                      const id = notice._id || notice.id;
                      return (
                        <motion.div
                          key={id}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ delay: i * 0.04 }}
                          onClick={() => openNotice(notice)}
                          className={`rounded-xl border p-4 cursor-pointer transition shadow-sm ${
                            isUnread
                              ? 'bg-rose-50/50 border-rose-200 hover:bg-rose-50'
                              : 'bg-white border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-semibold text-gray-900">{notice.title}</span>
                                {isUnread && (
                                  <Badge className="bg-rose-500 text-white text-xs">New</Badge>
                                )}
                                {notice.isImportant && (
                                  <Badge variant="secondary" className="gap-1 bg-amber-100 text-amber-800">
                                    <Pin className="h-3 w-3" /> Important
                                  </Badge>
                                )}
                              </div>
                              <p className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">
                                {notice.message}
                              </p>
                              <p className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(notice.createdAt).toLocaleString()}
                              </p>
                              {notice.attachments?.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {notice.attachments.map((url, idx) => (
                                    <a
                                      key={idx}
                                      href={url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-blue-600 hover:underline"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      Attachment {idx + 1}
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>
                            {isUnread && (
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={markingId === id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAsRead(id);
                                }}
                              >
                                {markingId === id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  'Mark read'
                                )}
                              </Button>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
                {pagination.pages > 1 && (
                  <div className="mt-6 flex justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page <= 1}
                      onClick={() => fetchNotices(pagination.page - 1)}
                    >
                      Previous
                    </Button>
                    <span className="flex items-center px-3 text-sm text-gray-600">
                      Page {pagination.page} of {pagination.pages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page >= pagination.pages}
                      onClick={() => fetchNotices(pagination.page + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
