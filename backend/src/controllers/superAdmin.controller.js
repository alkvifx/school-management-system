import User from "../models/user.model.js";
import School from "../models/school.model.js";
import bcrypt from "bcryptjs";
import { isValidEmail, isValidPassword } from "../utils/validators.js";
import { asyncHandler } from "../middlewares/error.middleware.js";
import { generateOTP, hashOTP, getOTPExpiration } from "../utils/otpHelper.js";
import { sendEmailVerificationOTP } from "../utils/emailService.js";

// @desc    Create a new school
// @route   POST /api/super-admin/create-school
// @access  SUPER_ADMIN
export const createSchool = asyncHandler(async (req, res) => {
  const { name, address, phone, email } = req.body;

  if (!name || !address || !phone || !email) {
    return res.status(400).json({
      success: false,
      message: "Name, address, phone, and email are required",
    });
  }

  const school = await School.create({
    name: name.trim(),
    address: address.trim(),
    phone: phone.trim(),
    email: email.trim().toLowerCase(),
  });

  res.status(201).json({
    success: true,
    message: "School created successfully",
    data: school,
  });
});

// @desc    Create a principal user
// @route   POST /api/super-admin/create-principal
// @access  SUPER_ADMIN
export const createPrincipal = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Validation
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Name, email, and password are required",
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

  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: "User with this email already exists",
    });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Generate email verification OTP
  const otp = generateOTP();
  const hashedOTP = await hashOTP(otp);
  const otpExpires = getOTPExpiration();

  // Create principal user
  const principal = await User.create({
    name: name.trim(),
    email: email.toLowerCase(),
    password: hashedPassword,
    role: "PRINCIPAL",
    schoolId: null, // Will be assigned when assigned to a school
    isEmailVerified: false,
    emailVerificationOTP: hashedOTP,
    emailVerificationOTPExpires: otpExpires,
  });

  // Send verification email
  try {
    await sendEmailVerificationOTP(principal.email, principal.name, otp);
  } catch (error) {
    console.error("Failed to send verification email:", error);
    // Continue even if email fails - OTP is still stored
  }

  res.status(201).json({
    success: true,
    message: "Principal created successfully. Please check your email to verify your account.",
    data: {
      id: principal._id,
      name: principal.name,
      email: principal.email,
      role: principal.role,
      isEmailVerified: principal.isEmailVerified,
    },
  });
});

// @desc    Assign principal to a school
// @route   POST /api/super-admin/assign-principal
// @access  SUPER_ADMIN
export const assignPrincipal = asyncHandler(async (req, res) => {
  const { principalId, schoolId } = req.body;

  if (!principalId || !schoolId) {
    return res.status(400).json({
      success: false,
      message: "Principal ID and School ID are required",
    });
  }

  // Verify principal exists and is a PRINCIPAL
  const principal = await User.findById(principalId);
  if (!principal) {
    return res.status(404).json({
      success: false,
      message: "Principal not found",
    });
  }

  if (principal.role !== "PRINCIPAL") {
    return res.status(400).json({
      success: false,
      message: "User is not a principal",
    });
  }

  // Verify school exists
  const school = await School.findById(schoolId);
  if (!school) {
    return res.status(404).json({
      success: false,
      message: "School not found",
    });
  }

  // Check if school already has a principal
  if (school.principalId) {
    const existingPrincipal = await User.findById(school.principalId);
    return res.status(400).json({
      success: false,
      message: `School already has a principal: ${existingPrincipal.name}`,
    });
  }

  // Assign principal to school
  school.principalId = principalId;
  await school.save();

  // Update principal's schoolId
  principal.schoolId = schoolId;
  await principal.save();

  res.status(200).json({
    success: true,
    message: "Principal assigned to school successfully",
    data: {
      school: {
        id: school._id,
        name: school.name,
        principalId: school.principalId,
      },
      principal: {
        id: principal._id,
        name: principal.name,
        email: principal.email,
        schoolId: principal.schoolId,
      },
    },
  });
});

// @desc    Get all schools with their principals
// @route   GET /api/super-admin/schools
// @access  SUPER_ADMIN
export const getAllSchools = asyncHandler(async (req, res) => {
  const schools = await School.find().populate("principalId", "name email");
  res.status(200).json({
    success: true,
    data: schools,
  });
});

// @desc    Get all principals
// @route   GET /api/super-admin/principals
// @access  SUPER_ADMIN
export const getAllPrincipals = asyncHandler(async (req, res) => {
  const principals = await User.find({ role: "PRINCIPAL" }).select("name email schoolId");
  res.status(200).json({
    success: true,
    data: principals,
  });
});