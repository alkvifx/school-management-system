import mongoose from "mongoose";

/**
 * Pre-computed leaderboard (weekly or monthly, class or school).
 * Filled by cron; APIs read from here.
 */
const leaderboardEntrySchema = new mongoose.Schema(
  {
    rank: { type: Number, required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    totalStars: { type: Number, required: true },
    attendancePercentage: { type: Number, required: true },
    academicScore: { type: Number, required: true },
  },
  { _id: false }
);

const leaderboardSnapshotSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      default: null, // null = school-wide
    },

    periodType: { type: String, enum: ["weekly", "monthly"], required: true },
    periodKey: { type: String, required: true }, // e.g. "2025-W06" or "2025-02"

    entries: [leaderboardEntrySchema],
    computedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

leaderboardSnapshotSchema.index(
  { schoolId: 1, classId: 1, periodType: 1, periodKey: 1 },
  { unique: true }
);

export default mongoose.model("LeaderboardSnapshot", leaderboardSnapshotSchema);
