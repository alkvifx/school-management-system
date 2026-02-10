import Notification from "../models/notification.model.js";
import StudentFee from "../models/studentFee.model.js";
import Student from "../models/student.model.js";
import User from "../models/user.model.js";
import Class from "../models/class.model.js";
import PushSubscription from "../models/pushSubscription.model.js";
import webpush from "web-push";

// Initialize web-push (will be configured with VAPID keys)
let webPushInitialized = false;

export const initializeWebPush = () => {
  if (
    !process.env.VAPID_PUBLIC_KEY ||
    !process.env.VAPID_PRIVATE_KEY ||
    !process.env.VAPID_EMAIL
  ) {
    console.warn(
      "⚠️  Web Push not configured. VAPID keys missing in environment variables."
    );
    return false;
  }

  webpush.setVapidDetails(
    process.env.VAPID_EMAIL,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );

  webPushInitialized = true;
  console.log("✅ Web Push initialized successfully");
  return true;
};

/**
 * Store or update push subscription for a device.
 * Upserts by endpoint so the same browser endpoint can be reassigned
 * to a different user (login on another account) without duplicates.
 */
export const savePushSubscription = async (
  userId,
  role,
  subscription,
  deviceInfo = null
) => {
  if (!subscription?.endpoint || !subscription?.keys) return;

  await PushSubscription.findOneAndUpdate(
    { endpoint: subscription.endpoint },
    {
      userId,
      role,
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
      deviceInfo: deviceInfo || {},
      isActive: true,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

/**
 * Mark a push subscription inactive by endpoint.
 * We keep the record for diagnostics but stop sending.
 */
export const removePushSubscriptionByEndpoint = async (endpoint) => {
  if (!endpoint) return;
  await PushSubscription.findOneAndUpdate(
    { endpoint },
    { isActive: false }
  ).catch(() => {});
};

/**
 * Get all active push subscriptions for a user
 */
export const getUserPushSubscriptions = async (userId) => {
  return PushSubscription.find({ userId, isActive: true }).lean();
};

/**
 * Send a push notification to all active subscriptions for a user.
 * Automatically cleans up subscriptions that are no longer valid.
 */
export const sendPushToUser = async (userId, payload) => {
  if (!webPushInitialized) return;
  const subscriptions = await getUserPushSubscriptions(userId);
  if (!subscriptions.length) return;

  const body = JSON.stringify(payload);

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: sub.keys,
          },
          body
        );
      } catch (err) {
        console.error("Push send failed for user", userId, err);
        if (err.statusCode === 410 || err.statusCode === 404) {
          await removePushSubscriptionByEndpoint(sub.endpoint);
        }
      }
    })
  );
};

/**
 * Create a notification
 */
export const createNotification = async (data) => {
  const notification = await Notification.create(data);
  return notification;
};

/**
 * Create attendance notifications for each student in the attendance record.
 * Called after teacher marks attendance. One notification per student (present/absent).
 * Sends in-app notification + push (if PWA subscription exists).
 * @param {object} attendance - Saved Attendance doc with records: [{ studentId, status }], schoolId, date
 * @param {string} createdByUserId - Teacher's User _id (for createdBy)
 */
export const createAttendanceNotifications = async (attendance, createdByUserId, io = null) => {
  if (!attendance || !attendance.records || !attendance.records.length) {
    return [];
  }

  const notifications = [];

  for (const record of attendance.records) {
    try {
      const student = await Student.findById(record.studentId).select("userId").lean();
      if (!student || !student.userId) continue;

      const userId = student.userId;
      const isPresent = record.status === "present";
      const title = isPresent ? "Attendance marked" : "Attendance marked";
      const message = isPresent
        ? "You have been marked PRESENT today ✅"
        : "You have been marked ABSENT today ❌";

      const notification = await Notification.create({
        title,
        message,
        schoolId: attendance.schoolId,
        userId,
        type: "ATTENDANCE",
        createdBy: createdByUserId,
        isRead: false,
        readBy: [],
        metadata: {
          relatedAttendanceId: attendance._id,
          date: attendance.date,
          status: record.status,
        },
      });

      notifications.push(notification);

      // Real-time: emit to user's socket room
      if (io) {
        io.to(`user-${userId}`).emit("notification", { notification });
      }

      // Push notification if subscriptions exist (PWA)
      await sendPushToUser(userId.toString(), {
        title: isPresent ? "Present today ✅" : "Absent today ❌",
        body: message,
        icon: "/icons/icon-192.png",
        badge: "/icons/icon-192.png",
        data: {
          url: "/student/attendance",
          notificationId: notification._id,
        },
      });
    } catch (err) {
      console.error("Failed to create attendance notification for record", record, err);
    }
  }

  return notifications;
};

/**
 * Create fee reminder notification for a student
 */
export const createFeeReminderNotification = async (studentFee, createdBy, io = null) => {
  const student = await Student.findById(studentFee.studentId).populate("userId");
  if (!student || !student.userId) {
    throw new Error("Student not found");
  }

  const dueDate = new Date(studentFee.dueDate).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const title = "⚠️ Fee Due Reminder";
  const message = `Your school fee of ₹${studentFee.pendingAmount.toFixed(2)} is pending. Please pay before ${dueDate}.`;

  const notification = await Notification.create({
    title,
    message,
    schoolId: studentFee.schoolId,
    userId: student.userId._id,
    type: "FEE_REMINDER",
    createdBy,
    metadata: {
      studentFeeId: studentFee._id,
      pendingAmount: studentFee.pendingAmount,
      dueDate: studentFee.dueDate,
      status: studentFee.status,
    },
    isRead: false,
  });

  // Real-time: emit to user's socket room
  if (io) {
    io.to(`user-${student.userId._id}`).emit("notification", { notification });
  }

  // Send push notification if subscriptions exist
  await sendPushToUser(student.userId._id.toString(), {
    title,
    body: message,
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    data: {
      url: "/fees",
      notificationId: notification._id,
    },
  });

  return notification;
};

/**
 * Send fee reminders to multiple students
 */
export const sendFeeReminders = async (options) => {
  const { schoolId, classId, studentId, onlyDefaulters, createdBy, io = null } = options;

  let studentFees = [];

  if (studentId) {
    // Send to specific student
    const fees = await StudentFee.find({
      schoolId,
      studentId,
      status: { $in: onlyDefaulters ? ["UNPAID", "PARTIAL", "OVERDUE"] : ["PAID", "PARTIAL", "UNPAID", "OVERDUE"] },
    });
    studentFees = fees;
  } else if (classId) {
    // Send to all students in class
    const fees = await StudentFee.find({
      schoolId,
      classId,
      status: onlyDefaulters
        ? { $in: ["UNPAID", "PARTIAL", "OVERDUE"] }
        : { $in: ["PAID", "PARTIAL", "UNPAID", "OVERDUE"] },
    });
    studentFees = fees;
  } else {
    // Send to all students in school
    const fees = await StudentFee.find({
      schoolId,
      status: onlyDefaulters
        ? { $in: ["UNPAID", "PARTIAL", "OVERDUE"] }
        : { $in: ["PAID", "PARTIAL", "UNPAID", "OVERDUE"] },
    });
    studentFees = fees;
  }

  // Filter to only unpaid/partial/overdue if onlyDefaulters is true
  if (onlyDefaulters) {
    studentFees = studentFees.filter(
      (fee) => fee.status === "UNPAID" || fee.status === "PARTIAL" || fee.status === "OVERDUE"
    );
  }

  const notifications = [];
  const errors = [];

  for (const studentFee of studentFees) {
    try {
      const notification = await createFeeReminderNotification(studentFee, createdBy, io);
      notifications.push(notification);
    } catch (error) {
      errors.push({
        studentFeeId: studentFee._id,
        error: error.message,
      });
    }
  }

  return {
    success: notifications.length,
    failed: errors.length,
    notifications,
    errors,
  };
};

/**
 * Get notifications for a user
 */
export const getUserNotifications = async (userId, schoolId, filters = {}) => {
  const query = {
    $or: [{ userId }, { schoolId, targetRole: "ALL" }, { schoolId, userId: null }],
  };

  if (filters.type) {
    query.type = filters.type;
  }

  if (filters.isRead !== undefined) {
    query.isRead = filters.isRead;
  }

  const notifications = await Notification.find(query)
    .populate("createdBy", "name")
    .sort({ createdAt: -1 })
    .limit(filters.limit || 50);

  return notifications;
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (notificationId, userId) => {
  const notification = await Notification.findById(notificationId);

  if (!notification) {
    throw new Error("Notification not found");
  }

  // If it's a user-specific notification, check ownership
  if (notification.userId && notification.userId.toString() !== userId.toString()) {
    throw new Error("Not authorized to mark this notification as read");
  }

  notification.isRead = true;
  if (!notification.readBy.includes(userId)) {
    notification.readBy.push(userId);
  }

  await notification.save();
  return notification;
};

/**
 * Mark all notifications as read for a user
 */
export const markAllNotificationsAsRead = async (userId, schoolId) => {
  const result = await Notification.updateMany(
    {
      $or: [{ userId }, { schoolId, targetRole: "ALL" }, { schoolId, userId: null }],
      isRead: false,
    },
    {
      $set: { isRead: true },
      $addToSet: { readBy: userId },
    }
  );

  return result.modifiedCount;
};

/**
 * Delete notification
 */
export const deleteNotification = async (notificationId, userId, role) => {
  const notification = await Notification.findById(notificationId);

  if (!notification) {
    throw new Error("Notification not found");
  }

  // Only creator or PRINCIPAL can delete
  if (
    notification.createdBy.toString() !== userId.toString() &&
    role !== "PRINCIPAL"
  ) {
    throw new Error("Not authorized to delete this notification");
  }

  await Notification.findByIdAndDelete(notificationId);
  return true;
};
