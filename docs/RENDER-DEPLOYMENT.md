# Render Deployment Guide (WebSocket + Redis + Web Push)

This guide covers deploying the School Management System on Render with real-time Socket.IO, Redis adapter, and Web Push notifications.

## Prerequisites

- Render account
- MongoDB (Atlas or self-hosted)
- Redis instance (Render Redis or external)

## Environment Variables

### Backend (Node.js / Express)

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | Yes | Render sets this automatically; include for local fallback |
| `NODE_ENV` | Yes | `production` |
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Strong secret for JWT signing |
| `CLIENT_URLS` | Yes | Comma-separated frontend URLs, e.g. `https://your-app.onrender.com` |
| `VAPID_PUBLIC_KEY` | Yes | Web Push VAPID public key |
| `VAPID_PRIVATE_KEY` | Yes | Web Push VAPID private key |
| `VAPID_EMAIL` | Yes | `mailto:your-email@example.com` |
| `REDIS_URL` | Recommended | Redis connection URL for Socket.IO adapter |

### Frontend (Next.js)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API base URL, e.g. `https://your-backend.onrender.com/api` |

## WebSocket Configuration on Render

Render supports WebSockets for Web Services. Ensure:

1. **Health check path** – Use a simple HTTP route (e.g. `/health`) so Render doesn't treat WebSocket upgrade as unhealthy.
2. **No sticky sessions** – Socket.IO with Redis adapter does not need sticky sessions; Redis pub/sub synchronizes events across instances.
3. **CORS** – `CLIENT_URLS` must include your frontend origin; the server reads it for Socket.IO CORS.

## Redis Setup

### Option 1: Render Redis

1. Create a **Redis** instance in Render.
2. Copy the **Internal Redis URL** (or external URL if frontend and backend are in different networks).
3. Set `REDIS_URL` in your backend environment variables.

### Option 2: External Redis (Upstash, etc.)

1. Create a Redis instance and obtain the connection URL.
2. Set `REDIS_URL` in your backend environment variables.

If `REDIS_URL` is not set, Socket.IO runs in single-instance mode without Redis. For multiple backend instances, Redis is required.

## Scaling Strategy

- **Single instance**: No Redis needed. Socket.IO works with in-memory adapter.
- **Multiple instances**: Set `REDIS_URL`. Socket.IO uses Redis adapter for pub/sub; events are propagated across all instances.
- **Reconnection**: Client uses exponential backoff (`reconnectionDelay: 1000`, `reconnectionDelayMax: 30000`, `randomizationFactor: 0.5`). Queued messages are delivered on reconnect.

## VAPID Keys for Web Push

1. Generate keys: `npx web-push generate-vapid-keys`
2. Set `VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY` in backend.
3. Set `NEXT_PUBLIC_VAPID_KEY` (or equivalent) in frontend for push subscription.

## Service Worker & Push

- Service worker (`sw.js`) handles `push` and `notificationclick`.
- On click, it opens `data.url` (e.g. `/notifications`, `/teacher/chat`).
- Ensure the PWA is served over HTTPS and the service worker is registered.

## Checklist

- [ ] Backend: `REDIS_URL`, `CLIENT_URLS`, VAPID keys, MongoDB
- [ ] Frontend: `NEXT_PUBLIC_API_URL`, VAPID public key
- [ ] Health check endpoint returns 200
- [ ] CORS includes frontend origin
- [ ] PWA served over HTTPS
