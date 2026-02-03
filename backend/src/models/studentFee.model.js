import mongoose from "mongoose";

const paymentHistorySchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: [true, "Payment amount is required"],
      min: [0, "Payment amount cannot be negative"],
    },
    paymentMode: {
      type: String,
      enum: ["cash", "online", "UPI", "bank"],
      required: [true, "Payment mode is required"],
    },
    referenceId: {
      type: String,
      default: null,
      trim: true,
    },
    paidAt: {
      type: Date,
      default: Date.now,
    },
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { _id: true }
);

const studentFeeSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: [true, "School ID is required"],
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: [true, "Student ID is required"],
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
    feeStructureId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FeeStructure",
      required: [true, "Fee structure ID is required"],
    },
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Total amount cannot be negative"],
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: [0, "Paid amount cannot be negative"],
    },
    pendingAmount: {
      type: Number,
      required: true,
      min: [0, "Pending amount cannot be negative"],
    },
    status: {
      type: String,
      enum: ["PAID", "PARTIAL", "UNPAID", "OVERDUE"],
      default: "UNPAID",
      required: true,
    },
    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
    },
    lastPaymentDate: {
      type: Date,
      default: null,
    },
    lateFineApplied: {
      type: Number,
      default: 0,
      min: [0, "Late fine cannot be negative"],
    },
    paymentHistory: [paymentHistorySchema],
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
studentFeeSchema.index({ schoolId: 1, studentId: 1, academicYear: 1 });
studentFeeSchema.index({ schoolId: 1, classId: 1, status: 1 });
studentFeeSchema.index({ schoolId: 1, status: 1, dueDate: 1 });
studentFeeSchema.index({ studentId: 1, academicYear: 1 });

// Pre-save hook to calculate pendingAmount and update status
studentFeeSchema.pre("save", function () {
  // Calculate pending amount
  this.pendingAmount = this.totalAmount - this.paidAmount;

  // Update status based on payment
  if (this.paidAmount === 0) {
    this.status = "UNPAID";
  } else if (this.paidAmount >= this.totalAmount) {
    this.status = "PAID";
    this.pendingAmount = 0;
  } else {
    this.status = "PARTIAL";
  }

  // Check if overdue (will be updated by cron job, but set initial status)
  if (this.status !== "PAID" && new Date() > this.dueDate) {
    this.status = "OVERDUE";
  }

});

export default mongoose.model("StudentFee", studentFeeSchema);
