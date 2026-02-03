import express from "express";
import { markAttendance } from "../controllers/attendance.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  allowRoles("teacher"),
  markAttendance
);

export default router;
