import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";
import { validateSchoolAccess } from "../middlewares/school.middleware.js";
import { generateReport } from "../controllers/reports.controller.js";
import { checkFeatureAccess } from "../middlewares/feature.middleware.js";

const router = express.Router();

router.use(protect);
router.use(allowRoles("PRINCIPAL"));
router.use(validateSchoolAccess);

router.get("/generate", checkFeatureAccess("REPORTS"), generateReport);

export default router;
