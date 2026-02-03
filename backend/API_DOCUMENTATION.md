# School Management System - API Documentation

## Base URL

```
http://localhost:5000/api
```

## Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

---

## AUTH ENDPOINTS

### POST /api/auth/login

Login user and get JWT token.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "user@example.com",
      "role": "PRINCIPAL",
      "schoolId": "507f1f77bcf86cd799439012"
    }
  }
}
```

---

## SUPER ADMIN ENDPOINTS

### POST /api/super-admin/create-school

Create a new school.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "name": "ABC High School",
  "address": "123 Main Street, City, State"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "School created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "ABC High School",
    "address": "123 Main Street, City, State",
    "principalId": null,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### POST /api/super-admin/create-principal

Create a principal user.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "name": "John Principal",
  "email": "principal@school.com",
  "password": "password123"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Principal created successfully",
  "data": {
    "id": "507f1f77bcf86cd799439013",
    "name": "John Principal",
    "email": "principal@school.com",
    "role": "PRINCIPAL"
  }
}
```

### POST /api/super-admin/assign-principal

Assign a principal to a school.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "principalId": "507f1f77bcf86cd799439013",
  "schoolId": "507f1f77bcf86cd799439012"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Principal assigned to school successfully",
  "data": {
    "school": {
      "id": "507f1f77bcf86cd799439012",
      "name": "ABC High School",
      "principalId": "507f1f77bcf86cd799439013"
    },
    "principal": {
      "id": "507f1f77bcf86cd799439013",
      "name": "John Principal",
      "email": "principal@school.com",
      "schoolId": "507f1f77bcf86cd799439012"
    }
  }
}
```

---

## PRINCIPAL ENDPOINTS

### AI & Reports (New)

#### POST /api/ai/school-template

Principal-only. Generate AI school templates.
**Headers:** `Authorization: Bearer <token>`

**Body:**

```json
{
  "schoolType": "CBSE",
  "classes": "1-12",
  "tone": "formal",
  "language": "English",
  "purpose": "website"
}
```

**Response:** Saved template record (200)

#### GET /api/ai/school-templates

List generated templates for principal's school (200)

#### GET /api/ai/school-template/:id/download?format=pdf|doc

Download a generated template as PDF or DOC (200 attachment)

#### POST /api/ai/notice

Generate notices and variants and save history.
**Body:**

```json
{
  "event": "PTM",
  "date": "2026-02-02",
  "classes": ["8A", "8B"],
  "language": "Hindi + English",
  "delivery": ["notice", "whatsapp", "sms"]
}
```

**Response:** Saved notice record (200)

#### GET /api/ai/notices

List AI-generated notices (200)

#### GET /api/ai/result-analysis/:examId

Run AI analysis for given exam type (returns JSON with summary, weakSubjects, atRiskStudents, teacherInsights)

#### POST /api/ai/branding

Generate branding kit (logo prompt, certificate text, letterhead, idCardLayout)

#### POST /api/ai/poster

Generate AI poster/image for social media.
**Headers:** `Authorization: Bearer <token>`

**Body (multipart/form-data or JSON)**

- text (string) — short prompt like "Happy Independence Day" (required)
- occasion (string) — optional festival/occasion
- format (story | poster | banner) — required
- image (file) — optional image to include (multipart/form-data)

**Response (200):**

```json
{
  "success": true,
  "data": {
    "imageUrl": "https://...",
    "promptUsed": "...",
    "id": "..."
  }
}
```

#### GET /api/ai/posters

List saved posters for the principal's school (200)

#### GET /api/reports/generate?type=monthly|attendance|fees|academic&format=pdf|json&startDate=&endDate=

Generate reports and optionally download as PDF. (Requires plan for some exports)

#### GET /api/dashboard/principal

Aggregated principal dashboard: totals, today's attendance, fee collected today, pending complaints, AI alerts (200)

#### GET /api/principal/risks

Get student risk flags (requires PRINCIPAL role)

### POST /api/principal/create-teacher

Create a teacher.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "name": "Jane Teacher",
  "email": "teacher@school.com",
  "password": "password123",
  "qualification": "M.Sc. Mathematics",
  "experience": 5
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Teacher created successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439014",
      "name": "Jane Teacher",
      "email": "teacher@school.com",
      "role": "TEACHER",
      "schoolId": "507f1f77bcf86cd799439012"
    },
    "profile": {
      "id": "507f1f77bcf86cd799439015",
      "qualification": "M.Sc. Mathematics",
      "experience": 5
    }
  }
}
```

### POST /api/principal/create-student

Create a student.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "name": "Alice Student",
  "email": "student@school.com",
  "password": "password123",
  "classId": "507f1f77bcf86cd799439016",
  "rollNumber": 1,
  "parentPhone": "9876543210"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Student created successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439017",
      "name": "Alice Student",
      "email": "student@school.com",
      "role": "STUDENT",
      "schoolId": "507f1f77bcf86cd799439012"
    },
    "profile": {
      "id": "507f1f77bcf86cd799439018",
      "classId": "507f1f77bcf86cd799439016",
      "rollNumber": 1
    }
  }
}
```

### POST /api/principal/create-class

Create a class.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "name": "10",
  "section": "A"
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Class created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439016",
    "name": "10",
    "section": "A",
    "schoolId": "507f1f77bcf86cd799439012",
    "classTeacherId": null,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### POST /api/principal/assign-teacher

Assign teacher to a class.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "teacherId": "507f1f77bcf86cd799439015",
  "classId": "507f1f77bcf86cd799439016"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Teacher assigned to class successfully",
  "data": {
    "teacher": {
      "id": "507f1f77bcf86cd799439015",
      "name": "Jane Teacher",
      "assignedClasses": ["507f1f77bcf86cd799439016"]
    },
    "class": {
      "id": "507f1f77bcf86cd799439016",
      "name": "10",
      "section": "A"
    }
  }
}
```

### POST /api/principal/assign-student

Assign student to a class.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "studentId": "507f1f77bcf86cd799439018",
  "classId": "507f1f77bcf86cd799439016"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Student assigned to class successfully",
  "data": {
    "student": {
      "id": "507f1f77bcf86cd799439018",
      "name": "Alice Student",
      "rollNumber": 1,
      "classId": "507f1f77bcf86cd799439016"
    },
    "class": {
      "id": "507f1f77bcf86cd799439016",
      "name": "10",
      "section": "A"
    }
  }
}
```

---

## TEACHER ENDPOINTS

### GET /api/teacher/classes

Get teacher's assigned classes.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**

```json
{
  "success": true,
  "message": "Classes retrieved successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439016",
      "name": "10",
      "section": "A",
      "schoolId": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "ABC High School"
      }
    }
  ]
}
```

### GET /api/teacher/students

Get students in teacher's assigned classes.

**Query Parameters:**

- `classId` (optional): Filter by specific class

**Headers:** `Authorization: Bearer <token>`

**Response (200):**

```json
{
  "success": true,
  "message": "Students retrieved successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439018",
      "rollNumber": 1,
      "classId": {
        "_id": "507f1f77bcf86cd799439016",
        "name": "10",
        "section": "A"
      },
      "userId": {
        "_id": "507f1f77bcf86cd799439017",
        "name": "Alice Student",
        "email": "student@school.com"
      }
    }
  ]
}
```

### POST /api/teacher/attendance

Mark attendance for a class.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "classId": "507f1f77bcf86cd799439016",
  "date": "2024-01-15",
  "records": [
    {
      "studentId": "507f1f77bcf86cd799439018",
      "status": "present"
    },
    {
      "studentId": "507f1f77bcf86cd799439019",
      "status": "absent"
    }
  ]
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Attendance marked successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "schoolId": "507f1f77bcf86cd799439012",
    "classId": "507f1f77bcf86cd799439016",
    "teacherId": "507f1f77bcf86cd799439015",
    "date": "2024-01-15",
    "records": [
      {
        "studentId": "507f1f77bcf86cd799439018",
        "status": "present"
      },
      {
        "studentId": "507f1f77bcf86cd799439019",
        "status": "absent"
      }
    ],
    "createdAt": "2024-01-15T00:00:00.000Z"
  }
}
```

### POST /api/teacher/marks

Upload marks for a student.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**

```json
{
  "studentId": "507f1f77bcf86cd799439018",
  "classId": "507f1f77bcf86cd799439016",
  "subject": "Mathematics",
  "marks": 85,
  "maxMarks": 100,
  "examType": "mid_term"
}
```

**Exam Types:** `unit_test`, `mid_term`, `final`, `assignment`, `quiz`

**Response (201):**

```json
{
  "success": true,
  "message": "Marks uploaded successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439021",
    "schoolId": "507f1f77bcf86cd799439012",
    "classId": "507f1f77bcf86cd799439016",
    "studentId": "507f1f77bcf86cd799439018",
    "teacherId": "507f1f77bcf86cd799439015",
    "subject": "Mathematics",
    "marks": 85,
    "maxMarks": 100,
    "examType": "mid_term",
    "date": "2024-01-15T00:00:00.000Z",
    "createdAt": "2024-01-15T00:00:00.000Z"
  }
}
```

---

## STUDENT ENDPOINTS

### GET /api/student/profile

Get student profile.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**

```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": "507f1f77bcf86cd799439018",
    "user": {
      "id": "507f1f77bcf86cd799439017",
      "name": "Alice Student",
      "email": "student@school.com"
    },
    "rollNumber": 1,
    "class": {
      "id": "507f1f77bcf86cd799439016",
      "name": "10",
      "section": "A"
    },
    "school": {
      "id": "507f1f77bcf86cd799439012",
      "name": "ABC High School",
      "address": "123 Main Street, City, State"
    },
    "parentPhone": "9876543210"
  }
}
```

### GET /api/student/attendance

Get student attendance records.

**Query Parameters:**

- `startDate` (optional): Filter from date (YYYY-MM-DD)
- `endDate` (optional): Filter to date (YYYY-MM-DD)

**Headers:** `Authorization: Bearer <token>`

**Response (200):**

```json
{
  "success": true,
  "message": "Attendance retrieved successfully",
  "data": {
    "records": [
      {
        "date": "2024-01-15",
        "status": "present"
      },
      {
        "date": "2024-01-14",
        "status": "absent"
      }
    ],
    "statistics": {
      "totalDays": 2,
      "presentDays": 1,
      "absentDays": 1,
      "attendancePercentage": 50.0
    }
  }
}
```

### GET /api/student/marks

Get student marks.

**Query Parameters:**

- `subject` (optional): Filter by subject
- `examType` (optional): Filter by exam type

**Headers:** `Authorization: Bearer <token>`

**Response (200):**

```json
{
  "success": true,
  "message": "Marks retrieved successfully",
  "data": {
    "records": [
      {
        "_id": "507f1f77bcf86cd799439021",
        "subject": "Mathematics",
        "marks": 85,
        "maxMarks": 100,
        "examType": "mid_term",
        "date": "2024-01-15T00:00:00.000Z",
        "classId": {
          "_id": "507f1f77bcf86cd799439016",
          "name": "10",
          "section": "A"
        },
        "teacherId": {
          "userId": {
            "name": "Jane Teacher"
          }
        }
      }
    ],
    "groupedBySubject": {
      "Mathematics": [
        {
          "id": "507f1f77bcf86cd799439021",
          "marks": 85,
          "maxMarks": 100,
          "percentage": "85.00",
          "examType": "mid_term",
          "date": "2024-01-15T00:00:00.000Z",
          "teacher": "Jane Teacher"
        }
      ]
    }
  }
}
```

---

## ERROR RESPONSES

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error message here"
}
```

**Common Status Codes:**

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource not found)
- `500` - Internal Server Error

---

## ROLE-BASED ACCESS

- **SUPER_ADMIN**: Can create schools and principals, assign principals to schools
- **PRINCIPAL**: Can manage their assigned school (create teachers, students, classes, assign them)
- **TEACHER**: Can access assigned classes, mark attendance, upload marks
- **STUDENT**: Can view their profile, attendance, and marks

---

## NOTES

1. All dates should be in `YYYY-MM-DD` format
2. All IDs are MongoDB ObjectIds
3. JWT tokens expire in 7 days (configurable via `JWT_EXPIRE`)
4. All protected routes require valid JWT token
5. School-based access validation ensures users can only access their school's data
