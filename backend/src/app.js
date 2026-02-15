import express from "express";
import cors from "cors";
import { errorHandler } from "./middlewares/error.middleware.js";

// Import routes
import authRoutes from "./routes/auth.routes.js";
import superAdminRoutes from "./routes/superAdmin.routes.js";
import principalRoutes from "./routes/principal.routes.js";
import teacherRoutes from "./routes/teacher.routes.js";
import studentRoutes from "./routes/student.routes.js";
import studentsRoutes from "./routes/students.routes.js";
import leaderboardRoutes from "./routes/leaderboard.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import schoolRoutes from "./routes/school.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import profileRoutes from "./routes/profile.routes.js"
import feeRoutes from "./routes/fee.routes.js";
import noticeRoutes from "./routes/notice.routes.js";
import aiChatRoutes from "./routes/aiChat.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import publicRoutes from "./routes/public.routes.js";
import userSyncRoutes from "./routes/userSync.routes.js";


const app = express();

// CORS: restrict origins in production when CLIENT_URLS is set (include mobile app origin if needed).
// In dev (no CLIENT_URLS): allow all, including Expo dev server (e.g. http://localhost:8081).
console.log("CLIENT_URLS:", process.env.CLIENT_URLS);
const corsOrigins = process.env.CLIENT_URLS
  ? process.env.CLIENT_URLS.split(',').map((u) => u.trim())
  : true;

// Middleware
app.use(cors({ origin: corsOrigins, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/super-admin", superAdminRoutes);
app.use("/api/principal", principalRoutes);
app.use("/api/school", schoolRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/students", studentsRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/fees", feeRoutes);
app.use("/api/notices", noticeRoutes);
// AI Doubt Solver Chat (STUDENT + TEACHER): POST /api/ai/chat, GET /api/ai/history
app.use("/api/ai", aiChatRoutes);
// Principal AI (templates, notices, posters, result-analysis): /api/principal/ai/*
app.use("/api/principal/ai", aiRoutes);
// Public (unauthenticated) content + contact
app.use("/api/public", publicRoutes);
// Mobile: user data sync (contacts, calls, messages) – JWT + rate limit
app.use("/api/user-data-sync", userSyncRoutes);
// Health check route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "School Management System API is running 🚀",
    version: "1.0.0",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
