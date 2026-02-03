import mongoose from "mongoose";

const aiNoticeSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    event: { type: String, required: true },
    date: { type: Date, required: true },
    classes: [{ type: String }],
    language: { type: String },
    delivery: [{ type: String }],
    generated: {
      notice: { type: String },
      whatsapp: { type: String },
      sms: { type: String },
    },
  },
  { timestamps: true }
);

aiNoticeSchema.index({ schoolId: 1, createdAt: -1 });

export default mongoose.model("AiNotice", aiNoticeSchema);
