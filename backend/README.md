# School Management System - Backend

A complete MERN stack backend for a School Management System with role-based access control, built with Node.js, Express, MongoDB, and Mongoose.

## Features

- 🔐 JWT Authentication
- 👥 Role-based Access Control (SUPER_ADMIN, PRINCIPAL, TEACHER, STUDENT)
- 🏫 School-based Data Isolation
- 📊 Attendance Management
- 📝 Marks/Grades Management
- 🛡️ Secure Password Hashing (bcrypt)
- ✅ Centralized Error Handling
- 📦 Clean, Scalable Architecture

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-async-handler** - Async error handling

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── controllers/
│   │   ├── auth.controllers.js
│   │   ├── superAdmin.controller.js
│   │   ├── principal.controller.js
│   │   ├── teacher.controller.js
│   │   └── student.controller.js
│   ├── middlewares/
│   │   ├── auth.middleware.js      # JWT authentication
│   │   ├── role.middleware.js      # Role-based access
│   │   ├── school.middleware.js    # School access validation
│   │   └── error.middleware.js     # Error handling
│   ├── models/
│   │   ├── user.model.js
│   │   ├── school.model.js
│   │   ├── class.model.js
│   │   ├── teacher.model.js
│   │   ├── student.model.js
│   │   ├── attendance.model.js
│   │   └── marks.model.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── superAdmin.routes.js
│   │   ├── principal.routes.js
│   │   ├── teacher.routes.js
│   │   └── student.routes.js
│   ├── utils/
│   │   └── validators.js
│   ├── app.js                 # Express app configuration
│   └── server.js              # Server entry point
├── package.json
├── env.example               # Environment variables template
└── README.md

```

## Installation

1. **Clone the repository** (if not already done)
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` and add your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGO_URI=mongodb://localhost:27017/school-management
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   JWT_EXPIRE=7d
   ```

4. **Start MongoDB**
   - Make sure MongoDB is running on your system
   - Or use MongoDB Atlas and update `MONGO_URI` in `.env`

5. **Run the server**
   ```bash
   # Development mode (with nodemon)
   npm run dev

   # Production mode
   npm start
   ```

   Server will run on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login user

### Super Admin
- `POST /api/super-admin/create-school` - Create school
- `POST /api/super-admin/create-principal` - Create principal
- `POST /api/super-admin/assign-principal` - Assign principal to school

### Principal
- `POST /api/principal/create-teacher` - Create teacher
- `POST /api/principal/create-student` - Create student
- `POST /api/principal/create-class` - Create class
- `POST /api/principal/assign-teacher` - Assign teacher to class
- `POST /api/principal/assign-student` - Assign student to class

### Teacher
- `GET /api/teacher/classes` - Get assigned classes
- `GET /api/teacher/students` - Get students in assigned classes
- `POST /api/teacher/attendance` - Mark attendance
- `POST /api/teacher/marks` - Upload marks

### Student
- `GET /api/student/profile` - Get profile
- `GET /api/student/attendance` - Get attendance records
- `GET /api/student/marks` - Get marks

For detailed API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

## System Roles & Permissions

### SUPER_ADMIN
- Can create schools
- Can create principals
- Can assign principals to schools
- Cannot access school internal data

### PRINCIPAL
- Can login
- Can manage ONLY their assigned school
- Can create teachers, classes, and students
- Can assign teachers and students to classes

### TEACHER
- Can login
- Can access ONLY assigned classes and students
- Can mark attendance
- Can upload marks

### STUDENT
- Can login
- Can view their profile, attendance, and marks

## Security Features

1. **JWT Authentication** - All protected routes require valid JWT token
2. **Password Hashing** - Passwords are hashed using bcrypt (10 rounds)
3. **Role-based Access Control** - Middleware validates user roles
4. **School-based Isolation** - Users can only access their school's data
5. **Input Validation** - Email, password, and other inputs are validated
6. **Error Handling** - Centralized error handling prevents crashes

## Database Models

### User
- name, email (unique), password (hashed), role, schoolId, isActive

### School
- name, address, principalId, isActive

### Class
- name, section, schoolId, classTeacherId, isActive

### Teacher Profile
- userId, schoolId, assignedClasses[], qualification, experience

### Student Profile
- userId, schoolId, classId, rollNumber, parentPhone

### Attendance
- schoolId, classId, teacherId, date, records[]

### Marks
- schoolId, classId, studentId, teacherId, subject, marks, maxMarks, examType, date

## Error Handling

All errors are handled centrally through the `errorHandler` middleware. Errors return consistent JSON responses:

```json
{
  "success": false,
  "message": "Error message here"
}
```

## Development

### Code Style
- Use async/await for asynchronous operations
- Use `asyncHandler` wrapper for route handlers
- Follow RESTful API conventions
- Use meaningful variable and function names

### Adding New Features
1. Create/update model in `models/`
2. Create controller in `controllers/`
3. Create routes in `routes/`
4. Add middleware if needed
5. Update `app.js` with new routes

## Testing

You can test the API using:
- **Postman** - Import the API endpoints
- **Thunder Client** (VS Code extension)
- **curl** - Command line tool
- **Frontend Application** - Connect your React frontend

## Example API Request

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "principal@school.com",
    "password": "password123"
  }'
```

### Create School (Super Admin)
```bash
curl -X POST http://localhost:5000/api/super-admin/create-school \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "ABC High School",
    "address": "123 Main Street"
  }'
```

## License

ISC

## Author

School Management System Backend
