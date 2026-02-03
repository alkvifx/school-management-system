import express from "express";
import {
  login,
  verifyEmailOTP,
  forgotPassword,
  resetPassword,
  resendVerificationOTP,
} from "../controllers/auth.controllers.js";
import { rateLimitOTP } from "../middlewares/rateLimit.middleware.js";

const router = express.Router();

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post("/login", login);

// @route   POST /api/auth/verify-email-otp
// @desc    Verify email with OTP
// @access  Public
router.post("/verify-email-otp", rateLimitOTP(5, 1 * 60 * 1000), verifyEmailOTP);

// @route   POST /api/auth/resend-verification-otp
// @desc    Resend email verification OTP
// @access  Public
router.post("/resend-verification-otp", rateLimitOTP(5, 1 * 60 * 1000), resendVerificationOTP);

// @route   POST /api/auth/forgot-password
// @desc    Request password reset OTP
// @access  Public
router.post("/forgot-password", rateLimitOTP(5, 1 * 60 * 1000), forgotPassword);

// @route   POST /api/auth/reset-password
// @desc    Reset password with OTP
// @access  Public
router.post("/reset-password", rateLimitOTP(5, 1 * 60 * 1000), resetPassword);

export default router;
