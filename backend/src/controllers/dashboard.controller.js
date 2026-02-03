import Student from "../models/student.model.js";
import Attendance from "../models/attendance.model.js";
import StudentFee from "../models/studentFee.model.js";
import Notification from "../models/notification.model.js";
import StudentRisk from "../models/studentRisk.model.js";
import Teacher from "../models/teacher.model.js";
import Class from "../models/class.model.js";

export const principalDashboard = async (req, res, next) => {
  try {
    const schoolId = req.school._id;

    const totalStudents = await Student.countDocuments({ schoolId, isActive: true });

    // Today attendance
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todayAttendance = await Attendance.countDocuments({ schoolId, date: { $gte: startOfDay, $lte: endOfDay } });

    // Fee collected today
    const fees = await StudentFee.aggregate([
      { $match: { schoolId } },
      { $unwind: { path: "$payments", preserveNullAndEmptyArrays: true } },
      { $match: { "payments.date": { $gte: startOfDay, $lte: endOfDay } } },
      { $group: { _id: null, total: { $sum: "$payments.amount" } } },
    ]);
    const feeCollectedToday = fees[0]?.total || 0;

    // Pending complaints approximation: count notifications of type OTHER and unread
    const pendingComplaints = await Notification.countDocuments({ schoolId, type: "OTHER", isRead: false });

    // AI alerts count
    const aiAlerts = await StudentRisk.countDocuments({ schoolId, riskLevel: { $in: ["HIGH", "MEDIUM"] } });

    res.json({
      success: true,
      data: {
        totalStudents,
        todayAttendance,
        feeCollectedToday,
        pendingComplaints,
        aiAlerts,
      },
    });
  } catch (error) {
    next(error);
  }
};

/** Today's date string YYYY-MM-DD (Attendance model uses string dates) */
function getTodayDateString() {
  return new Date().toISOString().slice(0, 10);
}

/** In-memory cache for pulse today (TTL 60s) – key: schoolId_todayStr */
const pulseCache = new Map();
const PULSE_CACHE_TTL_MS = 60 * 1000;

function getPulseCacheKey(schoolId, dateStr) {
  return `${schoolId}_${dateStr}`;
}

/**
 * GET /api/principal/dashboard/pulse/today
 * Aaj School Ka Pulse – today's school health overview (Principal only).
 * Aggregates student/teacher attendance, class-wise stats, and auto-generated alerts.
 */
export const getPulseToday = async (req, res, next) => {
  try {
    const schoolId = req.school._id;
    const todayStr = getTodayDateString();
    const cacheKey = getPulseCacheKey(schoolId, todayStr);
    const cached = pulseCache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) {
      return res.json({ success: true, data: cached.data });
    }

    const [totalStudents, totalTeachers, classesInSchool, todayAttendanceDocs] = await Promise.all([
      Student.countDocuments({ schoolId, isActive: true }),
      Teacher.countDocuments({ schoolId, isActive: true }),
      Class.find({ schoolId, isActive: true }).select("_id name section").lean(),
      Attendance.find({ schoolId, date: todayStr }).lean(),
    ]);

    const classIds = classesInSchool.map((c) => c._id);
    const classMap = Object.fromEntries(classesInSchool.map((c) => [c._id.toString(), { name: c.name, section: c.section }]));

    let studentPresent = 0;
    let studentAbsent = 0;
    const classWisePresent = {};
    const classWiseTotal = {};
    const teacherIdsMarked = new Set();

    for (const doc of todayAttendanceDocs) {
      teacherIdsMarked.add(doc.teacherId?.toString());
      const cid = doc.classId?.toString();
      if (!cid) continue;
      if (!classWisePresent[cid]) classWisePresent[cid] = 0;
      if (!classWiseTotal[cid]) classWiseTotal[cid] = 0;
      for (const r of doc.records || []) {
        classWiseTotal[cid] += 1;
        if (r.status === "present") {
          studentPresent += 1;
          classWisePresent[cid] += 1;
        } else {
          studentAbsent += 1;
        }
      }
    }

    const totalMarkedStudents = studentPresent + studentAbsent;
    const attendancePct =
      totalMarkedStudents > 0 ? Math.round((studentPresent / totalMarkedStudents) * 1000) / 10 : 0;
    const totalMarked = totalMarkedStudents;

    const classWiseBreakdown = classIds
      .map((cid) => {
        const key = cid.toString();
        const total = classWiseTotal[key] ?? 0;
        const present = classWisePresent[key] ?? 0;
        const pct = total > 0 ? Math.round((present / total) * 100) : null;
        const label = classMap[key] ? `${classMap[key].name}${classMap[key].section}` : key;
        return { classId: key, label, total, present, absent: total - present, attendancePct: pct };
      })
      .filter((c) => c.total > 0);

    classWiseBreakdown.sort((a, b) => (a.attendancePct ?? 100) - (b.attendancePct ?? 100));
    const lowestAttendanceClasses = classWiseBreakdown.slice(0, 3);

    const teachersMarkedCount = teacherIdsMarked.size;
    const teachersNotMarked = Math.max(0, totalTeachers - teachersMarkedCount);

    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 2);
    const dateStrs = [];
    for (let i = 0; i < 3; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dateStrs.push(d.toISOString().slice(0, 10));
    }
    const last3DaysAttendance = await Attendance.find({ schoolId, date: { $in: dateStrs } }).select("date classId records").lean();
    const absentByStudentByDay = {};
    for (const doc of last3DaysAttendance) {
      const date = doc.date;
      for (const r of doc.records || []) {
        const sid = r.studentId?.toString();
        if (!sid) continue;
        if (!absentByStudentByDay[sid]) absentByStudentByDay[sid] = {};
        if (r.status === "absent") absentByStudentByDay[sid][date] = true;
      }
    }
    let studentsAbsent3Days = 0;
    for (const sid of Object.keys(absentByStudentByDay)) {
      const days = absentByStudentByDay[sid];
      if (dateStrs.every((d) => days[d])) studentsAbsent3Days += 1;
    }

    const alerts = [];
    for (const c of lowestAttendanceClasses) {
      if (c.attendancePct != null && c.attendancePct < 70) {
        alerts.push({
          type: "LOW_CLASS_ATTENDANCE",
          severity: "warning",
          message: `Class ${c.label} attendance below 70% today (${c.attendancePct}%)`,
        });
      }
    }
    if (teachersNotMarked > 0) {
      alerts.push({
        type: "TEACHERS_NOT_MARKED",
        severity: "warning",
        message: `${teachersNotMarked} teacher${teachersNotMarked === 1 ? "" : "s"} have not marked attendance yet`,
      });
    }
    if (studentsAbsent3Days > 0) {
      alerts.push({
        type: "STUDENTS_ABSENT_3_DAYS",
        severity: "warning",
        message: `${studentsAbsent3Days} student${studentsAbsent3Days === 1 ? "" : "s"} absent continuously for 3 days`,
      });
    }

    const now = new Date();
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    const data = {
        date: todayStr,
        dayName: dayNames[now.getDay()],
        student: {
          totalStudents,
          present: studentPresent,
          absent: studentAbsent,
          totalMarked,
          attendancePercentage: attendancePct,
          classWiseBreakdown: lowestAttendanceClasses.map((c) => ({
            classId: c.classId,
            label: c.label,
            present: c.present,
            total: c.total,
            attendancePct: c.attendancePct,
          })),
        },
        teacher: {
          totalTeachers,
          presentToday: teachersMarkedCount,
          notMarkedYet: teachersNotMarked,
        },
        late: {
          studentsLate: 0,
          teachersLate: 0,
        },
        alerts,
      };
    pulseCache.set(cacheKey, { data, expiresAt: Date.now() + PULSE_CACHE_TTL_MS });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};
