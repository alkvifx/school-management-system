import Attendance from "../models/attendance.model.js";
import StudentFee from "../models/studentFee.model.js";
import Marks from "../models/marks.model.js";
import PDFDocument from "pdfkit";

export const generateReport = async (req, res, next) => {
  try {
    const { type, startDate, endDate, format = "json" } = req.query;
    if (!type) return res.status(400).json({ success: false, message: "Report type required" });

    // Basic date filtering
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    const schoolId = req.school._id;

    let payload = {};

    if (type === "attendance") {
      const q = { schoolId };
      if (start && end) q.date = { $gte: start, $lte: end };
      const records = await Attendance.find(q).limit(10000).lean();
      payload = { summary: `Attendance records: ${records.length}`, records };
    } else if (type === "fees") {
      const q = { schoolId };
      if (start && end) q.createdAt = { $gte: start, $lte: end };
      const records = await StudentFee.find(q).limit(10000).lean();
      payload = { summary: `Fee records: ${records.length}`, records };
    } else if (type === "academic") {
      const q = { schoolId };
      if (start && end) q.date = { $gte: start, $lte: end };
      const records = await Marks.find(q).limit(10000).lean();
      payload = { summary: `Marks records: ${records.length}`, records };
    } else if (type === "monthly") {
      // Compose a small aggregated monthly report
      const attendanceCount = await Attendance.countDocuments({ schoolId });
      const feesCount = await StudentFee.countDocuments({ schoolId });
      payload = { summary: "Monthly snapshot", attendanceCount, feesCount };
    } else {
      return res.status(400).json({ success: false, message: "Unknown report type" });
    }

    if (format === "json") {
      return res.json({ success: true, data: payload });
    }

    if (format === "pdf") {
      // generate simple pdf
      const doc = new PDFDocument();
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="report-${type}.pdf"`);
      doc.text(`Report Type: ${type}\n`);
      doc.text(JSON.stringify(payload, null, 2));
      doc.end();
      doc.pipe(res);
      return;
    }

    // For other formats, return json
    res.json({ success: true, data: payload });
  } catch (error) {
    next(error);
  }
};
