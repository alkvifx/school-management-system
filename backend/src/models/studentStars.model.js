import mongoose from "mongoose";

/**
 * Cached star totals per student. Recalculated by cron/on-demand.
 */
const studentStarsSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },

    totalStars: { type: Number, default: 0 },
    attendanceStars: { type: Number, default: 0 },
    academicStars: { type: Number, default: 0 },

    // For display (0–100)
    attendancePercentage: { type: Number, default: 0 },
    academicScore: { type: Number, default: 0 }, // 0–100 range

    lastCalculatedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

studentStarsSchema.index({ studentId: 1 }, { unique: true });
studentStarsSchema.index({ schoolId: 1, totalStars: -1 });
studentStarsSchema.index({ schoolId: 1, classId: 1, totalStars: -1 });

export default mongoose.model("StudentStars", studentStarsSchema);
