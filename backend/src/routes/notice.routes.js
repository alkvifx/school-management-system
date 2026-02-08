import express from "express";
import {
  createNotice,
  getMyNotices,
  markNoticeAsRead,
  markAllNoticesAsRead,
  deleteNotice,
} from "../controllers/notice.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";
import { validateSchoolAccess } from "../middlewares/school.middleware.js";

const router = express.Router();

// All routes require auth
router.use(protect);
router.use(validateSchoolAccess);

// GET /api/notices/me - Notices for current user (Principal: sent; Teacher/Student: received)
router.get("/me", allowRoles("PRINCIPAL", "TEACHER", "STUDENT"), getMyNotices);

// PATCH /api/notices/mark-all-read - Mark all as read (TEACHER | STUDENT)
router.patch(
  "/mark-all-read",
  allowRoles("TEACHER", "STUDENT"),
  markAllNoticesAsRead
);

// PATCH /api/notices/:id/read - Mark as read (recipients)
router.patch(
  "/:id/read",
  allowRoles("PRINCIPAL", "TEACHER", "STUDENT"),
  markNoticeAsRead
);

// POST /api/notices - Create notice (Principal only)
router.post("/", allowRoles("PRINCIPAL"), createNotice);

// DELETE /api/notices/:id - Delete notice (Principal only)
router.delete("/:id", allowRoles("PRINCIPAL"), deleteNotice);

export default router;
