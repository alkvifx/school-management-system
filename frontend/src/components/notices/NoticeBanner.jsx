'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { AlertCircle, Info, X, ChevronRight, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export function NoticeBanner({ notices, loading, onDismiss, className }) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissedIds, setDismissedIds] = useState(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('dismissedNoticeIds');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Filter out dismissed notices
  const visibleNotices = notices.filter(
    (notice) => !dismissedIds.includes(notice._id)
  );

  useEffect(() => {
    if (visibleNotices.length > 0 && currentIndex >= visibleNotices.length) {
      setCurrentIndex(0);
    }
  }, [visibleNotices.length, currentIndex]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn('rounded-lg border p-4 bg-gray-50 animate-pulse', className)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="h-10 w-10 rounded-full bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-64 bg-gray-200 rounded" />
              <div className="h-3 w-48 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!visibleNotices || visibleNotices.length === 0) {
    return null;
  }

  const currentNotice = visibleNotices[currentIndex];
  const isUrgent = currentNotice.priority === 'URGENT';

  const handleDismiss = (noticeId) => {
    const newDismissed = [...dismissedIds, noticeId];
    setDismissedIds(newDismissed);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('dismissedNoticeIds', JSON.stringify(newDismissed));
      } catch (e) {
        console.error('Failed to save dismissed notices:', e);
      }
    }
    if (onDismiss) {
      onDismiss(noticeId);
    }
    // Move to next notice if available
    if (currentIndex < visibleNotices.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleViewAll = () => {
    router.push('/notices');
  };

  const handleNext = () => {
    if (currentIndex < visibleNotices.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(visibleNotices.length - 1);
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentNotice._id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.3 }}
        className={cn(
          'rounded-lg border p-4 shadow-sm relative overflow-hidden',
          isUrgent
            ? 'bg-gradient-to-r from-red-50 to-orange-50 border-red-200'
            : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200',
          className
        )}
      >
        {/* Pulse animation for urgent notices */}
        {isUrgent && (
          <div className="absolute inset-0 bg-red-200/20 animate-pulse pointer-events-none" />
        )}

        <div className="relative flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div
              className={cn(
                'p-2 rounded-full flex-shrink-0',
                isUrgent ? 'bg-red-100' : 'bg-blue-100'
              )}
            >
              {isUrgent ? (
                <AlertCircle className="h-5 w-5 text-red-600" />
              ) : (
                <Info className="h-5 w-5 text-blue-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <Badge
                  className={cn(
                    'text-xs font-semibold',
                    isUrgent
                      ? 'bg-red-500 text-white'
                      : 'bg-blue-500 text-white'
                  )}
                >
                  {isUrgent ? 'URGENT' : 'INFO'}
                </Badge>
                {currentNotice.className && (
                  <Badge variant="outline" className="text-xs">
                    {currentNotice.className}
                  </Badge>
                )}
                {visibleNotices.length > 1 && (
                  <Badge variant="outline" className="text-xs">
                    {currentIndex + 1} of {visibleNotices.length}
                  </Badge>
                )}
              </div>
              <h4 className={cn('font-semibold mb-1 text-sm sm:text-base', isUrgent ? 'text-red-900' : 'text-blue-900')}>
                {currentNotice.title}
              </h4>
              <p className={cn('text-sm mb-2 line-clamp-2', isUrgent ? 'text-red-800' : 'text-blue-800')}>
                {currentNotice.message}
              </p>
              {currentNotice.expiresAt && (
                <p className={cn('text-xs', isUrgent ? 'text-red-700' : 'text-blue-700', 'opacity-75')}>
                  Expires: {format(new Date(currentNotice.expiresAt), 'MMM dd, yyyy')}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 sm:self-start">
            {visibleNotices.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="p-1.5 rounded-full hover:bg-black/5 transition-colors"
                  aria-label="Previous notice"
                >
                  <ChevronRight className="h-4 w-4 text-gray-500 rotate-180" />
                </button>
                <button
                  onClick={handleNext}
                  className="p-1.5 rounded-full hover:bg-black/5 transition-colors"
                  aria-label="Next notice"
                >
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                </button>
              </>
            )}
            <Button
              size="sm"
              onClick={handleViewAll}
              variant={isUrgent ? 'default' : 'outline'}
              className={cn(
                isUrgent
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'border-blue-300 text-blue-700 hover:bg-blue-100'
              )}
            >
              <Bell className="h-4 w-4 mr-1" />
              View All
            </Button>
            <button
              onClick={() => handleDismiss(currentNotice._id)}
              className="p-1 rounded-full hover:bg-black/5 transition-colors"
              aria-label="Dismiss notice"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
