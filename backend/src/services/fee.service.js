import FeeStructure from "../models/feeStructure.model.js";
import StudentFee from "../models/studentFee.model.js";
import Student from "../models/student.model.js";
import Class from "../models/class.model.js";
import School from "../models/school.model.js";

/**
 * Create a fee structure for a class
 */
export const createFeeStructure = async (data) => {
  const {
    schoolId,
    classId,
    academicYear,
    feeType,
    components = {},
    dueDate,
    lateFinePerDay,
  } = data;

  // Verify class exists and belongs to school
  const classDoc = await Class.findById(classId);
  if (!classDoc || classDoc.schoolId.toString() !== schoolId.toString()) {
    throw new Error("Class not found or does not belong to the school");
  }

  // Prevent duplicate active fee structures
  const existing = await FeeStructure.findOne({
    schoolId,
    classId,
    academicYear,
    feeType,
    isActive: true,
  });

  if (existing) {
    throw new Error(
      "Fee structure already exists for this class, academic year, and fee type"
    );
  }

  // Normalize components (extra safety)
  const normalizedComponents = {
    tuitionFee: Number(components.tuitionFee) || 0,
    examFee: Number(components.examFee) || 0,
    transportFee: Number(components.transportFee) || 0,
    otherFee: Number(components.otherFee) || 0,
  };

  if (normalizedComponents.tuitionFee < 0) {
    throw new Error("Tuition fee cannot be negative");
  }

  const totalAmount =
    normalizedComponents.tuitionFee +
    normalizedComponents.examFee +
    normalizedComponents.transportFee +
    normalizedComponents.otherFee;

  const feeStructure = await FeeStructure.create({
    schoolId,
    classId,
    academicYear,
    feeType,
    components: normalizedComponents,
    totalAmount,
    dueDate: new Date(dueDate),
    lateFinePerDay: Number(lateFinePerDay) || 0,
    isActive: true,
  });

  return feeStructure;
};


/**
 * Update fee structure
 */
export const updateFeeStructure = async (id, schoolId, data) => {
  const feeStructure = await FeeStructure.findOne({
    _id: id,
    schoolId,
    isActive: true,
  });

  if (!feeStructure) {
    throw new Error("Fee structure not found");
  }

  const {
    classId,
    academicYear,
    feeType,
    components,
    dueDate,
    lateFinePerDay,
  } = data;

  if (Array.isArray(components)) {
    // Frontend sends array format - normalize it
    const normalizedComponents = {
      tuitionFee: 0,
      examFee: 0,
      transportFee: 0,
      otherFee: 0,
    };

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

    // Replace whole object (important for Mongoose)
    feeStructure.components = normalizedComponents;
    feeStructure.markModified("components");
  } else if (typeof components === 'object' && components !== null) {
    // Backend sends object format - merge with existing
    feeStructure.components = {
      ...feeStructure.components,
      tuitionFee: Number(components.tuitionFee) ?? feeStructure.components.tuitionFee,
      examFee: Number(components.examFee) ?? feeStructure.components.examFee,
      transportFee: Number(components.transportFee) ?? feeStructure.components.transportFee,
      otherFee: Number(components.otherFee) ?? feeStructure.components.otherFee,
    };
    feeStructure.markModified("components");
  }

  if (classId) feeStructure.classId = classId;
  if (academicYear) feeStructure.academicYear = academicYear;
  if (feeType) feeStructure.feeType = feeType;
  if (dueDate) feeStructure.dueDate = new Date(dueDate);
  if (lateFinePerDay != null)
    feeStructure.lateFinePerDay = Number(lateFinePerDay);
  if (data.isActive !== undefined) feeStructure.isActive = Boolean(data.isActive);

  // Recalculate totalAmount after components update
  feeStructure.totalAmount =
    feeStructure.components.tuitionFee +
    feeStructure.components.examFee +
    feeStructure.components.transportFee +
    feeStructure.components.otherFee;

  await feeStructure.save();
  return feeStructure;
};


/**
 * Get fee structures for a school/class
 */
export const getFeeStructures = async (filters) => {
  const query = { isActive: true };
  if (filters.schoolId) query.schoolId = filters.schoolId;
  if (filters.classId) query.classId = filters.classId;
  if (filters.academicYear) query.academicYear = filters.academicYear;
  if (filters.feeType) query.feeType = filters.feeType;

  const feeStructures = await FeeStructure.find(query)
    .populate("classId", "name section")
    .sort({ createdAt: -1 });

  return feeStructures;
};

/**
 * Initialize student fees based on fee structure
 * This creates StudentFee records for all students in a class
 */
export const initializeStudentFees = async (feeStructureId, schoolId) => {
  const feeStructure = await FeeStructure.findById(feeStructureId);

  if (!feeStructure) {
    throw new Error("Fee structure not found");
  }

  if (feeStructure.schoolId.toString() !== schoolId.toString()) {
    throw new Error("Not authorized");
  }

  // Get all active students in the class
  const students = await Student.find({
    schoolId,
    classId: feeStructure.classId,
    isActive: true,
  });

  const studentFees = [];

  for (const student of students) {
    // Check if fee record already exists
    const existing = await StudentFee.findOne({
      schoolId,
      studentId: student._id,
      academicYear: feeStructure.academicYear,
      feeStructureId: feeStructure._id,
    });

    if (!existing) {
      const studentFee = await StudentFee.create({
        schoolId,
        studentId: student._id,
        classId: feeStructure.classId,
        academicYear: feeStructure.academicYear,
        feeStructureId: feeStructure._id,
        totalAmount: feeStructure.totalAmount,
        paidAmount: 0,
        pendingAmount: feeStructure.totalAmount,
        status: "UNPAID",
        dueDate: feeStructure.dueDate,
        lateFineApplied: 0,
        paymentHistory: [],
      });

      studentFees.push(studentFee);
    }
  }

  return studentFees;
};

/**
 * Collect fee payment (manual entry)
 */
export const collectFee = async (data) => {
  const { studentFeeId, amount, paymentMode, referenceId, paidBy } = data;

  const studentFee = await StudentFee.findById(studentFeeId).populate("studentId");

  if (!studentFee) {
    throw new Error("Student fee record not found");
  }

  // Validate payment amount
  if (amount <= 0) {
    throw new Error("Payment amount must be greater than 0");
  }

  if (amount > studentFee.pendingAmount) {
    throw new Error("Payment amount cannot exceed pending amount");
  }

  // Add payment to history
  studentFee.paymentHistory.push({
    amount,
    paymentMode,
    referenceId: referenceId || null,
    paidAt: new Date(),
    paidBy: paidBy || null,
  });

  // Update payment amounts
  studentFee.paidAmount += amount;
  studentFee.pendingAmount = studentFee.totalAmount - studentFee.paidAmount;
  studentFee.lastPaymentDate = new Date();

  // Update status
  if (studentFee.paidAmount >= studentFee.totalAmount) {
    studentFee.status = "PAID";
    studentFee.pendingAmount = 0;
  } else {
    studentFee.status = "PARTIAL";
  }

  // If paid and was overdue, remove overdue status
  if (studentFee.status === "PAID" && new Date() <= studentFee.dueDate) {
    studentFee.status = "PAID";
  }

  await studentFee.save();

  return studentFee;
};

/**
 * Get student fees
 */
export const getStudentFees = async (filters) => {
  const query = {};
  if (filters.schoolId) query.schoolId = filters.schoolId;
  if (filters.studentId) query.studentId = filters.studentId;
  if (filters.classId) query.classId = filters.classId;
  if (filters.academicYear) query.academicYear = filters.academicYear;
  if (filters.status) query.status = filters.status;

  const studentFees = await StudentFee.find(query)
    .populate("studentId", "userId")
    .populate({
      path: "studentId",
      populate: { path: "userId", select: "name email" },
    })
    .populate("classId", "name section")
    .populate("feeStructureId")
    .sort({ createdAt: -1 });

  return studentFees;
};

/**
 * Get fee defaulters (students with unpaid/overdue fees)
 */
export const getFeeDefaulters = async (schoolId, classId = null) => {
  const query = {
    schoolId,
    status: { $in: ["UNPAID", "PARTIAL", "OVERDUE"] },
  };

  if (classId) {
    query.classId = classId;
  }

  const defaulters = await StudentFee.find(query)
    .populate("studentId", "userId")
    .populate({
      path: "studentId",
      populate: { path: "userId", select: "name email" },
    })
    .populate("classId", "name section")
    .populate("feeStructureId")
    .sort({ dueDate: 1 });

  return defaulters;
};

/**
 * Calculate and update overdue fees
 * This is called by cron job daily
 */
export const updateOverdueFees = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find all unpaid/partial fees with due date passed
  const overdueFees = await StudentFee.find({
    status: { $in: ["UNPAID", "PARTIAL"] },
    dueDate: { $lt: today },
  }).populate("feeStructureId");

  let updatedCount = 0;

  for (const studentFee of overdueFees) {
    // Calculate late fine
    const daysOverdue = Math.floor(
      (today - new Date(studentFee.dueDate)) / (1000 * 60 * 60 * 24)
    );

    if (studentFee.feeStructureId && studentFee.feeStructureId.lateFinePerDay > 0) {
      const lateFine = daysOverdue * studentFee.feeStructureId.lateFinePerDay;
      studentFee.lateFineApplied = lateFine;
      // Update total amount to include late fine
      studentFee.totalAmount = studentFee.feeStructureId.totalAmount + lateFine;
      studentFee.pendingAmount = studentFee.totalAmount - studentFee.paidAmount;
    }

    // Update status to OVERDUE
    studentFee.status = "OVERDUE";
    await studentFee.save();
    updatedCount++;
  }

  return updatedCount;
};

/**
 * Get fee statistics for a school/class
 */
export const getFeeStatistics = async (schoolId, classId = null, academicYear = null) => {
  const query = { schoolId };
  if (classId) query.classId = classId;
  if (academicYear) query.academicYear = academicYear;

  const fees = await StudentFee.find(query);

  const stats = {
    total: fees.length,
    paid: fees.filter((f) => f.status === "PAID").length,
    partial: fees.filter((f) => f.status === "PARTIAL").length,
    unpaid: fees.filter((f) => f.status === "UNPAID").length,
    overdue: fees.filter((f) => f.status === "OVERDUE").length,
    totalAmount: fees.reduce((sum, f) => sum + f.totalAmount, 0),
    paidAmount: fees.reduce((sum, f) => sum + f.paidAmount, 0),
    pendingAmount: fees.reduce((sum, f) => sum + f.pendingAmount, 0),
    lateFineCollected: fees.reduce((sum, f) => sum + f.lateFineApplied, 0),
  };

  return stats;
};
