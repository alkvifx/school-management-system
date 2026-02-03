import User from "../models/user.model.js";
import School from "../models/school.model.js";
import Class from "../models/class.model.js";
import Teacher from "../models/teacher.model.js";
import Student from "../models/student.model.js";
import bcrypt from "bcryptjs";
import { isValidEmail, isValidPassword } from "../utils/validators.js";
import { asyncHandler } from "../middlewares/error.middleware.js";
import { deleteFromCloudinary } from "../utils/cloudinaryHelper.js";
import mongoose from "mongoose";
import { generateOTP, hashOTP, getOTPExpiration } from "../utils/otpHelper.js";
import { sendEmailVerificationOTP } from "../utils/emailService.js";

// @desc    Create a teacher
// @route   POST /api/principal/create-teacher
// @access  PRINCIPAL
export const createTeacher = asyncHandler(async (req, res) => {
  const { name, email, password, qualification, subject, experience } = req.body;
  const principal = req.user;

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

  // Verify principal has a school
  if (!principal.schoolId) {
    return res.status(403).json({
      success: false,
      message: "Principal not assigned to any school",
    });
  }

  // Verify school exists and principal is assigned
  const school = await School.findById(principal.schoolId);
  if (!school || school.principalId?.toString() !== principal._id.toString()) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to create teachers for this school",
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

  // Create teacher user
  const teacherUser = await User.create({
    name: name.trim(),
    email: email.toLowerCase(),
    password: hashedPassword,
    role: "TEACHER",
    schoolId: principal.schoolId,
    isEmailVerified: false,
    emailVerificationOTP: hashedOTP,
    emailVerificationOTPExpires: otpExpires,
  });

  // Create teacher profile
  const teacherProfile = await Teacher.create({
    userId: teacherUser._id,
    schoolId: principal.schoolId,
    subject: subject?.trim() || "",
    qualification: qualification?.trim() || "",
    experience: experience || 0,
    assignedClasses: [],
  });

  // Send verification email
  try {
    await sendEmailVerificationOTP(teacherUser.email, teacherUser.name, otp);
  } catch (error) {
    console.error("Failed to send verification email:", error);
    // Continue even if email fails - OTP is still stored
  }

  res.status(201).json({
    success: true,
    message: "Teacher created successfully. Please check your email to verify your account.",
    data: {
      user: {
        id: teacherUser._id,
        name: teacherUser.name,
        email: teacherUser.email,
        role: teacherUser.role,
        schoolId: teacherUser.schoolId,
        isEmailVerified: teacherUser.isEmailVerified,
      },
      profile: {
        id: teacherProfile._id,
        qualification: teacherProfile.qualification,
        subject: teacherProfile.subject,
        experience: teacherProfile.experience,
      },
    },
  });
});

// @desc    Create a student
// @route   POST /api/principal/create-student
// @access  PRINCIPAL
export const createStudent = asyncHandler(async (req, res) => {
  const { name, email, password, classId, rollNumber, parentPhone, parentName } = req.body;
  const principal = req.user;

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

  // Verify principal has a school
  if (!principal.schoolId) {
    return res.status(403).json({
      success: false,
      message: "Principal not assigned to any school",
    });
  }

  // Verify class exists and belongs to principal's school
  const classDoc = await Class.findById(classId);
  if (!classDoc) {
    return res.status(404).json({
      success: false,
      message: "Class not found",
    });
  }

  if (classDoc.schoolId.toString() !== principal.schoolId.toString()) {
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

  // Generate email verification OTP
  const otp = generateOTP();
  const hashedOTP = await hashOTP(otp);
  const otpExpires = getOTPExpiration();

  // Create student user
  const studentUser = await User.create({
    name: name.trim(),
    email: email.toLowerCase(),
    password: hashedPassword,
    role: "STUDENT",
    schoolId: principal.schoolId,
    isEmailVerified: false,
    emailVerificationOTP: hashedOTP,
    emailVerificationOTPExpires: otpExpires,
  });

  // Create student profile
  const studentProfile = await Student.create({
    userId: studentUser._id,
    schoolId: principal.schoolId,
    classId,
    rollNumber,
    parentPhone: parentPhone.trim(),
    parentName: parentName?.trim() || "",
  });

  // Send verification email
  try {
    await sendEmailVerificationOTP(studentUser.email, studentUser.name, otp);
  } catch (error) {
    console.error("Failed to send verification email:", error);
    // Continue even if email fails - OTP is still stored
  }

  res.status(201).json({
    success: true,
    message: "Student created successfully. Please check your email to verify your account.",
    data: {
      user: {
        id: studentUser._id,
        name: studentUser.name,
        email: studentUser.email,
        role: studentUser.role,
        schoolId: studentUser.schoolId,
        isEmailVerified: studentUser.isEmailVerified,
      },
      profile: {
        id: studentProfile._id,
        classId: studentProfile.classId,
        rollNumber: studentProfile.rollNumber,
      },
    },
  });
});

// @desc    Create a class
// @route   POST /api/principal/create-class
// @access  PRINCIPAL
export const createClass = asyncHandler(async (req, res) => {
  const { name, section } = req.body;
  const principal = req.user;

  // Validation
  if (!name || !section) {
    return res.status(400).json({
      success: false,
      message: "Name and section are required",
    });
  }

  // Verify principal has a school
  if (!principal.schoolId) {
    return res.status(403).json({
      success: false,
      message: "Principal not assigned to any school",
    });
  }

  // Verify school exists and principal is assigned
  const school = await School.findById(principal.schoolId);
  if (!school || school.principalId?.toString() !== principal._id.toString()) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to create classes for this school",
    });
  }

  // Create class
  const classDoc = await Class.create({
    name: name.trim(),
    section: section.trim().toUpperCase(),
    schoolId: principal.schoolId,
  });

  res.status(201).json({
    success: true,
    message: "Class created successfully",
    data: classDoc,
  });
});

// @desc    Assign teacher to class
// @route   POST /api/principal/assign-teacher
// @access  PRINCIPAL
export const assignTeacher = asyncHandler(async (req, res) => {
  const { teacherId, classId } = req.body;
  const principal = req.user;

  // Validation
  if (!teacherId || !classId) {
    return res.status(400).json({
      success: false,
      message: "Teacher ID and Class ID are required",
    });
  }

  // Verify principal has a school
  if (!principal.schoolId) {
    return res.status(403).json({
      success: false,
      message: "Principal not assigned to any school",
    });
  }

  // Verify teacher exists and belongs to principal's school
  const teacher = await Teacher.findById(teacherId).populate("userId");
  if (!teacher) {
    return res.status(404).json({
      success: false,
      message: "Teacher not found",
    });
  }

  if (teacher.schoolId.toString() !== principal.schoolId.toString()) {
    return res.status(403).json({
      success: false,
      message: "Teacher does not belong to your school",
    });
  }

  // Verify class exists and belongs to principal's school
  const classDoc = await Class.findById(classId);
  if (!classDoc) {
    return res.status(404).json({
      success: false,
      message: "Class not found",
    });
  }

  if (classDoc.schoolId.toString() !== principal.schoolId.toString()) {
    return res.status(403).json({
      success: false,
      message: "Class does not belong to your school",
    });
  }

  // Check if teacher is already assigned to this class
  if (teacher.assignedClasses.includes(classId)) {
    return res.status(400).json({
      success: false,
      message: "Teacher is already assigned to this class",
    });
  }

  // Assign teacher to class
  teacher.assignedClasses.push(classId);
  await teacher.save();

  classDoc.classTeacherId = teacher._id;
  await classDoc.save();

  // Update class teacher (optional - can be class teacher or subject teacher)
  // For now, we'll just add to assigned classes

  res.status(200).json({
    success: true,
    message: "Teacher assigned to class successfully",
    data: {
      teacher: {
        id: teacher._id,
        name: teacher.userId.name,
        assignedClasses: teacher.assignedClasses,
      },
      class: {
        id: classDoc._id,
        name: classDoc.name,
        section: classDoc.section,
      },
    },
  });
});

// @desc    Assign student to class
// @route   POST /api/principal/assign-student
// @access  PRINCIPAL
export const assignStudent = asyncHandler(async (req, res) => {
  const { studentId, classId } = req.body;
  const principal = req.user;

  // Validation
  if (!studentId || !classId) {
    return res.status(400).json({
      success: false,
      message: "Student ID and Class ID are required",
    });
  }

  // Verify principal has a school
  if (!principal.schoolId) {
    return res.status(403).json({
      success: false,
      message: "Principal not assigned to any school",
    });
  }

  // Verify student exists and belongs to principal's school
  const student = await Student.findById(studentId).populate("userId");
  if (!student) {
    return res.status(404).json({
      success: false,
      message: "Student not found",
    });
  }

  if (student.schoolId.toString() !== principal.schoolId.toString()) {
    return res.status(403).json({
      success: false,
      message: "Student does not belong to your school",
    });
  }

  // Verify class exists and belongs to principal's school
  const classDoc = await Class.findById(classId);
  if (!classDoc) {
    return res.status(404).json({
      success: false,
      message: "Class not found",
    });
  }

  if (classDoc.schoolId.toString() !== principal.schoolId.toString()) {
    return res.status(403).json({
      success: false,
      message: "Class does not belong to your school",
    });
  }

  // Update student's class
  student.classId = classId;
  await student.save();

  res.status(200).json({
    success: true,
    message: "Student assigned to class successfully",
    data: {
      student: {
        id: student._id,
        name: student.userId.name,
        rollNumber: student.rollNumber,
        classId: student.classId,
      },
      class: {
        id: classDoc._id,
        name: classDoc.name,
        section: classDoc.section,
      },
    },
  });
});

export const getAllTeachers = asyncHandler(async (req, res) => {
  const principal = req.user;
  if (!principal.schoolId) {
    return res.status(403).json({
      success: false,
      message: "Principal not assigned to any school",
    });
  }
  const teachers = await Teacher.find({ schoolId: principal.schoolId }).populate('userId');
  res.status(200).json({
    success: true,
    data: teachers.map(teacher => ({
      id: teacher._id,
      name: teacher.userId.name,
      email: teacher.userId.email,
      qualification: teacher.qualification,
      experience: teacher.experience,
      subject: teacher.subject,
      photo: teacher.photo,
      assignedClasses: teacher.assignedClasses,
    })),
  });
});

export const getAllStudents = asyncHandler(async (req, res) => {
  const principal = req.user;
  if (!principal.schoolId) {
    return res.status(403).json({
      success: false,
      message: "Principal not assigned to any school",
    });
  }
  const students = await Student.find({ schoolId: principal.schoolId }).populate('userId');
  res.status(200).json({
    success: true,
    data: students.map(student => ({
      id: student._id,
      name: student.userId.name,
      email: student.userId.email,
      rollNumber: student.rollNumber,
      classId: student.classId,
      parentPhone: student.parentPhone,
      parentName: student.parentName,
      photo: student.photo,
    })),
  });
});

export const getAllClasses = asyncHandler(async (req, res) => {
  const principal = req.user;
  if (!principal.schoolId) {
    return res.status(403).json({
      success: false,
      message: "Principal not assigned to any school",
    });
  }
  const classes = await Class.find({ schoolId: principal.schoolId });
  res.status(200).json({
    success: true,
    data: classes,
  });
});

// ==================== UPDATE OPERATIONS ====================

// @desc    Update school details
// @route   PUT /api/principal/school
// @access  PRINCIPAL
export const updateSchool = asyncHandler(async (req, res) => {
  const { name, address, phone, email } = req.body;
  const principal = req.user;

  if (!principal.schoolId) {
    return res.status(403).json({
      success: false,
      message: "Principal not assigned to any school",
    });
  }

  const school = await School.findById(principal.schoolId);
  if (!school || school.principalId?.toString() !== principal._id.toString()) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to update this school",
    });
  }

  // Handle logo upload if provided
  if (req.file) {
    // Delete old logo if exists
    if (school.logo?.publicId) {
      await deleteFromCloudinary(school.logo.publicId);
    }

    school.logo = {
      url: req.file.path,
      publicId: req.file.public_id,
    };
  }

  if (name) school.name = name.trim();
  if (address) school.address = address.trim();
  if (phone) school.phone = phone.trim();
  if (email) {
    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }
    school.email = email.toLowerCase();
  }

  await school.save();

  res.status(200).json({
    success: true,
    message: "School updated successfully",
    data: school,
  });
});

// @desc    Update teacher profile
// @route   PUT /api/principal/teacher/:id
// @access  PRINCIPAL
export const updateTeacher = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, qualification, experience } = req.body;
  const principal = req.user;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid teacher ID",
    });
  }

  if (!principal.schoolId) {
    return res.status(403).json({
      success: false,
      message: "Principal not assigned to any school",
    });
  }

  const teacher = await Teacher.findById(id).populate("userId");
  if (!teacher) {
    return res.status(404).json({
      success: false,
      message: "Teacher not found",
    });
  }

  if (teacher.schoolId.toString() !== principal.schoolId.toString()) {
    return res.status(403).json({
      success: false,
      message: "Teacher does not belong to your school",
    });
  }

  // Handle photo upload if provided
  if (req.file) {
    // Delete old photo if exists
    if (teacher.photo?.publicId) {
      await deleteFromCloudinary(teacher.photo.publicId);
    }

    teacher.photo = {
      url: req.file.path,
      publicId: req.file.filename,
    };
  }

  // Update user details
  if (name) teacher.userId.name = name.trim();
  if (email) {
    const existingUser = await User.findOne({ email: email.toLowerCase(), _id: { $ne: teacher.userId._id } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }
    teacher.userId.email = email.toLowerCase();
  }
  if (qualification !== undefined) teacher.qualification = qualification?.trim() || "";
  if (experience !== undefined) teacher.experience = experience || 0;

  await teacher.userId.save();
  await teacher.save();

  res.status(200).json({
    success: true,
    message: "Teacher updated successfully",
    data: {
      id: teacher._id,
      name: teacher.userId.name,
      email: teacher.userId.email,
      qualification: teacher.qualification,
      experience: teacher.experience,
      photo: teacher.photo,
    },
  });
});

// @desc    Update student profile
// @route   PUT /api/principal/student/:id
// @access  PRINCIPAL
export const updateStudent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, classId, rollNumber, parentPhone } = req.body;
  const principal = req.user;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid student ID",
    });
  }

  if (!principal.schoolId) {
    return res.status(403).json({
      success: false,
      message: "Principal not assigned to any school",
    });
  }

  const student = await Student.findById(id).populate("userId");
  if (!student) {
    return res.status(404).json({
      success: false,
      message: "Student not found",
    });
  }

  if (student.schoolId.toString() !== principal.schoolId.toString()) {
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

  // Update user details
  if (name) student.userId.name = name.trim();
  if (email) {
    const existingUser = await User.findOne({ email: email.toLowerCase(), _id: { $ne: student.userId._id } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }
    student.userId.email = email.toLowerCase();
  }
  if (parentPhone) student.parentPhone = parentPhone.trim();

  // Update class if provided
  if (classId) {
    if (!mongoose.Types.ObjectId.isValid(classId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid class ID",
      });
    }

    const classDoc = await Class.findById(classId);
    if (!classDoc) {
      return res.status(404).json({
        success: false,
        message: "Class not found",
      });
    }

    if (classDoc.schoolId.toString() !== principal.schoolId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Class does not belong to your school",
      });
    }

    student.classId = classId;
  }

  // Update roll number if provided
  if (rollNumber !== undefined) {
    // Check if roll number already exists in the class
    const existingStudent = await Student.findOne({
      classId: student.classId,
      rollNumber,
      _id: { $ne: student._id },
    });

    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: "Roll number already exists in this class",
      });
    }

    student.rollNumber = rollNumber;
  }

  await student.userId.save();
  await student.save();

  res.status(200).json({
    success: true,
    message: "Student updated successfully",
    data: {
      id: student._id,
      name: student.userId.name,
      email: student.userId.email,
      rollNumber: student.rollNumber,
      classId: student.classId,
      parentPhone: student.parentPhone,
      photo: student.photo,
    },
  });
});

// @desc    Update class details
// @route   PUT /api/principal/class/:id
// @access  PRINCIPAL
export const updateClass = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, section, classTeacherId } = req.body;
  const principal = req.user;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid class ID",
    });
  }



  if (!principal.schoolId) {
    return res.status(403).json({
      success: false,
      message: "Principal not assigned to any school",
    });
  }

  const classDoc = await Class.findById(id);
  if (!classDoc) {
    return res.status(404).json({
      success: false,
      message: "Class not found",
    });
  }

  if (classDoc.schoolId.toString() !== principal.schoolId.toString()) {
    return res.status(403).json({
      success: false,
      message: "Class does not belong to your school",
    });
  }

  if (name) classDoc.name = name.trim();
  if (section) classDoc.section = section.trim().toUpperCase();

  // Update class teacher if provided
  if (classTeacherId !== undefined) {
    if (classTeacherId === null) {
      classDoc.classTeacherId = null;
    } else {
      if (!mongoose.Types.ObjectId.isValid(classTeacherId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid teacher ID",
        });
      }

      const teacher = await Teacher.findById(classTeacherId);
      if (!teacher) {
        return res.status(404).json({
          success: false,
          message: "Teacher not found",
        });
      }

      if (teacher.schoolId.toString() !== principal.schoolId.toString()) {
        return res.status(403).json({
          success: false,
          message: "Teacher does not belong to your school",
        });
      }

      teacher.assignedClasses.push(id);
      await teacher.save();

      classDoc.classTeacherId = classTeacherId;
    }
  }

  await classDoc.save();

  res.status(200).json({
    success: true,
    message: "Class updated successfully",
    data: classDoc,
  });
});

// ==================== DELETE OPERATIONS (SOFT DELETE) ====================

// @desc    Delete teacher (soft delete)
// @route   DELETE /api/principal/teacher/:id
// @access  PRINCIPAL
export const deleteTeacher = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const principal = req.user;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid teacher ID",
    });
  }

  if (!principal.schoolId) {
    return res.status(403).json({
      success: false,
      message: "Principal not assigned to any school",
    });
  }

  const teacher = await Teacher.findById(id).populate("userId");
  if (!teacher) {
    return res.status(404).json({
      success: false,
      message: "Teacher not found",
    });
  }

  if (teacher.schoolId.toString() !== principal.schoolId.toString()) {
    return res.status(403).json({
      success: false,
      message: "Teacher does not belong to your school",
    });
  }

  // Check if teacher is assigned to any active classes
  if (teacher.assignedClasses && teacher.assignedClasses.length > 0) {
    const activeClasses = await Class.find({
      _id: { $in: teacher.assignedClasses },
      isActive: true,
    });

    if (activeClasses.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete teacher. Teacher is assigned to active classes. Please unassign first.",
      });
    }
  }

  // Soft delete: set isActive to false
  teacher.isActive = false;
  teacher.userId.isActive = false;

  await teacher.save();
  await teacher.userId.save();

  res.status(200).json({
    success: true,
    message: "Teacher deleted successfully",
  });
});

// @desc    Delete student (soft delete)
// @route   DELETE /api/principal/student/:id
// @access  PRINCIPAL
export const deleteStudent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const principal = req.user;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid student ID",
    });
  }

  if (!principal.schoolId) {
    return res.status(403).json({
      success: false,
      message: "Principal not assigned to any school",
    });
  }

  const student = await Student.findById(id).populate("userId");
  if (!student) {
    return res.status(404).json({
      success: false,
      message: "Student not found",
    });
  }

  if (student.schoolId.toString() !== principal.schoolId.toString()) {
    return res.status(403).json({
      success: false,
      message: "Student does not belong to your school",
    });
  }

  // Soft delete: set isActive to false
  student.isActive = false;
  student.userId.isActive = false;

  await student.save();
  await student.userId.save();

  res.status(200).json({
    success: true,
    message: "Student deleted successfully",
  });
});

// @desc    Delete class (soft delete)
// @route   DELETE /api/principal/class/:id
// @access  PRINCIPAL
export const deleteClass = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const principal = req.user;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid class ID",
    });
  }

  if (!principal.schoolId) {
    return res.status(403).json({
      success: false,
      message: "Principal not assigned to any school",
    });
  }

  const classDoc = await Class.findById(id);
  if (!classDoc) {
    return res.status(404).json({
      success: false,
      message: "Class not found",
    });
  }

  if (classDoc.schoolId.toString() !== principal.schoolId.toString()) {
    return res.status(403).json({
      success: false,
      message: "Class does not belong to your school",
    });
  }

  // Check if class has active students
  const activeStudents = await Student.countDocuments({
    classId: id,
    isActive: true,
  });

  if (activeStudents > 0) {
    return res.status(400).json({
      success: false,
      message: `Cannot delete class. Class has ${activeStudents} active student(s). Please remove students first.`,
    });
  }

  // Soft delete: set isActive to false
  classDoc.isActive = false;
  await classDoc.save();

  res.status(200).json({
    success: true,
    message: "Class deleted successfully",
  });
});