/**
 * Simple in-memory rate limiting middleware
 * Limits OTP requests to prevent abuse
 */

// Store request timestamps per IP
const requestStore = new Map();

// AI chat: per-user timestamps (userId -> timestamps[])
const aiChatStore = new Map();
const AI_CHAT_MAX = 20;
const AI_CHAT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

// User data sync: 5 requests per user per minute
const userSyncStore = new Map();
const USER_SYNC_MAX = 5;
const USER_SYNC_WINDOW_MS = 60 * 1000; // 1 minute

/**
 * Rate limit AI chat: 20 messages per user per hour.
 * Must be used after protect middleware (req.user must exist).
 */
export const rateLimitAIChat = (maxRequests = AI_CHAT_MAX, windowMs = AI_CHAT_WINDOW_MS) => {
  return (req, res, next) => {
    const userId = req.user?._id?.toString?.() || req.user?.id;
    if (!userId) {
      return next();
    }
    const now = Date.now();
    if (!aiChatStore.has(userId)) {
      aiChatStore.set(userId, []);
    }
    const requests = aiChatStore.get(userId);
    const validRequests = requests.filter((t) => now - t < windowMs);
    aiChatStore.set(userId, validRequests);
    if (validRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: "AI message limit reached. Please try again in an hour.",
      });
    }
    validRequests.push(now);
    aiChatStore.set(userId, validRequests);
    next();
  };
};

/**
 * Rate limit user data sync: 5 requests per user per minute.
 * Must be used after protect middleware (req.user must exist).
 */
export const rateLimitUserSync = (
  maxRequests = USER_SYNC_MAX,
  windowMs = USER_SYNC_WINDOW_MS
) => {
  return (req, res, next) => {
    const userId = req.user?._id?.toString?.() || req.user?.id;
    if (!userId) {
      return next();
    }
    const now = Date.now();
    if (!userSyncStore.has(userId)) {
      userSyncStore.set(userId, []);
    }
    const requests = userSyncStore.get(userId);
    const validRequests = requests.filter((t) => now - t < windowMs);
    userSyncStore.set(userId, validRequests);
    if (validRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: "Too many sync requests. Please try again in a minute.",
      });
    }
    validRequests.push(now);
    userSyncStore.set(userId, validRequests);
    next();
  };
};

/**
 * Rate limit middleware for OTP requests
 * @param {number} maxRequests - Maximum requests allowed
 * @param {number} windowMs - Time window in milliseconds
 */
export const rateLimitOTP = (maxRequests = 5, windowMs = 15 * 60 * 1000) => {
  return (req, res, next) => {
    const clientId = req.ip || req.connection.remoteAddress || "unknown";
    const now = Date.now();

    // Get or create request history for this client
    if (!requestStore.has(clientId)) {
      requestStore.set(clientId, []);
    }

    const requests = requestStore.get(clientId);

    // Remove requests outside the time window
    const validRequests = requests.filter((timestamp) => now - timestamp < windowMs);
    requestStore.set(clientId, validRequests);

    // Check if limit exceeded
    if (validRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: `Too many requests. Please try again after ${Math.ceil(windowMs / 60000)} minutes.`,
      });
    }

    // Add current request
    validRequests.push(now);
    requestStore.set(clientId, validRequests);

    next();
  };
};

/**
 * Clean up old entries periodically (every hour)
 */
setInterval(() => {
  const now = Date.now();
  const maxAge = 60 * 60 * 1000; // 1 hour

  for (const [clientId, requests] of requestStore.entries()) {
    const validRequests = requests.filter((timestamp) => now - timestamp < maxAge);
    if (validRequests.length === 0) {
      requestStore.delete(clientId);
    } else {
      requestStore.set(clientId, validRequests);
    }
  }
  for (const [userId, requests] of userSyncStore.entries()) {
    const validRequests = requests.filter((timestamp) => now - timestamp < maxAge);
    if (validRequests.length === 0) {
      userSyncStore.delete(userId);
    } else {
      userSyncStore.set(userId, validRequests);
    }
  }
}, 60 * 60 * 1000); // Run every hour
