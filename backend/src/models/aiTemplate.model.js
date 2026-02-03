import mongoose from "mongoose";

const aiTemplateSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    templateType: { type: String, required: true, trim: true }, // website, notice, prospectus, admission, report
    language: { type: String, default: "English" },
    tone: { type: String, default: "formal" },
    content: { type: mongoose.Schema.Types.Mixed, required: true }, // structured content
  },
  { timestamps: true }
);

aiTemplateSchema.index({ schoolId: 1, templateType: 1, createdBy: 1 });

export default mongoose.model("AiTemplate", aiTemplateSchema);
