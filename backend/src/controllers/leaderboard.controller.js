import LeaderboardSnapshot from "../models/leaderboardSnapshot.model.js";
import Student from "../models/student.model.js";
import StudentStars from "../models/studentStars.model.js";
import Teacher from "../models/teacher.model.js";
import { asyncHandler } from "../middlewares/error.middleware.js";
import {
  getCurrentPeriodKeys,
  calculateStarsForStudent,
  buildLeaderboardSnapshot,
} from "../services/stars.service.js";

/**
 * Get leaderboard for a class (weekly or monthly).
 * GET /leaderboard/class/:classId?period=weekly|monthly
 */
export const getClassLeaderboard = asyncHandler(async (req, res) => {
  const { classId } = req.params;
  const period = (req.query.period || "weekly").toLowerCase();
  const periodType = period === "monthly" ? "monthly" : "weekly";

  const schoolId = req.user.schoolId;
  if (!schoolId) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to access this school",
    });
  }

  if (req.user.role === "TEACHER") {
    const teacher = await Teacher.findOne({ userId: req.user._id }).lean();
    if (!teacher?.assignedClasses?.some((c) => c.toString() === classId)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this class leaderboard",
      });
    }
  }

  const { weekKey, monthKey } = getCurrentPeriodKeys();
  const periodKey = periodType === "weekly" ? weekKey : monthKey;

  let snapshot = await LeaderboardSnapshot.findOne({
    schoolId,
    classId,
    periodType,
    periodKey,
  })
    .lean()
    .populate({
      path: "entries.studentId",
      select: "userId classId rollNumber photo",
      populate: [
        { path: "userId", select: "name" },
        { path: "classId", select: "name section" },
      ],
    });

  if (!snapshot) {
    await buildLeaderboardSnapshot(schoolId, periodType, periodKey, classId);
    snapshot = await LeaderboardSnapshot.findOne({
      schoolId,
      classId,
      periodType,
      periodKey,
    })
      .lean()
      .populate({
        path: "entries.studentId",
        select: "userId classId rollNumber photo",
        populate: [
          { path: "userId", select: "name" },
          { path: "classId", select: "name section" },
        ],
      });
  }

  const entries = (snapshot?.entries || []).map((e) => ({
    rank: e.rank,
    studentId: e.studentId?._id,
    name: e.studentId?.userId?.name,
    class: e.studentId?.classId
      ? `${e.studentId.classId.name}-${e.studentId.classId.section}`
      : null,
    totalStars: e.totalStars,
    attendancePercentage: e.attendancePercentage,
    academicScore: e.academicScore,
  }));

  res.status(200).json({
    success: true,
    data: {
      periodType,
      periodKey,
      scope: "class",
      classId,
      entries,
      computedAt: snapshot?.computedAt,
    },
  });
});

/**
 * Get school-wide leaderboard (weekly or monthly).
 * GET /leaderboard/school/:schoolId?period=weekly|monthly
 */
export const getSchoolLeaderboard = asyncHandler(async (req, res) => {
  const { schoolId } = req.params;
  const period = (req.query.period || "weekly").toLowerCase();
  const periodType = period === "monthly" ? "monthly" : "weekly";

  if (req.user.role !== "SUPER_ADMIN" && req.user.schoolId?.toString() !== schoolId) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to access this school",
    });
  }

  const { weekKey, monthKey } = getCurrentPeriodKeys();
  const periodKey = periodType === "weekly" ? weekKey : monthKey;

  let snapshot = await LeaderboardSnapshot.findOne({
    schoolId,
    classId: null,
    periodType,
    periodKey,
  })
    .lean()
    .populate({
      path: "entries.studentId",
      select: "userId classId rollNumber photo",
      populate: [
        { path: "userId", select: "name" },
        { path: "classId", select: "name section" },
      ],
    });

  if (!snapshot) {
    await buildLeaderboardSnapshot(schoolId, periodType, periodKey, null);
    snapshot = await LeaderboardSnapshot.findOne({
      schoolId,
      classId: null,
      periodType,
      periodKey,
    })
      .lean()
      .populate({
        path: "entries.studentId",
        select: "userId classId rollNumber photo",
        populate: [
          { path: "userId", select: "name" },
          { path: "classId", select: "name section" },
        ],
      });
  }

  const entries = (snapshot?.entries || []).map((e) => ({
    rank: e.rank,
    studentId: e.studentId?._id,
    name: e.studentId?.userId?.name,
    class: e.studentId?.classId
      ? `${e.studentId.classId.name}-${e.studentId.classId.section}`
      : null,
    totalStars: e.totalStars,
    attendancePercentage: e.attendancePercentage,
    academicScore: e.academicScore,
  }));

  res.status(200).json({
    success: true,
    data: {
      periodType,
      periodKey,
      scope: "school",
      schoolId,
      entries,
      computedAt: snapshot?.computedAt,
    },
  });
});

/**
 * Get current user's rank (student: class + school; teacher/principal: N/A or optional).
 * GET /leaderboard/me?period=weekly|monthly
 */
export const getMyRank = asyncHandler(async (req, res) => {
  const period = (req.query.period || "weekly").toLowerCase();
  const periodType = period === "monthly" ? "monthly" : "weekly";

  const schoolId = req.user.schoolId;
  if (!schoolId) {
    return res.status(403).json({
      success: false,
      message: "Not authorized",
    });
  }

  const student = await Student.findOne({ userId: req.user._id }).lean();
  if (!student) {
    return res.status(200).json({
      success: true,
      data: {
        isStudent: false,
        classRank: null,
        schoolRank: null,
        totalStars: null,
        periodType,
      },
    });
  }

  const starDoc = await StudentStars.findOne({ studentId: student._id }).lean();
  if (!starDoc) {
    await calculateStarsForStudent(student._id);
  }

  const { weekKey, monthKey } = getCurrentPeriodKeys();
  const periodKey = periodType === "weekly" ? weekKey : monthKey;

  const [classSnapshot, schoolSnapshot] = await Promise.all([
    LeaderboardSnapshot.findOne({
      schoolId,
      classId: student.classId,
      periodType,
      periodKey,
    }).lean(),
    LeaderboardSnapshot.findOne({
      schoolId,
      classId: null,
      periodType,
      periodKey,
    }).lean(),
  ]);

  const classEntry = classSnapshot?.entries?.find(
    (e) => e.studentId && e.studentId.toString() === student._id.toString()
  );
  const schoolEntry = schoolSnapshot?.entries?.find(
    (e) => e.studentId && e.studentId.toString() === student._id.toString()
  );

  const updatedStars = await StudentStars.findOne({ studentId: student._id }).lean();

  res.status(200).json({
    success: true,
    data: {
      isStudent: true,
      classRank: classEntry?.rank ?? null,
      schoolRank: schoolEntry?.rank ?? null,
      totalStars: updatedStars?.totalStars ?? 0,
      attendancePercentage: updatedStars?.attendancePercentage ?? 0,
      academicScore: updatedStars?.academicScore ?? 0,
      periodType,
      periodKey,
    },
  });
});
