# Super Admin Auto-Creation Setup

## Overview

The Super Admin is automatically created when the server starts, using credentials from environment variables. There is **NO signup API** for Super Admin - only one Super Admin can exist in the system.

## Implementation Flow

```
Server Start
    ↓
Load Environment Variables
    ↓
Connect to MongoDB
    ↓
createSuperAdminIfNotExists()
    ↓
Check if Super Admin exists
    ↓
If NOT exists → Create Super Admin
If EXISTS → Skip (log message)
    ↓
Start Express Server
```

## Files Modified/Created

### 1. `src/utils/createSuperAdmin.js` (NEW)
- Utility function that creates Super Admin if it doesn't exist
- Validates environment variables
- Ensures only ONE Super Admin exists
- Safe error handling (doesn't crash server)

### 2. `src/config/db.js` (UPDATED)
- Calls `createSuperAdminIfNotExists()` after successful MongoDB connection
- Ensures Super Admin is created before server starts accepting requests

### 3. `src/server.js` (UPDATED)
- Now properly awaits database connection before starting server
- Ensures proper initialization order

### 4. `env.example` (UPDATED)
- Added Super Admin configuration variables

## Environment Variables

Add these to your `.env` file:

```env
SUPER_ADMIN_EMAIL=admin@schoolsystem.com
SUPER_ADMIN_PASSWORD=change_this_secure_password
SUPER_ADMIN_NAME=Super Administrator
```

**Important:**
- `SUPER_ADMIN_EMAIL` and `SUPER_ADMIN_PASSWORD` are **required**
- `SUPER_ADMIN_NAME` is optional (defaults to "Super Admin")
- If credentials are missing, server will log a warning but continue running

## Security Features

1. **No Public Signup Route**
   - Super Admin can only be created via server startup
   - No API endpoint exists for Super Admin creation

2. **Password Hashing**
   - Password is hashed using bcrypt (10 rounds)
   - Never stored in plain text

3. **Single Super Admin**
   - System ensures only ONE Super Admin exists
   - If Super Admin already exists, creation is skipped

4. **Credentials Never Exposed**
   - Super Admin credentials are never returned in API responses
   - Only standard user fields are returned (id, name, email, role, schoolId)

## Login Flow

Super Admin can login using the existing `/api/auth/login` endpoint:

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@schoolsystem.com",
  "password": "your_password"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "...",
      "name": "Super Administrator",
      "email": "admin@schoolsystem.com",
      "role": "SUPER_ADMIN",
      "schoolId": null
    }
  }
}
```

## Error Handling

- **Missing Environment Variables**: Server logs warning but continues
- **Database Error**: Error is logged, server continues (Super Admin creation is non-critical)
- **Super Admin Already Exists**: Creation is skipped, no error

## Testing

1. **First Server Start:**
   ```
   ✅ MongoDB connected 🔥
   ✅ Super Admin created successfully: admin@schoolsystem.com
   Server running on port 5000
   ```

2. **Subsequent Server Starts:**
   ```
   ✅ MongoDB connected 🔥
   ✅ Super Admin already exists in database
   Server running on port 5000
   ```

3. **Missing Credentials:**
   ```
   ✅ MongoDB connected 🔥
   ⚠️  SUPER_ADMIN_EMAIL or SUPER_ADMIN_PASSWORD not set in .env
   ⚠️  Super Admin will not be created. Set these variables to enable Super Admin.
   Server running on port 5000
   ```

## Production Checklist

- [ ] Set strong `SUPER_ADMIN_PASSWORD` in production `.env`
- [ ] Use secure email for `SUPER_ADMIN_EMAIL`
- [ ] Ensure `.env` file is in `.gitignore`
- [ ] Never commit Super Admin credentials to version control
- [ ] Rotate Super Admin password periodically
- [ ] Monitor Super Admin login attempts

## Notes

- Super Admin has `schoolId: null` (not assigned to any school)
- Super Admin can login but cannot access school-specific data (by design)
- Super Admin's role is `"SUPER_ADMIN"` (uppercase, matches enum in User model)
