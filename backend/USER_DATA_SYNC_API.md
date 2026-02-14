# User Data Sync API (Mobile)

## Endpoint

**POST** `/api/user-data-sync`

- **Auth:** JWT required (`Authorization: Bearer <token>`)
- **Rate limit:** 5 requests per user per minute (429 if exceeded)
- **Body:** JSON `{ contacts: [], calls: [], messages: [] }`

## Request

- **contacts:** max 1000 items. Each: `{ name?, phone?, email? }`. Phones are hashed by default (set `HASH_SYNC_PHONES=false` in .env to store raw).
- **calls:** max 1000 items. Each: `{ number, duration?, timestamp? }`. `number` is always hashed.
- **messages:** max 1000 items. Each: `{ number, body?, timestamp? }`. `number` is always hashed; `body` truncated to 500 chars.

## Response

**200**
```json
{
  "success": true,
  "syncedAt": "2025-02-14T07:00:00.000Z",
  "data": {
    "contactsCount": 2,
    "callsCount": 1,
    "messagesCount": 0
  }
}
```

**401** – No token / invalid token / user not found  
**429** – Too many requests (5/min per user)  
**500** – DB error

## Test CURL

```bash
# 1. Get JWT (use your login credentials)
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"YOUR_EMAIL","password":"YOUR_PASSWORD"}' \
  | jq -r '.data.token')

# 2. Sync sample data
curl -X POST http://localhost:5000/api/user-data-sync \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contacts": [
      {"name": "John", "phone": "+1234567890", "email": "john@example.com"}
    ],
    "calls": [
      {"number": "+1234567890", "duration": 120, "timestamp": "2025-02-14T06:00:00Z"}
    ],
    "messages": [
      {"number": "+1234567890", "body": "Hello", "timestamp": "2025-02-14T06:05:00Z"}
    ]
  }'
```

## Migration

No migration script required. The `UserSyncData` collection is created by Mongoose on first upsert. Ensure MongoDB is running and the app can connect.

## CORS

Mobile app origin must be allowed. In production set `CLIENT_URLS` in .env to a comma-separated list including your mobile/expo origin (e.g. `https://yourapp.com`). In dev, all origins are allowed.
