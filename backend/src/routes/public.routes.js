import express from "express";
import {
  getPublicContent,
  submitContactMessage,
} from "../controllers/publicContent.controller.js";

const router = express.Router();

// Public content for landing / marketing pages
router.get("/content", getPublicContent);

// Public contact form
router.post("/contact", submitContactMessage);

export default router;

