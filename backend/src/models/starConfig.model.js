import mongoose from "mongoose";

/**
 * Per-school gamification config.
 * Used to calculate stars from attendance and academics.
 */
const starConfigSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
      unique: true,
    },

    // --- Attendance ---
    starPerFullDay: { type: Number, default: 1 },
    bonusWeeklyFullAttendance: { type: Number, default: 2 },
    bonusMonthlyFullAttendance: { type: Number, default: 5 },

    // --- Academics: marks % → stars (order: high to low) ---
    // e.g. [{ minPercent: 90, stars: 5 }, { minPercent: 80, stars: 4 }, { minPercent: 70, stars: 3 }]
    academicTiers: [
      {
        minPercent: { type: Number, required: true },
        stars: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("StarConfig", starConfigSchema);
