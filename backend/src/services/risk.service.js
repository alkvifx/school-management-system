import Student from "../models/student.model.js";
import Attendance from "../models/attendance.model.js";
import Marks from "../models/marks.model.js";
import StudentFee from "../models/studentFee.model.js";
import StudentRisk from "../models/studentRisk.model.js";

// thresholds configurable via env
const ATTENDANCE_THRESHOLD = Number(process.env.RISK_ATTENDANCE_THRESHOLD || 75); // percent
const MARKS_DECLINE_THRESHOLD = Number(process.env.RISK_MARKS_DECLINE_THRESHOLD || 10); // percent drop

export async function detectRisksForSchool(schoolId) {
  // Get all students
  const students = await Student.find({ schoolId, isActive: true }).lean();
  const risks = [];

  for (const student of students) {
    const reasons = [];
    let riskLevel = "LOW";

    // Attendance check: compute average attendance % for last 30 days
    const thirtyAgo = new Date();
    thirtyAgo.setDate(thirtyAgo.getDate() - 30);
    const attendanceRecords = await Attendance.find({ studentId: student._id, date: { $gte: thirtyAgo } }).lean();
    const presentCount = attendanceRecords.filter((r) => r.status === "PRESENT").length;
    const total = attendanceRecords.length || 1;
    const attendancePct = Math.round((presentCount / total) * 100);
    if (attendancePct < ATTENDANCE_THRESHOLD) {
      reasons.push(`Low attendance: ${attendancePct}%`);
      riskLevel = riskLevel === "LOW" ? "MEDIUM" : riskLevel;
    }

    // Fee pending check: find overdue fees
    const overdue = await StudentFee.findOne({ studentId: student._id, status: "OVERDUE" }).lean();
    if (overdue) {
      reasons.push("Fee overdue");
      riskLevel = "HIGH";
    }

    // Marks decline: check marks trends (simple heuristic)
    const marks = await Marks.find({ studentId: student._id }).sort({ date: -1 }).limit(6).lean();
    if (marks.length >= 3) {
      const avgLatest = marks.slice(0, 3).reduce((s, m) => s + m.marks, 0) / 3;
      const avgPrev = marks.slice(3).reduce((s, m) => s + m.marks, 0) / (marks.length - 3);
      if (avgPrev && avgPrev - avgLatest >= MARKS_DECLINE_THRESHOLD) {
        reasons.push("Marks declined recently");
        riskLevel = "HIGH";
      }
    }

    if (reasons.length > 0) {
      risks.push({ studentId: student._id, schoolId, riskLevel, reasons });
    }
  }

  // Upsert StudentRisk entries
  let createdCount = 0;
  for (const r of risks) {
    const existing = await StudentRisk.findOne({ studentId: r.studentId, schoolId });
    if (existing) {
      existing.riskLevel = r.riskLevel;
      existing.reasons = r.reasons;
      existing.metadata = r.metadata || null;
      await existing.save();
    } else {
      await StudentRisk.create(r);
      createdCount++;
    }
  }

  return { total: risks.length, created: createdCount };
}

export default { detectRisksForSchool };
