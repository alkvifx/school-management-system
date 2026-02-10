import dotenv from "dotenv";
dotenv.config();

import { createServer } from "http";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";
import app from "./app.js";
import connectDB from "./config/db.js";
import { initializeSocketIO } from "./utils/socketHandler.js";
import { initializeWebPush } from "./services/notification.service.js";

// Create HTTP server
const httpServer = createServer(app);

// Parse CLIENT_URLS for CORS (comma-separated)
const corsOrigins = process.env.CLIENT_URLS
  ? process.env.CLIENT_URLS.split(",").map((u) => u.trim())
  : "*";

// Initialize Socket.IO with production-ready config
const io = new Server(httpServer, {
  cors: {
    origin: corsOrigins,
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["Authorization"],
  },
  transports: process.env.FORCE_WEBSOCKET === "true" ? ["websocket"] : ["websocket", "polling"],
  pingTimeout: 20000,
  pingInterval: 10000,
  connectTimeout: 45000,
  maxHttpBufferSize: 1e6,
});

// Redis adapter for horizontal scaling (optional - only if REDIS_URL is set)
const setupRedisAdapter = async () => {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    console.log("Socket.IO: Running without Redis adapter (single instance)");
    return;
  }
  try {
    const pubClient = createClient({ url: redisUrl });
    const subClient = pubClient.duplicate();
    await Promise.all([pubClient.connect(), subClient.connect()]);
    io.adapter(createAdapter(pubClient, subClient));
    console.log("Socket.IO: Redis adapter connected (horizontal scaling enabled)");
  } catch (err) {
    console.warn("Socket.IO: Redis adapter failed, falling back to in-memory:", err.message);
  }
};

// Initialize Socket.IO handlers (after adapter is ready)
const startServer = async () => {
  try {
    await connectDB();

    await setupRedisAdapter();

    initializeSocketIO(io);

    app.set("io", io);

    initializeWebPush();

    const PORT = process.env.PORT || 5000;
    httpServer.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Socket.IO server initialized`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = () => {
  console.log("Shutting down gracefully...");
  io.close(() => {
    console.log("All Socket.IO connections closed");
    httpServer.close(() => {
      console.log("HTTP server closed");
      process.exit(0);
    });
  });
  setTimeout(() => {
    console.error("Forcing shutdown after 30s timeout");
    process.exit(1);
  }, 30000);
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

startServer();
