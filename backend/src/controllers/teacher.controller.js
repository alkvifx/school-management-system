import Teacher from "../models/teacher.model.js";
import Class from "../models/class.model.js";
import Student from "../models/student.model.js";
import Attendance from "../models/attendance.model.js";
import User from "../models/user.model.js";
import Marks from "../models/marks.model.js";
import Notification from "../models/notification.model.js";
import * as notificationService from "../services/notification.service.js";
import { logActivity } from "../services/activityLog.service.js";
import { asyncHandler } from "../middlewares/error.middleware.js";
import { isValidEmail, isValidPassword } from "../utils/validators.js";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { deleteFromCloudinary } from "../utils/cloudinaryHelper.js";

// @desc    Get teacher dashboard stats (total students, classes, attendance today, pending tasks)
// @route   GET /api/teacher/dashboard
// @access  TEACHER
export const getDashboard = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findOne({ userId: req.user._id });

  if (!teacher) {
    return res.status(404).json({
      success: false,
      message: "Teacher profile not found",
    });
  }

  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  const [totalStudents, totalClasses, attendanceToday, pendingTasks, recentStudents] = await Promise.all([
    Student.countDocuments({
      schoolId: teacher.schoolId,
      classId: { $in: teacher.assignedClasses },
      isActive: true,
    }),
    teacher.assignedClasses.length,
    Attendance.countDocuments({
      teacherId: teacher._id,
      date: today,
    }),
    Notification.countDocuments({
      userId: req.user._id,
      isRead: false,
    }).catch(() => 0),
    Student.find({
      schoolId: teacher.schoolId,
      classId: { $in: teacher.assignedClasses },
      isActive: true,
    })
      .populate("userId", "name email")
      .populate("classId", "name section")
      .select("rollNumber parentPhone")
      .sort({ rollNumber: 1 })
      .limit(10)
      .lean(),
  ]);

  res.status(200).json({
    success: true,
    message: "Dashboard data retrieved successfully",
    data: {
      totalStudents,
      totalClasses,
      attendanceToday,
      pendingTasks: pendingTasks || 0,
      recentStudents,
    },
  });
});

export const createStudent = asyncHandler(async (req, res) => {
  const { name, email, password, classId, rollNumber, parentPhone } = req.body;
  const teacher = req.user;

  // Validation
  if (!name || !email || !password || !classId || !rollNumber || !parentPhone) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
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

  // Verify teacher has a school
  if (!teacher.schoolId) {
    return res.status(403).json({
      success: false,
      message: "Teacher not assigned to any school",
    });
  }

  // Verify class exists and belongs to teacher's school
  const classDoc = await Class.findById(classId);
  if (!classDoc) {
    return res.status(404).json({
      success: false,
      message: "Class not found",
    });
  }

  if (classDoc.schoolId.toString() !== teacher.schoolId.toString()) {
    return res.status(403).json({
      success: false,
      message: "Class does not belong to your school",
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

  // Check if roll number already exists in class
  const existingStudent = await Student.findOne({
    classId,
    rollNumber,
  });
  if (existingStudent) {
    return res.status(400).json({
      success: false,
      message: "Roll number already exists in this class",
    });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create student user
  const studentUser = await User.create({
    name: name.trim(),
    email: email.toLowerCase(),
    password: hashedPassword,
    role: "STUDENT",
    schoolId: teacher.schoolId,
  });

  // Create student profile
  const studentProfile = await Student.create({
    userId: studentUser._id,
    schoolId: teacher.schoolId,
    classId,
    rollNumber,
    parentPhone: parentPhone.trim(),
  });

  res.status(201).json({
    success: true,
    message: "Student created successfully",
    data: {
      user: {
        id: studentUser._id,
        name: studentUser.name,
        email: studentUser.email,
        role: studentUser.role,
        schoolId: studentUser.schoolId,
      },
      profile: {
        id: studentProfile._id,
        classId: studentProfile.classId,
        rollNumber: studentProfile.rollNumber,
      },
    },
  });
});

// @desc    Get teacher's assigned classes
// @route   GET /api/teacher/classes
// @access  TEACHER
export const getClasses = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findOne({ userId: req.user._id });

  if (!teacher) {
    return res.status(404).json({
      success: false,
      message: "Teacher profile not found",
    });
  }

  const classes = await Class.find({
    _id: { $in: teacher.assignedClasses },
    isActive: true,
  })
    .select("name section schoolId")
    .populate("schoolId", "name")
    .sort({ name: 1, section: 1 });

  res.status(200).json({
    success: true,
    message: "Classes retrieved successfully",
    data: classes,
  });
});

// @desc    Get students in teacher's assigned classes
// @route   GET /api/teacher/students
// @access  TEACHER
export const getStudents = asyncHandler(async (req, res) => {
  const { classId } = req.query;
  const teacher = await Teacher.findOne({ userId: req.user._id });

  if (!teacher) {
    return res.status(404).json({
      success: false,
      message: "Teacher profile not found",
    });
  }

  let query = {
    schoolId: teacher.schoolId,
    isActive: true,
  };

  // If classId provided, verify teacher is assigned to that class
  if (classId) {
    if (!teacher.assignedClasses.includes(classId)) {
      return res.status(403).json({
        success: false,
        message: "Not assigned to this class",
      });
    }
    query.classId = classId;
  } else {
    // Get students from all assigned classes
    query.classId = { $in: teacher.assignedClasses };
  }

  const students = await Student.find(query)
    .populate("userId", "name email")
    .populate("classId", "name section")
    .select("rollNumber classId userId")
    .sort({ rollNumber: 1 });

  res.status(200).json({
    success: true,
    message: "Students retrieved successfully",
    data: students,
  });
});

// @desc    Mark attendance
// @route   POST /api/teacher/attendance
// @access  TEACHER
export const markAttendance = asyncHandler(async (req, res) => {
  const { classId, date, records } = req.body;

  // Validation
  if (!classId || !date || !records || !Array.isArray(records) || records.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Class ID, date, and records array are required",
    });
  }

  // Get teacher profile
  const teacher = await Teacher.findOne({ userId: req.user._id });
  if (!teacher) {
    return res.status(404).json({
      success: false,
      message: "Teacher profile not found",
    });
  }

  // Verify teacher is assigned to this class
  if (!teacher.assignedClasses.includes(classId)) {
    return res.status(403).json({
      success: false,
      message: "Not assigned to this class",
    });
  }

  // Verify class exists and belongs to teacher's school
  const classDoc = await Class.findById(classId);
  if (!classDoc) {
    return res.status(404).json({
      success: false,
      message: "Class not found",
    });
  }

  if (classDoc.schoolId.toString() !== teacher.schoolId.toString()) {
    return res.status(403).json({
      success: false,
      message: "Class does not belong to your school",
    });
  }

  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return res.status(400).json({
      success: false,
      message: "Date must be in YYYY-MM-DD format",
    });
  }

  // Validate records
  for (const record of records) {
    if (!record.studentId || !record.status) {
      return res.status(400).json({
        success: false,
        message: "Each record must have studentId and status (present/absent)",
      });
    }

    if (!["present", "absent"].includes(record.status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be 'present' or 'absent'",
      });
    }
  }

  // Create attendance record
  const attendance = await Attendance.create({
    schoolId: teacher.schoolId,
    classId,
    teacherId: teacher._id,
    date,
    records,
  });

  // Notify each student (in-app + push if PWA). Do not block response; do not send twice.
  notificationService
    .createAttendanceNotifications(attendance, req.user._id)
    .catch((err) => console.error("Attendance notifications failed:", err));

  logActivity(req.user._id, "TEACHER", teacher.schoolId, "attendance_marked", "attendance", {
    classId,
    date,
    teacherId: teacher._id,
  });

  res.status(201).json({
    success: true,
    message: "Attendance marked successfully",
    data: attendance,
  });
});

// @desc    Upload marks
// @route   POST /api/teacher/marks
// @access  TEACHER
export const uploadMarks = asyncHandler(async (req, res) => {
  const { studentId, classId, subject, marks, maxMarks, examType } = req.body;

  // Validation
  if (!studentId || !classId || !subject || marks === undefined || !examType) {
    return res.status(400).json({
      success: false,
      message: "Student ID, Class ID, subject, marks, and exam type are required",
    });
  }

  // Get teacher profile
  const teacher = await Teacher.findOne({ userId: req.user._id });
  if (!teacher) {
    return res.status(404).json({
      success: false,
      message: "Teacher profile not found",
    });
  }

  // Verify teacher is assigned to this class
  if (!teacher.assignedClasses.includes(classId)) {
    return res.status(403).json({
      success: false,
      message: "Not assigned to this class",
    });
  }

  // Verify class exists and belongs to teacher's school
  const classDoc = await Class.findById(classId);
  if (!classDoc) {
    return res.status(404).json({
      success: false,
      message: "Class not found",
    });
  }

  if (classDoc.schoolId.toString() !== teacher.schoolId.toString()) {
    return res.status(403).json({
      success: false,
      message: "Class does not belong to your school",
    });
  }

  // Verify student exists and belongs to the class
  const student = await Student.findById(studentId);
  if (!student) {
    return res.status(404).json({
      success: false,
      message: "Student not found",
    });
  }

  if (student.classId.toString() !== classId) {
    return res.status(400).json({
      success: false,
      message: "Student does not belong to this class",
    });
  }

  // Validate marks
  const marksNum = Number(marks);
  const maxMarksNum = Number(maxMarks) || 100;

  if (isNaN(marksNum) || marksNum < 0 || marksNum > maxMarksNum) {
    return res.status(400).json({
      success: false,
      message: `Marks must be between 0 and ${maxMarksNum}`,
    });
  }

  // Validate exam type
  const validExamTypes = ["unit_test", "mid_term", "final", "assignment", "quiz"];
  if (!validExamTypes.includes(examType)) {
    return res.status(400).json({
      success: false,
      message: `Exam type must be one of: ${validExamTypes.join(", ")}`,
    });
  }

  // Create marks record
  const marksRecord = await Marks.create({
    schoolId: teacher.schoolId,
    classId,
    studentId,
    teacherId: teacher._id,
    subject: subject.trim(),
    marks: marksNum,
    maxMarks: maxMarksNum,
    examType,
  });

  logActivity(req.user._id, "TEACHER", teacher.schoolId, "marks_uploaded", "marks", {
    classId,
    subject: subject.trim(),
    examType,
  });

  res.status(201).json({
    success: true,
    message: "Marks uploaded successfully",
    data: marksRecord,
  });
});

// ==================== UPDATE & DELETE OPERATIONS ====================

// @desc    Update student basic info (name, parentPhone)
// @route   PUT /api/teacher/student/:id
// @access  TEACHER
export const updateStudent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, parentPhone } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid student ID",
    });
  }

  // Get teacher profile
  const teacher = await Teacher.findOne({ userId: req.user._id });
  if (!teacher) {
    return res.status(404).json({
      success: false,
      message: "Teacher profile not found",
    });
  }

  // Get student
  const student = await Student.findById(id).populate("userId");
  if (!student) {
    return res.status(404).json({
      success: false,
      message: "Student not found",
    });
  }

  // Verify teacher is assigned to student's class
  if (!teacher.assignedClasses.includes(student.classId.toString())) {
    return res.status(403).json({
      success: false,
      message: "Not assigned to this student's class",
    });
  }

  // Verify student belongs to teacher's school
  if (student.schoolId.toString() !== teacher.schoolId.toString()) {
    return res.status(403).json({
      success: false,
      message: "Student does not belong to your school",
    });
  }

  // Handle photo upload if provided
  if (req.file) {
    // Delete old photo if exists
    if (student.photo?.publicId) {
      await deleteFromCloudinary(student.photo.publicId);
    }

    student.photo = {
      url: req.file.path,
      publicId: req.file.filename,
    };
  }

  // Update allowed fields
  if (name) student.userId.name = name.trim();
  if (parentPhone) student.parentPhone = parentPhone.trim();

  await student.userId.save();
  await student.save();

  logActivity(req.user._id, "TEACHER", teacher.schoolId, "student_updated", "student", {
    studentId: student._id,
    classId: student.classId?.toString(),
  });

  res.status(200).json({
    success: true,
    message: "Student updated successfully",
    data: {
      id: student._id,
      name: student.userId.name,
      parentPhone: student.parentPhone,
      photo: student.photo,
    },
  });
});

// @desc    Remove student from teacher's assigned class (soft delete from class perspective)
// @route   DELETE /api/teacher/student/:id
// @access  TEACHER
export const removeStudentFromClass = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { classId } = req.body; // Optional: specify which class to remove from

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid student ID",
    });
  }

  // Get teacher profile
  const teacher = await Teacher.findOne({ userId: req.user._id });
  if (!teacher) {
    return res.status(404).json({
      success: false,
      message: "Teacher profile not found",
    });
  }

  // Get student
  const student = await Student.findById(id);
  if (!student) {
    return res.status(404).json({
      success: false,
      message: "Student not found",
    });
  }

  // Verify teacher is assigned to student's class
  const targetClassId = classId || student.classId;
  if (!teacher.assignedClasses.includes(targetClassId.toString())) {
    return res.status(403).json({
      success: false,
      message: "Not assigned to this student's class",
    });
  }

  // Verify student belongs to teacher's school
  if (student.schoolId.toString() !== teacher.schoolId.toString()) {
    return res.status(403).json({
      success: false,
      message: "Student does not belong to your school",
    });
  }

  // Note: Teacher cannot delete student globally, only principal can
  // This endpoint is for removing student from a specific class context
  // For now, we'll just return a message that principal needs to handle this
  // Or we can soft-delete the student's association with this class

  res.status(403).json({
    success: false,
    message: "Teachers cannot delete students. Please contact principal for student deletion.",
  });
});
