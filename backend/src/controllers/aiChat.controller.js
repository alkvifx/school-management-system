/**
 * AI Doubt Solver Chat (Perplexity) for STUDENT and TEACHER.
 * Separate from principal AI (templates, notices, etc.).
 * In-memory cache: last 10 responses per user (key: userId + normalized message).
 */

import AiChat from "../models/aiChat.model.js";
import { chatWithPerplexity } from "../services/perplexity.service.js";

const FALLBACK_MESSAGE =
  "AI is busy right now, please try again in a moment.";

const CACHE_MAX_PER_USER = 10;
const responseCache = new Map(); // userId -> [{ key, aiResponse, createdAt }, ...]

function getCached(userId, message) {
  const key = `${String(message).trim().toLowerCase().slice(0, 200)}`;
  const list = responseCache.get(String(userId)) || [];
  const found = list.find((e) => e.key === key);
  return found ? found.aiResponse : null;
}

function setCached(userId, message, aiResponse) {
  const key = `${String(message).trim().toLowerCase().slice(0, 200)}`;
  let list = responseCache.get(String(userId)) || [];
  list = [{ key, aiResponse, createdAt: new Date() }, ...list.filter((e) => e.key !== key)].slice(0, CACHE_MAX_PER_USER);
  responseCache.set(String(userId), list);
}

/**
 * POST /api/ai/chat
 * Body: { message: string, role: "STUDENT" | "TEACHER" }
 * Returns: { success, data: { message, aiResponse, createdAt } }
 */
export const postChat = async (req, res, next) => {
  try {
    const { message, role } = req.body;
    const userId = req.user._id;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const allowedRoles = ["STUDENT", "TEACHER"];
    const userRole = role || req.user.role;
    if (!allowedRoles.includes(userRole)) {
      return res.status(400).json({
        success: false,
        message: "Role must be STUDENT or TEACHER",
      });
    }

    const trimmed = message.trim().slice(0, 500);
    let content = getCached(userId, trimmed);
    let error = null;

    if (content == null) {
      const result = await chatWithPerplexity({
        message: trimmed,
        role: userRole,
      });
      content = result.content;
      error = result.error;
      if (content) setCached(userId, trimmed, content);
    }

    const aiResponse = content || FALLBACK_MESSAGE;

    const record = await AiChat.create({
      userId,
      role: userRole,
      message: trimmed,
      aiResponse,
    });

    return res.status(201).json({
      success: true,
      data: {
        _id: record._id,
        message: record.message,
        aiResponse: record.aiResponse,
        createdAt: record.createdAt,
      },
      ...(error && { warning: error }),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/ai/history
 * Returns last 20 AI chats for the logged-in user.
 */
export const getHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);

    const history = await AiChat.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return res.json({
      success: true,
      data: history,
    });
  } catch (err) {
    next(err);
  }
};
