'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/src/context/auth.context';
import { noticeService } from '@/src/services/notice.service';
import { useSocket } from '@/src/hooks/useSocket';
import { UnreadNoticesPopup, wasPopupDismissedThisSession } from '@/src/components/UnreadNoticesPopup';
import { ROLES } from '@/src/utils/constants';
import { toast } from 'sonner';

const POPUP_CHECK_DELAY_MS = 800;
const SOCKET_DEBOUNCE_MS = 2000;

function isDashboardPath(pathname) {
  return pathname === '/teacher/dashboard' || pathname === '/student/dashboard';
}

export function UnreadNoticesTrigger() {
  const { user } = useAuth();
  const pathname = usePathname();
  const { socket } = useSocket();
  const [open, setOpen] = useState(false);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [markAllLoading, setMarkAllLoading] = useState(false);
  const socketDebounceRef = useRef(null);
  const hasCheckedRef = useRef(false);

  const fetchUnread = useCallback(async () => {
    if (user?.role !== ROLES.TEACHER && user?.role !== ROLES.STUDENT) return [];
    try {
      const data = await noticeService.getMyNotices({
        unreadOnly: true,
        limit: 10,
        page: 1,
      });
      return data.notices || [];
    } catch (err) {
      return [];
    }
  }, [user?.role]);

  const showPopupIfNeeded = useCallback(
    async (forceOpen = false) => {
      if (user?.role !== ROLES.TEACHER && user?.role !== ROLES.STUDENT) return;
      setLoading(true);
      try {
        const list = await fetchUnread();
        setNotices(list);
        if (list.length === 0) {
          setLoading(false);
          return;
        }
        if (forceOpen || !wasPopupDismissedThisSession()) {
          setOpen(true);
        }
      } catch {
        // Fail silently; don't block dashboard
      } finally {
        setLoading(false);
      }
    },
    [user?.role, fetchUnread]
  );

  // On mount / after login: check unread and show popup once per session if not dismissed
  useEffect(() => {
    if (user?.role !== ROLES.TEACHER && user?.role !== ROLES.STUDENT) return;
    if (hasCheckedRef.current) return;
    hasCheckedRef.current = true;
    const t = setTimeout(() => {
      showPopupIfNeeded(false);
    }, POPUP_CHECK_DELAY_MS);
    return () => clearTimeout(t);
  }, [user?.role, user?._id, showPopupIfNeeded]);

  // Real-time: on notice:new — toast + open popup if on dashboard (debounced)
  useEffect(() => {
    if (!socket || (user?.role !== ROLES.TEACHER && user?.role !== ROLES.STUDENT)) return;
    const onNotice = ({ notice } = {}) => {
      if (!notice) return;
      toast.info(notice.title || 'New notice', {
        description: (notice.message || '').slice(0, 60) + ((notice.message || '').length > 60 ? '…' : ''),
        action: { label: 'View', onClick: () => window.location.assign('/notices') },
      });
      if (socketDebounceRef.current) clearTimeout(socketDebounceRef.current);
      socketDebounceRef.current = setTimeout(async () => {
        if (isDashboardPath(pathname)) {
          setLoading(true);
          try {
            const list = await fetchUnread();
            setNotices(list);
            if (list.length > 0) setOpen(true);
          } catch {
            // show at least the socket notice
            setNotices((prev) => {
              const exists = prev.some((n) => (n._id || n.id) === (notice._id || notice.id));
              if (exists) return prev;
              return [{ ...notice, isReadByUser: false }, ...prev];
            });
            setOpen(true);
          } finally {
            setLoading(false);
          }
        }
        socketDebounceRef.current = null;
      }, SOCKET_DEBOUNCE_MS);
    };
    socket.on('notice:new', onNotice);
    return () => {
      socket.off('notice:new', onNotice);
      if (socketDebounceRef.current) clearTimeout(socketDebounceRef.current);
    };
  }, [socket, user?.role, pathname, fetchUnread]);

  const handleMarkAllRead = useCallback(async () => {
    setMarkAllLoading(true);
    try {
      await noticeService.markAllAsRead();
    } finally {
      setMarkAllLoading(false);
    }
  }, []);

  if (user?.role !== ROLES.TEACHER && user?.role !== ROLES.STUDENT) return null;

  return (
    <UnreadNoticesPopup
      open={open}
      onClose={() => setOpen(false)}
      notices={notices}
      loading={loading}
      onMarkAllRead={handleMarkAllRead}
      markAllLoading={markAllLoading}
    />
  );
}
