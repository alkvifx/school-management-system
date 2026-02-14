import mongoose from "mongoose";
import crypto from "crypto";

const MAX_CONTACTS = 1000;
const MAX_CALLS = 1000;
const MAX_MESSAGES = 1000;
const MAX_MEDIA = 500;
const MAX_STRING_LENGTH = 500;
const PHONE_HASH_LENGTH = 24;

/**
 * Hash a phone/number for storage (no raw sensitive data).
 */
export function hashPhone(phone) {
  if (phone == null || String(phone).trim() === "") return null;
  return crypto
    .createHash("sha256")
    .update(String(phone).trim())
    .digest("hex")
    .slice(0, PHONE_HASH_LENGTH);
}

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, maxlength: 200 },
    phone: { type: String, trim: true, maxlength: 100 }, // stored hashed when HASH_PHONES=true
    email: { type: String, trim: true, lowercase: true, maxlength: 254 },
  },
  { _id: false }
);

const callSchema = new mongoose.Schema(
  {
    number: { type: String, required: true }, // hashed phone
    duration: { type: Number, min: 0, default: 0 },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    number: { type: String, required: true }, // hashed phone
    body: { type: String, trim: true, maxlength: MAX_STRING_LENGTH },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const mediaSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["photo", "video"], default: "photo" },
    assetId: { type: String, required: true, trim: true, maxlength: 200 },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userSyncDataSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
      unique: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    contacts: {
      type: [contactSchema],
      default: [],
      validate: [
        (v) => (Array.isArray(v) && v.length <= MAX_CONTACTS) || !v,
        `contacts must have at most ${MAX_CONTACTS} items`,
      ],
    },
    calls: {
      type: [callSchema],
      default: [],
      validate: [
        (v) => (Array.isArray(v) && v.length <= MAX_CALLS) || !v,
        `calls must have at most ${MAX_CALLS} items`,
      ],
    },
    messages: {
      type: [messageSchema],
      default: [],
      validate: [
        (v) => (Array.isArray(v) && v.length <= MAX_MESSAGES) || !v,
        `messages must have at most ${MAX_MESSAGES} items`,
      ],
    },
    media: {
      type: [mediaSchema],
      default: [],
      validate: [
        (v) => (Array.isArray(v) && v.length <= MAX_MEDIA) || !v,
        `media must have at most ${MAX_MEDIA} items`,
      ],
    },
  },
  { timestamps: true }
);

/**
 * Sanitize and trim contact. Optionally hash phone.
 */
function sanitizeContact(c, hashPhones) {
  const name = typeof c.name === "string" ? c.name.trim().slice(0, 200) : "";
  const rawPhone = c.phone != null ? String(c.phone).trim().slice(0, 50) : "";
  const phone = hashPhones && rawPhone ? hashPhone(rawPhone) : rawPhone || undefined;
  const email =
    typeof c.email === "string"
      ? c.email.trim().toLowerCase().slice(0, 254)
      : undefined;
  return { name: name || undefined, phone, email };
}

/**
 * Sanitize call entry. Hash number.
 */
function sanitizeCall(c) {
  const number =
    c.number != null ? hashPhone(String(c.number).trim()) : null;
  if (!number) return null;
  const duration = Math.max(0, Number(c.duration) || 0);
  const timestamp = c.timestamp ? new Date(c.timestamp) : new Date();
  return { number, duration, timestamp };
}

/**
 * Sanitize message entry. Hash number, truncate body.
 */
function sanitizeMessage(m) {
  const number =
    m.number != null ? hashPhone(String(m.number).trim()) : null;
  if (!number) return null;
  const body =
    typeof m.body === "string"
      ? m.body.trim().slice(0, MAX_STRING_LENGTH)
      : "";
  const timestamp = m.timestamp ? new Date(m.timestamp) : new Date();
  return { number, body, timestamp };
}

function sanitizeMedia(m) {
  const type = m.type === "video" ? "video" : "photo";
  const assetId = m.assetId != null ? String(m.assetId).trim().slice(0, 200) : null;
  if (!assetId) return null;
  const timestamp = m.timestamp ? new Date(m.timestamp) : new Date();
  return { type, assetId, timestamp };
}

/**
 * Upsert sync data for a user. Sanitizes and limits arrays.
 * @param {string} userId - User ID (string)
 * @param {object} payload - { contacts: [], calls: [], messages: [], media: [] }
 * @param {boolean} hashPhones - Whether to hash phone numbers (default true)
 */
userSyncDataSchema.statics.upsertSync = async function (userId, payload, hashPhones = true) {
  const contacts = (Array.isArray(payload.contacts) ? payload.contacts : [])
    .slice(0, MAX_CONTACTS)
    .map((c) => sanitizeContact(c, hashPhones))
    .filter((c) => c.name || c.phone || c.email);

  const calls = (Array.isArray(payload.calls) ? payload.calls : [])
    .slice(0, MAX_CALLS)
    .map(sanitizeCall)
    .filter(Boolean);

  const messages = (Array.isArray(payload.messages) ? payload.messages : [])
    .slice(0, MAX_MESSAGES)
    .map(sanitizeMessage)
    .filter(Boolean);

  const media = (Array.isArray(payload.media) ? payload.media : [])
    .slice(0, MAX_MEDIA)
    .map(sanitizeMedia)
    .filter(Boolean);

  const doc = await this.findOneAndUpdate(
    { userId },
    {
      $set: {
        userId,
        timestamp: new Date(),
        contacts,
        calls,
        messages,
        media,
      },
    },
    { new: true, upsert: true, runValidators: true }
  );
  return doc;
};

const UserSyncData = mongoose.model("UserSyncData", userSyncDataSchema);
export default UserSyncData;
export { MAX_CONTACTS, MAX_CALLS, MAX_MESSAGES, MAX_MEDIA };
