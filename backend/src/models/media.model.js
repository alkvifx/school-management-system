import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: [true, "Media URL is required"],
    },
    publicId: {
      type: String,
      required: [true, "Cloudinary public ID is required"],
    },
    type: {
      type: String,
      enum: ["image", "video"],
      required: [true, "Media type is required"],
    },
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    filename: {
      type: String,
      trim: true,
    },
    size: {
      type: Number, // in bytes
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
mediaSchema.index({ schoolId: 1, type: 1 });
mediaSchema.index({ schoolId: 1, uploadedBy: 1 });

export default mongoose.model("Media", mediaSchema);
