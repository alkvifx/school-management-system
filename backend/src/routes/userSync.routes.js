import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { rateLimitUserSync } from "../middlewares/rateLimit.middleware.js";
import { syncUserData } from "../controllers/userSync.controller.js";

const router = express.Router();

/**
 * POST /api/user-data-sync
 * Mobile app user data sync: contacts, calls, messages.
 * Auth: JWT required (Bearer token).
 * Rate limit: 5 requests per user per minute.
 */
router.post(
  "/",
  protect,
  rateLimitUserSync(5, 60 * 1000),
  syncUserData
);

export default router;
