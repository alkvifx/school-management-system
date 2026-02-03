import mongoose from "mongoose";
import Class from "../models/class.model.js";
import Teacher from "../models/teacher.model.js";
import Student from "../models/student.model.js";
import { asyncHandler } from "./error.middleware.js";

/**
 * Middleware to validate chat access for a class
 * - Teacher: Must be assigned to the class
 * - Student: Must belong to the class
 */
export const validateChatAccess = asyncHandler(async (req, res, next) => {
  const { classId } = req.params;
  const user = req.user;

  // Validate classId format
  if (!classId || !mongoose.Types.ObjectId.isValid(classId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid class ID",
    });
  }

  // Find class
  const classDoc = await Class.findById(classId);
  if (!classDoc) {
    return res.status(404).json({
      success: false,
      message: "Class not found",
    });
  }

  // Check if class is active
  if (!classDoc.isActive) {
    return res.status(403).json({
      success: false,
      message: "Class is not active",
    });
  }

  // Validate access based on role
  if (user.role === "TEACHER") {
    // Find teacher profile
    const teacher = await Teacher.findOne({ userId: user._id });
    if (!teacher) {
      return res.status(403).json({
        success: false,
        message: "Teacher profile not found",
      });
    }

    // Check if teacher is assigned to this class
    const isAssigned = teacher.assignedClasses.some(
      (id) => id.toString() === classId
    );

    if (!isAssigned) {
      return res.status(403).json({
        success: false,
        message: "You are not assigned to this class",
      });
    }

    // Store teacher info for later use
    req.teacher = teacher;
  } else if (user.role === "STUDENT") {
    // Find student profile
    const student = await Student.findOne({ userId: user._id });
    if (!student) {
      return res.status(403).json({
        success: false,
        message: "Student profile not found",
      });
    }

    // Check if student belongs to this class
    if (student.classId.toString() !== classId) {
      return res.status(403).json({
        success: false,
        message: "You do not belong to this class",
      });
    }

    // Store student info for later use
    req.student = student;
  } else {
    return res.status(403).json({
      success: false,
      message: "Only teachers and students can access class chats",
    });
  }

  // Store class info
  req.classDoc = classDoc;
  next();
});
