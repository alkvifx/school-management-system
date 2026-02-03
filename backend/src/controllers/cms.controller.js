import Page from "../models/page.model.js";
import Media from "../models/media.model.js";
import School from "../models/school.model.js";
import { asyncHandler } from "../middlewares/error.middleware.js";
import { generateSlug } from "../utils/slugGenerator.js";
import { deleteFromCloudinary } from "../utils/cloudinaryHelper.js";
import mongoose from "mongoose";

// ==================== PAGE OPERATIONS ====================

// @desc    Create a page
// @route   POST /api/principal/pages
// @access  PRINCIPAL
export const createPage = asyncHandler(async (req, res) => {
  const { title, content, slug, isPublished } = req.body;
  const principal = req.user;

  if (!title || !content) {
    return res.status(400).json({
      success: false,
      message: "Title and content are required",
    });
  }

  if (!principal.schoolId) {
    return res.status(403).json({
      success: false,
      message: "Principal not assigned to any school",
    });
  }

  // Generate slug if not provided
  let pageSlug = slug;
  if (!pageSlug) {
    pageSlug = generateSlug(title, principal.schoolId);
  } else {
    // Clean and validate provided slug
    pageSlug = pageSlug
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  // Check if slug already exists
  const existingPage = await Page.findOne({ slug: pageSlug });
  if (existingPage) {
    return res.status(400).json({
      success: false,
      message: "Page with this slug already exists",
    });
  }

  const page = await Page.create({
    title: title.trim(),
    slug: pageSlug,
    content,
    schoolId: principal.schoolId,
    isPublished: isPublished || false,
    createdBy: principal._id,
  });

  res.status(201).json({
    success: true,
    message: "Page created successfully",
    data: page,
  });
});

// @desc    Update a page
// @route   PUT /api/principal/pages/:id
// @access  PRINCIPAL
export const updatePage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, content, slug, isPublished } = req.body;
  const principal = req.user;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid page ID",
    });
  }

  if (!principal.schoolId) {
    return res.status(403).json({
      success: false,
      message: "Principal not assigned to any school",
    });
  }

  const page = await Page.findById(id);
  if (!page) {
    return res.status(404).json({
      success: false,
      message: "Page not found",
    });
  }

  if (page.schoolId.toString() !== principal.schoolId.toString()) {
    return res.status(403).json({
      success: false,
      message: "Page does not belong to your school",
    });
  }

  if (title) page.title = title.trim();
  if (content) page.content = content;
  if (isPublished !== undefined) page.isPublished = isPublished;

  // Update slug if provided
  if (slug) {
    const pageSlug = slug
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Check if new slug already exists (excluding current page)
    const existingPage = await Page.findOne({
      slug: pageSlug,
      _id: { $ne: id },
    });

    if (existingPage) {
      return res.status(400).json({
        success: false,
        message: "Page with this slug already exists",
      });
    }

    page.slug = pageSlug;
  }

  await page.save();

  res.status(200).json({
    success: true,
    message: "Page updated successfully",
    data: page,
  });
});

// @desc    Delete a page
// @route   DELETE /api/principal/pages/:id
// @access  PRINCIPAL
export const deletePage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const principal = req.user;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid page ID",
    });
  }

  if (!principal.schoolId) {
    return res.status(403).json({
      success: false,
      message: "Principal not assigned to any school",
    });
  }

  const page = await Page.findById(id);
  if (!page) {
    return res.status(404).json({
      success: false,
      message: "Page not found",
    });
  }

  if (page.schoolId.toString() !== principal.schoolId.toString()) {
    return res.status(403).json({
      success: false,
      message: "Page does not belong to your school",
    });
  }

  await Page.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: "Page deleted successfully",
  });
});

// @desc    Get all pages
// @route   GET /api/principal/pages
// @access  PRINCIPAL
export const getPages = asyncHandler(async (req, res) => {
  const { isPublished } = req.query;
  const principal = req.user;

  if (!principal.schoolId) {
    return res.status(403).json({
      success: false,
      message: "Principal not assigned to any school",
    });
  }

  let query = { schoolId: principal.schoolId };

  if (isPublished !== undefined) {
    query.isPublished = isPublished === "true";
  }

  const pages = await Page.find(query)
    .populate("createdBy", "name")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    message: "Pages retrieved successfully",
    data: pages,
  });
});

// @desc    Get single page
// @route   GET /api/principal/pages/:id
// @access  PRINCIPAL
export const getPage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const principal = req.user;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid page ID",
    });
  }

  if (!principal.schoolId) {
    return res.status(403).json({
      success: false,
      message: "Principal not assigned to any school",
    });
  }

  const page = await Page.findById(id).populate("createdBy", "name");

  if (!page) {
    return res.status(404).json({
      success: false,
      message: "Page not found",
    });
  }

  if (page.schoolId.toString() !== principal.schoolId.toString()) {
    return res.status(403).json({
      success: false,
      message: "Page does not belong to your school",
    });
  }

  res.status(200).json({
    success: true,
    message: "Page retrieved successfully",
    data: page,
  });
});

// ==================== MEDIA OPERATIONS ====================

// @desc    Upload media
// @route   POST /api/principal/media
// @access  PRINCIPAL
export const uploadMedia = asyncHandler(async (req, res) => {
  const principal = req.user;

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Media file is required",
    });
  }

  if (!principal.schoolId) {
    return res.status(403).json({
      success: false,
      message: "Principal not assigned to any school",
    });
  }

  // Determine media type from mime type
  const isVideo = req.file.mimetype.startsWith("video/");
  const mediaType = isVideo ? "video" : "image";

  const media = await Media.create({
    url: req.file.path,
    publicId: req.file.filename,
    type: mediaType,
    schoolId: principal.schoolId,
    uploadedBy: principal._id,
    filename: req.file.originalname,
    size: req.file.size,
  });

  res.status(201).json({
    success: true,
    message: "Media uploaded successfully",
    data: media,
  });
});

// @desc    Get all media
// @route   GET /api/principal/media
// @access  PRINCIPAL
export const getMedia = asyncHandler(async (req, res) => {
  const { type, page = 1, limit = 20 } = req.query;
  const principal = req.user;

  if (!principal.schoolId) {
    return res.status(403).json({
      success: false,
      message: "Principal not assigned to any school",
    });
  }

  let query = { schoolId: principal.schoolId };

  if (type && ["image", "video"].includes(type)) {
    query.type = type;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const media = await Media.find(query)
    .populate("uploadedBy", "name")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Media.countDocuments(query);

  res.status(200).json({
    success: true,
    message: "Media retrieved successfully",
    data: {
      media,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    },
  });
});

// @desc    Delete media
// @route   DELETE /api/principal/media/:id
// @access  PRINCIPAL
export const deleteMedia = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const principal = req.user;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid media ID",
    });
  }

  if (!principal.schoolId) {
    return res.status(403).json({
      success: false,
      message: "Principal not assigned to any school",
    });
  }

  const media = await Media.findById(id);
  if (!media) {
    return res.status(404).json({
      success: false,
      message: "Media not found",
    });
  }

  if (media.schoolId.toString() !== principal.schoolId.toString()) {
    return res.status(403).json({
      success: false,
      message: "Media does not belong to your school",
    });
  }

  // Delete from Cloudinary
  if (media.publicId) {
    await deleteFromCloudinary(media.publicId);
  }

  await Media.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: "Media deleted successfully",
  });
});
