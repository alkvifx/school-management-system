/**
 * Simple in-memory rate limiting middleware
 * Limits OTP requests to prevent abuse
 */

// Store request timestamps per IP
const requestStore = new Map();

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
}, 60 * 60 * 1000); // Run every hour
