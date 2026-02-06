'use client';

import { useState } from 'react';
import { usePushNotifications } from '@/src/hooks/usePushNotifications';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';

export function PushNotificationSetup() {
  const {
    isSupported,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe,
    permission,
  } = usePushNotifications();

  const [showExplanation, setShowExplanation] = useState(false);
  const [showHowToEnable, setShowHowToEnable] = useState(false);

  if (!isSupported) {
    return null; // Don't show anything if not supported
  }

  const showEnableButton = permission !== 'denied';

  return (
    <>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Get class updates, fee reminders, and chat messages even when the app is closed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Status:</span>{' '}
            {permission === 'denied'
              ? 'Blocked in browser settings'
              : isSubscribed
              ? 'Subscribed on this device'
              : 'Not subscribed'}
          </div>

          {isSubscribed && permission === 'granted' && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">You will receive push notifications on this device.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={unsubscribe}
                disabled={isLoading}
              >
                <BellOff className="h-4 w-4 mr-2" />
                Disable
              </Button>
            </div>
          )}

          {!isSubscribed && showEnableButton && (
            <Button
              onClick={() => setShowExplanation(true)}
              disabled={isLoading}
              className="w-full"
            >
              <Bell className="h-4 w-4 mr-2" />
              {isLoading ? 'Subscribing...' : 'Enable Notifications'}
            </Button>
          )}

          {permission === 'denied' && (
            <div className="space-y-2">
              <p className="text-xs text-red-600 flex items-start gap-1">
                <Info className="h-3 w-3 mt-[2px]" />
                Notifications are blocked in your browser settings. To receive alerts, please enable
                notifications for this PWA.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHowToEnable(true)}
              >
                How to enable notifications
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Soft explanation modal shown BEFORE the browser permission prompt */}
      <AlertDialog open={showExplanation} onOpenChange={setShowExplanation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Enable push notifications?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                We&apos;ll send you notifications for:
              </p>
              <ul className="list-disc list-inside text-left">
                <li>New class chat messages</li>
                <li>Fee reminders and important notices</li>
                <li>Result updates and key announcements</li>
              </ul>
              <p className="text-xs text-gray-500">
                You can turn these off anytime from this settings page or your browser settings. We
                won&apos;t spam you.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Not now</AlertDialogCancel>
            <AlertDialogAction
              disabled={isLoading}
              onClick={async () => {
                setShowExplanation(false);
                await subscribe();
              }}
            >
              Turn on notifications
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* How-to-enable guide when permission is blocked */}
      <AlertDialog open={showHowToEnable} onOpenChange={setShowHowToEnable}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Enable notifications in your browser</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2 text-left">
              <p className="font-medium">On Android (Chrome PWA):</p>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Long-press the app icon and tap &quot;i&quot; or &quot;App info&quot;.</li>
                <li>Tap <span className="font-semibold">Notifications</span>.</li>
                <li>Turn notifications <span className="font-semibold">On</span>.</li>
              </ol>
              <p className="font-medium mt-3">In Chrome directly:</p>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Open this app in Chrome.</li>
                <li>Tap the lock icon in the address bar.</li>
                <li>Tap <span className="font-semibold">Permissions</span> → <span className="font-semibold">Notifications</span> and set to <span className="font-semibold">Allow</span>.</li>
              </ol>
              <p className="text-xs text-gray-500 mt-2">
                After enabling, come back here and tap &quot;Enable Notifications&quot; again.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Got it</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
