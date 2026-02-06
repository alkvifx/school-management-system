import mongoose from "mongoose";

const aiChatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["STUDENT", "TEACHER"],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    aiResponse: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

aiChatSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("AiChat", aiChatSchema);
