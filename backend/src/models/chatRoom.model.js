import mongoose from "mongoose";

const chatRoomSchema = new mongoose.Schema(
  {
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
      unique: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
  },
  { timestamps: true }
);

// Index for faster queries
chatRoomSchema.index({ teacherId: 1 });

export default mongoose.model("ChatRoom", chatRoomSchema);
