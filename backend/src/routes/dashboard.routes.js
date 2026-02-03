import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";
import { validateSchoolAccess } from "../middlewares/school.middleware.js";
import { principalDashboard } from "../controllers/dashboard.controller.js";

const router = express.Router();
router.use(protect);
router.use(allowRoles("PRINCIPAL"));
router.use(validateSchoolAccess);

router.get("/principal", principalDashboard);

export default router;
