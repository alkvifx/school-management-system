import Student from "../models/student.model.js";
import Attendance from "../models/attendance.model.js";
import Marks from "../models/marks.model.js";
import StudentStars from "../models/studentStars.model.js";
import LeaderboardSnapshot from "../models/leaderboardSnapshot.model.js";
import Teacher from "../models/teacher.model.js";
import { asyncHandler } from "../middlewares/error.middleware.js";
import { getCurrentPeriodKeys } from "../services/stars.service.js";

// @desc    Get student profile
// @route   GET /api/student/profile
// @access  STUDENT
export const getProfile = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ userId: req.user._id })
    .populate("userId", "name email")
    .populate("classId", "name section")
    .populate("schoolId", "name address");

  if (!student) {
    return res.status(404).json({
      success: false,
      message: "Student profile not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Profile retrieved successfully",
    data: {
      id: student._id,
      user: {
        id: student.userId._id,
        name: student.userId.name,
        email: student.userId.email,
      },
      rollNumber: student.rollNumber,
      class: {
        id: student.classId._id,
        name: student.classId.name,
        section: student.classId.section,
      },
      school: {
        id: student.schoolId._id,
        name: student.schoolId.name,
        address: student.schoolId.address,
      },
      parentPhone: student.parentPhone,
    },
  });
});

// @desc    Get student attendance
// @route   GET /api/student/attendance
// @access  STUDENT
export const getAttendance = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const student = await Student.findOne({ userId: req.user._id });

  if (!student) {
    return res.status(404).json({
      success: false,
      message: "Student profile not found",
    });
  }

  // Build query
  let query = {
    classId: student.classId,
    "records.studentId": student._id,
  };

  // Add date range if provided
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = startDate;
    if (endDate) query.date.$lte = endDate;
  }

  const attendanceRecords = await Attendance.find(query)
    .select("date records")
    .sort({ date: -1 });

  // Filter and format attendance for this student
  const formattedAttendance = attendanceRecords.map((record) => {
    const studentRecord = record.records.find(
      (r) => r.studentId.toString() === student._id.toString()
    );
    return {
      date: record.date,
      status: studentRecord ? studentRecord.status : "absent",
    };
  });

  // Calculate statistics
  const totalDays = formattedAttendance.length;
  const presentDays = formattedAttendance.filter((a) => a.status === "present").length;
  const absentDays = totalDays - presentDays;
  const attendancePercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(2) : 0;

  res.status(200).json({
    success: true,
    message: "Attendance retrieved successfully",
    data: {
      records: formattedAttendance,
      statistics: {
        totalDays,
        presentDays,
        absentDays,
        attendancePercentage: parseFloat(attendancePercentage),
      },
    },
  });
});

// @desc    Get student marks
// @route   GET /api/student/marks
// @access  STUDENT
export const getMarks = asyncHandler(async (req, res) => {
  const { subject, examType } = req.query;
  const student = await Student.findOne({ userId: req.user._id });

  if (!student) {
    return res.status(404).json({
      success: false,
      message: "Student profile not found",
    });
  }

  // Build query
  let query = {
    studentId: student._id,
  };

  if (subject) {
    query.subject = subject.trim();
  }

  if (examType) {
    query.examType = examType;
  }

  const marksRecords = await Marks.find(query)
    .populate("classId", "name section")
    .populate("teacherId", "userId")
    .populate({
      path: "teacherId",
      populate: {
        path: "userId",
        select: "name",
      },
    })
    .select("subject marks maxMarks examType date classId teacherId")
    .sort({ date: -1 });

  // Group by subject
  const marksBySubject = {};
  marksRecords.forEach((record) => {
    if (!marksBySubject[record.subject]) {
      marksBySubject[record.subject] = [];
    }
    marksBySubject[record.subject].push({
      id: record._id,
      marks: record.marks,
      maxMarks: record.maxMarks,
      percentage: ((record.marks / record.maxMarks) * 100).toFixed(2),
      examType: record.examType,
      date: record.date,
      teacher: record.teacherId?.userId?.name || "N/A",
    });
  });

  res.status(200).json({
    success: true,
    message: "Marks retrieved successfully",
    data: {
      records: marksRecords,
      groupedBySubject: marksBySubject,
    },
  });
});

// @desc    Get public student profile (same school; teachers: assigned classes only)
// @route   GET /api/students/profile/:id
// @access  STUDENT, TEACHER, PRINCIPAL (same school)
export const getPublicProfile = asyncHandler(async (req, res) => {
  const studentId = req.params.id;
  const schoolId = req.user.schoolId;

  if (!schoolId && req.user.role !== "SUPER_ADMIN") {
    return res.status(403).json({
      success: false,
      message: "Not authorized",
    });
  }

  const student = await Student.findById(studentId)
    .populate("userId", "name")
    .populate("classId", "name section")
    .populate("schoolId", "name")
    .lean();

  if (!student) {
    return res.status(404).json({
      success: false,
      message: "Student not found",
    });
  }

  if (req.user.role !== "SUPER_ADMIN" && student.schoolId?._id?.toString() !== schoolId?.toString()) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to view this student",
    });
  }

  if (req.user.role === "TEACHER") {
    const teacher = await Teacher.findOne({ userId: req.user._id }).lean();
    if (!teacher || !teacher.assignedClasses?.some((c) => c.toString() === student.classId?._id?.toString())) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this student",
      });
    }
  }

  const starDoc = await StudentStars.findOne({ studentId: student._id }).lean();
  const { weekKey, monthKey } = getCurrentPeriodKeys();

  const [classSnapshot, schoolSnapshot] = await Promise.all([
    LeaderboardSnapshot.findOne({
      schoolId: student.schoolId._id,
      classId: student.classId._id,
      periodType: "weekly",
      periodKey: weekKey,
    }).lean(),
    LeaderboardSnapshot.findOne({
      schoolId: student.schoolId._id,
      classId: null,
      periodType: "weekly",
      periodKey: weekKey,
    }).lean(),
  ]);

  const classEntry = classSnapshot?.entries?.find(
    (e) => e.studentId && e.studentId.toString() === student._id.toString()
  );
  const schoolEntry = schoolSnapshot?.entries?.find(
    (e) => e.studentId && e.studentId.toString() === student._id.toString()
  );

  res.status(200).json({
    success: true,
    data: {
      id: student._id,
      name: student.userId?.name,
      class: student.classId ? { name: student.classId.name, section: student.classId.section } : null,
      classLabel: student.classId ? `${student.classId.name}-${student.classId.section}` : null,
      profilePhoto: student.photo?.url || null,
      totalStars: starDoc?.totalStars ?? 0,
      attendancePercentage: starDoc?.attendancePercentage ?? 0,
      academicScore: starDoc?.academicScore ?? 0,
      classRank: classEntry?.rank ?? null,
      schoolRank: schoolEntry?.rank ?? null,
    },
  });
});
