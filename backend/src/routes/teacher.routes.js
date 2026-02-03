import express from "express";
import {
  getDashboard,
  createStudent,
  getClasses,
  getStudents,
  markAttendance,
  uploadMarks,
  updateStudent,
  removeStudentFromClass,
} from "../controllers/teacher.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";
import { validateSchoolAccess } from "../middlewares/school.middleware.js";
import { uploadPhoto } from "../middlewares/upload.middleware.js";

const router = express.Router();

// All routes require TEACHER role and school access
router.use(protect);
router.use(allowRoles("TEACHER"));
router.use(validateSchoolAccess);

// @route   GET /api/teacher/dashboard
// @desc    Get teacher dashboard stats (totalStudents, totalClasses, attendanceToday, pendingTasks, recentStudents)
// @access  TEACHER
router.get("/dashboard", getDashboard);

router.post("/create-student", createStudent);
// Alias for consistency with REST: POST /api/teacher/students
router.post("/students", createStudent);

// @route   GET /api/teacher/classes
// @desc    Get teacher's assigned classes
// @access  TEACHER
router.get("/classes", getClasses);

// @route   GET /api/teacher/students
// @desc    Get students in teacher's assigned classes
// @access  TEACHER
router.get("/students", getStudents);

// @route   POST /api/teacher/attendance
// @desc    Mark attendance
// @access  TEACHER
router.post("/attendance", markAttendance);

// @route   POST /api/teacher/marks
// @desc    Upload marks
// @access  TEACHER
router.post("/marks", uploadMarks);

// ==================== UPDATE & DELETE OPERATIONS ====================
// @route   PUT /api/teacher/student/:id
// @desc    Update student basic info (name, parentPhone)
// @access  TEACHER
router.put("/student/:id", uploadPhoto.single("photo"), updateStudent);

// @route   DELETE /api/teacher/student/:id
// @desc    Remove student from teacher's assigned class
// @access  TEACHER
router.delete("/student/:id", removeStudentFromClass);

export default router;
