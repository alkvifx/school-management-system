import express from "express";
import {
  getOrCreateChatRoom,
  getMessages,
  sendMessage,
} from "../controllers/chat.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { validateChatAccess } from "../middlewares/chat.middleware.js";
import { uploadChatMedia } from "../middlewares/upload.middleware.js";

const router = express.Router();

// All chat routes require authentication
router.use(protect);

// @route   GET /api/chat/class/:classId
// @desc    Get or create chat room for a class
// @access  Protected (TEACHER, STUDENT)
router.get("/class/:classId", validateChatAccess, getOrCreateChatRoom);

// @route   GET /api/chat/:classId/messages
// @desc    Get paginated messages for a class chat
// @access  Protected (TEACHER, STUDENT)
router.get("/:classId/messages", validateChatAccess, getMessages);

// @route   POST /api/chat/:classId/message
// @desc    Send a message (text or media)
// @access  Protected (TEACHER, STUDENT)
router.post(
  "/:classId/message",
  validateChatAccess,
  uploadChatMedia.single("media"),
  sendMessage
);

export default router;
