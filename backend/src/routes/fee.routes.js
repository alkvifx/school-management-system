import express from "express";
import {
  createFeeStructure,
  updateFeeStructure,
  getFeeStructures,
  toggleFeeStructureStatus,
  initializeStudentFees,
  collectFee,
  getStudentFees,
  getClassFees,
  getFeeDefaulters,
  sendFeeReminder,
  getFeeStatistics,
  getMyFees,
} from "../controllers/fee.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";
import { validateSchoolAccess } from "../middlewares/school.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// ==================== PRINCIPAL ROUTES ====================
// Fee Structure Management (Principal only)
router.post(
  "/structure",
  allowRoles("PRINCIPAL"),
  validateSchoolAccess,
  createFeeStructure
);

router.put(
  "/structure/:id",
  allowRoles("PRINCIPAL"),
  validateSchoolAccess,
  updateFeeStructure
);

router.get(
  "/structure",
  allowRoles("PRINCIPAL", "TEACHER"),
  validateSchoolAccess,
  getFeeStructures
);

router.patch(
  "/structure/:id/status",
  allowRoles("PRINCIPAL"),
  validateSchoolAccess,
  toggleFeeStructureStatus
);

// Initialize student fees (Principal only)
router.post(
  "/initialize",
  allowRoles("PRINCIPAL"),
  validateSchoolAccess,
  initializeStudentFees
);

// Fee Collection (Principal only)
router.post(
  "/collect",
  allowRoles("PRINCIPAL"),
  validateSchoolAccess,
  collectFee
);

// Send Fee Reminder (Principal only)
router.post(
  "/send-reminder",
  allowRoles("PRINCIPAL"),
  validateSchoolAccess,
  sendFeeReminder
);

// ==================== PRINCIPAL & TEACHER ROUTES ====================
// Get fees by class
router.get(
  "/class/:classId",
  allowRoles("PRINCIPAL", "TEACHER"),
  validateSchoolAccess,
  getClassFees
);

// Get fee defaulters
router.get(
  "/defaulters",
  allowRoles("PRINCIPAL", "TEACHER"),
  validateSchoolAccess,
  getFeeDefaulters
);

// Get fee statistics
router.get(
  "/statistics",
  allowRoles("PRINCIPAL", "TEACHER"),
  validateSchoolAccess,
  getFeeStatistics
);

// ==================== PRINCIPAL, TEACHER & STUDENT ROUTES ====================
// Get student fees (students can only view their own)
router.get(
  "/student/:studentId",
  allowRoles("PRINCIPAL", "TEACHER", "STUDENT"),
  validateSchoolAccess,
  getStudentFees
);

// ==================== STUDENT ROUTES ====================
// Get own fees
router.get("/my-fees", allowRoles("STUDENT"), getMyFees);

export default router;
