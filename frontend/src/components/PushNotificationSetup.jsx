'use client';

import { useEffect } from 'react';
import { usePushNotifications } from '@/src/hooks/usePushNotifications';
import { Button } from '@/components/ui/button';
import { Bell, BellOff } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function PushNotificationSetup() {
  const { isSupported, isSubscribed, isLoading, subscribe, unsubscribe } = usePushNotifications();

  if (!isSupported) {
    return null; // Don't show anything if not supported
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Push Notifications
        </CardTitle>
        <CardDescription>
          Get notified about important updates even when the app is closed
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isSubscribed ? (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">You're subscribed to push notifications</p>
            <Button
              variant="outline"
              size="sm"
              onClick={unsubscribe}
              disabled={isLoading}
            >
              <BellOff className="h-4 w-4 mr-2" />
              Unsubscribe
            </Button>
          </div>
        ) : (
          <Button
            onClick={subscribe}
            disabled={isLoading}
            className="w-full"
          >
            <Bell className="h-4 w-4 mr-2" />
            {isLoading ? 'Subscribing...' : 'Enable Push Notifications'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
