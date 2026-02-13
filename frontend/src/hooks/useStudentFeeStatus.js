import { useState, useEffect, useCallback } from 'react';
import { feesService } from '@/src/services/fees.service';

/**
 * Hook to fetch and manage student fee status for dashboard banner.
 * Supports real-time updates via refetch on focus and optional polling.
 */
export function useStudentFeeStatus(options = {}) {
  const { 
    pollInterval = null, // null = no polling, number = ms between polls
    refetchOnFocus = true, // refetch when window gains focus
  } = options;

  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStatus = useCallback(async () => {
    try {
      setError(null);
      const data = await feesService.getFeeStatus();
      setStatus(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch fee status');
      // On error, set default DUE status so banner still shows
      setStatus({ status: 'DUE', dueAmount: 0, dueDate: null, lateFine: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();

    // Polling
    let pollTimer = null;
    if (pollInterval && pollInterval > 0) {
      pollTimer = setInterval(() => {
        fetchStatus();
      }, pollInterval);
    }

    // Refetch on window focus
    let focusHandler = null;
    if (refetchOnFocus && typeof window !== 'undefined') {
      focusHandler = () => {
        fetchStatus();
      };
      window.addEventListener('focus', focusHandler);
    }

    return () => {
      if (pollTimer) clearInterval(pollTimer);
      if (focusHandler) window.removeEventListener('focus', focusHandler);
    };
  }, [fetchStatus, pollInterval, refetchOnFocus]);

  return {
    status,
    loading,
    error,
    refetch: fetchStatus,
  };
}
