
// --- Custom push notification handlers for PWA events (chat, fees, notices) ---

self.addEventListener("push", (event) => {
  if (!event.data) {
    return;
  }

  let payload = {};
  try {
    payload = event.data.json();
  } catch (e) {
    try {
      payload = JSON.parse(event.data.text());
    } catch {
      payload = {};
    }
  }

  const title = payload.title || "New notification";
  const options = {
    body: payload.body || "",
    icon: payload.icon || "/icons/icon-192.png",
    badge: payload.badge || "/icons/icon-192.png",
    data: payload.data || {},
    tag: payload.tag,
    renotify: !!payload.renotify,
    vibrate: payload.vibrate || [100, 50, 100],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const data = event.notification.data || {};
  const targetUrl = data.url || "/";

  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      if (allClients && allClients.length > 0) {
        const client = allClients[0];
        if ("focus" in client) {
          await client.focus();
        }
        try {
          client.postMessage({
            type: "NOTIFICATION_CLICK",
            url: targetUrl,
          });
        } catch {
          // ignore postMessage failures
        }
      } else {
        await self.clients.openWindow(targetUrl);
      }
    })()
  );
});

