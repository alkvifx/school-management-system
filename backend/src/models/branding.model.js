import mongoose from "mongoose";

const brandingSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    logoPrompt: { type: String },
    logoUrl: { type: String },
    certificateText: { type: String },
    letterhead: { type: String },
    idCardLayout: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

brandingSchema.index({ schoolId: 1, createdAt: -1 });

export default mongoose.model("Branding", brandingSchema);
