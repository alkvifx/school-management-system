import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";
import { validateSchoolAccess } from "../middlewares/school.middleware.js";
import { checkFeatureAccess } from "../middlewares/feature.middleware.js";
import {
  generateSchoolTemplate,
  createNotice,
  analyzeResults,
  generateBranding,
  getTemplates,
  getNotices,
  downloadTemplate,
} from "../controllers/ai.controller.js";

const router = express.Router();

// All AI endpoints require principal role and school context
router.use(protect);
router.use(allowRoles("PRINCIPAL"));
router.use(validateSchoolAccess);

// Templates
router.post("/school-template", checkFeatureAccess("AI_TEMPLATES"), generateSchoolTemplate);
router.get("/school-templates", checkFeatureAccess("AI_TEMPLATES"), getTemplates);

// Notices
router.post("/notice", checkFeatureAccess("AI_NOTICE"), createNotice);
router.get("/notices", checkFeatureAccess("AI_NOTICE"), getNotices);

// Poster / image generator
import { createPoster, listPosters } from "../controllers/aiPoster.controller.js";
import { uploadMedia } from "../middlewares/upload.middleware.js";
router.post("/poster", uploadMedia.single("image"), checkFeatureAccess("AI_POSTER_GENERATOR"), createPoster);
router.get("/posters", checkFeatureAccess("AI_POSTER_GENERATOR"), listPosters);

// Result analysis (read-only)
router.get("/result-analysis/:examId", checkFeatureAccess("AI_RESULT_ANALYSIS"), analyzeResults);

// Branding
router.post("/branding", checkFeatureAccess("BRANDING"), generateBranding);
router.get("/school-template/:id/download", checkFeatureAccess("AI_TEMPLATES"), downloadTemplate);
export default router;
