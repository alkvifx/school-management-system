# School Management System – Full API Documentation

---

## 📌 Project Overview

This is a **full-stack School Management System** backend built with **Node.js**, **Express**, and **MongoDB**. The API supports role-based access for:

- **Super Admin** – Platform-level management (schools, principals)
- **Principal** – School-level management (teachers, students, classes, CMS, fees, notices)
- **Teacher** – Class-level operations (attendance, marks, students)
- **Student** – Personal profile, attendance, marks, fees, leaderboard
- **Public** – Unauthenticated content and contact form

The system includes **WebSocket (Socket.IO)** for real-time chat, **push notifications (PWA)**, and **AI features** for principals (templates, notices, posters, result analysis) and for students/teachers (doubt solver chat).

---

## 📌 Base URL

| Environment | Base URL |
|-------------|----------|
| Local Development | `http://localhost:5000` |
| Production | Set via `CLIENT_URLS` / server host |

---

## 📌 Auth Flow (Login → JWT → Role-based Access)

1. **Login**: `POST /api/auth/login` with `email` and `password`.
2. **Response**: Returns `token` (JWT) and `user` (id, name, email, role, schoolId, isEmailVerified).
3. **Subsequent requests**: Add header `Authorization: Bearer <JWT_TOKEN>`.
4. **Role-based access**: Each route group enforces roles via `allowRoles(...)` middleware.
5. **School context**: For PRINCIPAL, TEACHER, STUDENT, `validateSchoolAccess` ensures the user can only access their assigned school’s data.

### Email verification

- PRINCIPAL, TEACHER, STUDENT must verify email before login.
- OTP is sent to email; verify via `POST /api/auth/verify-email-otp`.
- Resend OTP: `POST /api/auth/resend-verification-otp`.

### Password reset

- `POST /api/auth/forgot-password` – Sends reset OTP to email.
- `POST /api/auth/reset-password` – Resets password with OTP.

---

## 📌 Roles & Permissions Matrix

| Role        | Can Access |
|-------------|------------|
| SUPER_ADMIN | Schools, principals, platform-level setup |
| PRINCIPAL   | Own school: teachers, students, classes, CMS, fees, notices, notifications, monitoring, AI tools |
| TEACHER     | Assigned classes: students, attendance, marks, chat, notifications, notices, AI doubt solver |
| STUDENT     | Own profile, attendance, marks, fees, leaderboard, chat, notices, AI doubt solver |
| PUBLIC      | Public content, contact form, VAPID key for push (no auth) |

---

## 📌 Standard Response Format

### Success

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { }
}
```

### Error

```json
{
  "success": false,
  "message": "Error message"
}
```

### Pagination

```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "pages": 5,
      "hasMore": true
    }
  }
}
```

---

## 📌 Pagination & Filters

- **page** (default: 1), **limit** (default: 20) – Common query params.
- **Filters**: Many list endpoints accept `classId`, `academicYear`, `status`, `subject`, `examType`, etc., depending on the API.
- **Date range**: `startDate`, `endDate` for reports and attendance.

---

## 📌 File Upload Rules

| Upload Type       | Max Size | Allowed Formats                    | Field Name    |
|-------------------|----------|------------------------------------|---------------|
| School logo       | 10 MB    | jpg, png, jpeg, webp               | `logo`        |
| Profile photo     | 5 MB     | jpg, png, jpeg, webp               | `photo`, `profileImage` |
| CMS media         | 10 MB    | jpg, png, jpeg, gif, webp, mp4, mov, avi | `media`  |
| Chat media        | 10 MB    | jpg, png, gif, webp, pdf, mp3, wav, ogg, aac | `media` |
| AI poster image   | 10 MB    | images                             | `image`       |

- All uploads go to **Cloudinary**.
- Use `Content-Type: multipart/form-data` for file uploads.

---

## 📌 WebSocket / Real-time Chat

- **Server**: Socket.IO on the same port as HTTP.
- **Auth**: JWT via `handshake.auth.token` or `Authorization` header.
- **Rooms**:
  - `user-{userId}` – Personal room (notifications, notices).
  - `school-{schoolId}` – School-wide room.
  - `class-{classId}` – Class chat room.
- **Events**:
  - `joinClassRoom` – Join a class chat room (ack required).
  - `leaveClassRoom` – Leave class room.
  - `sendMessage` – Send chat message (ack required).
  - `receiveMessage` / `newChatMessage` – New message broadcast.
  - `notice:new` – New notice to recipients.
  - `userPresence` – Online/offline status.
  - `joinedSchoolRoom` – Confirmation after connection.

---

## API Endpoints by Role

---

# 🔴 Super Admin APIs

All routes under `/api/super-admin` require `SUPER_ADMIN` role.

---

### 🔹 Create School

**Method:** POST  
**Endpoint:** `/api/super-admin/create-school`  
**Auth Required:** Yes  
**Role Allowed:** SUPER_ADMIN  

**Purpose:** Create a new school in the platform.

**Headers:**
```json
{
  "Authorization": "Bearer <JWT_TOKEN>",
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "name": "ABC School",
  "address": "123 Main St",
  "phone": "+91 9876543210",
  "email": "school@example.com"
}
```

**Success Response Example:**
```json
{
  "success": true,
  "message": "School created successfully",
  "data": {
    "_id": "...",
    "name": "ABC School",
    "address": "123 Main St",
    "phone": "+91 9876543210",
    "email": "school@example.com"
  }
}
```

**Error Response Example:**
```json
{
  "success": false,
  "message": "Name, address, phone, and email are required"
}
```

**Who can call:** Super Admin only.

**Example CURL:**
```bash
curl -X POST http://localhost:5000/api/super-admin/create-school \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"ABC School","address":"123 Main St","phone":"+91 9876543210","email":"school@example.com"}'
```

---

### 🔹 Create Principal

**Method:** POST  
**Endpoint:** `/api/super-admin/create-principal`  
**Auth Required:** Yes  
**Role Allowed:** SUPER_ADMIN  

**Purpose:** Create a principal user (email verification OTP sent).

**Request Body:**
```json
{
  "name": "John Principal",
  "email": "principal@school.com",
  "password": "securePassword123"
}
```

**Success Response Example:**
```json
{
  "success": true,
  "message": "Principal created successfully. Please check your email to verify your account.",
  "data": {
    "id": "...",
    "name": "John Principal",
    "email": "principal@school.com",
    "role": "PRINCIPAL",
    "isEmailVerified": false
  }
}
```

**Who can call:** Super Admin only.

**Example CURL:**
```bash
curl -X POST http://localhost:5000/api/super-admin/create-principal \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"John Principal","email":"principal@school.com","password":"securePassword123"}'
```

---

### 🔹 Assign Principal to School

**Method:** POST  
**Endpoint:** `/api/super-admin/assign-principal`  
**Auth Required:** Yes  
**Role Allowed:** SUPER_ADMIN  

**Purpose:** Assign a principal to a school.

**Request Body:**
```json
{
  "principalId": "MONGO_ID",
  "schoolId": "MONGO_ID"
}
```

**Success Response Example:**
```json
{
  "success": true,
  "message": "Principal assigned to school successfully",
  "data": {
    "school": { "id": "...", "name": "...", "principalId": "..." },
    "principal": { "id": "...", "name": "...", "email": "...", "schoolId": "..." }
  }
}
```

**Who can call:** Super Admin only.

---

### 🔹 Get All Schools

**Method:** GET  
**Endpoint:** `/api/super-admin/schools`  
**Auth Required:** Yes  
**Role Allowed:** SUPER_ADMIN  

**Purpose:** List all schools with their principals.

**Success Response Example:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "ABC School",
      "principalId": { "name": "...", "email": "..." }
    }
  ]
}
```

**Who can call:** Super Admin only.

---

### 🔹 Get All Principals

**Method:** GET  
**Endpoint:** `/api/super-admin/principals`  
**Auth Required:** Yes  
**Role Allowed:** SUPER_ADMIN  

**Purpose:** List all principal users.

**Success Response Example:**
```json
{
  "success": true,
  "data": [
    { "_id": "...", "name": "...", "email": "...", "schoolId": "..." }
  ]
}
```

**Who can call:** Super Admin only.

---

# 🟡 Principal APIs

All routes under `/api/principal` require `PRINCIPAL` role and school access.

---

### 🔹 Create Teacher

**Method:** POST  
**Endpoint:** `/api/principal/create-teacher`  
**Auth Required:** Yes  
**Role Allowed:** PRINCIPAL  

**Purpose:** Create a teacher for the principal's school.

**Request Body:**
```json
{
  "name": "Jane Teacher",
  "email": "teacher@school.com",
  "password": "secure123",
  "qualification": "B.Ed",
  "subject": "Mathematics",
  "experience": 5
}
```

**Success Response Example:**
```json
{
  "success": true,
  "message": "Teacher created successfully. Please check your email to verify your account.",
  "data": {
    "user": { "id": "...", "name": "...", "email": "...", "role": "TEACHER", "schoolId": "...", "isEmailVerified": false },
    "profile": { "id": "...", "qualification": "...", "subject": "...", "experience": 5 }
  }
}
```

**Who can call:** Principal of the school only.

---

### 🔹 Create Student

**Method:** POST  
**Endpoint:** `/api/principal/create-student`  
**Auth Required:** Yes  
**Role Allowed:** PRINCIPAL  

**Purpose:** Create a student and assign to a class.

**Request Body:**
```json
{
  "name": "Student Name",
  "email": "student@school.com",
  "password": "secure123",
  "classId": "MONGO_ID",
  "rollNumber": "101",
  "parentPhone": "+91 9876543210",
  "parentName": "Parent Name"
}
```

**Success Response Example:**
```json
{
  "success": true,
  "message": "Student created successfully. Please check your email to verify your account.",
  "data": {
    "user": { "id": "...", "name": "...", "email": "...", "role": "STUDENT", "schoolId": "...", "isEmailVerified": false },
    "profile": { "id": "...", "classId": "...", "rollNumber": "101" }
  }
}
```

**Who can call:** Principal only.

---

### 🔹 Create Class

**Method:** POST  
**Endpoint:** `/api/principal/create-class`  
**Auth Required:** Yes  
**Role Allowed:** PRINCIPAL  

**Purpose:** Create a new class in the school.

**Request Body:**
```json
{
  "name": "10",
  "section": "A"
}
```

**Success Response Example:**
```json
{
  "success": true,
  "message": "Class created successfully",
  "data": { "_id": "...", "name": "10", "section": "A", "schoolId": "..." }
}
```

**Who can call:** Principal only.

---

### 🔹 Assign Teacher to Class

**Method:** POST  
**Endpoint:** `/api/principal/assign-teacher`  
**Auth Required:** Yes  
**Role Allowed:** PRINCIPAL  

**Purpose:** Assign a teacher to a class.

**Request Body:**
```json
{
  "teacherId": "MONGO_ID",
  "classId": "MONGO_ID"
}
```

**Who can call:** Principal only.

---

### 🔹 Assign Student to Class

**Method:** POST  
**Endpoint:** `/api/principal/assign-student`  
**Auth Required:** Yes  
**Role Allowed:** PRINCIPAL  

**Purpose:** Move a student to a different class.

**Request Body:**
```json
{
  "studentId": "MONGO_ID",
  "classId": "MONGO_ID"
}
```

**Who can call:** Principal only.

---

### 🔹 Get All Teachers

**Method:** GET  
**Endpoint:** `/api/principal/teachers`  
**Auth Required:** Yes  
**Role Allowed:** PRINCIPAL  

**Purpose:** List all teachers in the school.

**Success Response Example:**
```json
{
  "success": true,
  "data": [
    { "id": "...", "userId": "...", "name": "...", "email": "...", "qualification": "...", "experience": 0, "subject": "...", "photo": null, "assignedClasses": [] }
  ]
}
```

**Who can call:** Principal only.

---

### 🔹 Get All Students

**Method:** GET  
**Endpoint:** `/api/principal/students`  
**Auth Required:** Yes  
**Role Allowed:** PRINCIPAL  

**Purpose:** List all students in the school.

**Success Response Example:**
```json
{
  "success": true,
  "data": [
    { "id": "...", "userId": "...", "name": "...", "email": "...", "rollNumber": "...", "classId": "...", "parentPhone": "...", "parentName": "...", "photo": null }
  ]
}
```

**Who can call:** Principal only.

---

### 🔹 Get All Classes

**Method:** GET  
**Endpoint:** `/api/principal/classes`  
**Auth Required:** Yes  
**Role Allowed:** PRINCIPAL  

**Purpose:** List all classes in the school.

**Success Response Example:**
```json
{
  "success": true,
  "data": [
    { "_id": "...", "name": "10", "section": "A", "schoolId": "..." }
  ]
}
```

**Who can call:** Principal only.

---

### 🔹 Update School

**Method:** PUT  
**Endpoint:** `/api/principal/school`  
**Auth Required:** Yes  
**Role Allowed:** PRINCIPAL  

**Purpose:** Update school details (and optionally upload logo).

**Headers:** `Content-Type: multipart/form-data` (if logo included)

**Request Body (JSON or form):**
```json
{
  "name": "Updated School Name",
  "address": "New Address",
  "phone": "+91 9999999999",
  "email": "new@school.com"
}
```
Optional: `logo` (file)

**Who can call:** Principal only.

---

### 🔹 Update Teacher

**Method:** PUT  
**Endpoint:** `/api/principal/teacher/:id`  
**Auth Required:** Yes  
**Role Allowed:** PRINCIPAL  

**Purpose:** Update teacher profile (name, email, qualification, experience, photo).

**URL Params:** `id` – Teacher profile ID

**Request Body (form):** `name`, `email`, `qualification`, `experience`, `photo` (file)

**Who can call:** Principal only.

---

### 🔹 Update Student

**Method:** PUT  
**Endpoint:** `/api/principal/student/:id`  
**Auth Required:** Yes  
**Role Allowed:** PRINCIPAL  

**Purpose:** Update student profile (name, email, class, rollNumber, parentPhone, photo).

**URL Params:** `id` – Student profile ID

**Who can call:** Principal only.

---

### 🔹 Update Class

**Method:** PUT  
**Endpoint:** `/api/principal/class/:id`  
**Auth Required:** Yes  
**Role Allowed:** PRINCIPAL  

**Purpose:** Update class details (name, section, classTeacherId).

**URL Params:** `id` – Class ID

**Request Body:**
```json
{
  "name": "11",
  "section": "B",
  "classTeacherId": "MONGO_ID"
}
```

**Who can call:** Principal only.

---

### 🔹 Delete Teacher (Soft Delete)

**Method:** DELETE  
**Endpoint:** `/api/principal/teacher/:id`  
**Auth Required:** Yes  
**Role Allowed:** PRINCIPAL  

**Purpose:** Soft-delete a teacher (sets isActive to false).

**URL Params:** `id` – Teacher profile ID

**Who can call:** Principal only.

---

### 🔹 Delete Student (Soft Delete)

**Method:** DELETE  
**Endpoint:** `/api/principal/student/:id`  
**Auth Required:** Yes  
**Role Allowed:** PRINCIPAL  

**Purpose:** Soft-delete a student.

**URL Params:** `id` – Student profile ID

**Who can call:** Principal only.

---

### 🔹 Delete Class (Soft Delete)

**Method:** DELETE  
**Endpoint:** `/api/principal/class/:id`  
**Auth Required:** Yes  
**Role Allowed:** PRINCIPAL  

**Purpose:** Soft-delete a class (fails if active students exist).

**URL Params:** `id` – Class ID

**Who can call:** Principal only.

---

### 🔹 Upload Logo

**Method:** POST  
**Endpoint:** `/api/principal/upload/logo`  
**Auth Required:** Yes  
**Role Allowed:** PRINCIPAL  

**Purpose:** Upload school logo (standalone endpoint).

**Request:** `multipart/form-data`, field `logo`

**Success Response Example:**
```json
{
  "success": true,
  "message": "Logo uploaded successfully",
  "data": { "url": "cloudinary_url", "publicId": "folder/filename" }
}
```

**Who can call:** Principal only.

---

### 🔹 Create Page (CMS)

**Method:** POST  
**Endpoint:** `/api/principal/pages`  
**Auth Required:** Yes  
**Role Allowed:** PRINCIPAL  

**Purpose:** Create a CMS page for the school website.

**Request Body:**
```json
{
  "title": "About Us",
  "content": "<p>HTML content</p>",
  "slug": "about-us",
  "isPublished": true
}
```

**Who can call:** Principal only.

---

### 🔹 Get Pages

**Method:** GET  
**Endpoint:** `/api/principal/pages`  
**Auth Required:** Yes  
**Role Allowed:** PRINCIPAL  

**Purpose:** List all CMS pages.

**Query Params:** `isPublished` (optional: true/false)

**Who can call:** Principal only.

---

### 🔹 Get Single Page

**Method:** GET  
**Endpoint:** `/api/principal/pages/:id`  
**Auth Required:** Yes  
**Role Allowed:** PRINCIPAL  

**Purpose:** Get one CMS page by ID.

**URL Params:** `id` – Page ID

**Who can call:** Principal only.

---

### 🔹 Update Page

**Method:** PUT  
**Endpoint:** `/api/principal/pages/:id`  
**Auth Required:** Yes  
**Role Allowed:** PRINCIPAL  

**Purpose:** Update a CMS page.

**URL Params:** `id` – Page ID

**Request Body:** `title`, `content`, `slug`, `isPublished`

**Who can call:** Principal only.

---

### 🔹 Delete Page

**Method:** DELETE  
**Endpoint:** `/api/principal/pages/:id`  
**Auth Required:** Yes  
**Role Allowed:** PRINCIPAL  

**Purpose:** Delete a CMS page.

**URL Params:** `id` – Page ID

**Who can call:** Principal only.

---

### 🔹 Upload Media (CMS)

**Method:** POST  
**Endpoint:** `/api/principal/media`  
**Auth Required:** Yes  
**Role Allowed:** PRINCIPAL  

**Purpose:** Upload media (image/video) for CMS.

**Request:** `multipart/form-data`, field `media`

**Who can call:** Principal only.

---

### 🔹 Get Media

**Method:** GET  
**Endpoint:** `/api/principal/media`  
**Auth Required:** Yes  
**Role Allowed:** PRINCIPAL  

**Purpose:** List CMS media with pagination.

**Query Params:** `type` (image/video), `page`, `limit`

**Who can call:** Principal only.

---

### 🔹 Delete Media

**Method:** DELETE  
**Endpoint:** `/api/principal/media/:id`  
**Auth Required:** Yes  
**Role Allowed:** PRINCIPAL  

**Purpose:** Delete a media file.

**URL Params:** `id` – Media ID

**Who can call:** Principal only.

---

### 🔹 Get Public Content (Principal View)

**Method:** GET  
**Endpoint:** `/api/principal/public-content`  
**Auth Required:** Yes  
**Role Allowed:** PRINCIPAL  

**Purpose:** Get structured public website content for the school (Principal can edit).

**Success Response Example:**
```json
{
  "success": true,
  "data": {
    "navbar": { "callNumber": "...", "medium": "...", "affiliationNumber": "..." },
    "banner": { "headingPrimary": "...", "images": [] },
    "announcements": [],
    "footer": {},
    "gallery": {}
  }
}
```

**Who can call:** Principal only.

---

### 🔹 Update Public Content

**Method:** PUT  
**Endpoint:** `/api/principal/public-content`  
**Auth Required:** Yes  
**Role Allowed:** PRINCIPAL  

**Purpose:** Update structured public website sections.

**Request Body:**
```json
{
  "sections": {
    "banner": { "headingPrimary": "New Heading" },
    "announcements": []
  }
}
```

**Who can call:** Principal only.

---

### 🔹 Create Notification

**Method:** POST  
**Endpoint:** `/api/principal/notifications`  
**Auth Required:** Yes  
**Role Allowed:** PRINCIPAL  

**Purpose:** Create a notification targeting teachers/students/class.

**Request Body:**
```json
{
  "title": "PTM Notice",
  "message": "Parent-Teacher meeting scheduled for Saturday.",
  "targetRole": "ALL",
  "targetClass": "MONGO_CLASS_ID"
}
```
`targetRole`: TEACHER | STUDENT | ALL

**Who can call:** Principal only.

---

### 🔹 Get Principal Notifications

**Method:** GET  
**Endpoint:** `/api/principal/notifications`  
**Auth Required:** Yes  
**Role Allowed:** PRINCIPAL  

**Purpose:** List all notifications created by the principal.

**Query Params:** `targetRole`, `targetClass`, `page`, `limit`

**Success Response Example:**
```json
{
  "success": true,
  "message": "Notifications retrieved successfully",
  "data": {
    "notifications": [],
    "pagination": { "page": 1, "limit": 20, "total": 0, "pages": 0 }
  }
}
```

**Who can call:** Principal only.

---

### 🔹 Delete Notification

**Method:** DELETE  
**Endpoint:** `/api/principal/notifications/:id`  
**Auth Required:** Yes  
**Role Allowed:** PRINCIPAL  

**Purpose:** Delete a notification.

**URL Params:** `id` – Notification ID

**Who can call:** Principal only.

---

### 🔹 Get Student Risks

**Method:** GET  
**Endpoint:** `/api/principal/risks`  
**Auth Required:** Yes  
**Role Allowed:** PRINCIPAL  

**Purpose:** Get student risk indicators (attendance, academics, etc.).

**Query Params:** `classId` (optional)

**Success Response Example:**
```json
{
  "success": true,
  "data": [
    { "studentId": "...", "riskLevel": "HIGH", "..." }
  ]
}
```

**Who can call:** Principal only.

---

### 🔹 Get School Pulse (Today)

**Method:** GET  
**Endpoint:** `/api/principal/dashboard/pulse/today`  
**Auth Required:** Yes  
**Role Allowed:** PRINCIPAL  

**Purpose:** Get today's school health overview (attendance, alerts).

**Success Response Example:**
```json
{
  "success": true,
  "data": {
    "date": "2025-02-13",
    "dayName": "Thursday",
    "student": { "totalStudents": 500, "present": 450, "absent": 50, "attendancePercentage": 90, "classWiseBreakdown": [] },
    "teacher": { "totalTeachers": 30, "presentToday": 28, "notMarkedYet": 2 },
    "alerts": []
  }
}
```

**Who can call:** Principal only.

---

### 🔹 Get Monitoring Teachers

**Method:** GET  
**Endpoint:** `/api/principal/monitoring/teachers`  
**Auth Required:** Yes  
**Role Allowed:** PRINCIPAL  

**Purpose:** Get teacher activity tracking and flags (attendance, marks, student updates).

**Success Response Example:**
```json
{
  "success": true,
  "data": {
    "teachers": [
      { "teacherId": "...", "name": "...", "attendanceMarkedToday": 2, "flags": {}, "status": "compliant" }
    ]
  }
}
```

**Who can call:** Principal only.

---

### 🔹 Get Monitoring Classes

**Method:** GET  
**Endpoint:** `/api/principal/monitoring/classes`  
**Auth Required:** Yes  
**Role Allowed:** PRINCIPAL  

**Purpose:** Get class-level attendance compliance.

**Who can call:** Principal only.

---

### 🔹 Get Monitoring Summary

**Method:** GET  
**Endpoint:** `/api/principal/monitoring/summary`  
**Auth Required:** Yes  
**Role Allowed:** PRINCIPAL  

**Purpose:** Get feature usage analytics (attendance, marks, student updates).

**Who can call:** Principal only.

---

# 🔵 Teacher APIs

All routes under `/api/teacher` require `TEACHER` role and school access.

---

### 🔹 Get Teacher Dashboard

**Method:** GET  
**Endpoint:** `/api/teacher/dashboard`  
**Auth Required:** Yes  
**Role Allowed:** TEACHER  

**Purpose:** Get teacher dashboard stats (totalStudents, totalClasses, attendanceToday, pendingTasks, recentStudents).

**Success Response Example:**
```json
{
  "success": true,
  "message": "Dashboard data retrieved successfully",
  "data": {
    "totalStudents": 50,
    "totalClasses": 2,
    "attendanceToday": 1,
    "pendingTasks": 3,
    "recentStudents": []
  }
}
```

**Who can call:** Teacher only.

---

### 🔹 Create Student (Teacher)

**Method:** POST  
**Endpoint:** `/api/teacher/create-student` or `/api/teacher/students`  
**Auth Required:** Yes  
**Role Allowed:** TEACHER  

**Purpose:** Create a student in teacher's assigned class.

**Request Body:**
```json
{
  "name": "Student Name",
  "email": "student@school.com",
  "password": "secure123",
  "classId": "MONGO_ID",
  "rollNumber": "102",
  "parentPhone": "+91 9876543210"
}
```

**Who can call:** Teacher only (class must be assigned to teacher).

---

### 🔹 Get Classes

**Method:** GET  
**Endpoint:** `/api/teacher/classes`  
**Auth Required:** Yes  
**Role Allowed:** TEACHER  

**Purpose:** Get teacher's assigned classes.

**Success Response Example:**
```json
{
  "success": true,
  "message": "Classes retrieved successfully",
  "data": [
    { "_id": "...", "name": "10", "section": "A", "schoolId": {} }
  ]
}
```

**Who can call:** Teacher only.

---

### 🔹 Get Students

**Method:** GET  
**Endpoint:** `/api/teacher/students`  
**Auth Required:** Yes  
**Role Allowed:** TEACHER  

**Purpose:** Get students in teacher's assigned classes.

**Query Params:** `classId` (optional – filter by class)

**Success Response Example:**
```json
{
  "success": true,
  "message": "Students retrieved successfully",
  "data": [
    { "_id": "...", "userId": {}, "classId": {}, "rollNumber": "101" }
  ]
}
```

**Who can call:** Teacher only.

---

### 🔹 Mark Attendance

**Method:** POST  
**Endpoint:** `/api/teacher/attendance`  
**Auth Required:** Yes  
**Role Allowed:** TEACHER  

**Purpose:** Mark attendance for a class on a date.

**Request Body:**
```json
{
  "classId": "MONGO_ID",
  "date": "2025-02-13",
  "records": [
    { "studentId": "MONGO_ID", "status": "present" },
    { "studentId": "MONGO_ID", "status": "absent" }
  ]
}
```
`status`: `present` | `absent`  
`date`: YYYY-MM-DD

**Who can call:** Teacher only (must be assigned to class).

---

### 🔹 Upload Marks

**Method:** POST  
**Endpoint:** `/api/teacher/marks`  
**Auth Required:** Yes  
**Role Allowed:** TEACHER  

**Purpose:** Upload marks for a student.

**Request Body:**
```json
{
  "studentId": "MONGO_ID",
  "classId": "MONGO_ID",
  "subject": "Mathematics",
  "marks": 85,
  "maxMarks": 100,
  "examType": "unit_test"
}
```
`examType`: unit_test | mid_term | final | assignment | quiz

**Who can call:** Teacher only.

---

### 🔹 Update Student (Teacher)

**Method:** PUT  
**Endpoint:** `/api/teacher/student/:id`  
**Auth Required:** Yes  
**Role Allowed:** TEACHER  

**Purpose:** Update student basic info (name, parentPhone, photo).

**URL Params:** `id` – Student profile ID

**Request Body (form):** `name`, `parentPhone`, `photo` (file)

**Who can call:** Teacher only (student must be in teacher's assigned class).

---

### 🔹 Remove Student From Class (Teacher)

**Method:** DELETE  
**Endpoint:** `/api/teacher/student/:id`  
**Auth Required:** Yes  
**Role Allowed:** TEACHER  

**Purpose:** Remove student from teacher's assigned class. **Note:** Currently returns 403; principal must handle deletion.

**URL Params:** `id` – Student profile ID

**Request Body (optional):** `classId`

**Who can call:** Teacher only.

---

# 🟢 Student APIs

---

### 🔹 Get Student Profile

**Method:** GET  
**Endpoint:** `/api/student/profile`  
**Auth Required:** Yes  
**Role Allowed:** STUDENT  

**Purpose:** Get logged-in student's profile with class and school info.

**Success Response Example:**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": "...",
    "user": { "id": "...", "name": "...", "email": "..." },
    "rollNumber": "101",
    "class": { "id": "...", "name": "10", "section": "A" },
    "school": { "id": "...", "name": "...", "address": "..." },
    "parentPhone": "+91 9876543210"
  }
}
```

**Who can call:** Student only.

---

### 🔹 Get Student Attendance

**Method:** GET  
**Endpoint:** `/api/student/attendance`  
**Auth Required:** Yes  
**Role Allowed:** STUDENT  

**Purpose:** Get own attendance records and statistics.

**Query Params:** `startDate`, `endDate` (optional date range)

**Success Response Example:**
```json
{
  "success": true,
  "message": "Attendance retrieved successfully",
  "data": {
    "records": [ { "date": "2025-02-13", "status": "present" } ],
    "statistics": { "totalDays": 10, "presentDays": 9, "absentDays": 1, "attendancePercentage": 90 }
  }
}
```

**Who can call:** Student only.

---

### 🔹 Get Student Marks

**Method:** GET  
**Endpoint:** `/api/student/marks`  
**Auth Required:** Yes  
**Role Allowed:** STUDENT  

**Purpose:** Get own marks with optional filters.

**Query Params:** `subject`, `examType`

**Success Response Example:**
```json
{
  "success": true,
  "message": "Marks retrieved successfully",
  "data": {
    "records": [],
    "groupedBySubject": { "Mathematics": [{ "marks": 85, "maxMarks": 100, "examType": "unit_test", "date": "..." }] }
  }
}
```

**Who can call:** Student only.

---

# 🟣 Common / Auth / Public APIs

---

## Auth (Public – No Auth)

### 🔹 Login

**Method:** POST  
**Endpoint:** `/api/auth/login`  
**Auth Required:** No  
**Role Allowed:** PUBLIC  

**Purpose:** Authenticate user and get JWT.

**Request Body:**
```json
{
  "email": "user@school.com",
  "password": "password123"
}
```

**Success Response Example:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "...",
      "name": "...",
      "email": "...",
      "role": "TEACHER",
      "schoolId": "...",
      "isEmailVerified": true
    }
  }
}
```

**Example CURL:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@school.com","password":"password123"}'
```

---

### 🔹 Verify Email OTP

**Method:** POST  
**Endpoint:** `/api/auth/verify-email-otp`  
**Auth Required:** No  
**Role Allowed:** PUBLIC  

**Purpose:** Verify email with 6-digit OTP.

**Request Body:**
```json
{
  "email": "user@school.com",
  "otp": "123456"
}
```

**Rate Limit:** 5 requests per minute per IP.

---

### 🔹 Resend Verification OTP

**Method:** POST  
**Endpoint:** `/api/auth/resend-verification-otp`  
**Auth Required:** No  
**Role Allowed:** PUBLIC  

**Purpose:** Resend email verification OTP.

**Request Body:**
```json
{
  "email": "user@school.com"
}
```

**Rate Limit:** 5 requests per minute per IP.

---

### 🔹 Forgot Password

**Method:** POST  
**Endpoint:** `/api/auth/forgot-password`  
**Auth Required:** No  
**Role Allowed:** PUBLIC  

**Purpose:** Request password reset OTP (sent to email).

**Request Body:**
```json
{
  "email": "user@school.com"
}
```

**Rate Limit:** 5 requests per minute per IP.

---

### 🔹 Reset Password

**Method:** POST  
**Endpoint:** `/api/auth/reset-password`  
**Auth Required:** No  
**Role Allowed:** PUBLIC  

**Purpose:** Reset password with OTP.

**Request Body:**
```json
{
  "email": "user@school.com",
  "otp": "123456",
  "newPassword": "newSecurePassword123"
}
```

**Rate Limit:** 5 requests per minute per IP.

---

## School (Principal)

### 🔹 Create School (Principal – First-time Setup)

**Method:** POST  
**Endpoint:** `/api/school`  
**Auth Required:** Yes  
**Role Allowed:** PRINCIPAL  

**Purpose:** Principal creates their school (one principal = one school).

**Request:** `multipart/form-data` – `name`, `email`, `phone`, `address`, `logo` (file)

**Who can call:** Principal (before school assignment by Super Admin).

---

### 🔹 Get My School

**Method:** GET  
**Endpoint:** `/api/school`  
**Auth Required:** Yes  
**Role Allowed:** PRINCIPAL  

**Purpose:** Get principal's school details.

**Who can call:** Principal only.

---

## Students (Shared – STUDENT, TEACHER, PRINCIPAL)

### 🔹 Get Public Student Profile

**Method:** GET  
**Endpoint:** `/api/students/profile/:id`  
**Auth Required:** Yes  
**Role Allowed:** STUDENT, TEACHER, PRINCIPAL  

**Purpose:** Get public profile of a student (same school; teachers: assigned classes only).

**URL Params:** `id` – Student profile ID

**Success Response Example:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "name": "...",
    "class": { "name": "10", "section": "A" },
    "profilePhoto": null,
    "totalStars": 50,
    "attendancePercentage": 90,
    "academicScore": 85,
    "classRank": 3,
    "schoolRank": 25
  }
}
```

**Who can call:** STUDENT (same school), TEACHER (assigned classes), PRINCIPAL (own school).

---

## Profile (All Authenticated Users)

### 🔹 Get My Profile

**Method:** GET  
**Endpoint:** `/api/profile/me`  
**Auth Required:** Yes  
**Role Allowed:** All authenticated  

**Purpose:** Get current user's profile with role-specific data.

**Who can call:** Any authenticated user.

---

### 🔹 Update Profile

**Method:** PUT  
**Endpoint:** `/api/profile/update`  
**Auth Required:** Yes  
**Role Allowed:** All authenticated  

**Purpose:** Update name and/or profile image.

**Request:** `multipart/form-data` – `name`, `profileImage` (file)

**Who can call:** Any authenticated user.

---

### 🔹 Send Profile OTP

**Method:** POST  
**Endpoint:** `/api/profile/send-otp`  
**Auth Required:** Yes  
**Role Allowed:** All authenticated  

**Purpose:** Send OTP for email/phone update.

**Request Body:**
```json
{
  "type": "email",
  "email": "new@email.com"
}
```
or
```json
{
  "type": "phone",
  "phone": "+91 9876543210"
}
```

**Rate Limit:** 5 requests per 15 minutes.

**Who can call:** Any authenticated user.

---

### 🔹 Verify Profile OTP

**Method:** POST  
**Endpoint:** `/api/profile/verify-otp`  
**Auth Required:** Yes  
**Role Allowed:** All authenticated  

**Purpose:** Verify OTP and update email/phone.

**Request Body:**
```json
{
  "type": "email",
  "otp": "123456"
}
```

**Who can call:** Any authenticated user.

---

## Leaderboard (STUDENT, TEACHER, PRINCIPAL)

### 🔹 Get My Rank

**Method:** GET  
**Endpoint:** `/api/leaderboard/me`  
**Auth Required:** Yes  
**Role Allowed:** STUDENT, TEACHER, PRINCIPAL  

**Purpose:** Get current user's leaderboard rank (students: class + school rank, stars).

**Query Params:** `period` (weekly | monthly, default: weekly)

**Success Response Example:**
```json
{
  "success": true,
  "data": {
    "isStudent": true,
    "classRank": 3,
    "schoolRank": 25,
    "totalStars": 50,
    "attendancePercentage": 90,
    "academicScore": 85,
    "periodType": "weekly",
    "periodKey": "2025-W07"
  }
}
```

**Who can call:** STUDENT (own rank), TEACHER/PRINCIPAL (may return isStudent: false).

---

### 🔹 Get Class Leaderboard

**Method:** GET  
**Endpoint:** `/api/leaderboard/class/:classId`  
**Auth Required:** Yes  
**Role Allowed:** STUDENT, TEACHER, PRINCIPAL  

**Purpose:** Get leaderboard for a class.

**URL Params:** `classId` – Class ID

**Query Params:** `period` (weekly | monthly)

**Who can call:** TEACHER (assigned class), PRINCIPAL, STUDENT (own class).

---

### 🔹 Get School Leaderboard

**Method:** GET  
**Endpoint:** `/api/leaderboard/school/:schoolId`  
**Auth Required:** Yes  
**Role Allowed:** STUDENT, TEACHER, PRINCIPAL, SUPER_ADMIN  

**Purpose:** Get school-wide leaderboard.

**URL Params:** `schoolId` – School ID

**Query Params:** `period` (weekly | monthly)

**Who can call:** Users with access to the school.

---

## Public (No Auth)

### 🔹 Get Public Content

**Method:** GET  
**Endpoint:** `/api/public/content`  
**Auth Required:** No  
**Role Allowed:** PUBLIC  

**Purpose:** Get public website content (landing, marketing).

**Query Params:** `schoolId` (optional – defaults to PUBLIC_SCHOOL_ID or first active school)

**Success Response Example:**
```json
{
  "success": true,
  "data": {
    "navbar": {},
    "banner": {},
    "announcements": [],
    "footer": {},
    "gallery": {}
  }
}
```

**Who can call:** Anyone (public).

---

### 🔹 Submit Contact Message

**Method:** POST  
**Endpoint:** `/api/public/contact`  
**Auth Required:** No  
**Role Allowed:** PUBLIC  

**Purpose:** Submit contact form message.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+91 9876543210",
  "subject": "Admission Query",
  "message": "I would like to know about admissions.",
  "schoolId": "MONGO_ID"
}
```

**Success Response Example:**
```json
{
  "success": true,
  "message": "Message submitted successfully"
}
```

**Who can call:** Anyone (public).

---

# 📊 Reports / Fees / Notices / Notifications / Chat

---

## Fees

### 🔹 Create Fee Structure (Principal)

**Method:** POST  
**Endpoint:** `/api/fees/structure`  
**Auth Required:** Yes  
**Role Allowed:** PRINCIPAL  

**Purpose:** Create fee structure for a class/academic year.

**Request Body:**
```json
{
  "classId": "MONGO_ID",
  "academicYear": "2024-25",
  "feeType": "YEARLY",
  "components": [
    { "name": "Tuition Fee", "amount": 50000 },
    { "name": "Exam Fee", "amount": 5000 }
  ],
  "dueDate": "2025-04-30",
  "lateFinePerDay": 10
}
```
`feeType`: MONTHLY | QUARTERLY | YEARLY

**Who can call:** Principal only.

---

### 🔹 Update Fee Structure (Principal)

**Method:** PUT  
**Endpoint:** `/api/fees/structure/:id`  
**Auth Required:** Yes  
**Role Allowed:** PRINCIPAL  

**Purpose:** Update fee structure.

**URL Params:** `id` – Fee structure ID

**Who can call:** Principal only.

---

### 🔹 Get Fee Structures (Principal, Teacher)

**Method:** GET  
**Endpoint:** `/api/fees/structure`  
**Auth Required:** Yes  
**Role Allowed:** PRINCIPAL, TEACHER  

**Purpose:** List fee structures.

**Query Params:** `classId`, `academicYear`, `feeType`

**Who can call:** Principal, Teacher.

---

### 🔹 Toggle Fee Structure Status (Principal)

**Method:** PATCH  
**Endpoint:** `/api/fees/structure/:id/status`  
**Auth Required:** Yes  
**Role Allowed:** PRINCIPAL  

**Purpose:** Activate/deactivate fee structure.

**URL Params:** `id` – Fee structure ID

**Request Body:** `{ "isActive": true }`

**Who can call:** Principal only.

---

### 🔹 Initialize Student Fees (Principal)

**Method:** POST  
**Endpoint:** `/api/fees/initialize`  
**Auth Required:** Yes  
**Role Allowed:** PRINCIPAL  

**Purpose:** Initialize student fees from a fee structure.

**Request Body:** `{ "structureId": "MONGO_ID" }`

**Who can call:** Principal only.

---

### 🔹 Collect Fee (Principal)

**Method:** POST  
**Endpoint:** `/api/fees/collect`  
**Auth Required:** Yes  
**Role Allowed:** PRINCIPAL  

**Purpose:** Record fee payment.

**Request Body:**
```json
{
  "studentFeeId": "MONGO_ID",
  "amount": 5000,
  "paymentMode": "cash",
  "referenceId": "TXN123"
}
```
`paymentMode`: cash | online | UPI | bank

**Who can call:** Principal only.

---

### 🔹 Send Fee Reminder (Principal)

**Method:** POST  
**Endpoint:** `/api/fees/send-reminder`  
**Auth Required:** Yes  
**Role Allowed:** PRINCIPAL  

**Purpose:** Send fee reminders (in-app + push).

**Request Body:**
```json
{
  "classId": "MONGO_ID",
  "studentId": "MONGO_ID",
  "onlyDefaulters": true
}
```

**Who can call:** Principal only.

---

### 🔹 Get Class Fees (Principal, Teacher)

**Method:** GET  
**Endpoint:** `/api/fees/class/:classId`  
**Auth Required:** Yes  
**Role Allowed:** PRINCIPAL, TEACHER  

**Purpose:** Get fees by class.

**URL Params:** `classId`

**Query Params:** `academicYear`, `status`

**Who can call:** Principal, Teacher.

---

### 🔹 Get Fee Defaulters (Principal, Teacher)

**Method:** GET  
**Endpoint:** `/api/fees/defaulters`  
**Auth Required:** Yes  
**Role Allowed:** PRINCIPAL, TEACHER  

**Purpose:** Get list of fee defaulters.

**Query Params:** `classId`

**Who can call:** Principal, Teacher.

---

### 🔹 Get Fee Statistics (Principal, Teacher)

**Method:** GET  
**Endpoint:** `/api/fees/statistics`  
**Auth Required:** Yes  
**Role Allowed:** PRINCIPAL, TEACHER  

**Purpose:** Get fee statistics.

**Query Params:** `classId`, `academicYear`

**Who can call:** Principal, Teacher.

---

### 🔹 Get Student Fee Status (Student – Dashboard)

**Method:** GET  
**Endpoint:** `/api/fees/student/status`  
**Auth Required:** Yes  
**Role Allowed:** STUDENT  

**Purpose:** Get lightweight fee status for dashboard banner.

**Who can call:** Student only.

---

### 🔹 Get Student Fees Me (Student)

**Method:** GET  
**Endpoint:** `/api/fees/student/me`  
**Auth Required:** Yes  
**Role Allowed:** STUDENT  

**Purpose:** Get own fee details (structure + payment).

**Who can call:** Student only.

---

### 🔹 Get My Fees (Student – Legacy)

**Method:** GET  
**Endpoint:** `/api/fees/my-fees`  
**Auth Required:** Yes  
**Role Allowed:** STUDENT  

**Purpose:** Get own fees list (legacy endpoint).

**Query Params:** `academicYear`, `status`

**Who can call:** Student only.

---

### 🔹 Get Student Fees (Principal, Teacher, Student)

**Method:** GET  
**Endpoint:** `/api/fees/student/:studentId`  
**Auth Required:** Yes  
**Role Allowed:** PRINCIPAL, TEACHER, STUDENT  

**Purpose:** Get fees for a student (students can only view own).

**URL Params:** `studentId`

**Query Params:** `academicYear`, `status`

**Who can call:** Principal, Teacher; Student (own fees only).

---

## Notices

### 🔹 Get Dashboard Notices (Teacher, Student)

**Method:** GET  
**Endpoint:** `/api/notices/dashboard`  
**Auth Required:** Yes  
**Role Allowed:** TEACHER, STUDENT  

**Purpose:** Get latest notices for dashboard banner.

**Query Params:** `limit` (default 3, max 5)

**Who can call:** Teacher, Student.

---

### 🔹 Get My Notices (Principal, Teacher, Student)

**Method:** GET  
**Endpoint:** `/api/notices/me`  
**Auth Required:** Yes  
**Role Allowed:** PRINCIPAL, TEACHER, STUDENT  

**Purpose:** Get notices for current user (Principal: sent; Teacher/Student: received).

**Query Params:** `page`, `limit`, `unreadOnly`

**Who can call:** Principal, Teacher, Student.

---

### 🔹 Mark Notice as Read (Principal, Teacher, Student)

**Method:** PATCH  
**Endpoint:** `/api/notices/:id/read`  
**Auth Required:** Yes  
**Role Allowed:** PRINCIPAL, TEACHER, STUDENT  

**Purpose:** Mark a notice as read.

**URL Params:** `id` – Notice ID

**Who can call:** Recipients (Teacher, Student); Principal if recipient.

---

### 🔹 Mark All Notices as Read (Teacher, Student)

**Method:** PATCH  
**Endpoint:** `/api/notices/mark-all-read`  
**Auth Required:** Yes  
**Role Allowed:** TEACHER, STUDENT  

**Purpose:** Mark all notices as read for current user.

**Who can call:** Teacher, Student.

---

### 🔹 Create Notice (Principal)

**Method:** POST  
**Endpoint:** `/api/notices`  
**Auth Required:** Yes  
**Role Allowed:** PRINCIPAL  

**Purpose:** Create a notice targeting role/class/student/teacher.

**Request Body:**
```json
{
  "title": "Holiday Notice",
  "message": "School will be closed on 15th Feb.",
  "targetRole": "ALL",
  "classId": "MONGO_ID",
  "studentId": "MONGO_ID",
  "teacherId": "MONGO_ID",
  "isImportant": true,
  "attachments": [],
  "expiresAt": "2025-02-20T00:00:00Z"
}
```
`targetRole`: TEACHER | STUDENT | ALL

**Who can call:** Principal only.

---

### 🔹 Delete Notice (Principal)

**Method:** DELETE  
**Endpoint:** `/api/notices/:id`  
**Auth Required:** Yes  
**Role Allowed:** PRINCIPAL  

**Purpose:** Delete a notice.

**URL Params:** `id` – Notice ID

**Who can call:** Principal only (creator).

---

## Notifications

### 🔹 Get VAPID Key (Public)

**Method:** GET  
**Endpoint:** `/api/notifications/vapid-key`  
**Auth Required:** No  
**Role Allowed:** PUBLIC  

**Purpose:** Get VAPID public key for PWA push notifications.

**Success Response Example:**
```json
{
  "success": true,
  "data": { "publicKey": "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFg..." }
}
```

**Who can call:** Anyone (for PWA setup).

---

### 🔹 Get User Notifications (Teacher, Student)

**Method:** GET  
**Endpoint:** `/api/notifications` or `/api/notifications/me`  
**Auth Required:** Yes  
**Role Allowed:** TEACHER, STUDENT  

**Purpose:** Get current user's notifications.

**Query Params:** `page`, `limit`, `unreadOnly`

**Who can call:** Teacher, Student.

---

### 🔹 Mark Notification as Read (Teacher, Student)

**Method:** PUT  
**Endpoint:** `/api/notifications/:id/read`  
**Auth Required:** Yes  
**Role Allowed:** TEACHER, STUDENT  

**Purpose:** Mark a notification as read.

**URL Params:** `id` – Notification ID

**Who can call:** Teacher, Student.

---

### 🔹 Mark All Notifications as Read (Teacher, Student)

**Method:** PUT  
**Endpoint:** `/api/notifications/read-all`  
**Auth Required:** Yes  
**Role Allowed:** TEACHER, STUDENT  

**Purpose:** Mark all notifications as read.

**Who can call:** Teacher, Student.

---

### 🔹 Subscribe to Push (All Authenticated)

**Method:** POST  
**Endpoint:** `/api/notifications/subscribe`  
**Auth Required:** Yes  
**Role Allowed:** All authenticated  

**Purpose:** Subscribe to push notifications (PWA).

**Request Body:**
```json
{
  "subscription": { "endpoint": "...", "keys": { "p256dh": "...", "auth": "..." } },
  "deviceInfo": "Chrome on Windows"
}
```

**Who can call:** Any authenticated user.

---

### 🔹 Unsubscribe from Push (All Authenticated)

**Method:** POST  
**Endpoint:** `/api/notifications/unsubscribe`  
**Auth Required:** Yes  
**Role Allowed:** All authenticated  

**Purpose:** Unsubscribe from push notifications.

**Request Body:** `{ "endpoint": "..." }`

**Who can call:** Any authenticated user.

---

## Chat

### 🔹 Get or Create Chat Room

**Method:** GET  
**Endpoint:** `/api/chat/class/:classId`  
**Auth Required:** Yes  
**Role Allowed:** TEACHER, STUDENT (via validateChatAccess)  

**Purpose:** Get or create chat room for a class.

**URL Params:** `classId` – Class ID

**Success Response Example:**
```json
{
  "success": true,
  "message": "Chat room retrieved successfully",
  "data": {
    "chatRoom": {
      "id": "...",
      "classId": "...",
      "className": "10",
      "classSection": "A",
      "teacherId": "...",
      "createdAt": "..."
    }
  }
}
```

**Who can call:** Teacher (assigned to class), Student (in class).

---

### 🔹 Get Chat Messages

**Method:** GET  
**Endpoint:** `/api/chat/:classId/messages`  
**Auth Required:** Yes  
**Role Allowed:** TEACHER, STUDENT  

**Purpose:** Get paginated messages for class chat.

**URL Params:** `classId`

**Query Params:** `page`, `limit` (default 50)

**Success Response Example:**
```json
{
  "success": true,
  "message": "Messages retrieved successfully",
  "data": {
    "messages": [],
    "pagination": { "currentPage": 1, "totalPages": 1, "totalMessages": 0, "hasMore": false }
  }
}
```

**Who can call:** Teacher (assigned), Student (in class).

---

### 🔹 Send Chat Message

**Method:** POST  
**Endpoint:** `/api/chat/:classId/message`  
**Auth Required:** Yes  
**Role Allowed:** TEACHER, STUDENT  

**Purpose:** Send a text or media message.

**URL Params:** `classId`

**Request:** `multipart/form-data` – `text`, `media` (file), `chatRoomId` (optional)

**Who can call:** Teacher (assigned), Student (in class).

---

# 🤖 AI APIs

---

## AI Doubt Solver Chat (Student, Teacher)

### 🔹 Post AI Chat

**Method:** POST  
**Endpoint:** `/api/ai/chat`  
**Auth Required:** Yes  
**Role Allowed:** STUDENT, TEACHER  

**Purpose:** Send a doubt/question and get AI response (Perplexity-based).

**Request Body:**
```json
{
  "message": "What is the Pythagorean theorem?",
  "role": "STUDENT"
}
```

**Success Response Example:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "message": "What is the Pythagorean theorem?",
    "aiResponse": "The Pythagorean theorem states that...",
    "createdAt": "..."
  }
}
```

**Rate Limit:** 20 messages per user per hour.

**Who can call:** Student, Teacher.

---

### 🔹 Get AI Chat History

**Method:** GET  
**Endpoint:** `/api/ai/history`  
**Auth Required:** Yes  
**Role Allowed:** STUDENT, TEACHER  

**Purpose:** Get last 20 AI chat messages for the user.

**Query Params:** `limit` (default 20, max 50)

**Who can call:** Student, Teacher.

---

## Principal AI (Templates, Notices, Posters, Result Analysis)

All under `/api/principal/ai` – require PRINCIPAL role and feature flags.

### 🔹 Generate School Template

**Method:** POST  
**Endpoint:** `/api/principal/ai/school-template`  
**Auth Required:** Yes  
**Role Allowed:** PRINCIPAL  
**Feature:** AI_TEMPLATES (PRO)  

**Purpose:** Generate school template content via AI.

**Request Body:**
```json
{
  "schoolType": "secondary",
  "classes": "1-10",
  "tone": "professional",
  "language": "English",
  "purpose": "admission"
}
```

**Who can call:** Principal (with PRO plan).

---

### 🔹 Get School Templates

**Method:** GET  
**Endpoint:** `/api/principal/ai/school-templates`  
**Auth Required:** Yes  
**Role Allowed:** PRINCIPAL  
**Feature:** AI_TEMPLATES  

**Purpose:** List AI-generated templates.

**Who can call:** Principal.

---

### 🔹 Download Template

**Method:** GET  
**Endpoint:** `/api/principal/ai/school-template/:id/download`  
**Auth Required:** Yes  
**Role Allowed:** PRINCIPAL  
**Feature:** AI_TEMPLATES  

**Purpose:** Download template as PDF or DOC.

**URL Params:** `id` – Template ID

**Query Params:** `format` (pdf | doc)

**Who can call:** Principal.

---

### 🔹 Create AI Notice

**Method:** POST  
**Endpoint:** `/api/principal/ai/notice`  
**Auth Required:** Yes  
**Role Allowed:** PRINCIPAL  
**Feature:** AI_NOTICE  

**Purpose:** Generate notice variants via AI.

**Request Body:**
```json
{
  "event": "PTM",
  "date": "2025-02-20",
  "classes": "1-10",
  "language": "English",
  "delivery": "email"
}
```

**Who can call:** Principal (PRO).

---

### 🔹 Get AI Notices

**Method:** GET  
**Endpoint:** `/api/principal/ai/notices`  
**Auth Required:** Yes  
**Role Allowed:** PRINCIPAL  
**Feature:** AI_NOTICE  

**Purpose:** List AI-generated notices.

**Who can call:** Principal.

---

### 🔹 Create AI Poster

**Method:** POST  
**Endpoint:** `/api/principal/ai/poster`  
**Auth Required:** Yes  
**Role Allowed:** PRINCIPAL  
**Feature:** AI_POSTER_GENERATOR  

**Purpose:** Generate poster image via AI.

**Request:** `multipart/form-data` – `text`, `occasion`, `format`, `image` (optional)

**Who can call:** Principal (PRO).

---

### 🔹 List AI Posters

**Method:** GET  
**Endpoint:** `/api/principal/ai/posters`  
**Auth Required:** Yes  
**Role Allowed:** PRINCIPAL  
**Feature:** AI_POSTER_GENERATOR  

**Purpose:** List AI-generated posters.

**Who can call:** Principal.

---

### 🔹 Analyze Results

**Method:** GET  
**Endpoint:** `/api/principal/ai/result-analysis/:examId`  
**Auth Required:** Yes  
**Role Allowed:** PRINCIPAL  
**Feature:** AI_RESULT_ANALYSIS  

**Purpose:** Get AI analysis of exam results.

**URL Params:** `examId` – exam type (unit_test, mid_term, final, etc.) or ID

**Who can call:** Principal (PRO).

---

### 🔹 Generate Branding

**Method:** POST  
**Endpoint:** `/api/principal/ai/branding`  
**Auth Required:** Yes  
**Role Allowed:** PRINCIPAL  
**Feature:** BRANDING  

**Purpose:** Generate branding suggestions (logo prompt, certificate text, etc.).

**Request Body:**
```json
{
  "tone": "professional",
  "language": "English"
}
```

**Who can call:** Principal (PRO).

---

# 📊 Reports

> ⚠️ **Note:** Reports routes exist in the codebase but are **NOT registered** in `app.js`. They are **UNUSED**.

### 🔹 Generate Report (UNUSED)

**Method:** GET  
**Endpoint:** `/api/reports/generate` (if mounted)  
**Auth Required:** Yes  
**Role Allowed:** PRINCIPAL  
**Feature:** REPORTS  

**Purpose:** Generate attendance/fees/academic/monthly report.

**Query Params:** `type` (attendance | fees | academic | monthly), `startDate`, `endDate`, `format` (json | pdf)

**Status:** Unused – route file exists but not mounted in app.js.

---

# Unused Routes (Not Mounted in app.js)

The following route files exist but are **not registered** in `app.js`:

| Route File | Mount Path (if used) | Description |
|------------|----------------------|-------------|
| reports.routes.js | /api/reports | Reports generation – UNUSED |
| dashboard.routes.js | /api/dashboard | Principal dashboard – UNUSED (pulse is under /api/principal) |
| class.routes.js | /api/class | Standalone class CRUD – UNUSED (classes under /api/principal) |
| attendance.routes.js | /api/attendance | Standalone attendance – UNUSED (attendance under /api/teacher) |

---

# Summary: APIs without Authentication

| Endpoint | Method | Purpose |
|----------|--------|---------|
| /api/auth/login | POST | Login |
| /api/auth/verify-email-otp | POST | Verify email |
| /api/auth/resend-verification-otp | POST | Resend OTP |
| /api/auth/forgot-password | POST | Request reset OTP |
| /api/auth/reset-password | POST | Reset password |
| /api/public/content | GET | Public website content |
| /api/public/contact | POST | Contact form |
| /api/notifications/vapid-key | GET | VAPID key for PWA |
| / (root) | GET | Health check |

---

# APIs with Missing or Inconsistent Role Protection

- **class.routes.js** and **attendance.routes.js** use `"principal"` and `"teacher"` (lowercase) in `allowRoles` – should be `"PRINCIPAL"` and `"TEACHER"` to match the role model.
- **school.controller.js** uses `msg` instead of `message` in error responses (inconsistent with standard format).
- **notification.routes.js**: `subscribe` and `unsubscribe` use `protect` but no role restriction – any authenticated user can subscribe (intended behavior).

---

# Duplicate or Conflicting Endpoints

- **Create Student**: `/api/principal/create-student` and `/api/teacher/create-student` (and `/api/teacher/students`) – same purpose, different roles. Not conflicting.
- **Notifications**: `/api/notifications` and `/api/notifications/me` both return user notifications (alias).
- **School creation**: Super Admin creates schools; Principal can also create school via `/api/school` (different flow – Principal self-onboarding).

---

# ⚠️ Inconsistent Response Formats

- Most APIs use `{ success, message, data }`.
- Some use `msg` (e.g., school.controller.js).
- Pagination format varies: some use `pagination`, some use `pages`, `total`, `limit`.
- Recommend standardizing on `{ success, message, data, pagination? }` everywhere.

---

# ✅ Suggested Improvements

1. **API versioning**: Add `/api/v1/` prefix for future compatibility.
2. **Consistent error format**: Use `{ success: false, message, code? }` everywhere.
3. **Register unused routes**: Either mount `reports.routes.js` or remove it.
4. **Role casing**: Ensure `allowRoles` uses uppercase (`PRINCIPAL`, `TEACHER`) everywhere.
5. **REST naming**: Prefer resource plural (`/api/teachers`, `/api/students`) for collections.
6. **Pagination**: Standardize `page`, `limit`, `total`, `pages`, `hasMore`.
7. **Rate limiting**: Consider global rate limiting for public endpoints.
8. **OpenAPI/Swagger**: Generate OpenAPI spec from this documentation for tooling.

---

*Document generated from backend codebase scan. Last updated: Feb 2025.*
