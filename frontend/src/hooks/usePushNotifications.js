'use client';

import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '@/src/services/notification.service';
import { toast } from 'sonner';

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [vapidPublicKey, setVapidPublicKey] = useState(null);
  const [permission, setPermission] = useState(
    typeof window !== 'undefined' && 'Notification' in window
      ? Notification.permission
      : 'default'
  );

  // Check if push notifications are supported
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const supported =
        'serviceWorker' in navigator &&
        'PushManager' in window &&
        'Notification' in window;
      setIsSupported(supported);
      if (supported && 'Notification' in window) {
        setPermission(Notification.permission);
      }
    }
  }, []);

  // Get VAPID public key
  useEffect(() => {
    if (isSupported && !vapidPublicKey) {
      notificationService
        .getVapidKey()
        .then((key) => {
          setVapidPublicKey(key);
        })
        .catch((error) => {
          console.error('Failed to get VAPID key:', error);
        });
    }
  }, [isSupported, vapidPublicKey]);

  // Check existing subscription and sync backend when supported
  useEffect(() => {
    if (isSupported && vapidPublicKey) {
      checkSubscription();
    }
  }, [isSupported, vapidPublicKey, checkSubscription]);

  const getDeviceInfo = () => {
    if (typeof window === 'undefined') return {};
    return {
      userAgent: window.navigator.userAgent,
      platform: window.navigator.platform,
      language: window.navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  };

  const checkSubscription = useCallback(async () => {
    if (!isSupported) return;
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      setSubscription(sub);
      const hasSub = !!sub && permission === 'granted';
      setIsSubscribed(hasSub);

      // If there is an existing browser subscription, ensure backend knows about it
      if (sub && permission === 'granted') {
        try {
          await notificationService.subscribeToPush(sub, getDeviceInfo());
        } catch (err) {
          console.error('Failed to sync push subscription with backend:', err);
        }
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  }, [isSupported, permission]);

  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      toast.error('Push notifications are not supported in this browser');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === 'granted') {
        return true;
      } else if (result === 'denied') {
        toast.error('Notification permission denied');
        return false;
      } else {
        toast.info('Notification permission not granted');
        return false;
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      toast.error('Failed to request notification permission');
      return false;
    }
  }, [isSupported]);

  const subscribe = useCallback(async () => {
    if (!isSupported || !vapidPublicKey) {
      toast.error('Push notifications are not available');
      return;
    }

    setIsLoading(true);
    try {
      // Request permission first
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        setIsLoading(false);
        return;
      }

      // Register service worker if not already registered
      let registration;
      if ('serviceWorker' in navigator) {
        registration = await navigator.serviceWorker.ready;
      } else {
        throw new Error('Service Worker not supported');
      }

      // Convert VAPID key to Uint8Array
      const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);

      // Subscribe to push
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      // Send subscription to backend with device info
      await notificationService.subscribeToPush(sub, getDeviceInfo());

      setSubscription(sub);
      setIsSubscribed(true);
      toast.success('Successfully subscribed to push notifications');
    } catch (error) {
      console.error('Error subscribing to push:', error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          'Failed to subscribe to push notifications'
      );
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, vapidPublicKey, requestPermission]);

  const unsubscribe = useCallback(async () => {
    if (!subscription) {
      return;
    }

    setIsLoading(true);
    try {
      await subscription.unsubscribe();
      await notificationService.unsubscribeFromPush(subscription.endpoint);

      setSubscription(null);
      setIsSubscribed(false);
      toast.success('Successfully unsubscribed from push notifications');
    } catch (error) {
      console.error('Error unsubscribing from push:', error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          'Failed to unsubscribe from push notifications'
      );
    } finally {
      setIsLoading(false);
    }
  }, [subscription]);

  // Helper function to convert VAPID key
  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  return {
    isSupported,
    isSubscribed,
    isLoading,
    subscription,
    subscribe,
    unsubscribe,
    requestPermission,
    permission,
  };
}
