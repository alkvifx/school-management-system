import express from "express";
import {
  getClassLeaderboard,
  getSchoolLeaderboard,
  getMyRank,
} from "../controllers/leaderboard.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";
import { validateSchoolAccess } from "../middlewares/school.middleware.js";

const router = express.Router();

router.use(protect);
router.use(allowRoles("STUDENT", "TEACHER", "PRINCIPAL"));
router.use(validateSchoolAccess);

router.get("/me", getMyRank);
router.get("/class/:classId", getClassLeaderboard);
router.get("/school/:schoolId", getSchoolLeaderboard);

export default router;
