import mongoose from "mongoose";

const marksSchema = new mongoose.Schema(
  {
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
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    marks: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    maxMarks: {
      type: Number,
      default: 100,
    },
    examType: {
      type: String,
      enum: ["unit_test", "mid_term", "final", "assignment", "quiz"],
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Prevent duplicate marks for same student, subject, examType, date
marksSchema.index(
  { studentId: 1, subject: 1, examType: 1, date: 1 },
  { unique: true }
);

export default mongoose.model("Marks", marksSchema);
