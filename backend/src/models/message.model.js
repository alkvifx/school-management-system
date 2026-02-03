import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    chatRoomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatRoom",
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderRole: {
      type: String,
      // Keep backward compatibility, but allow system roles to participate in chat safely.
      // Frontend payload shape is unchanged.
      enum: ["SUPER_ADMIN", "PRINCIPAL", "TEACHER", "STUDENT"],
      required: true,
    },
    messageType: {
      type: String,
      enum: ["text", "image", "pdf", "audio"],
      required: true,
      default: "text",
    },
    text: {
      type: String,
      default: null,
    },
    mediaUrl: {
      type: String,
      default: null,
    },
    mediaPublicId: {
      type: String,
      default: null,
    },
    // Optional client-generated id used to dedupe retries (does not change existing API contract)
    clientMessageId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Indexes for faster queries
messageSchema.index({ chatRoomId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1 });
// Idempotency / dedupe (sparse so existing docs without clientMessageId are unaffected)
messageSchema.index(
  { chatRoomId: 1, senderId: 1, clientMessageId: 1 },
  { unique: true, sparse: true }
);

export default mongoose.model("Message", messageSchema);
