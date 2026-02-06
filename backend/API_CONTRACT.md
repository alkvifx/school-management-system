# API Contract – School Management System

Base URL: `/api` (e.g. `https://backend-2tbg.onrender.com/api`)

All protected routes require: `Authorization: Bearer <token>`

---

## Health

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | No | Health check. Response: `{ success, status, timestamp, uptime, env }` |

---

## Auth

| Method | Endpoint | Auth | Body | Response |
|--------|----------|------|------|----------|
| POST | `/auth/login` | No | `{ email, password }` | `{ success, data: { token, user } }` |
| POST | `/auth/verify-email-otp` | No | `{ email, otp }` | `{ success, message }` |
| POST | `/auth/forgot-password` | No | `{ email }` | `{ success, message }` |
| POST | `/auth/reset-password` | No | `{ email, otp, newPassword }` | `{ success, message }` |

---

## Student (role: STUDENT)

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| GET | `/student/profile` | - | `{ success, data: { user, rollNumber, class, school, parentPhone } }` |
| GET | `/student/attendance` | - | `{ success, data: { records, statistics } }`. Query: `startDate`, `endDate` |
| GET | `/student/marks` | - | `{ success, data: { records, groupedBySubject } }`. Query: `subject`, `examType` |

---

## Teacher (role: TEACHER)

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| GET | `/teacher/dashboard` | - | `{ success, data: { totalStudents, totalClasses, attendanceToday, pendingTasks, recentStudents } }` |
| GET | `/teacher/classes` | - | `{ success, data: Class[] }` |
| GET | `/teacher/students` | - | `{ success, data: Student[] }`. Query: `classId` (optional) |
| POST | `/teacher/students` | `{ name, email, password, classId, rollNumber, parentPhone }` | `{ success, data }` |
| POST | `/teacher/attendance` | `{ classId, date (YYYY-MM-DD), records: [{ studentId, status: "present"\|"absent" }] }` | `{ success, data }` |
| POST | `/teacher/marks` | `{ studentId, classId, subject, marks, maxMarks?, examType }` | `{ success, data }` |
| PUT | `/teacher/student/:id` | FormData: `name`, `parentPhone`, `photo?` | `{ success, data }` |

---

## Principal (role: PRINCIPAL)

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| GET | `/principal/teachers` | - | `{ success, data: Teacher[] }` |
| GET | `/principal/students` | - | `{ success, data: Student[] }` |
| GET | `/principal/classes` | - | `{ success, data: Class[] }` |
| GET | `/principal/dashboard/pulse/today` | - | `{ success, data: pulse }` |
| POST | `/principal/create-teacher` | `{ name, email, password, ... }` | `{ success, data }` |
| POST | `/principal/create-student` | `{ name, email, password, classId, rollNumber, parentPhone }` | `{ success, data }` |
| POST | `/principal/create-class` | `{ name, section }` | `{ success, data }` |
| POST | `/principal/assign-teacher` | `{ teacherId, classId }` | `{ success, data }` |
| POST | `/principal/assign-student` | `{ studentId, classId }` | `{ success, data }` |

---

## AI Doubt Solver (roles: STUDENT, TEACHER)

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| POST | `/ai/chat` | `{ message (string, max 500), role?: "STUDENT"\|"TEACHER" }` | `{ success, data: { message, aiResponse, createdAt } }` |
| GET | `/ai/history` | - | `{ success, data: AiChat[] }`. Query: `limit` (default 20, max 50) |

---

## Leaderboard

| Method | Endpoint | Auth | Response |
|--------|----------|------|----------|
| GET | `/leaderboard/rank` | Yes (STUDENT) | Query: `period` (weekly\|monthly). `{ success, data: { totalStars, classRank, schoolRank, ... } }` |

---

## Chat (class chat)

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| GET | `/chat/rooms` | - | `{ success, data: rooms }` |
| GET | `/chat/rooms/:roomId/messages` | - | `{ success, data: messages }` |
| POST | `/chat/rooms/:roomId/messages` | `{ text, messageType?, clientMessageId? }` | `{ success, data }` |

---

## Fees

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/fees/...` | Varies | See fee routes. Principal/Teacher/Student fee endpoints. |

---

## Notifications

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/notifications` | Yes | User notifications. |
| PATCH | `/notifications/:id/read` | Yes | Mark read. |

---

## Field alignment (camelCase)

- **Student (API)**: `userId` (populated as `user` in profile), `classId`, `schoolId`, `rollNumber`, `parentPhone`, `photo`, `isActive`.
- **Teacher (API)**: `userId`, `schoolId`, `assignedClasses`, `qualification`, `experience`, `subject`, `photo`, `isActive`.
- **Class**: `name`, `section`, `schoolId`, `classTeacherId`, `isActive`.
- **Attendance (POST)**: `classId`, `date` (string YYYY-MM-DD), `records`: `[{ studentId, status }]`.
- **Marks (POST)**: `studentId`, `classId`, `subject`, `marks`, `maxMarks` (optional, default 100), `examType` (unit_test, mid_term, final, assignment, quiz).

Frontend must send the same field names (camelCase). Do not send extra unused fields; omit optional fields when not used.
