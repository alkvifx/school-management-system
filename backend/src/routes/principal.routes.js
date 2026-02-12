import express from "express";
import {
  createTeacher,
  createStudent,
  createClass,
  assignTeacher,
  assignStudent,
  getAllTeachers,
  getAllStudents,
  getAllClasses,
  updateSchool,
  updateTeacher,
  updateStudent,
  updateClass,
  deleteTeacher,
  deleteStudent,
  deleteClass,
} from "../controllers/principal.controller.js";
import {
  createPage,
  updatePage,
  deletePage,
  getPages,
  getPage,
  uploadMedia,
  getMedia,
  deleteMedia,
} from "../controllers/cms.controller.js";
import {
  getPublicContentForPrincipal,
  updatePublicContent,
} from "../controllers/publicContent.controller.js";
import {
  createNotification,
  getPrincipalNotifications,
  deleteNotification,
} from "../controllers/notification.controller.js";
import { getPulseToday } from "../controllers/dashboard.controller.js";
import {
  getMonitoringTeachers,
  getMonitoringClasses,
  getMonitoringSummary,
} from "../controllers/monitoring.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";
import { validateSchoolAccess } from "../middlewares/school.middleware.js";
import { uploadLogo, uploadPhoto, uploadMedia as uploadMediaMiddleware } from "../middlewares/upload.middleware.js";

const router = express.Router();

// All routes require PRINCIPAL role and school access
router.use(protect);
router.use(allowRoles("PRINCIPAL"));
router.use(validateSchoolAccess);

// @route   POST /api/principal/create-teacher
// @desc    Create a teacher
// @access  PRINCIPAL
router.post("/create-teacher", createTeacher);

// @route   POST /api/principal/create-student
// @desc    Create a student
// @access  PRINCIPAL
router.post("/create-student", createStudent);

// @route   POST /api/principal/create-class
// @desc    Create a class
// @access  PRINCIPAL
router.post("/create-class", createClass);

// @route   POST /api/principal/assign-teacher
// @desc    Assign teacher to class
// @access  PRINCIPAL
router.post("/assign-teacher", assignTeacher);

// @route   POST /api/principal/assign-student
// @desc    Assign student to class
// @access  PRINCIPAL
router.post("/assign-student", assignStudent);

router.get("/teachers", getAllTeachers);
router.get("/students", getAllStudents);
router.get("/classes", getAllClasses);

// ==================== UPDATE OPERATIONS ====================
// @route   PUT /api/principal/school
// @desc    Update school details
// @access  PRINCIPAL
router.put("/school", uploadLogo.single("logo"), updateSchool);

// @route   PUT /api/principal/teacher/:id
// @desc    Update teacher profile
// @access  PRINCIPAL
router.put("/teacher/:id", uploadPhoto.single("photo"), updateTeacher);

// @route   PUT /api/principal/student/:id
// @desc    Update student profile
// @access  PRINCIPAL
router.put("/student/:id", uploadPhoto.single("photo"), updateStudent);

// @route   PUT /api/principal/class/:id
// @desc    Update class details
// @access  PRINCIPAL
router.put("/class/:id", updateClass);

// ==================== DELETE OPERATIONS ====================
// @route   DELETE /api/principal/teacher/:id
// @desc    Delete teacher (soft delete)
// @access  PRINCIPAL
router.delete("/teacher/:id", deleteTeacher);

// @route   DELETE /api/principal/student/:id
// @desc    Delete student (soft delete)
// @access  PRINCIPAL
router.delete("/student/:id", deleteStudent);

// @route   DELETE /api/principal/class/:id
// @desc    Delete class (soft delete)
// @access  PRINCIPAL
router.delete("/class/:id", deleteClass);

// ==================== CMS OPERATIONS ====================
// @route   POST /api/principal/upload/logo
// @desc    Upload school logo
// @access  PRINCIPAL
router.post("/upload/logo", uploadLogo.single("logo"), (req, res) => {
  res.status(200).json({
    success: true,
    message: "Logo uploaded successfully",
    data: {
      url: req.file.path,
      publicId: req.file.filename,
    },
  });
});

// @route   POST /api/principal/pages
// @desc    Create a page
// @access  PRINCIPAL
router.post("/pages", createPage);

// @route   GET /api/principal/pages
// @desc    Get all pages
// @access  PRINCIPAL
router.get("/pages", getPages);

// @route   GET /api/principal/pages/:id
// @desc    Get single page
// @access  PRINCIPAL
router.get("/pages/:id", getPage);

// @route   PUT /api/principal/pages/:id
// @desc    Update a page
// @access  PRINCIPAL
router.put("/pages/:id", updatePage);

// @route   DELETE /api/principal/pages/:id
// @desc    Delete a page
// @access  PRINCIPAL
router.delete("/pages/:id", deletePage);

// @route   POST /api/principal/media
// @desc    Upload media
// @access  PRINCIPAL
router.post("/media", uploadMediaMiddleware.single("media"), uploadMedia);

// @route   GET /api/principal/media
// @desc    Get all media
// @access  PRINCIPAL
router.get("/media", getMedia);

// @route   DELETE /api/principal/media/:id
// @desc    Delete media
// @access  PRINCIPAL
router.delete("/media/:id", deleteMedia);

// ==================== PUBLIC WEBSITE CONTENT ====================
// @route   GET /api/principal/public-content
// @desc    Get structured public website content for this school
// @access  PRINCIPAL
router.get("/public-content", getPublicContentForPrincipal);

// @route   PUT /api/principal/public-content
// @desc    Update structured public website content sections
// @access  PRINCIPAL
router.put("/public-content", updatePublicContent);

// ==================== NOTIFICATION OPERATIONS ====================
// @route   POST /api/principal/notifications
// @desc    Create notification
// @access  PRINCIPAL
router.post("/notifications", createNotification);

// @route   GET /api/principal/notifications
// @desc    Get all notifications (Principal view)
// @access  PRINCIPAL
router.get("/notifications", getPrincipalNotifications);

// @route   DELETE /api/principal/notifications/:id
// @desc    Delete notification
// @access  PRINCIPAL
router.delete("/notifications/:id", deleteNotification);

// Student risk endpoint
import { getRisks } from "../controllers/risk.controller.js";
router.get("/risks", getRisks);

// Aaj School Ka Pulse – today's school health (Principal only)
router.get("/dashboard/pulse/today", getPulseToday);

// Silent Control – monitoring (Principal only, no notifications to teachers)
router.get("/monitoring/teachers", getMonitoringTeachers);
router.get("/monitoring/classes", getMonitoringClasses);
router.get("/monitoring/summary", getMonitoringSummary);

export default router;
