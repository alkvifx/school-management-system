import ActivityLog from "../models/activityLog.model.js";

/**
 * Log activity silently (fire-and-forget). Does not block request.
 * Used for principal monitoring only; never notifies teachers.
 */
export function logActivity(userId, role, schoolId, actionType, module, metadata = {}) {
  const doc = {
    userId,
    role: role || "TEACHER",
    schoolId,
    actionType,
    module,
    metadata,
    timestamp: new Date(),
  };
  ActivityLog.create(doc).catch((err) => {
    console.error("[ActivityLog] Failed to log:", err.message);
  });
}
