'use client';

import { useEffect, useState } from 'react';
import { Megaphone, Pin } from 'lucide-react';
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
import { noticeService } from '@/src/services/notice.service';
import { useSocket } from '@/src/hooks/useSocket';
import { toast } from 'sonner';
import Link from 'next/link';

const NOTICES_CACHE_KEY = 'notices_cache';
const CACHE_TTL_MS = 60 * 1000; // 1 min

function getCachedNotices() {
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

function setCachedNotices(data) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(NOTICES_CACHE_KEY, JSON.stringify({ data, at: Date.now() }));
  } catch {}
}

export function NoticeDropdown() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const { socket } = useSocket();

  const fetchNotices = async () => {
    try {
      const data = await noticeService.getMyNotices({ page: 1, limit: 15 });
      const list = data.notices || [];
      setNotices(list);
      setCachedNotices(list);
    } catch (error) {
      console.error('Error fetching notices:', error);
      const cached = getCachedNotices();
      if (cached) setNotices(cached);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
    const interval = setInterval(fetchNotices, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const onFocus = () => fetchNotices();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  useEffect(() => {
    const onMarkedRead = () => fetchNotices();
    window.addEventListener('notices:marked-read', onMarkedRead);
    return () => window.removeEventListener('notices:marked-read', onMarkedRead);
  }, []);

  useEffect(() => {
    if (!socket) return;
    const onNotice = ({ notice } = {}) => {
      if (notice) {
        setNotices((prev) => {
          const exists = prev.some((n) => (n._id || n.id) === (notice._id || notice.id));
          if (exists) return prev;
          return [{ ...notice, isReadByUser: false }, ...prev];
        });
        toast.info(notice.title, {
          description: notice.message?.slice(0, 80) + (notice.message?.length > 80 ? '…' : ''),
          action: { label: 'View', onClick: () => window.location.href = '/notices' },
        });
      }
    };
    socket.on('notice:new', onNotice);
    return () => socket.off('notice:new', onNotice);
  }, [socket]);

  const handleMarkAsRead = async (noticeId, e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    try {
      await noticeService.markAsRead(noticeId);
      setNotices((prev) =>
        prev.map((n) =>
          (n._id || n.id) === noticeId ? { ...n, isReadByUser: true } : n
        )
      );
    } catch {
      toast.error('Failed to mark as read');
    }
  };

  const isUnread = (n) => !(n.isReadByUser ?? false);
  const unreadCount = notices.filter(isUnread).length;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Megaphone className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-rose-500 text-white text-[10px] rounded-full flex items-center justify-center font-medium">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notices</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-72">
          {loading ? (
            <div className="p-4 text-center text-sm text-gray-500">Loading...</div>
          ) : notices.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">No notices</div>
          ) : (
            notices.slice(0, 10).map((notice) => {
              const unread = isUnread(notice);
              return (
                <DropdownMenuItem
                  key={notice._id || notice.id}
                  className="flex flex-col items-start p-3 cursor-pointer"
                  onClick={() => {
                    if (unread) handleMarkAsRead(notice._id || notice.id);
                    setOpen(false);
                  }}
                  asChild
                >
                  <Link href="/notices">
                    <div className="flex items-start justify-between w-full">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className={`text-sm font-medium truncate ${unread ? 'font-semibold' : ''}`}>
                            {notice.title}
                          </p>
                          {notice.isImportant && (
                            <Pin className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                          )}
                          {unread && (
                            <span className="px-1.5 py-0.5 text-[10px] bg-rose-100 text-rose-700 rounded font-medium">
                              New
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{notice.message}</p>
                        <p className="text-[10px] text-gray-400 mt-1">
                          {new Date(notice.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {unread && (
                        <span className="ml-2 h-2 w-2 bg-rose-500 rounded-full flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                  </Link>
                </DropdownMenuItem>
              );
            })
          )}
        </ScrollArea>
        <DropdownMenuSeparator />
        <div className="p-2">
          <Link
            href="/notices"
            className="text-sm text-center block w-full text-rose-600 hover:text-rose-700 font-medium"
            onClick={() => setOpen(false)}
          >
            View all notices
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
