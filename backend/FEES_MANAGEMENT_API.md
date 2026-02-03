# Fees Management System API Documentation

## Overview

The Fees Management System provides comprehensive fee tracking, collection, and reminder functionality for schools. It includes automatic overdue fee calculation, one-click reminder notifications, and PWA-ready push notifications.

## Features

- ✅ Fee Structure Management (Class-wise, Monthly/Quarterly/Yearly)
- ✅ Student Fee Tracking with Payment History
- ✅ Manual Fee Collection (Cash/Online/UPI/Bank)
- ✅ Automatic Overdue Fee Calculation (Daily Cron Job)
- ✅ One-Click Fee Reminders (All students, Class-wise, Individual, Defaulters only)
- ✅ Push Notifications (PWA Ready)
- ✅ Fee Statistics and Reports
- ✅ Role-based Access Control

---

## API Endpoints

### 1. Fee Structure Management

#### Create Fee Structure

**POST** `/api/fees/structure`

**Access:** PRINCIPAL only

**Request Body:**

```json
{
  "classId": "507f1f77bcf86cd799439011",
  "academicYear": "2024-2025",
  "feeType": "monthly", // "monthly" | "quarterly" | "yearly"
  "components": {
    "tuitionFee": 5000,
    "examFee": 1000,
    "transportFee": 2000,
    "otherFee": 500
  },
  "dueDate": "2024-02-15",
  "lateFinePerDay": 50 // Optional, default: 0
}
```

**Response:**

```json
{
  "success": true,
  "message": "Fee structure created successfully",
  "data": {
    "_id": "...",
    "schoolId": "...",
    "classId": "...",
    "academicYear": "2024-2025",
    "feeType": "monthly",
    "components": { ... },
    "totalAmount": 8500,
    "dueDate": "2024-02-15T00:00:00.000Z",
    "lateFinePerDay": 50,
    "isActive": true
  }
}
```

#### Update Fee Structure

**PUT** `/api/fees/structure/:id`

**Access:** PRINCIPAL only

**Request Body:** (All fields optional)

```json
{
  "components": {
    "tuitionFee": 5500
  },
  "dueDate": "2024-02-20",
  "lateFinePerDay": 75,
  "isActive": false
}
```

#### Get Fee Structures

**GET** `/api/fees/structure?classId=&academicYear=&feeType=`

**Access:** PRINCIPAL, TEACHER (read-only)

**Query Parameters:**

- `classId` (optional)
- `academicYear` (optional)
- `feeType` (optional: "monthly" | "quarterly" | "yearly")

---

### 2. Student Fee Initialization

#### Initialize Student Fees

**POST** `/api/fees/initialize`

**Access:** PRINCIPAL only

**Description:** Creates StudentFee records for all active students in a class based on fee structure.

**Request Body:**

```json
{
  "feeStructureId": "507f1f77bcf86cd799439011"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Student fees initialized for 25 students",
  "data": {
    "count": 25,
    "studentFees": [ ... ]
  }
}
```

---

### 3. Fee Collection

#### Collect Fee Payment

**POST** `/api/fees/collect`

**Access:** PRINCIPAL only

**Request Body:**

```json
{
  "studentFeeId": "507f1f77bcf86cd799439011",
  "amount": 5000,
  "paymentMode": "cash", // "cash" | "online" | "UPI" | "bank"
  "referenceId": "TXN123456" // Optional
}
```

**Response:**

```json
{
  "success": true,
  "message": "Fee collected successfully",
  "data": {
    "_id": "...",
    "studentId": "...",
    "totalAmount": 8500,
    "paidAmount": 5000,
    "pendingAmount": 3500,
    "status": "PARTIAL",
    "paymentHistory": [
      {
        "amount": 5000,
        "paymentMode": "cash",
        "referenceId": "TXN123456",
        "paidAt": "2024-01-15T10:30:00.000Z",
        "paidBy": "..."
      }
    ]
  }
}
```

---

### 4. Get Student Fees

#### Get Fees by Student

**GET** `/api/fees/student/:studentId?academicYear=&status=`

**Access:**

- PRINCIPAL: Can view any student
- TEACHER: Can view students in assigned classes
- STUDENT: Can only view own fees

**Query Parameters:**

- `academicYear` (optional)
- `status` (optional: "PAID" | "PARTIAL" | "UNPAID" | "OVERDUE")

#### Get Fees by Class

**GET** `/api/fees/class/:classId?academicYear=&status=`

**Access:** PRINCIPAL, TEACHER

#### Get Own Fees (Student)

**GET** `/api/fees/my-fees?academicYear=&status=`

**Access:** STUDENT only

---

### 5. Fee Defaulters

#### Get Fee Defaulters

**GET** `/api/fees/defaulters?classId=`

**Access:** PRINCIPAL, TEACHER

**Query Parameters:**

- `classId` (optional) - Filter by class

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "studentId": {
        "userId": {
          "name": "John Doe",
          "email": "john@example.com"
        }
      },
      "pendingAmount": 3500,
      "status": "OVERDUE",
      "dueDate": "2024-01-15T00:00:00.000Z",
      "lateFineApplied": 500
    }
  ],
  "count": 10
}
```

---

### 6. Fee Reminders

#### Send Fee Reminder

**POST** `/api/fees/send-reminder`

**Access:** PRINCIPAL only

**Description:** Send fee reminders to students. Supports:

- All students in school
- All students in a class
- Individual student
- Only defaulters (unpaid/partial/overdue)

**Request Body:**

```json
{
  "classId": "507f1f77bcf86cd799439011", // Optional
  "studentId": "507f1f77bcf86cd799439012", // Optional
  "onlyDefaulters": true // Optional, default: false
}
```

**Note:** If both `classId` and `studentId` are provided, `studentId` takes precedence.

**Response:**

```json
{
  "success": true,
  "message": "Fee reminders sent to 15 student(s)",
  "data": {
    "sent": 15,
    "failed": 0,
    "errors": []
  }
}
```

**What happens:**

1. Creates notification records for each student
2. Sends push notification if user has subscribed
3. Notification includes:
   - Title: "⚠️ Fee Due Reminder"
   - Message: "Your school fee of ₹XXXX is pending. Please pay before DD/MM."
   - Metadata: fee details, due date, status

---

### 7. Fee Statistics

#### Get Fee Statistics

**GET** `/api/fees/statistics?classId=&academicYear=`

**Access:** PRINCIPAL, TEACHER

**Response:**

```json
{
  "success": true,
  "data": {
    "total": 100,
    "paid": 60,
    "partial": 20,
    "unpaid": 15,
    "overdue": 5,
    "totalAmount": 850000,
    "paidAmount": 600000,
    "pendingAmount": 250000,
    "lateFineCollected": 5000
  }
}
```

---

## Push Notifications (PWA)

### Subscribe to Push Notifications

**POST** `/api/notifications/subscribe`

**Access:** All authenticated users

**Request Body:**

```json
{
  "subscription": {
    "endpoint": "https://fcm.googleapis.com/...",
    "keys": {
      "p256dh": "...",
      "auth": "..."
    }
  }
}
```

### Get VAPID Public Key

**GET** `/api/notifications/vapid-key`

**Access:** Public (for PWA setup)

**Response:**

```json
{
  "success": true,
  "data": {
    "publicKey": "BEl62iUYgUivxIkv69yViEuiBIa40HI..."
  }
}
```

---

## Automatic Overdue Fee Updates

A cron job runs **daily at midnight (00:00)** to:

1. Find all unpaid/partial fees with passed due dates
2. Calculate late fine: `daysOverdue × lateFinePerDay`
3. Update fee status to "OVERDUE"
4. Update total amount to include late fine

**Note:** Late fine is only applied if `lateFinePerDay > 0` in fee structure.

---

## Database Schemas

### FeeStructure

```javascript
{
  schoolId: ObjectId,
  classId: ObjectId,
  academicYear: String,
  feeType: "monthly" | "quarterly" | "yearly",
  components: {
    tuitionFee: Number,
    examFee: Number,
    transportFee: Number,
    otherFee: Number
  },
  totalAmount: Number,  // Auto-calculated
  dueDate: Date,
  lateFinePerDay: Number,
  isActive: Boolean
}
```

### StudentFee

```javascript
{
  schoolId: ObjectId,
  studentId: ObjectId,
  classId: ObjectId,
  academicYear: String,
  feeStructureId: ObjectId,
  totalAmount: Number,
  paidAmount: Number,
  pendingAmount: Number,  // Auto-calculated
  status: "PAID" | "PARTIAL" | "UNPAID" | "OVERDUE",
  dueDate: Date,
  lastPaymentDate: Date,
  lateFineApplied: Number,
  paymentHistory: [{
    amount: Number,
    paymentMode: "cash" | "online" | "UPI" | "bank",
    referenceId: String,
    paidAt: Date,
    paidBy: ObjectId
  }]
}
```

---

## Role Permissions

### PRINCIPAL

- ✅ Create/Update fee structures
- ✅ Initialize student fees
- ✅ Collect fees (manual entry)
- ✅ Send fee reminders (all/class/individual/defaulters)
- ✅ View all fees and statistics
- ✅ View fee defaulters

### TEACHER

- ✅ View fee structures (read-only)
- ✅ View fees for assigned classes
- ✅ View fee defaulters
- ✅ View fee statistics

### STUDENT

- ✅ View own fees only
- ✅ Receive fee reminder notifications
- ✅ Subscribe to push notifications

---

## Environment Variables

Add to `.env`:

```env
# Web Push Notifications (VAPID Keys)
# Generate using: npx web-push generate-vapid-keys
VAPID_PUBLIC_KEY=your_vapid_public_key_here
VAPID_PRIVATE_KEY=your_vapid_private_key_here
VAPID_EMAIL=mailto:your-email@example.com
```

**Generate VAPID Keys:**

```bash
npx web-push generate-vapid-keys
```

---

## Error Responses

All endpoints return consistent error format:

```json
{
  "success": false,
  "message": "Error message here"
}
```

**Common Status Codes:**

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Example Workflow

1. **Principal creates fee structure:**

   ```
   POST /api/fees/structure
   ```

2. **Principal initializes student fees:**

   ```
   POST /api/fees/initialize
   ```

3. **Cron job runs daily** to update overdue fees

4. **Principal sends reminders to defaulters:**

   ```
   POST /api/fees/send-reminder
   {
     "onlyDefaulters": true
   }
   ```

5. **Student receives notification** (in-app + push if subscribed)

6. **Principal collects fee:**

   ```
   POST /api/fees/collect
   ```

7. **Principal views statistics:**
   ```
   GET /api/fees/statistics
   ```

---

## Notes

- Late fine is calculated dynamically based on days overdue
- Payment history is maintained for audit trail
- Status updates automatically based on payment amounts
- Push notifications require user subscription (PWA)
- Cron job runs automatically (no manual trigger needed)
- All fees are school-scoped (data isolation)

---

## Support

For issues or questions, refer to the main API documentation or contact the development team.
