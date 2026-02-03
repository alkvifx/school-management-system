import express from "express";
import {
  getProfile,
  getAttendance,
  getMarks,
} from "../controllers/student.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";
import { validateSchoolAccess } from "../middlewares/school.middleware.js";

const router = express.Router();

// All routes require STUDENT role and school access
router.use(protect);
router.use(allowRoles("STUDENT"));
router.use(validateSchoolAccess);

// @route   GET /api/student/profile
// @desc    Get student profile
// @access  STUDENT
router.get("/profile", getProfile);

// @route   GET /api/student/attendance
// @desc    Get student attendance
// @access  STUDENT
router.get("/attendance", getAttendance);

// @route   GET /api/student/marks
// @desc    Get student marks
// @access  STUDENT
router.get("/marks", getMarks);

export default router;
