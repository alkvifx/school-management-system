import mongoose from "mongoose";

const studentRiskSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
    riskLevel: { type: String, enum: ["LOW", "MEDIUM", "HIGH"], required: true },
    reasons: [{ type: String }],
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

studentRiskSchema.index({ schoolId: 1, studentId: 1 });

export default mongoose.model("StudentRisk", studentRiskSchema);
