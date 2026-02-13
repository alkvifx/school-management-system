import Notice from "../models/notice.model.js";
import Class from "../models/class.model.js";
import Student from "../models/student.model.js";
import Teacher from "../models/teacher.model.js";
import { asyncHandler } from "../middlewares/error.middleware.js";
import mongoose from "mongoose";
import * as notificationService from "../services/notification.service.js";
import {
  fetchNoticesForUser,
  markAllNoticesReadForUser,
  buildNoticeQueryForUser,
} from "../services/notice.service.js";

/**
 * Build list of recipient user IDs for a notice (for Socket.IO / push).
 * Used after creating a notice to emit to the right rooms/users.
 */
export const getNoticeRecipientUserIds = async (notice) => {
  const schoolId = notice.schoolId;
  const userIds = new Set();

  if (notice.studentId) {
    userIds.add(notice.studentId.toString());
    return Array.from(userIds);
  }
  if (notice.teacherId) {
    userIds.add(notice.teacherId.toString());
    return Array.from(userIds);
  }
  if (notice.classId) {
    const students = await Student.find({
      schoolId,
      classId: notice.classId,
      isActive: true,
    })
      .select("userId")
      .lean();
    students.forEach((s) => s.userId && userIds.add(s.userId.toString()));
    return Array.from(userIds);
  }
  if (notice.targetRole === "TEACHER") {
    const teachers = await Teacher.find({
      schoolId,
      isActive: true,
    })
      .select("userId")
      .lean();
    teachers.forEach((t) => t.userId && userIds.add(t.userId.toString()));
    return Array.from(userIds);
  }
  if (notice.targetRole === "STUDENT") {
    const students = await Student.find({
      schoolId,
      isActive: true,
    })
      .select("userId")
      .lean();
    students.forEach((s) => s.userId && userIds.add(s.userId.toString()));
    return Array.from(userIds);
  }
  if (notice.targetRole === "ALL") {
    const [teachers, students] = await Promise.all([
      Teacher.find({ schoolId, isActive: true }).select("userId").lean(),
      Student.find({ schoolId, isActive: true }).select("userId").lean(),
    ]);
    teachers.forEach((t) => t.userId && userIds.add(t.userId.toString()));
    students.forEach((s) => s.userId && userIds.add(s.userId.toString()));
    return Array.from(userIds);
  }
  return [];
};

/**
 * @desc    Create notice (Principal only)
 * @route   POST /api/notices
 * @access  PRINCIPAL
 */
export const createNotice = asyncHandler(async (req, res) => {
  const principal = req.user;
  const {
    title,
    message,
    targetRole,
    classId,
    studentId,
    teacherId,
    isImportant,
    attachments,
    expiresAt,
  } = req.body;

  if (!title || !message || !targetRole) {
    return res.status(400).json({
      success: false,
      message: "Title, message, and target role are required",
    });
  }

  if (!["TEACHER", "STUDENT", "ALL"].includes(targetRole)) {
    return res.status(400).json({
      success: false,
      message: "targetRole must be TEACHER, STUDENT, or ALL",
    });
  }

  if (!principal.schoolId) {
    return res.status(403).json({
      success: false,
      message: "Principal not assigned to any school",
    });
  }

  // Validate classId if provided
  if (classId) {
    if (!mongoose.Types.ObjectId.isValid(classId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid class ID",
      });
    }
    const classDoc = await Class.findOne({
      _id: classId,
      schoolId: principal.schoolId,
      isActive: true,
    });
    if (!classDoc) {
      return res.status(404).json({
        success: false,
        message: "Class not found or does not belong to your school",
      });
    }
  }

  // Validate studentId (User id) if provided
  if (studentId) {
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID",
      });
    }
    const student = await Student.findOne({
      userId: studentId,
      schoolId: principal.schoolId,
      isActive: true,
    });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found or does not belong to your school",
      });
    }
  }

  // Validate teacherId (User id) if provided
  if (teacherId) {
    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid teacher ID",
      });
    }
    const teacher = await Teacher.findOne({
      userId: teacherId,
      schoolId: principal.schoolId,
      isActive: true,
    });
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found or does not belong to your school",
      });
    }
  }

  const notice = await Notice.create({
    title: title.trim(),
    message: message.trim(),
    schoolId: principal.schoolId,
    targetRole,
    classId: classId || null,
    studentId: studentId || null,
    teacherId: teacherId || null,
    createdBy: principal._id,
    isImportant: !!isImportant,
    isActive: true, // New notices are active by default
    priority: isImportant ? "URGENT" : "INFO", // Map isImportant to priority
    attachments: Array.isArray(attachments) ? attachments : [],
    expiresAt: expiresAt ? new Date(expiresAt) : null,
    readBy: [],
  });

  const populated = await Notice.findById(notice._id)
    .populate("createdBy", "name")
    .populate("classId", "name section")
    .lean();

  // Attach recipient user IDs for Socket.IO (controller will use req.app.get('io'))
  const recipientUserIds = await getNoticeRecipientUserIds(notice);
  const noticePayload = {
    ...populated,
    _id: populated._id.toString(),
    recipientUserIds,
    classId: notice.classId?.toString() || null,
    targetRole: notice.targetRole,
  };

  const io = req.app.get("io");
  if (io) {
    // Emit to each recipient's personal room (user-{userId})
    recipientUserIds.forEach((uid) => {
      io.to(`user-${uid}`).emit("notice:new", { notice: noticePayload });
    });
    // If class-specific, also emit to class room so anyone in chat sees it
    if (notice.classId) {
      io.to(`class-${notice.classId}`).emit("notice:new", { notice: noticePayload });
    }
  }

  // PWA push notification (bonus): send to each recipient
  if (recipientUserIds.length > 0) {
    const pushPayload = {
      title: notice.title,
      body: notice.message?.slice(0, 100) || "New notice",
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      data: { url: "/notices", noticeId: notice._id.toString() },
    };
    recipientUserIds.forEach((uid) => {
      notificationService.sendPushToUser(uid, pushPayload).catch(() => {});
    });
  }

  res.status(201).json({
    success: true,
    message: "Notice created successfully",
    data: populated,
  });
});

/**
 * @desc    Get latest notices for dashboard banner (Teacher/Student only)
 * @route   GET /api/notices/dashboard
 * @access  TEACHER | STUDENT
 */
export const getDashboardNotices = asyncHandler(async (req, res) => {
  const user = req.user;
  const { limit = 3 } = req.query;

  if (user.role !== "TEACHER" && user.role !== "STUDENT") {
    return res.status(403).json({
      success: false,
      message: "This endpoint is only for teachers and students",
    });
  }

  if (!user.schoolId) {
    return res.status(403).json({
      success: false,
      message: "User not assigned to any school",
    });
  }

  const limitNum = Math.min(5, Math.max(1, parseInt(limit, 10) || 3));
  const now = new Date();

  // Build query based on role
  let query = {
    schoolId: user.schoolId,
    isActive: true,
    $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
  };

  if (user.role === "TEACHER") {
    query.$and = [
      {
        $or: [
          { targetRole: "ALL" },
          { targetRole: "TEACHER", teacherId: null },
          { teacherId: user._id },
        ],
      },
    ];
  } else if (user.role === "STUDENT") {
    const student = await Student.findOne({
      userId: user._id,
      schoolId: user.schoolId,
      isActive: true,
    })
      .select("classId")
      .lean();

    const classId = student?.classId || null;
    const orConditions = [
      { targetRole: "ALL", classId: null },
      { targetRole: "STUDENT", studentId: null, classId: null },
      { studentId: user._id },
    ];

    if (classId) {
      orConditions.push({ classId, targetRole: { $in: ["STUDENT", "ALL"] } });
    }

    query.$and = [{ $or: orConditions }];
  }

  const notices = await Notice.find(query)
    .select("_id title message priority isImportant targetRole classId createdAt expiresAt")
    .populate("classId", "name section")
    .sort({ createdAt: -1 }) // Newest first
    .limit(limitNum * 2) // Get more to sort by priority
    .lean();

  // Sort by priority: URGENT first, then INFO, then by createdAt
  notices.sort((a, b) => {
    const priorityA = a.priority || (a.isImportant ? "URGENT" : "INFO");
    const priorityB = b.priority || (b.isImportant ? "URGENT" : "INFO");
    
    if (priorityA === "URGENT" && priorityB !== "URGENT") return -1;
    if (priorityA !== "URGENT" && priorityB === "URGENT") return 1;
    
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  // Limit to requested number after sorting
  const limitedNotices = notices.slice(0, limitNum);

  // Map isImportant to priority for backward compatibility
  const formatted = limitedNotices.map((notice) => ({
    _id: notice._id,
    title: notice.title,
    message: notice.message,
    priority: notice.priority || (notice.isImportant ? "URGENT" : "INFO"),
    targetRole: notice.targetRole,
    classId: notice.classId,
    className: notice.classId
      ? `${notice.classId.name || ""} ${notice.classId.section || ""}`.trim()
      : null,
    createdAt: notice.createdAt,
    expiresAt: notice.expiresAt,
  }));

  res.status(200).json({
    success: true,
    data: formatted,
  });
});

/**
 * @desc    Get notices for current user (Principal: all sent; Teacher/Student: received)
 * @route   GET /api/notices/me
 * @access  PRINCIPAL | TEACHER | STUDENT
 */
export const getMyNotices = asyncHandler(async (req, res) => {
  const user = req.user;
  const { page = 1, limit: limitQuery, unreadOnly } = req.query;
  const unreadOnlyFilter = unreadOnly === "true" || unreadOnly === true;

  if (process.env.NODE_ENV !== "production") {
    try {
      const debugQuery = await buildNoticeQueryForUser(user, { unreadOnly: unreadOnlyFilter });
      const studentRecord = user.role === "STUDENT"
        ? await Student.findOne({ userId: user._id, schoolId: user.schoolId, isActive: true })
            .select("classId")
            .lean()
        : null;
      console.log("[notices/me] user:", {
        role: user.role,
        userId: user._id?.toString(),
        schoolId: user.schoolId?.toString(),
        classId: studentRecord?.classId?.toString() || null,
        unreadOnly: unreadOnlyFilter,
        query: debugQuery,
      });
    } catch (e) {
      console.log("[notices/me] debug failed:", e?.message || e);
    }
  }

  const { notices, pagination } = await fetchNoticesForUser(user, {
    page,
    limit: limitQuery,
    unreadOnly: unreadOnlyFilter,
  });

  res.status(200).json({
    success: true,
    data: {
      notices,
      pagination,
    },
  });
});

/**
 * @desc    Mark notice as read
 * @route   PATCH /api/notices/:id/read
 * @access  TEACHER | STUDENT (and Principal if they are recipient - not typical)
 */
export const markNoticeAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid notice ID",
    });
  }

  const notice = await Notice.findById(id);
  if (!notice) {
    return res.status(404).json({
      success: false,
      message: "Notice not found",
    });
  }

  if (notice.schoolId.toString() !== user.schoolId.toString()) {
    return res.status(403).json({
      success: false,
      message: "Notice does not belong to your school",
    });
  }

  // Prevent duplicate readBy
  const userIdStr = user._id.toString();
  if (!notice.readBy.some((id) => id.toString() === userIdStr)) {
    notice.readBy.push(user._id);
    await notice.save();
  }

  res.status(200).json({
    success: true,
    message: "Notice marked as read",
    data: notice,
  });
});

/**
 * @desc    Mark all notices as read for current user
 * @route   PATCH /api/notices/mark-all-read
 * @access  TEACHER | STUDENT
 */
export const markAllNoticesAsRead = asyncHandler(async (req, res) => {
  const user = req.user;
  const role = (user.role || "").toUpperCase();

  if (!user.schoolId) {
    return res.status(403).json({
      success: false,
      message: "User not assigned to any school",
    });
  }

  if (role === "PRINCIPAL") {
    return res.status(400).json({
      success: false,
      message: "Principals do not receive notices; no need to mark all as read",
    });
  }
  const result = await markAllNoticesReadForUser(user);

  res.status(200).json({
    success: true,
    message: "All notices marked as read",
    data: result,
  });
});

/**
 * @desc    Delete notice (Principal only)
 * @route   DELETE /api/notices/:id
 * @access  PRINCIPAL
 */
export const deleteNotice = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const principal = req.user;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid notice ID",
    });
  }

  const notice = await Notice.findById(id);
  if (!notice) {
    return res.status(404).json({
      success: false,
      message: "Notice not found",
    });
  }

  if (notice.schoolId.toString() !== principal.schoolId.toString() || notice.createdBy.toString() !== principal._id.toString()) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to delete this notice",
    });
  }

  await Notice.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: "Notice deleted successfully",
  });
});
