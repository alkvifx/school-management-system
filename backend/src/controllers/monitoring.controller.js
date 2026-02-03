import Teacher from "../models/teacher.model.js";
import User from "../models/user.model.js";
import Class from "../models/class.model.js";
import ActivityLog from "../models/activityLog.model.js";
import Attendance from "../models/attendance.model.js";
import { asyncHandler } from "../middlewares/error.middleware.js";

const TODAY_STR = () => new Date().toISOString().slice(0, 10);
const ATTENDANCE_DEADLINE_HOUR = 10; // 10 AM
const STUDENT_UPDATES_HIGH_THRESHOLD = 15; // flag if updates in last 7 days > this
const MARKS_LATE_DAYS = 7;

/**
 * GET /api/principal/monitoring/teachers
 * Teacher activity tracking + flags. Principal only.
 */
export const getMonitoringTeachers = asyncHandler(async (req, res) => {
  const schoolId = req.school._id;
  const todayStr = TODAY_STR();
  const todayStart = new Date(todayStr);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(todayStr);
  todayEnd.setHours(23, 59, 59, 999);

  const teachers = await Teacher.find({ schoolId, isActive: true })
    .populate("userId", "name email lastLoginAt")
    .populate("assignedClasses", "name section")
    .lean();

  const teacherIds = teachers.map((t) => t._id);
  const userIds = teachers.map((t) => t.userId?._id).filter(Boolean);

  const [attendanceToday, logsByUser, studentUpdateCounts] = await Promise.all([
    Attendance.find({ schoolId, date: todayStr }).select("teacherId classId date").lean(),
    ActivityLog.aggregate([
      { $match: { schoolId, userId: { $in: userIds }, role: "TEACHER" } },
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: "$userId",
          lastActivity: { $first: "$timestamp" },
          attendanceTodayCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$actionType", "attendance_marked"] },
                    { $gte: ["$timestamp", todayStart] },
                    { $lte: ["$timestamp", todayEnd] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          marksTodayCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$actionType", "marks_uploaded"] },
                    { $gte: ["$timestamp", todayStart] },
                    { $lte: ["$timestamp", todayEnd] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          lastAttendanceAt: {
            $max: {
              $cond: [
                { $eq: ["$actionType", "attendance_marked"] },
                "$timestamp",
                null,
              ],
            },
          },
        },
      },
    ]),
    ActivityLog.aggregate([
      {
        $match: {
          schoolId,
          actionType: "student_updated",
          role: "TEACHER",
          timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      },
      { $group: { _id: "$userId", count: { $sum: 1 } } },
    ]),
  ]);

  const userLogMap = Object.fromEntries(logsByUser.map((l) => [l._id.toString(), l]));
  const teacherAttendanceCount = {};
  const teacherLastAttendance = {};
  for (const a of attendanceToday) {
    const tid = a.teacherId?.toString();
    if (!tid) continue;
    teacherAttendanceCount[tid] = (teacherAttendanceCount[tid] || 0) + 1;
    if (!teacherLastAttendance[tid]) teacherLastAttendance[tid] = a.date;
  }
  const studentUpdateMap = Object.fromEntries(studentUpdateCounts.map((s) => [s._id.toString(), s.count]));

  const result = teachers.map((t) => {
    const uid = t.userId?._id?.toString();
    const tid = t._id.toString();
    const log = userLogMap[uid] || {};
    const assignedCount = t.assignedClasses?.length || 0;
    const attCountToday = teacherAttendanceCount[tid] ?? log.attendanceTodayCount ?? 0;
    const lastAtt = log.lastAttendanceAt ? new Date(log.lastAttendanceAt) : null;
    const attendanceLate = lastAtt && lastAtt.getHours() >= ATTENDANCE_DEADLINE_HOUR;
    const attendanceMultiple = assignedCount > 0 && attCountToday > assignedCount;
    const studentUpdates7d = studentUpdateMap[uid] ?? 0;
    const studentUpdatesHigh = studentUpdates7d > STUDENT_UPDATES_HIGH_THRESHOLD;

    let status = "compliant";
    if (attendanceLate || attendanceMultiple || studentUpdatesHigh) status = "warning";
    if ((assignedCount > 0 && attCountToday === 0) || studentUpdates7d > 25) status = "risk";

    return {
      teacherId: t._id,
      userId: uid,
      name: t.userId?.name,
      email: t.userId?.email,
      lastLoginAt: t.userId?.lastLoginAt ?? null,
      assignedClasses: (t.assignedClasses || []).map((c) => ({ id: c._id, name: c.name, section: c.section })),
      attendanceMarkedToday: attCountToday,
      lastAttendanceAt: lastAtt?.toISOString() ?? null,
      marksUploadedToday: log.marksTodayCount ?? 0,
      lastActivityAt: log.lastActivity ? new Date(log.lastActivity).toISOString() : null,
      flags: {
        attendanceLate,
        attendanceMultipleEdits: attendanceMultiple,
        studentUpdatesHigh,
      },
      status,
    };
  });

  res.status(200).json({ success: true, data: { teachers: result } });
});

/**
 * GET /api/principal/monitoring/classes
 * Class-level monitoring + compliance. Principal only.
 */
export const getMonitoringClasses = asyncHandler(async (req, res) => {
  const schoolId = req.school._id;
  const todayStr = TODAY_STR();
  const todayStart = new Date();
  todayStart.setHours(ATTENDANCE_DEADLINE_HOUR, 0, 0, 0);
  const todayStartMidnight = new Date(todayStr);
  todayStartMidnight.setHours(0, 0, 0, 0);

  const classes = await Class.find({ schoolId, isActive: true }).select("name section").lean();

  const logsToday = await ActivityLog.find({
    schoolId,
    role: "TEACHER",
    actionType: "attendance_marked",
    timestamp: { $gte: todayStartMidnight },
  })
    .select("metadata timestamp")
    .lean();

  const classStats = {};
  for (const c of classes) {
    classStats[c._id.toString()] = {
      label: `${c.name}${c.section}`,
      attendanceLateCount: 0,
      attendanceMarkCount: 0,
    };
  }
  for (const log of logsToday) {
    const cid = log.metadata?.classId?.toString();
    if (!cid || !classStats[cid]) continue;
    classStats[cid].attendanceMarkCount += 1;
    const t = new Date(log.timestamp);
    if (t >= todayStart) classStats[cid].attendanceLateCount += 1;
  }

  const result = classes.map((c) => {
    const s = classStats[c._id.toString()] || { attendanceLateCount: 0, attendanceMarkCount: 0 };
    const compliance = s.attendanceMarkCount === 0 ? 0 : Math.max(0, 100 - s.attendanceLateCount * 20);
    return {
      classId: c._id,
      label: `${c.name}${c.section}`,
      attendanceMarkedToday: s.attendanceMarkCount,
      attendanceLateCount: s.attendanceLateCount,
      complianceScore: Math.round(compliance),
    };
  });

  res.status(200).json({ success: true, data: { classes: result } });
});

/**
 * GET /api/principal/monitoring/summary
 * Feature usage analytics. Principal only.
 */
export const getMonitoringSummary = asyncHandler(async (req, res) => {
  const schoolId = req.school._id;
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const summary = await ActivityLog.aggregate([
    { $match: { schoolId, role: "TEACHER", timestamp: { $gte: thirtyDaysAgo } } },
    {
      $group: {
        _id: "$module",
        usageCount: { $sum: 1 },
        lastUsed: { $max: "$timestamp" },
        actionBreakdown: { $push: "$actionType" },
      },
    },
  ]);

  const moduleStats = {
    attendance: { usageCount: 0, lastUsed: null, actionCounts: {} },
    marks: { usageCount: 0, lastUsed: null, actionCounts: {} },
    student: { usageCount: 0, lastUsed: null, actionCounts: {} },
  };

  for (const s of summary) {
    const mod = s._id;
    if (!moduleStats[mod]) moduleStats[mod] = { usageCount: 0, lastUsed: null, actionCounts: {} };
    moduleStats[mod].usageCount = s.usageCount;
    moduleStats[mod].lastUsed = s.lastUsed;
    const counts = {};
    for (const a of s.actionBreakdown || []) {
      counts[a] = (counts[a] || 0) + 1;
    }
    moduleStats[mod].actionCounts = counts;
  }

  const modules = [
    { id: "attendance", name: "Attendance", ...moduleStats.attendance },
    { id: "marks", name: "Marks", ...moduleStats.marks },
    { id: "student", name: "Student updates", ...moduleStats.student },
  ];

  res.status(200).json({ success: true, data: { modules } });
});
