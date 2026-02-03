import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    role: {
      type: String,
      enum: ["SUPER_ADMIN", "PRINCIPAL", "TEACHER", "STUDENT"],
      required: [true, "Role is required"],
    },
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    // Profile image
    profileImage: {
      url: {
        type: String,
        default: null,
      },
      publicId: {
        type: String,
        default: null,
      },
    },
    // Phone number
    phone: {
      type: String,
      default: null,
      trim: true,
    },
    // Email verification fields
    isEmailVerified: {
      type: Boolean,
      default: true,
    },
    emailVerificationOTP: {
      type: String,
      default: null,
    },
    emailVerificationOTPExpires: {
      type: Date,
      default: null,
    },
    // Phone verification fields
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    phoneOTP: {
      type: String,
      default: null,
    },
    phoneOTPExpires: {
      type: Date,
      default: null,
    },
    // Pending updates (for OTP verification flow)
    pendingEmail: {
      type: String,
      default: null,
      lowercase: true,
      trim: true,
    },
    pendingEmailOTP: {
      type: String,
      default: null,
    },
    pendingEmailOTPExpires: {
      type: Date,
      default: null,
    },
    pendingPhone: {
      type: String,
      default: null,
      trim: true,
    },
    pendingPhoneOTP: {
      type: String,
      default: null,
    },
    pendingPhoneOTPExpires: {
      type: Date,
      default: null,
    },
    // Password reset fields
    passwordResetOTP: {
      type: String,
      default: null,
    },
    passwordResetOTPExpires: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);
