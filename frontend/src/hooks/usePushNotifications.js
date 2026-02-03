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

  // Check if push notifications are supported
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const supported =
        'serviceWorker' in navigator &&
        'PushManager' in window &&
        'Notification' in window;
      setIsSupported(supported);
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

  // Check existing subscription
  useEffect(() => {
    if (isSupported && vapidPublicKey) {
      checkSubscription();
    }
  }, [isSupported, vapidPublicKey]);

  const checkSubscription = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      setSubscription(sub);
      setIsSubscribed(!!sub);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      toast.error('Push notifications are not supported in this browser');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        return true;
      } else if (permission === 'denied') {
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

      // Send subscription to backend
      await notificationService.subscribeToPush(sub);

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
  };
}
