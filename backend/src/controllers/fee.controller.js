import { asyncHandler } from "../middlewares/error.middleware.js";
import * as feeService from "../services/fee.service.js";
import * as notificationService from "../services/notification.service.js";
import FeeStructure from "../models/feeStructure.model.js";
import StudentFee from "../models/studentFee.model.js";
import Student from "../models/student.model.js";
import Class from "../models/class.model.js";
import mongoose from "mongoose";

// @desc    Create fee structure
// @route   POST /api/fees/structure
// @access  PRINCIPAL
export const createFeeStructure = asyncHandler(async (req, res) => {
  const { classId, academicYear, feeType, components, dueDate, lateFinePerDay } = req.body;
  const principal = req.user;

  if (!classId || !academicYear || !feeType || !components || !dueDate) {
    return res.status(400).json({
      success: false,
      message: "All required fields must be provided",
    });
  }


  if (!["MONTHLY", "QUARTERLY", "YEARLY"].includes(feeType)) {
    return res.status(400).json({
      success: false,
      message: "Fee type must be MONTHLY, QUARTERLY, or YEARLY",
    });
  }


  // Normalize components - handle both array and object formats
  let normalizedComponents = {
    tuitionFee: 0,
    examFee: 0,
    transportFee: 0,
    otherFee: 0,
  };

  if (Array.isArray(components)) {
    // Frontend sends array format
    components.forEach((c) => {
      if (c?.name && c.amount >= 0) {
        const normalizedName = c.name
          .toLowerCase()
          .replace(/\s+/g, '')
          .replace(/fee$/, 'Fee')
          .replace(/^(\w)/, (m) => m.toLowerCase());
        
        // Map common variations to standard names
        const nameMap = {
          'tuitionfee': 'tuitionFee',
          'tuition': 'tuitionFee',
          'examfee': 'examFee',
          'examinationfee': 'examFee',
          'examination': 'examFee',
          'transportfee': 'transportFee',
          'transport': 'transportFee',
          'otherfee': 'otherFee',
          'other': 'otherFee',
          'libraryfee': 'otherFee',
          'sportsfee': 'otherFee',
        };
        
        const mappedName = nameMap[normalizedName] || 'otherFee';
        normalizedComponents[mappedName] = (normalizedComponents[mappedName] || 0) + Number(c.amount);
      }
    });
  } else if (typeof components === 'object' && components !== null) {
    // Backend/API sends object format
    normalizedComponents = {
      tuitionFee: Number(components.tuitionFee) || 0,
      examFee: Number(components.examFee) || 0,
      transportFee: Number(components.transportFee) || 0,
      otherFee: Number(components.otherFee) || 0,
    };
  } else {
    return res.status(400).json({
      success: false,
      message: "Fee components are required",
    });
  }

  if (normalizedComponents.tuitionFee <= 0) {
    return res.status(400).json({
      success: false,
      message: "Tuition fee is required and must be greater than 0",
    });
  }

  if (!principal.schoolId) {
    return res.status(403).json({
      success: false,
      message: "Principal not assigned to any school",
    });
  }


  const feeStructure = await feeService.createFeeStructure({
    schoolId: principal.schoolId,
    classId,
    academicYear,
    feeType,
    components: normalizedComponents,
    dueDate,
    lateFinePerDay: Number(lateFinePerDay) || 0,
  });


  res.status(201).json({
    success: true,
    message: "Fee structure created successfully",
    data: feeStructure,
  });
});


// @desc    Update fee structure
// @route   PUT /api/fees/structure/:id
// @access  PRINCIPAL
export const updateFeeStructure = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const principal = req.user;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid fee structure ID",
    });
  }

  if (!principal?.schoolId) {
    return res.status(403).json({
      success: false,
      message: "Principal not assigned to any school",
    });
  }

  const feeStructure = await feeService.updateFeeStructure(
    id,
    principal.schoolId,
    req.body
  );

  res.status(200).json({
    success: true,
    message: "Fee structure updated successfully",
    data: feeStructure,
  });
});
// @desc    Get fee structures
// @route   GET /api/fees/structure
// @access  PRINCIPAL, TEACHER (read-only)
export const getFeeStructures = asyncHandler(async (req, res) => {
  const { classId, academicYear, feeType } = req.query;
  const user = req.user;

  if (!user.schoolId) {
    return res.status(403).json({
      success: false,
      message: "User not assigned to any school",
    });
  }

  const feeStructures = await feeService.getFeeStructures({
    schoolId: user.schoolId,
    classId,
    academicYear,
    feeType,
  });

  res.status(200).json({
    success: true,
    data: feeStructures,
  });
});

// @desc    Initialize student fees from fee structure
// @route   POST /api/fees/initialize
// @access  PRINCIPAL
export const initializeStudentFees = asyncHandler(async (req, res) => {
  const { structureId } = req.body;
  const principal = req.user;


  if (!structureId) {
    return res.status(400).json({
      success: false,
      message: "Fee structure ID is required",
    });
  }

  if (!principal.schoolId) {
    return res.status(403).json({
      success: false,
      message: "Principal not assigned to any school",
    });
  }

  try {
    const studentFees = await feeService.initializeStudentFees(
      structureId,
      principal.schoolId
    );

    res.status(201).json({
      success: true,
      message: `Student fees initialized for ${studentFees.length} students`,
      data: {
        count: studentFees.length,
        studentFees,
      },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// @desc    Collect fee payment
// @route   POST /api/fees/collect
// @access  PRINCIPAL
export const collectFee = asyncHandler(async (req, res) => {
  const { studentFeeId, amount, paymentMode, referenceId } = req.body;
  const principal = req.user;

  // Validation
  if (!studentFeeId || !amount || !paymentMode) {
    return res.status(400).json({
      success: false,
      message: "Student fee ID, amount, and payment mode are required",
    });
  }

  if (!["cash", "online", "UPI", "bank"].includes(paymentMode)) {
    return res.status(400).json({
      success: false,
      message: "Payment mode must be cash, online, UPI, or bank",
    });
  }

  if (amount <= 0) {
    return res.status(400).json({
      success: false,
      message: "Payment amount must be greater than 0",
    });
  }

  try {
    const studentFee = await feeService.collectFee({
      studentFeeId,
      amount,
      paymentMode,
      referenceId,
      paidBy: principal._id,
    });

    res.status(200).json({
      success: true,
      message: "Fee collected successfully",
      data: studentFee,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// @desc    Get student fees
// @route   GET /api/fees/student/:studentId
// @access  PRINCIPAL, TEACHER, STUDENT (own fees only)
export const getStudentFees = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { academicYear, status } = req.query;
  const user = req.user;

  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid student ID",
    });
  }

  if (!user.schoolId) {
    return res.status(403).json({
      success: false,
      message: "User not assigned to any school",
    });
  }

  // If student, can only view own fees
  if (user.role === "STUDENT") {
    const student = await Student.findOne({ userId: user._id });
    if (!student || student._id.toString() !== studentId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this student's fees",
      });
    }
  }

  const studentFees = await feeService.getStudentFees({
    schoolId: user.schoolId,
    studentId,
    academicYear,
    status,
  });

  res.status(200).json({
    success: true,
    data: studentFees,
  });
});

// @desc    Get fees by class
// @route   GET /api/fees/class/:classId
// @access  PRINCIPAL, TEACHER
export const getClassFees = asyncHandler(async (req, res) => {
  const { classId } = req.params;
  const { academicYear, status } = req.query;
  const user = req.user;

  if (!mongoose.Types.ObjectId.isValid(classId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid class ID",
    });
  }

  if (!user.schoolId) {
    return res.status(403).json({
      success: false,
      message: "User not assigned to any school",
    });
  }

  // Verify class belongs to school
  const classDoc = await Class.findById(classId);
  if (!classDoc || classDoc.schoolId.toString() !== user.schoolId.toString()) {
    return res.status(403).json({
      success: false,
      message: "Class not found or does not belong to your school",
    });
  }

  const studentFees = await feeService.getStudentFees({
    schoolId: user.schoolId,
    classId,
    academicYear,
    status,
  });

  res.status(200).json({
    success: true,
    data: studentFees,
  });
});

// @desc    Get fee defaulters
// @route   GET /api/fees/defaulters
// @access  PRINCIPAL, TEACHER
export const getFeeDefaulters = asyncHandler(async (req, res) => {
  const { classId } = req.query;
  const user = req.user;

  if (!user.schoolId) {
    return res.status(403).json({
      success: false,
      message: "User not assigned to any school",
    });
  }

  const defaulters = await feeService.getFeeDefaulters(
    user.schoolId,
    classId || null
  );

  res.status(200).json({
    success: true,
    data: defaulters,
    count: defaulters.length,
  });
});

// @desc    Send fee reminder
// @route   POST /api/fees/send-reminder
// @access  PRINCIPAL
export const sendFeeReminder = asyncHandler(async (req, res) => {
  const { classId, studentId, onlyDefaulters } = req.body;
  const principal = req.user;

  if (!principal.schoolId) {
    return res.status(403).json({
      success: false,
      message: "Principal not assigned to any school",
    });
  }

  try {
    const io = req.app.get("io");
    const result = await notificationService.sendFeeReminders({
      schoolId: principal.schoolId,
      classId: classId || null,
      studentId: studentId || null,
      onlyDefaulters: onlyDefaulters || false,
      createdBy: principal._id,
      io,
    });

    res.status(200).json({
      success: true,
      message: `Fee reminders sent to ${result.success} student(s)`,
      data: {
        sent: result.success,
        failed: result.failed,
        errors: result.errors,
      },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// @desc    Get fee statistics
// @route   GET /api/fees/statistics
// @access  PRINCIPAL, TEACHER
export const getFeeStatistics = asyncHandler(async (req, res) => {
  const { classId, academicYear } = req.query;
  const user = req.user;

  if (!user.schoolId) {
    return res.status(403).json({
      success: false,
      message: "User not assigned to any school",
    });
  }

  const stats = await feeService.getFeeStatistics(
    user.schoolId,
    classId || null,
    academicYear || null
  );

  res.status(200).json({
    success: true,
    data: stats,
  });
});

// @desc    Toggle fee structure status (activate/deactivate)
// @route   PATCH /api/fees/structure/:id/status
// @access  PRINCIPAL
export const toggleFeeStructureStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;
  const principal = req.user;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid fee structure ID",
    });
  }

  if (!principal.schoolId) {
    return res.status(403).json({
      success: false,
      message: "Principal not assigned to any school",
    });
  }

  try {
    const feeStructure = await feeService.updateFeeStructure(id, principal.schoolId, {
      isActive: Boolean(isActive),
    });

    res.status(200).json({
      success: true,
      message: `Fee structure ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: feeStructure,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// @desc    Get own fees (for students)
// @route   GET /api/fees/my-fees
// @access  STUDENT
export const getMyFees = asyncHandler(async (req, res) => {
  const user = req.user;
  const { academicYear, status } = req.query;

  if (user.role !== "STUDENT") {
    return res.status(403).json({
      success: false,
      message: "This endpoint is only for students",
    });
  }

  const student = await Student.findOne({ userId: user._id });

  if (!student) {
    return res.status(404).json({
      success: false,
      message: "Student profile not found",
    });
  }

  const studentFees = await feeService.getStudentFees({
    schoolId: user.schoolId,
    studentId: student._id,
    academicYear,
    status,
  });

  res.status(200).json({
    success: true,
    data: studentFees,
  });
});
