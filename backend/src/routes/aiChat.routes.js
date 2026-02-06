/**
 * AI Doubt Solver Chat routes for STUDENT and TEACHER.
 * POST /api/ai/chat, GET /api/ai/history
 * Does NOT affect existing principal AI (templates, notices) - those stay under /api/principal/ai.
 */

import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";
import { rateLimitAIChat } from "../middlewares/rateLimit.middleware.js";
import { postChat, getHistory } from "../controllers/aiChat.controller.js";

const router = express.Router();

router.use(protect);
router.use(allowRoles("STUDENT", "TEACHER"));

router.post("/chat", rateLimitAIChat(20, 60 * 60 * 1000), postChat);
router.get("/history", getHistory);

export default router;
