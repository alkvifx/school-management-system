import StarConfig from "../models/starConfig.model.js";
import StudentStars from "../models/studentStars.model.js";
import LeaderboardSnapshot from "../models/leaderboardSnapshot.model.js";
import Student from "../models/student.model.js";
import Attendance from "../models/attendance.model.js";
import Marks from "../models/marks.model.js";

const DEFAULT_ACADEMIC_TIERS = [
  { minPercent: 90, stars: 5 },
  { minPercent: 80, stars: 4 },
  { minPercent: 70, stars: 3 },
  { minPercent: 60, stars: 2 },
  { minPercent: 50, stars: 1 },
];

/**
 * Get or create StarConfig for a school.
 */
export async function getOrCreateStarConfig(schoolId) {
  let config = await StarConfig.findOne({ schoolId }).lean();
  if (!config) {
    const created = await StarConfig.create({
      schoolId,
      starPerFullDay: 1,
      bonusWeeklyFullAttendance: 2,
      bonusMonthlyFullAttendance: 5,
      academicTiers: DEFAULT_ACADEMIC_TIERS,
    });
    config = created.toObject();
  }
  return config;
}

/**
 * Get current week key (ISO week) and month key for leaderboard period.
 */
export function getCurrentPeriodKeys() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const monthKey = `${year}-${month}`;

  const startOfYear = new Date(year, 0, 1);
  const days = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000));
  const weekNum = Math.ceil((days + startOfYear.getDay() + 1) / 7);
  const weekKey = `${year}-W${String(weekNum).padStart(2, "0")}`;

  return { weekKey, monthKey };
}

/**
 * Get start/end dates for a period key (for attendance aggregation).
 */
export function getPeriodDateRange(periodType, periodKey) {
  if (periodType === "weekly") {
    const [year, w] = periodKey.split("-W").map(Number);
    const firstDay = new Date(year, 0, 1);
    const start = new Date(firstDay);
    start.setDate(firstDay.getDate() + (w - 1) * 7 - firstDay.getDay() + 1);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return {
      start: start.toISOString().slice(0, 10),
      end: end.toISOString().slice(0, 10),
    };
  }
  if (periodType === "monthly") {
    const [year, month] = periodKey.split("-").map(Number);
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);
    return {
      start: start.toISOString().slice(0, 10),
      end: end.toISOString().slice(0, 10),
    };
  }
  return { start: null, end: null };
}

/**
 * Calculate attendance stars for a student in a given period (and overall for percentage).
 */
async function getAttendanceStats(studentId, classId, config, periodRange = null) {
  const query = {
    classId,
    "records.studentId": studentId,
  };
  if (periodRange?.start || periodRange?.end) {
    query.date = {};
    if (periodRange.start) query.date.$gte = periodRange.start;
    if (periodRange.end) query.date.$lte = periodRange.end;
  }

  const records = await Attendance.find(query).select("date records").lean();
  let presentDays = 0;
  const datesPresent = new Set();

  for (const rec of records) {
    const studentRec = rec.records.find(
      (r) => r.studentId && r.studentId.toString() === studentId.toString()
    );
    if (studentRec?.status === "present") {
      presentDays++;
      datesPresent.add(rec.date);
    }
  }

  const totalDays = records.length;
  const attendancePct = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

  let stars = presentDays * (config.starPerFullDay || 1);

  if (periodRange) {
    const dates = [...datesPresent].sort();
    if (dates.length >= 5) {
      const weeks = new Set(dates.map((d) => d.slice(0, 10)));
      const weekCount = Math.ceil(dates.length / 5);
      stars += (config.bonusWeeklyFullAttendance || 0) * Math.min(weekCount, 4);
    }
    if (dates.length >= 20) {
      stars += config.bonusMonthlyFullAttendance || 0;
    }
  }

  return { stars, attendancePct, totalDays, presentDays };
}

/**
 * Calculate academic stars from marks (average % across latest exams).
 */
async function getAcademicStars(studentId, config) {
  const marksRecords = await Marks.find({ studentId }).lean();
  if (!marksRecords.length) return { stars: 0, academicScore: 0 };

  const totalMarks = marksRecords.reduce((s, r) => s + (r.marks || 0), 0);
  const totalMax = marksRecords.reduce((s, r) => s + (r.maxMarks || 100), 0);
  const academicScore = totalMax > 0 ? Math.round((totalMarks / totalMax) * 100) : 0;

  const tiers = (config.academicTiers || DEFAULT_ACADEMIC_TIERS).slice().sort(
    (a, b) => b.minPercent - a.minPercent
  );
  let stars = 0;
  for (const t of tiers) {
    if (academicScore >= t.minPercent) {
      stars = t.stars;
      break;
    }
  }
  return { stars, academicScore };
}

/**
 * Recalculate and upsert StudentStars for one student.
 */
export async function calculateStarsForStudent(studentId) {
  const student = await Student.findById(studentId).lean();
  if (!student) return null;

  const config = await getOrCreateStarConfig(student.schoolId);

  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthRange = {
    start: currentMonthStart.toISOString().slice(0, 10),
    end: now.toISOString().slice(0, 10),
  };

  const { stars: attendanceStars, attendancePct } = await getAttendanceStats(
    studentId,
    student.classId,
    config,
    monthRange
  );

  const { stars: academicStars, academicScore } = await getAcademicStars(studentId, config);

  const totalStars = attendanceStars + academicStars;

  const doc = await StudentStars.findOneAndUpdate(
    { studentId },
    {
      schoolId: student.schoolId,
      classId: student.classId,
      totalStars,
      attendanceStars,
      academicStars,
      attendancePercentage: attendancePct,
      academicScore,
      lastCalculatedAt: new Date(),
    },
    { upsert: true, new: true }
  );
  return doc;
}

/**
 * Recalculate stars for all students in a school.
 */
export async function calculateStarsForSchool(schoolId) {
  const students = await Student.find({ schoolId, isActive: true }).select("_id").lean();
  let count = 0;
  for (const s of students) {
    await calculateStarsForStudent(s._id);
    count++;
  }
  return count;
}

/**
 * Build and save leaderboard snapshot for a school/class and period.
 */
export async function buildLeaderboardSnapshot(schoolId, periodType, periodKey, classId = null) {
  const query = { schoolId };
  if (classId) query.classId = classId;

  const students = await StudentStars.find(query)
    .sort({ totalStars: -1 })
    .lean();

  const entries = students.map((s, i) => ({
    rank: i + 1,
    studentId: s.studentId,
    totalStars: s.totalStars,
    attendancePercentage: s.attendancePercentage,
    academicScore: s.academicScore,
  }));

  await LeaderboardSnapshot.findOneAndUpdate(
    { schoolId, classId: classId || null, periodType, periodKey },
    { entries, computedAt: new Date() },
    { upsert: true }
  );
  return entries.length;
}

/**
 * Build all leaderboards for a school (current week + current month, class + school).
 */
export async function buildAllLeaderboardsForSchool(schoolId) {
  const { weekKey, monthKey } = getCurrentPeriodKeys();
  const classes = await Student.distinct("classId", { schoolId, isActive: true });

  for (const periodType of ["weekly", "monthly"]) {
    const periodKey = periodType === "weekly" ? weekKey : monthKey;
    await buildLeaderboardSnapshot(schoolId, periodType, periodKey, null);
    for (const classId of classes) {
      await buildLeaderboardSnapshot(schoolId, periodType, periodKey, classId);
    }
  }
}
