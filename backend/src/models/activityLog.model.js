import mongoose from "mongoose";

/**
 * Silent activity log for principal monitoring.
 * Used only for aggregation; never exposed to teachers/students.
 */
const activityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["TEACHER", "PRINCIPAL", "STUDENT"],
      required: true,
    },
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },
    actionType: {
      type: String,
      required: true,
      enum: [
        "attendance_marked",
        "attendance_edited",
        "marks_uploaded",
        "student_updated",
        "student_created",
        "login",
      ],
    },
    module: {
      type: String,
      required: true,
      enum: ["attendance", "marks", "student", "auth"],
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

activityLogSchema.index({ schoolId: 1, timestamp: -1 });
activityLogSchema.index({ schoolId: 1, userId: 1, timestamp: -1 });
activityLogSchema.index({ schoolId: 1, module: 1, actionType: 1, timestamp: -1 });

export default mongoose.model("ActivityLog", activityLogSchema);
