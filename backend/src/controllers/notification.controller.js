import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import Student from "../models/student.model.js";
import Teacher from "../models/teacher.model.js";
import Class from "../models/class.model.js";
import { asyncHandler } from "../middlewares/error.middleware.js";
import mongoose from "mongoose";
import * as notificationService from "../services/notification.service.js";

// ==================== PRINCIPAL OPERATIONS ====================

// @desc    Create notification
// @route   POST /api/principal/notifications
// @access  PRINCIPAL
export const createNotification = asyncHandler(async (req, res) => {
  const { title, message, targetRole, targetClass } = req.body;
  const principal = req.user;

  if (!title || !message || !targetRole) {
    return res.status(400).json({
      success: false,
      message: "Title, message, and target role are required",
    });
  }

  if (!["TEACHER", "STUDENT", "ALL"].includes(targetRole)) {
    return res.status(400).json({
      success: false,
      message: "Target role must be TEACHER, STUDENT, or ALL",
    });
  }

  if (!principal.schoolId) {
    return res.status(403).json({
      success: false,
      message: "Principal not assigned to any school",
    });
  }

  // Validate targetClass if provided
  if (targetClass) {
    if (!mongoose.Types.ObjectId.isValid(targetClass)) {
      return res.status(400).json({
        success: false,
        message: "Invalid class ID",
      });
    }

    const classDoc = await Class.findById(targetClass);
    if (!classDoc) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    if (classDoc.schoolId.toString() !== principal.schoolId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Class does not belong to your school",
      });
    }
  }

  const notification = await Notification.create({
    title: title.trim(),
    message: message.trim(),
    schoolId: principal.schoolId,
    userId: null, // Broadcast notification
    type: "GENERAL",
    targetRole,
    targetClass: targetClass || null,
    createdBy: principal._id,
    isRead: false,
    readBy: [],
  });

  // Real-time: emit to school room so connected users get instant update
  const io = req.app.get("io");
  if (io) {
    io.to(`school-${principal.schoolId}`).emit("notification", {
      notification: notification.toObject ? notification.toObject() : notification,
    });
  }

  res.status(201).json({
    success: true,
    message: "Notification created successfully",
    data: notification,
  });
});

// @desc    Get all notifications (Principal view)
// @route   GET /api/principal/notifications
// @access  PRINCIPAL
export const getPrincipalNotifications = asyncHandler(async (req, res) => {
  const { targetRole, targetClass, page = 1, limit = 20 } = req.query;
  const principal = req.user;

  if (!principal.schoolId) {
    return res.status(403).json({
      success: false,
      message: "Principal not assigned to any school",
    });
  }

  let query = { schoolId: principal.schoolId };

  if (targetRole && ["TEACHER", "STUDENT", "ALL"].includes(targetRole)) {
    query.targetRole = targetRole;
  }

  if (targetClass) {
    if (mongoose.Types.ObjectId.isValid(targetClass)) {
      query.targetClass = targetClass;
    }
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const notifications = await Notification.find(query)
    .populate("createdBy", "name")
    .populate("targetClass", "name section")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Notification.countDocuments(query);

  res.status(200).json({
    success: true,
    message: "Notifications retrieved successfully",
    data: {
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    },
  });
});

// @desc    Delete notification
// @route   DELETE /api/principal/notifications/:id
// @access  PRINCIPAL
export const deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const principal = req.user;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid notification ID",
    });
  }

  if (!principal.schoolId) {
    return res.status(403).json({
      success: false,
      message: "Principal not assigned to any school",
    });
  }

  const notification = await Notification.findById(id);
  if (!notification) {
    return res.status(404).json({
      success: false,
      message: "Notification not found",
    });
  }

  if (notification.schoolId.toString() !== principal.schoolId.toString()) {
    return res.status(403).json({
      success: false,
      message: "Notification does not belong to your school",
    });
  }

  await Notification.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: "Notification deleted successfully",
  });
});

// ==================== USER OPERATIONS (TEACHER & STUDENT) ====================

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  TEACHER | STUDENT
export const getUserNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, unreadOnly } = req.query;
  const user = req.user;

  if (!user.schoolId) {
    return res.status(403).json({
      success: false,
      message: "User not assigned to any school",
    });
  }

  // Build query - check for user-specific notifications or broadcast notifications
  let query = {
    schoolId: user.schoolId,
    $or: [
      { userId: user._id }, // User-specific notifications
      { userId: null, targetRole: "ALL" }, // Broadcast to all
      { userId: null, targetRole: user.role }, // Broadcast to user's role
    ],
  };

  // If user is a student, also check for class-specific notifications
  if (user.role === "STUDENT") {
    const student = await Student.findOne({ userId: user._id });
    if (student && student.classId) {
      query.$or.push({ userId: null, targetClass: student.classId });
      query.$or.push({ userId: null, targetClass: null }); // Notifications for all classes
    }
  }

  // Filter unread only if requested
  if (unreadOnly === "true") {
    query.$or = query.$or.map((condition) => ({
      ...condition,
      $or: [
        { isRead: false },
        { readBy: { $ne: user._id } },
      ],
    }));
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const notifications = await Notification.find(query)
    .populate("createdBy", "name")
    .populate("targetClass", "name section")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Notification.countDocuments(query);

  // Mark which notifications are read/unread
  const formattedNotifications = notifications.map((notif) => ({
    ...notif.toObject(),
    isReadByUser: notif.isRead || notif.readBy.includes(user._id),
  }));

  res.status(200).json({
    success: true,
    message: "Notifications retrieved successfully",
    data: {
      notifications: formattedNotifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    },
  });
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  TEACHER | STUDENT
export const markNotificationAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid notification ID",
    });
  }

  if (!user.schoolId) {
    return res.status(403).json({
      success: false,
      message: "User not assigned to any school",
    });
  }

  const notification = await Notification.findById(id);
  if (!notification) {
    return res.status(404).json({
      success: false,
      message: "Notification not found",
    });
  }

  // Verify notification is for this user's school
  if (notification.schoolId.toString() !== user.schoolId.toString()) {
    return res.status(403).json({
      success: false,
      message: "Notification does not belong to your school",
    });
  }

  // Check if user should receive this notification (user-specific or broadcast)
  const shouldReceive =
    (notification.userId && notification.userId.toString() === user._id.toString()) ||
    notification.targetRole === "ALL" ||
    notification.targetRole === user.role ||
    (user.role === "STUDENT" && notification.targetClass) ||
    (user.role === "TEACHER" && notification.targetRole === "TEACHER");

  if (!shouldReceive) {
    return res.status(403).json({
      success: false,
      message: "You are not authorized to access this notification",
    });
  }

  // Mark notification as read
  if (!notification.readBy.includes(user._id)) {
    notification.readBy.push(user._id);
    // If all target users have read, mark as read
    notification.isRead = true;
    await notification.save();
  }

  res.status(200).json({
    success: true,
    message: "Notification marked as read",
    data: notification,
  });
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  TEACHER | STUDENT
export const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user.schoolId) {
    return res.status(403).json({
      success: false,
      message: "User not assigned to any school",
    });
  }

  // Build query for user's notifications
  let query = {
    schoolId: user.schoolId,
    $or: [
      { userId: user._id }, // User-specific notifications
      { userId: null, targetRole: "ALL" }, // Broadcast to all
      { userId: null, targetRole: user.role }, // Broadcast to user's role
    ],
    readBy: { $ne: user._id },
  };

  // If user is a student, also check for class-specific notifications
  if (user.role === "STUDENT") {
    const student = await Student.findOne({ userId: user._id });
    if (student && student.classId) {
      query.$or.push({ userId: null, targetClass: student.classId });
      query.$or.push({ userId: null, targetClass: null });
    }
  }

  // Update all unread notifications
  const result = await Notification.updateMany(query, {
    $addToSet: { readBy: user._id },
    $set: { isRead: true },
  });

  res.status(200).json({
    success: true,
    message: `${result.modifiedCount} notification(s) marked as read`,
    data: {
      markedCount: result.modifiedCount,
    },
  });
});

// ==================== PUSH NOTIFICATION OPERATIONS ====================

// @desc    Subscribe to push notifications
// @route   POST /api/notifications/subscribe
// @access  All authenticated users
export const subscribeToPush = asyncHandler(async (req, res) => {
  const { subscription, deviceInfo } = req.body;
  const user = req.user;

  if (!subscription || !subscription.endpoint || !subscription.keys) {
    return res.status(400).json({
      success: false,
      message: "Invalid subscription object",
    });
  }

  await notificationService.savePushSubscription(
    user._id.toString(),
    user.role,
    subscription,
    deviceInfo || null
  );

  res.status(200).json({
    success: true,
    message: "Push notification subscription saved successfully",
  });
});

// @desc    Unsubscribe from push notifications
// @route   POST /api/notifications/unsubscribe
// @access  All authenticated users
export const unsubscribeFromPush = asyncHandler(async (req, res) => {
  const { endpoint } = req.body;

  if (!endpoint) {
    return res.status(400).json({
      success: false,
      message: "Endpoint is required to unsubscribe",
    });
  }

  await notificationService.removePushSubscriptionByEndpoint(endpoint);

  res.status(200).json({
    success: true,
    message: "Unsubscribed from push notifications for this device",
  });
});

// @desc    Get VAPID public key for push notifications
// @route   GET /api/notifications/vapid-key
// @access  Public (for PWA setup)
export const getVapidKey = asyncHandler(async (req, res) => {
  const publicKey = process.env.VAPID_PUBLIC_KEY;

  if (!publicKey) {
    return res.status(503).json({
      success: false,
      message: "Push notifications are not configured",
    });
  }

  res.status(200).json({
    success: true,
    data: {
      publicKey,
    },
  });
});
