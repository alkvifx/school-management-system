import StudentRisk from "../models/studentRisk.model.js";
import Student from "../models/student.model.js";

export const getRisks = async (req, res, next) => {
  try {
    const schoolId = req.school._id;
    const { classId } = req.query;
    const query = { schoolId };
    if (classId) query.classId = classId;

    const risks = await StudentRisk.find(query).populate("studentId", "firstName lastName classId").lean();
    res.json({ success: true, data: risks });
  } catch (error) {
    next(error);
  }
};
