'use client';

import { useEffect, useState } from 'react';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { useSocket } from '@/src/hooks/useSocket';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { notificationService } from '@/src/services/notification.service';
import { toast } from 'sonner';
import Link from 'next/link';

export function NotificationDropdown() {
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Auto-refresh when app regains focus (e.g. returning from background)
  useEffect(() => {
    const onFocus = () => fetchNotifications();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  // Real-time: listen for notification events from Socket.IO
  useEffect(() => {
    if (!socket) return;
    const onNotification = (payload) => {
      fetchNotifications();
      if (payload?.notification?.title) {
        toast.info(payload.notification.title, {
          description: payload.notification.message,
        });
      }
    };
    socket.on('notification', onNotification);
    return () => {
      socket.off('notification', onNotification);
    };
  }, [socket]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId || n.id === notificationId
            ? { ...n, isRead: true, isReadByUser: true }
            : n
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
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const isUnread = (n) => !(n.isReadByUser ?? n.isRead);
  const unreadCount = notifications.filter(isUnread).length;


  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="h-auto p-1"
            >
              <CheckCheck className="h-4 w-4 mr-1" />
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-96">
          {loading ? (
            <div className="p-4 text-center text-sm text-gray-500">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">No notifications</div>
          ) : (
            notifications.map((notification) => {
              const unread = isUnread(notification);
              const isAttendance = notification.type === 'ATTENDANCE';
              const isFeeReminder = notification.type === 'FEE_REMINDER';
              return (
                <DropdownMenuItem
                  key={notification._id || notification.id}
                  className={`flex flex-col items-start p-3 cursor-pointer ${
                    isFeeReminder ? 'bg-yellow-50 border-l-4 border-yellow-500' : ''
                  } ${isAttendance ? 'bg-emerald-50/80 border-l-4 border-emerald-500' : ''}`}
                  onClick={() => {
                    if (unread) {
                      handleMarkAsRead(notification._id || notification.id);
                    }
                  }}
                >
                  <div className="flex items-start justify-between w-full">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`text-sm font-medium ${unread ? 'font-bold' : ''}`}>
                          {notification.title}
                        </p>
                        {isFeeReminder && (
                          <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded-full font-medium">
                            Fee
                          </span>
                        )}
                        {isAttendance && (
                          <span className="px-2 py-0.5 text-xs bg-emerald-100 text-emerald-800 rounded-full font-medium">
                            Attendance
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {unread && (
                      <div className="h-2 w-2 bg-blue-500 rounded-full ml-2 mt-1 flex-shrink-0" />
                    )}
                  </div>
                </DropdownMenuItem>
              );
            })
          )}
        </ScrollArea>
        <DropdownMenuSeparator />
        <div className="p-2">
          <Link
            href="/notifications"
            className="text-sm text-center block w-full text-blue-600 hover:text-blue-700 font-medium"
            onClick={() => setOpen(false)}
          >
            View all notifications
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
