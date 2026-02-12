import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { isValidEmail, isValidPassword } from "../utils/validators.js";
import { asyncHandler } from "../middlewares/error.middleware.js";
import { generateOTP, hashOTP, compareOTP, isOTPExpired, getOTPExpiration } from "../utils/otpHelper.js";
import { sendEmailVerificationOTP, sendPasswordResetOTP } from "../utils/emailService.js";

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      message: "Invalid email format",
    });
  }

  if (!isValidPassword(password)) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters",
    });
  }

  // Find user
  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  // Check if user is active
  if (!user.isActive) {
    return res.status(401).json({
      success: false,
      message: "Account is inactive. Please contact administrator",
    });
  }

  // Check email verification for PRINCIPAL, TEACHER, and STUDENT
  if (["PRINCIPAL", "TEACHER", "STUDENT"].includes(user.role) && !user.isEmailVerified) {
    return res.status(403).json({
      success: false,
      message: "Please verify your email address before logging in. Check your email for the verification code.",
    });
  }

  // Verify password
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  // Generate token
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || "7d" }
  );

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        schoolId: user.schoolId,
        isEmailVerified: user.isEmailVerified,
      },
    },
  });
});

// @desc    Verify email with OTP
// @route   POST /api/auth/verify-email-otp
// @access  Public
export const verifyEmailOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  // Validation
  if (!email || !otp) {
    return res.status(400).json({
      success: false,
      message: "Email and OTP are required",
    });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      message: "Invalid email format",
    });
  }

  if (!/^\d{6}$/.test(otp)) {
    return res.status(400).json({
      success: false,
      message: "OTP must be a 6-digit number",
    });
  }

  // Find user
  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  // Check if already verified
  if (user.isEmailVerified) {
    return res.status(400).json({
      success: false,
      message: "Email is already verified",
    });
  }

  // Check if OTP exists
  if (!user.emailVerificationOTP) {
    return res.status(400).json({
      success: false,
      message: "No verification OTP found. Please request a new one.",
    });
  }

  // Check if OTP expired
  if (isOTPExpired(user.emailVerificationOTPExpires)) {
    return res.status(400).json({
      success: false,
      message: "OTP has expired. Please request a new one.",
    });
  }

  // Verify OTP
  const isOTPValid = await compareOTP(otp, user.emailVerificationOTP);

  if (!isOTPValid) {
    return res.status(400).json({
      success: false,
      message: "Invalid OTP",
    });
  }

  // Update user
  user.isEmailVerified = true;
  user.emailVerificationOTP = null;
  user.emailVerificationOTPExpires = null;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Email verified successfully",
    data: {
      id: user._id,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
    },
  });
});

// @desc    Request password reset OTP
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // Validation
  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      message: "Invalid email format",
    });
  }

  // Find user (only PRINCIPAL, TEACHER, STUDENT can reset password)
  const user = await User.findOne({
    email: email.toLowerCase(),
    role: { $in: ["PRINCIPAL", "TEACHER", "STUDENT"] },
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "No account found with this email address.",
    });
  }

  if (!user.isActive) {
    return res.status(401).json({
      success: false,
      message: "Account is inactive. Please contact the school administrator.",
    });
  }

  // Generate password reset OTP
  const otp = generateOTP();
  const hashedOTP = await hashOTP(otp);
  const otpExpires = getOTPExpiration();

  // Update user with reset OTP
  user.passwordResetOTP = hashedOTP;
  user.passwordResetOTPExpires = otpExpires;
  await user.save();

  // Send password reset email
  try {
    await sendPasswordResetOTP(user.email, user.name, otp);
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    // Clear OTP if email fails
    user.passwordResetOTP = null;
    user.passwordResetOTPExpires = null;
    await user.save();
    return res.status(500).json({
      success: false,
      message: "Failed to send password reset email. Please try again later.",
    });
  }

  res.status(200).json({
    success: true,
    message: "Password reset code has been sent to your email.",
  });
});

// @desc    Reset password with OTP
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  // Validation
  if (!email || !otp || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Email, OTP, and new password are required",
    });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      message: "Invalid email format",
    });
  }

  if (!/^\d{6}$/.test(otp)) {
    return res.status(400).json({
      success: false,
      message: "OTP must be a 6-digit number",
    });
  }

  if (!isValidPassword(newPassword)) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters",
    });
  }

  // Find user
  const user = await User.findOne({
    email: email.toLowerCase(),
    role: { $in: ["PRINCIPAL", "TEACHER", "STUDENT"] },
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  // Check if user is active
  if (!user.isActive) {
    return res.status(401).json({
      success: false,
      message: "Account is inactive. Please contact administrator",
    });
  }

  // Check if OTP exists
  if (!user.passwordResetOTP) {
    return res.status(400).json({
      success: false,
      message: "No password reset OTP found. Please request a new one.",
    });
  }

  // Check if OTP expired
  if (isOTPExpired(user.passwordResetOTPExpires)) {
    return res.status(400).json({
      success: false,
      message: "OTP has expired. Please request a new one.",
    });
  }

  // Verify OTP
  const isOTPValid = await compareOTP(otp, user.passwordResetOTP);

  if (!isOTPValid) {
    return res.status(400).json({
      success: false,
      message: "Invalid OTP",
    });
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update password and clear OTP fields
  user.password = hashedPassword;
  user.passwordResetOTP = null;
  user.passwordResetOTPExpires = null;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password reset successfully. Please login with your new password.",
  });
});

// @desc    Resend email verification OTP
// @route   POST /api/auth/resend-verification-otp
// @access  Public
export const resendVerificationOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // Validation
  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      message: "Invalid email format",
    });
  }

  // Find user
  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  // Check if already verified
  if (user.isEmailVerified) {
    return res.status(400).json({
      success: false,
      message: "Email is already verified",
    });
  }

  // Only allow resend for PRINCIPAL, TEACHER, STUDENT
  if (!["PRINCIPAL", "TEACHER", "STUDENT"].includes(user.role)) {
    return res.status(403).json({
      success: false,
      message: "Email verification is not required for this account type",
    });
  }

  // Generate new OTP
  const otp = generateOTP();
  const hashedOTP = await hashOTP(otp);
  const otpExpires = getOTPExpiration();

  // Update user with new OTP
  user.emailVerificationOTP = hashedOTP;
  user.emailVerificationOTPExpires = otpExpires;
  await user.save();

  // Send verification email
  try {
    await sendEmailVerificationOTP(user.email, user.name, otp);
    res.status(200).json({
      success: true,
      message: "Verification code has been resent to your email",
    });
  } catch (error) {
    console.error("Failed to send verification email:", error);
    // Clear OTP if email fails
    user.emailVerificationOTP = null;
    user.emailVerificationOTPExpires = null;
    await user.save();
    return res.status(500).json({
      success: false,
      message: "Failed to send verification email. Please try again later.",
    });
  }
});
