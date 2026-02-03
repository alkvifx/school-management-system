import express from "express";
import {
  getMyProfile,
  updateProfile,
  sendProfileOTP,
  verifyProfileOTP,
} from "../controllers/profile.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { rateLimitOTP } from "../middlewares/rateLimit.middleware.js";
import { uploadProfileImage } from "../middlewares/upload.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// @route   GET /api/profile/me
// @desc    Get current user's profile
// @access  Protected
router.get("/me", getMyProfile);

// @route   PUT /api/profile/update
// @desc    Update profile (name, profile image)
// @access  Protected
router.put("/update", uploadProfileImage.single("profileImage"), updateProfile);

// @route   POST /api/profile/send-otp
// @desc    Send OTP for email/phone update
// @access  Protected
router.post("/send-otp", rateLimitOTP(5, 15 * 60 * 1000), sendProfileOTP);

// @route   POST /api/profile/verify-otp
// @desc    Verify OTP and update email/phone
// @access  Protected
router.post("/verify-otp", verifyProfileOTP);

export default router;
