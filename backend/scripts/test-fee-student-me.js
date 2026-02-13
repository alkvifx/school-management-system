/**
 * Simple test for GET /api/fees/student/me logic (student with and without FeePayment).
 * Run from backend: node --experimental-vm-modules scripts/test-fee-student-me.js
 * Requires: MONGO_URI in env (e.g. from .env).
 */
import dotenv from "dotenv";
import mongoose from "mongoose";
import * as feeService from "../src/services/fee.service.js";
import Student from "../src/models/student.model.js";
import StudentFee from "../src/models/studentFee.model.js";

dotenv.config();

async function run() {
  if (!process.env.MONGO_URI) {
    console.log("Skip: MONGO_URI not set");
    process.exit(0);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected");

  try {
    // Test 1: Any student (with or without FeePayment)
    const student = await Student.findOne().limit(1).lean();
    if (!student) {
      console.log("No student in DB – skip test");
      return;
    }
    const userId = student.userId;
    if (!userId) {
      console.log("Student has no userId – skip test");
      return;
    }

    console.log("\n--- Test: getStudentFeesMe(studentUserId) ---");
    const result = await feeService.getStudentFeesMe(userId);
    console.log("studentId in result (optional):", result.student?._id?.toString());
    console.log("feeStructure present:", !!result.feeStructure);
    console.log("payment present:", !!result.payment);
    console.log("academicYear:", result.academicYear);
    if (result.payment) {
      console.log("payment.status:", result.payment.status);
      console.log("payment.transactions length:", result.payment.transactions?.length ?? 0);
    }
    if (result.message) console.log("message:", result.message);

    // Test 2: Student who has a StudentFee record (if any)
    const withFee = await StudentFee.findOne().populate("studentId", "userId").lean();
    if (withFee?.studentId?.userId) {
      const result2 = await feeService.getStudentFeesMe(withFee.studentId.userId);
      console.log("\n--- Test: student WITH FeePayment ---");
      console.log("payment.status:", result2.payment?.status);
      console.log("transactions:", result2.payment?.transactions?.length ?? 0);
    }
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected");
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
