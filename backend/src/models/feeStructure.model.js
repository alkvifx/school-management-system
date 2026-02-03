import mongoose from "mongoose";

const feeStructureSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: [true, "School ID is required"],
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: [true, "Class ID is required"],
    },
    academicYear: {
      type: String,
      required: [true, "Academic year is required"],
      trim: true,
    },
    feeType: {
      type: String,
      enum: ["MONTHLY", "QUARTERLY", "YEARLY"],
      required: [true, "Fee type is required"],
    },
    components: {
      tuitionFee: {
        type: Number,
        required: [true, "Tuition fee is required"],
        min: [0, "Tuition fee cannot be negative"],
      },
      examFee: {
        type: Number,
        default: 0,
        min: [0, "Exam fee cannot be negative"],
      },
      transportFee: {
        type: Number,
        default: 0,
        min: [0, "Transport fee cannot be negative"],
      },
      otherFee: {
        type: Number,
        default: 0,
        min: [0, "Other fee cannot be negative"],
      },
    },
    totalAmount: {
      type: Number,
      required: true,
      min: [0, "Total amount cannot be negative"],
    },
    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
    },
    lateFinePerDay: {
      type: Number,
      default: 0,
      min: [0, "Late fine cannot be negative"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
feeStructureSchema.index({ schoolId: 1, classId: 1, academicYear: 1, feeType: 1 });
feeStructureSchema.index({ schoolId: 1, isActive: 1 });

// Pre-save hook to calculate totalAmount
feeStructureSchema.pre("save", function () {
  if (this.isModified("components")) {
    this.totalAmount =
      (this.components.tuitionFee || 0) +
      (this.components.examFee || 0) +
      (this.components.transportFee || 0) +
      (this.components.otherFee || 0);
  }
});

export default mongoose.model("FeeStructure", feeStructureSchema);
