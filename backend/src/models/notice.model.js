import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Notice title is required"],
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Notice message is required"],
      trim: true,
    },
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },
    targetRole: {
      type: String,
      enum: ["TEACHER", "STUDENT", "ALL"],
      required: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      default: null,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isImportant: {
      type: Boolean,
      default: false,
    },
    attachments: [
      {
        type: String, // file URLs
      },
    ],
    expiresAt: {
      type: Date,
      default: null,
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

// Indexes for fast querying
noticeSchema.index({ schoolId: 1, targetRole: 1, createdAt: -1 });
noticeSchema.index({ schoolId: 1, classId: 1, createdAt: -1 });
noticeSchema.index({ schoolId: 1, studentId: 1, createdAt: -1 });
noticeSchema.index({ schoolId: 1, teacherId: 1, createdAt: -1 });
noticeSchema.index({ createdBy: 1, createdAt: -1 });
noticeSchema.index({ schoolId: 1, createdAt: -1 });

export default mongoose.model("Notice", noticeSchema);
