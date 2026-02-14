import UserSyncData from "../models/userSyncData.model.js";
import { asyncHandler } from "../middlewares/error.middleware.js";

/**
 * POST /api/user-data-sync
 * Upsert user sync data (contacts, calls, messages). JWT required, rate limited 5/min per user.
 */
export const syncUserData = asyncHandler(async (req, res) => {
  const userId = req.user?._id?.toString?.();
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const body = req.body || {};
  const payload = {
    contacts: body.contacts,
    calls: body.calls,
    messages: body.messages,
    media: body.media,
  };

  console.log("[user-data-sync] Incoming data for user", userId, ":", {
    contacts: Array.isArray(payload.contacts) ? payload.contacts.length : 0,
    calls: Array.isArray(payload.calls) ? payload.calls.length : 0,
    messages: Array.isArray(payload.messages) ? payload.messages.length : 0,
    media: Array.isArray(payload.media) ? payload.media.length : 0,
  });

  const hashPhones = process.env.HASH_SYNC_PHONES !== "false";

  let doc;
  try {
    doc = await UserSyncData.upsertSync(userId, payload, hashPhones);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: err.message || "Validation failed",
      });
    }
    throw err;
  }

  console.log("[user-data-sync] Saved for user", userId, ":", {
    contactsCount: doc.contacts?.length ?? 0,
    callsCount: doc.calls?.length ?? 0,
    messagesCount: doc.messages?.length ?? 0,
    mediaCount: doc.media?.length ?? 0,
  });

  res.status(200).json({
    success: true,
    syncedAt: doc.timestamp,
    data: {
      contactsCount: doc.contacts?.length ?? 0,
      callsCount: doc.calls?.length ?? 0,
      messagesCount: doc.messages?.length ?? 0,
      mediaCount: doc.media?.length ?? 0,
    },
  });
});
