import mongoose from "mongoose";

const aiPosterSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    imageUrl: { type: String, required: true },
    format: { type: String, enum: ["story", "poster", "banner"], required: true },
    promptUsed: { type: String, required: true },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

aiPosterSchema.index({ schoolId: 1, createdAt: -1 });

export default mongoose.model("AiPoster", aiPosterSchema);
