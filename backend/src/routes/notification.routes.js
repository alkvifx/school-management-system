import express from "express";
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  subscribeToPush,
  unsubscribeFromPush,
  getVapidKey,
} from "../controllers/notification.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";
import { validateSchoolAccess } from "../middlewares/school.middleware.js";

const router = express.Router();

// All routes (except VAPID key) require authentication and school access
router.use(protect);
router.use(validateSchoolAccess);

// @route   GET /api/notifications
// @desc    Get user notifications
// @access  TEACHER | STUDENT
router.get("/", allowRoles("TEACHER", "STUDENT"), getUserNotifications);

// @route   GET /api/notifications/me
// @desc    Get current user's notifications (alias)
// @access  TEACHER | STUDENT
router.get("/me", allowRoles("TEACHER", "STUDENT"), getUserNotifications);

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  TEACHER | STUDENT
router.put(
  "/:id/read",
  allowRoles("TEACHER", "STUDENT"),
  markNotificationAsRead
);

// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  TEACHER | STUDENT
router.put(
  "/read-all",
  allowRoles("TEACHER", "STUDENT"),
  markAllNotificationsAsRead
);

// @route   GET /api/notifications/vapid-key
// @desc    Get VAPID public key for push notifications
// @access  Public (for PWA setup)
router.get("/vapid-key", getVapidKey);

// @route   POST /api/notifications/subscribe
// @desc    Subscribe to push notifications
// @access  All authenticated users
router.post("/subscribe", protect, subscribeToPush);

// @route   POST /api/notifications/unsubscribe
// @desc    Unsubscribe from push notifications
// @access  All authenticated users
router.post("/unsubscribe", protect, unsubscribeFromPush);

export default router;
