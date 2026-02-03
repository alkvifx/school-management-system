import express from "express";
import { getPublicProfile } from "../controllers/student.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";
import { validateSchoolAccess } from "../middlewares/school.middleware.js";

const router = express.Router();

router.use(protect);
router.use(allowRoles("STUDENT", "TEACHER", "PRINCIPAL"));
router.use(validateSchoolAccess);

// GET /api/students/profile/:id — public profile (same school; teachers: assigned classes)
router.get("/profile/:id", getPublicProfile);

export default router;
