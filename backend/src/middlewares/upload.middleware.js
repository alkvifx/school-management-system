import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

// File size limit: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Allowed mime types
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/mpeg", "video/quicktime", "video/x-msvideo"];
const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

/**
 * Create Cloudinary storage configuration
 * @param {string} folder - Cloudinary folder path
 * @param {string[]} allowedFormats - Allowed file formats
 * @returns {CloudinaryStorage}
 */
const createStorage = (folder, allowedFormats = ["jpg", "png", "jpeg", "gif", "webp", "mp4", "mov", "avi"]) => {
  return new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
      // Determine resource type based on mime type
      const isVideo = file.mimetype.startsWith("video/");
      const resourceType = isVideo ? "video" : "image";

      return {
        folder: folder,
        allowed_formats: allowedFormats,
        resource_type: resourceType,
        transformation: resourceType === "image" ? [{ quality: "auto" }] : undefined,
      };
    },
  });
};

/**
 * File filter to validate mime types
 */
const fileFilter = (req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type. Allowed types: ${ALLOWED_TYPES.join(", ")}`
      ),
      false
    );
  }
};

// Upload configurations for different use cases
export const uploadLogo = multer({
  storage: createStorage("schools/logos", ["jpg", "png", "jpeg", "webp"]),
  fileFilter: (req, file, cb) => {
    if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed for logo"), false);
    }
  },
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

export const uploadPhoto = multer({
  storage: createStorage("schools/photos", ["jpg", "png", "jpeg", "webp"]),
  fileFilter: (req, file, cb) => {
    if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

export const uploadProfileImage = multer({
  storage: createStorage("users/profile-images", ["jpg", "png", "jpeg", "webp"]),
  fileFilter: (req, file, cb) => {
    if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB for profile images
  },
});

export const uploadMedia = multer({
  storage: createStorage("schools/media", ["jpg", "png", "jpeg", "gif", "webp", "mp4", "mov", "avi"]),
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

// Chat media upload - supports images, PDFs, and audio
const ALLOWED_CHAT_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
const ALLOWED_PDF_TYPES = ["application/pdf"];
const ALLOWED_AUDIO_TYPES = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/aac"];

const chatFileFilter = (req, file, cb) => {
  const allowedTypes = [...ALLOWED_CHAT_IMAGE_TYPES, ...ALLOWED_PDF_TYPES, ...ALLOWED_AUDIO_TYPES];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type. Allowed types: images (${ALLOWED_CHAT_IMAGE_TYPES.join(", ")}), PDF, audio (${ALLOWED_AUDIO_TYPES.join(", ")})`
      ),
      false
    );
  }
};

// Custom storage for chat media (images, PDFs, audio)
const createChatStorage = (folder) => {
  return new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
      // Determine resource type based on mime type
      let resourceType = "image";
      if (file.mimetype === "application/pdf") {
        resourceType = "raw"; // PDFs are stored as raw files
      } else if (file.mimetype.startsWith("audio/")) {
        resourceType = "video"; // Cloudinary treats audio as video resource type
      }

      return {
        folder: folder,
        resource_type: resourceType,
        transformation: resourceType === "image" ? [{ quality: "auto" }] : undefined,
      };
    },
  });
};

export const uploadChatMedia = multer({
  storage: createChatStorage("schools/chat-media"),
  fileFilter: chatFileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

// Legacy export for backward compatibility
export const upload = uploadLogo;
