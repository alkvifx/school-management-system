import User from "../models/user.model.js";
import Teacher from "../models/teacher.model.js";
import Student from "../models/student.model.js";
import Class from "../models/class.model.js";
import School from "../models/school.model.js";
import { asyncHandler } from "../middlewares/error.middleware.js";
import {
  generateOTP,
  hashOTP,
  compareOTP,
  isOTPExpired,
  getOTPExpiration,
} from "../utils/otpHelper.js";
import { sendEmailVerificationOTP } from "../utils/emailService.js";
import cloudinary from "../config/cloudinary.js";
import mongoose from "mongoose";

/**
 * Get current user's profile
 * @route   GET /api/profile/me
 * @access  Protected
 */
export const getMyProfile = asyncHandler(async (req, res) => {
  const user = req.user;

  // Populate role-specific data
  let profileData = {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone || null,
    role: user.role,
    profileImage: user.profileImage || null,
    isEmailVerified: user.isEmailVerified,
    isPhoneVerified: user.isPhoneVerified,
    schoolId: user.schoolId || null,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  // Add role-specific information
  if (user.role === "TEACHER") {
    const teacher = await Teacher.findOne({ userId: user._id })
      .populate("schoolId", "name")
      .populate("assignedClasses", "name section");
    
    if (teacher) {
      profileData.teacher = {
        qualification: teacher.qualification || null,
        experience: teacher.experience || null,
        subject: teacher.subject || null,
        assignedClasses: teacher.assignedClasses || [],
        photo: teacher.photo || null,
      };
      profileData.school = teacher.schoolId
        ? { id: teacher.schoolId._id, name: teacher.schoolId.name }
        : null;
    }
  } else if (user.role === "STUDENT") {
    const student = await Student.findOne({ userId: user._id })
      .populate("schoolId", "name")
      .populate("classId", "name section");
    
    if (student) {
      profileData.student = {
        rollNumber: student.rollNumber || null,
        parentPhone: student.parentPhone || null,
        parentName: student.parentName || null,
        photo: student.photo || null,
      };
      profileData.school = student.schoolId
        ? { id: student.schoolId._id, name: student.schoolId.name }
        : null;
      profileData.class = student.classId
        ? {
            id: student.classId._id,
            name: student.classId.name,
            section: student.classId.section,
          }
        : null;
    }
  } else if (user.role === "PRINCIPAL") {
    // Principal is just a User with role PRINCIPAL, no separate model
    if (user.schoolId) {
      const school = await School.findById(user.schoolId).select("name");
      profileData.school = school
        ? { id: school._id, name: school.name }
        : null;
    }
  }

  res.status(200).json({
    success: true,
    message: "Profile retrieved successfully",
    data: {
      profile: profileData,
    },
  });
});

/**
 * Update profile (name, profile image)
 * @route   PUT /api/profile/update
 * @access  Protected
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const user = req.user;
  const { name } = req.body;
  const file = req.file;

  // Validate name if provided
  if (name !== undefined) {
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Name cannot be empty",
      });
    }
    if (name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Name must be at least 2 characters",
      });
    }
  }

  // Update name if provided
  if (name !== undefined) {
    user.name = name.trim();
  }

  // Handle profile image upload
  if (file) {
    // Delete old image if exists
    if (user.profileImage?.publicId) {
      try {
        await cloudinary.uploader.destroy(user.profileImage.publicId);
      } catch (error) {
        console.error("Error deleting old profile image:", error);
        // Continue even if deletion fails
      }
    }

    // Store new image
    user.profileImage = {
      url: file.path,
      publicId: file.filename,
    };
  }

  await user.save();

  // Prepare response
  const profileData = {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone || null,
    role: user.role,
    profileImage: user.profileImage || null,
    isEmailVerified: user.isEmailVerified,
    isPhoneVerified: user.isPhoneVerified,
  };

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: {
      profile: profileData,
    },
  });
});

/**
 * Send OTP for email/phone update
 * @route   POST /api/profile/send-otp
 * @access  Protected
 */
export const sendProfileOTP = asyncHandler(async (req, res) => {
  const user = req.user;
  const { type, email, phone } = req.body;

  // Validation
  if (!type || !["email", "phone"].includes(type)) {
    return res.status(400).json({
      success: false,
      message: "Type must be 'email' or 'phone'",
    });
  }

  if (type === "email") {
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // Check if email is already in use by another user
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
      _id: { $ne: user._id },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email is already in use by another account",
      });
    }

    // Check if same as current email
    if (email.toLowerCase() === user.email.toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: "New email must be different from current email",
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const hashedOTP = await hashOTP(otp);
    const otpExpires = getOTPExpiration();

    // Store pending email and OTP
    user.pendingEmail = email.toLowerCase();
    user.pendingEmailOTP = hashedOTP;
    user.pendingEmailOTPExpires = otpExpires;
    await user.save();

    // Send OTP email
    try {
      await sendEmailVerificationOTP(email, user.name, otp);
      res.status(200).json({
        success: true,
        message: "Verification code has been sent to your new email address",
      });
    } catch (error) {
      console.error("Failed to send verification email:", error);
      // Clear OTP if email fails
      user.pendingEmail = null;
      user.pendingEmailOTP = null;
      user.pendingEmailOTPExpires = null;
      await user.save();
      return res.status(500).json({
        success: false,
        message: "Failed to send verification email. Please try again later.",
      });
    }
  } else if (type === "phone") {
    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    // Validate phone format (basic validation - adjust regex as needed)
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number format",
      });
    }

    // Check if phone is already in use by another user
    const existingUser = await User.findOne({
      phone: phone,
      _id: { $ne: user._id },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Phone number is already in use by another account",
      });
    }

    // Check if same as current phone
    if (user.phone && phone === user.phone) {
      return res.status(400).json({
        success: false,
        message: "New phone number must be different from current phone number",
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const hashedOTP = await hashOTP(otp);
    const otpExpires = getOTPExpiration();

    // Store pending phone and OTP
    user.pendingPhone = phone;
    user.pendingPhoneOTP = hashedOTP;
    user.pendingPhoneOTPExpires = otpExpires;
    await user.save();

    // For phone, we'll return OTP in response (in production, use SMS service)
    // TODO: Integrate SMS service (Twilio, AWS SNS, etc.)
    res.status(200).json({
      success: true,
      message: "Verification code generated",
      // In production, remove this and send via SMS
      data: {
        otp: process.env.NODE_ENV === "development" ? otp : undefined,
        note: process.env.NODE_ENV === "development"
          ? "OTP shown only in development. In production, this will be sent via SMS."
          : "OTP has been sent to your phone number",
      },
    });
  }
});

/**
 * Verify OTP and update email/phone
 * @route   POST /api/profile/verify-otp
 * @access  Protected
 */
export const verifyProfileOTP = asyncHandler(async (req, res) => {
  const user = req.user;
  const { type, otp } = req.body;

  // Validation
  if (!type || !["email", "phone"].includes(type)) {
    return res.status(400).json({
      success: false,
      message: "Type must be 'email' or 'phone'",
    });
  }

  if (!otp || !/^\d{6}$/.test(otp)) {
    return res.status(400).json({
      success: false,
      message: "OTP must be a 6-digit number",
    });
  }

  if (type === "email") {
    // Check if pending email exists
    if (!user.pendingEmail || !user.pendingEmailOTP) {
      return res.status(400).json({
        success: false,
        message: "No pending email update found. Please request a new OTP.",
      });
    }

    // Check if OTP expired
    if (isOTPExpired(user.pendingEmailOTPExpires)) {
      user.pendingEmail = null;
      user.pendingEmailOTP = null;
      user.pendingEmailOTPExpires = null;
      await user.save();
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one.",
      });
    }

    // Verify OTP
    const isOTPValid = await compareOTP(otp, user.pendingEmailOTP);

    if (!isOTPValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // Update email
    user.email = user.pendingEmail;
    user.isEmailVerified = true;
    user.pendingEmail = null;
    user.pendingEmailOTP = null;
    user.pendingEmailOTPExpires = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Email updated and verified successfully",
      data: {
        email: user.email,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } else if (type === "phone") {
    // Check if pending phone exists
    if (!user.pendingPhone || !user.pendingPhoneOTP) {
      return res.status(400).json({
        success: false,
        message: "No pending phone update found. Please request a new OTP.",
      });
    }

    // Check if OTP expired
    if (isOTPExpired(user.pendingPhoneOTPExpires)) {
      user.pendingPhone = null;
      user.pendingPhoneOTP = null;
      user.pendingPhoneOTPExpires = null;
      await user.save();
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one.",
      });
    }

    // Verify OTP
    const isOTPValid = await compareOTP(otp, user.pendingPhoneOTP);

    if (!isOTPValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // Update phone
    user.phone = user.pendingPhone;
    user.isPhoneVerified = true;
    user.pendingPhone = null;
    user.pendingPhoneOTP = null;
    user.pendingPhoneOTPExpires = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Phone number updated and verified successfully",
      data: {
        phone: user.phone,
        isPhoneVerified: user.isPhoneVerified,
      },
    });
  }
});
