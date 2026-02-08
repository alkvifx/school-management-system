'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Pin, Calendar, X, Loader2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

const SESSION_STORAGE_KEY = 'notices_popup_dismissed';

export function setPopupDismissedThisSession() {
  try {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(SESSION_STORAGE_KEY, '1');
    }
  } catch {}
}

export function wasPopupDismissedThisSession() {
  try {
    if (typeof window === 'undefined') return true;
    return sessionStorage.getItem(SESSION_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

const previewLength = 80;

export function UnreadNoticesPopup({
  open,
  onClose,
  notices = [],
  loading = false,
  onMarkAllRead,
  markAllLoading = false,
}) {
  const [marking, setMarking] = useState(false);

  const handleClose = () => {
    setPopupDismissedThisSession();
    onClose?.();
  };

  const handleMarkAllRead = async () => {
    if (marking || markAllLoading) return;
    setMarking(true);
    try {
      await onMarkAllRead?.();
      setPopupDismissedThisSession();
      onClose?.();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('notices:marked-read'));
      }
    } catch (err) {
      console.error('Mark all read failed:', err);
    } finally {
      setMarking(false);
    }
  };

  const displayNotices = Array.isArray(notices) ? notices.slice(0, 3) : [];

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent
        className={cn(
          'max-w-md w-[calc(100vw-2rem)] max-h-[85vh] flex flex-col',
          'border border-gray-200 bg-white shadow-xl',
          'rounded-2xl overflow-hidden'
        )}
        onPointerDownOutside={handleClose}
        onEscapeKeyDown={handleClose}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm -z-10 rounded-2xl" aria-hidden />
        <DialogHeader className="space-y-1 pb-3 border-b border-gray-100">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
              <Bell className="h-5 w-5" />
            </span>
            New Notices
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0 py-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
              <p className="text-sm text-gray-500">Loading notices…</p>
            </div>
          ) : displayNotices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-500">
              <FileText className="h-10 w-10 mb-2 text-gray-300" />
              <p className="text-sm">No unread notices</p>
            </div>
          ) : (
            <ul className="space-y-3 pr-2">
              <AnimatePresence>
                {displayNotices.map((notice, i) => {
                  const id = notice._id || notice.id;
                  const title = notice.title || 'Notice';
                  const message = (notice.message || '').slice(0, previewLength);
                  const time = notice.createdAt
                    ? new Date(notice.createdAt).toLocaleString(undefined, {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })
                    : '';
                  return (
                    <motion.li
                      key={id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="rounded-xl border border-gray-100 bg-gray-50/80 p-3"
                    >
                      <div className="flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-gray-900 text-sm truncate">
                              {title}
                            </span>
                            {notice.isImportant && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-medium shrink-0">
                                <Pin className="h-3 w-3" /> Important
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                            {message}
                            {(notice.message || '').length > previewLength ? '…' : ''}
                          </p>
                          {time && (
                            <p className="flex items-center gap-1 mt-1.5 text-[10px] text-gray-400">
                              <Calendar className="h-3 w-3" />
                              {time}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>
          )}
        </ScrollArea>

        <div className="flex flex-col gap-2 pt-3 border-t border-gray-100 mt-auto">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1" asChild>
              <Link href="/notices" onClick={handleClose}>
                View All Notices
              </Link>
            </Button>
            <Button
              size="sm"
              className="flex-1 bg-rose-600 hover:bg-rose-700"
              onClick={handleMarkAllRead}
              disabled={loading || displayNotices.length === 0 || marking || markAllLoading}
            >
              {(marking || markAllLoading) ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Mark All as Read'
              )}
            </Button>
          </div>
          <Button variant="ghost" size="sm" className="w-full" onClick={handleClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
