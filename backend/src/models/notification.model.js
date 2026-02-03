import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Notification title is required"],
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Notification message is required"],
      trim: true,
    },
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // null means broadcast notification
    },
    type: {
      type: String,
      enum: ["FEE_REMINDER", "GENERAL", "ATTENDANCE", "MARKS", "OTHER"],
      default: "GENERAL",
    },
    targetRole: {
      type: String,
      enum: ["TEACHER", "STUDENT", "ALL"],
      default: null, // null when userId is specified
    },
    targetClass: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      default: null, // null means all classes
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: null, // Store additional data like fee amount, due date, etc.
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
notificationSchema.index({ schoolId: 1, userId: 1, isRead: 1 });
notificationSchema.index({ schoolId: 1, targetRole: 1 });
notificationSchema.index({ schoolId: 1, targetClass: 1 });
notificationSchema.index({ schoolId: 1, type: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);
