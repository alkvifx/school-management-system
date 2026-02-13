import { useState, useEffect, useCallback } from 'react';
import { noticeService } from '@/src/services/notice.service';

/**
 * Hook to fetch and manage dashboard notices for Teacher/Student dashboards.
 * Supports real-time updates via refetch on focus and optional polling.
 */
export function useDashboardNotices(options = {}) {
  const { 
    pollInterval = null, // null = no polling, number = ms between polls
    refetchOnFocus = true, // refetch when window gains focus
    limit = 3, // max number of notices to fetch
  } = options;

  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotices = useCallback(async () => {
    try {
      setError(null);
      const data = await noticeService.getDashboardNotices({ limit });
      setNotices(data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch notices');
      setNotices([]); // Clear notices on error
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchNotices();

    // Polling
    let pollTimer = null;
    if (pollInterval && pollInterval > 0) {
      pollTimer = setInterval(() => {
        fetchNotices();
      }, pollInterval);
    }

    // Refetch on window focus
    let focusHandler = null;
    if (refetchOnFocus && typeof window !== 'undefined') {
      focusHandler = () => {
        fetchNotices();
      };
      window.addEventListener('focus', focusHandler);
    }

    return () => {
      if (pollTimer) clearInterval(pollTimer);
      if (focusHandler) window.removeEventListener('focus', focusHandler);
    };
  }, [fetchNotices, pollInterval, refetchOnFocus]);

  return {
    notices,
    loading,
    error,
    refetch: fetchNotices,
  };
}
