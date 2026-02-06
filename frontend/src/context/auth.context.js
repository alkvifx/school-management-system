'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authService } from '../services/auth.service';
import { ROLE_ROUTES, ROLES } from '../utils/constants';
import { notificationService } from '../services/notification.service';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const { user: loggedInUser } = await authService.login(email, password);
      setUser(loggedInUser);
      
      // Redirect based on role
      const redirectPath = ROLE_ROUTES[loggedInUser.role] || '/unauthorized';
      router.push(redirectPath);
      
      return { success: true };
    } catch (error) {
      // Handle email not verified
      if (error.reason === 'EMAIL_NOT_VERIFIED') {
        // Redirect to verification page
        router.push('/verify-email');
        return { success: false, error: 'Please verify your email to continue.' };
      }
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    // Best-effort: unsubscribe this device's push subscription for current user
    try {
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const sub = await registration.pushManager.getSubscription();
        if (sub) {
          try {
            await notificationService.unsubscribeFromPush(sub.endpoint);
          } catch (err) {
            // Non-fatal; just log
            console.error('Failed to unsubscribe push on backend during logout:', err);
          }
          try {
            await sub.unsubscribe();
          } catch (err) {
            console.error('Failed to unsubscribe push in browser during logout:', err);
          }
        }
      }
    } catch (e) {
      console.error('Error while cleaning up push subscription on logout:', e);
    }

    authService.logout();
    setUser(null);
    router.push('/login');
  };

  const updateUser = (updatedUserData) => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updatedUserData };
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      setUser(updatedUser);
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
