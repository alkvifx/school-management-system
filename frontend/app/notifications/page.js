'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/src/components/ProtectedRoute';
import { ROLES } from '@/src/utils/constants';
import { useAuth } from '@/src/context/auth.context';
import { notificationService } from '@/src/services/notification.service';
import { Bell, ArrowLeft, CheckCheck, Loader2, ClipboardList, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const DASHBOARD_BY_ROLE = {
  [ROLES.TEACHER]: '/teacher/dashboard',
  [ROLES.STUDENT]: '/student/dashboard',
  [ROLES.PRINCIPAL]: '/principal/dashboard',
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const backHref = DASHBOARD_BY_ROLE[user?.role] || '/';

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    const onFocus = () => fetchNotifications();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) =>
          (n._id === id || n.id === id) ? { ...n, isRead: true, isReadByUser: true } : n
        )
      );
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true, isReadByUser: true })));
      toast.success('All marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const isUnread = (n) => !(n.isReadByUser ?? n.isRead);
  const unreadCount = notifications.filter(isUnread).length;

  return (
    <ProtectedRoute allowedRoles={[ROLES.STUDENT, ROLES.TEACHER, ROLES.PRINCIPAL]}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <Link
                href={backHref}
                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Bell className="h-7 w-7 text-blue-600" />
                Notifications
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
              </p>
            </div>
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark all read
              </Button>
            )}
          </div>

          {loading ? (
            <Card>
              <CardContent className="py-12 flex flex-col items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
                <p className="text-gray-600">Loading notifications...</p>
              </CardContent>
            </Card>
          ) : notifications.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">No notifications yet</p>
                <p className="text-sm text-gray-500 mt-1">
                  When your teacher marks attendance or you get updates, they’ll show here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => {
                const unread = isUnread(notification);
                const isAttendance = notification.type === 'ATTENDANCE';
                const isFeeReminder = notification.type === 'FEE_REMINDER';
                return (
                  <Card
                    key={notification._id || notification.id}
                    className={`overflow-hidden transition-colors ${
                      unread ? 'border-l-4 border-l-blue-500 bg-white' : 'bg-white/95'
                    } ${isAttendance ? 'border-emerald-200' : ''} ${isFeeReminder ? 'border-yellow-200' : ''}`}
                  >
                    <CardContent className="p-4">
                      <div
                        className="flex items-start gap-3 cursor-pointer"
                        onClick={() => unread && handleMarkAsRead(notification._id || notification.id)}
                      >
                        <div
                          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                            isAttendance
                              ? 'bg-emerald-100 text-emerald-700'
                              : isFeeReminder
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {isAttendance ? (
                            <ClipboardList className="h-5 w-5" />
                          ) : isFeeReminder ? (
                            <CreditCard className="h-5 w-5" />
                          ) : (
                            <Bell className="h-5 w-5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className={`text-sm font-medium ${unread ? 'text-gray-900 font-semibold' : 'text-gray-700'}`}>
                              {notification.title}
                            </p>
                            {isAttendance && (
                              <span className="px-2 py-0.5 text-xs bg-emerald-100 text-emerald-800 rounded-full font-medium">
                                Attendance
                              </span>
                            )}
                            {isFeeReminder && (
                              <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded-full font-medium">
                                Fee
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                          <p className="text-xs text-gray-400 mt-2">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                        {unread && (
                          <div className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
