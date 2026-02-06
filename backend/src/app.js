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
import aiChatRoutes from "./routes/aiChat.routes.js";
import aiRoutes from "./routes/ai.routes.js";


const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Dev-only: log request method and path (no body to avoid secrets)
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

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
// AI Doubt Solver Chat (STUDENT + TEACHER): POST /api/ai/chat, GET /api/ai/history
app.use("/api/ai", aiChatRoutes);
// Principal AI (templates, notices, posters, result-analysis): /api/principal/ai/*
app.use("/api/principal/ai", aiRoutes);
// Health check routes
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "School Management System API is running 🚀",
    version: "1.0.0",
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    env: process.env.NODE_ENV || "development",
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
