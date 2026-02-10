'use client';

import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { API_BASE_URL } from '@/src/utils/constants';
import { useAuth } from '@/src/context/auth.context';

// Module-level singleton socket instance
let socketInstance = null;
let connectionState = {
  isConnected: false,
  error: null,
  listeners: new Set(),
};

/**
 * Custom hook for managing Socket.IO connection
 * Creates a singleton connection that persists across component re-renders
 * FIX: Now syncs with auth context to handle token changes after login
 */
export function useSocket() {
  const { user, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(connectionState.isConnected);
  const [error, setError] = useState(connectionState.error);
  const listenerIdRef = useRef(Symbol('listener'));
  const previousTokenRef = useRef(null);

  useEffect(() => {
    // Get token from localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    // BUG FIX: Don't proceed if no token OR user not authenticated
    if (!token || !isAuthenticated) {
      // Clear error when user logs out
      if (!isAuthenticated && socketInstance?.connected) {
        socketInstance.disconnect();
        socketInstance = null;
        connectionState.isConnected = false;
        connectionState.error = null;
        connectionState.listeners.forEach((updateFn) => updateFn());
      }
      setError(isAuthenticated ? 'Initializing connection...' : null);
      return;
    }

    // BUG FIX: If token changed (e.g., new login), reconnect with new token
    if (previousTokenRef.current !== token && socketInstance?.connected) {
      if (process.env.NODE_ENV !== 'production') {
        console.log('[socket] token changed, reconnecting...');
      }
      socketInstance.disconnect();
      socketInstance = null;
      connectionState.isConnected = false;
    }
    previousTokenRef.current = token;

    // Create socket connection if it doesn't exist (singleton)
    if (!socketInstance) {
      // Extract base URL without /api suffix for Socket.IO
      const socketUrl = API_BASE_URL.replace('/api', '');

      if (process.env.NODE_ENV !== 'production') {
        console.log('[socket] creating new connection to', socketUrl);
      }

      socketInstance = io(socketUrl, {
        auth: {
          token: token,
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 30000,
        randomizationFactor: 0.5,
      });

      // Connection event handlers
      socketInstance.on('connect', () => {
        if (process.env.NODE_ENV !== 'production') {
          console.log('[socket] connected', { id: socketInstance?.id });
        }
        connectionState.isConnected = true;
        connectionState.error = null;
        // Update all listeners
        connectionState.listeners.forEach((updateFn) => updateFn());
      });

      socketInstance.on('disconnect', () => {
        if (process.env.NODE_ENV !== 'production') {
          console.log('[socket] disconnected');
        }
        connectionState.isConnected = false;
        connectionState.listeners.forEach((updateFn) => updateFn());
      });

      socketInstance.on('connect_error', (err) => {
        if (process.env.NODE_ENV !== 'production') {
          console.log('[socket] connect_error', err?.message || err);
        }
        connectionState.error = err.message || 'Connection error';
        connectionState.isConnected = false;
        connectionState.listeners.forEach((updateFn) => updateFn());
      });

      socketInstance.on('error', (err) => {
        if (process.env.NODE_ENV !== 'production') {
          console.log('[socket] error event', err?.message || err);
        }
        // BUG FIX: Better error handling for socket events
        const errorMsg = typeof err === 'string' ? err : err?.message || 'Socket error';
        connectionState.error = errorMsg;
        connectionState.listeners.forEach((updateFn) => updateFn());
      });
    } else {
      // If we already have a socket singleton but it's disconnected, ensure it reconnects.
      // This helps mobile/network transitions and route changes.
      if (!socketInstance.connected) {
        if (process.env.NODE_ENV !== 'production') {
          console.log('[socket] reconnecting existing socket');
        }
        socketInstance.auth = { token };
        socketInstance.connect();
      }
    }

    // Register this component as a listener
    const updateState = () => {
      setIsConnected(connectionState.isConnected);
      setError(connectionState.error);
    };

    const listenerId = listenerIdRef.current;
    connectionState.listeners.add(updateState);

    // Initialize state
    updateState();

    // Cleanup: remove listener (but don't disconnect socket - it's shared)
    return () => {
      connectionState.listeners.delete(updateState);

      // If no components are listening anymore, close the shared connection to avoid leaks.
      if (connectionState.listeners.size === 0 && socketInstance) {
        try {
          socketInstance.disconnect();
        } catch {}
        socketInstance = null;
        connectionState.isConnected = false;
        connectionState.error = null;
      }
    };
  }, [isAuthenticated, user?._id]); // BUG FIX: Added dependencies

  return {
    socket: socketInstance,
    isConnected,
    error,
  };
}
