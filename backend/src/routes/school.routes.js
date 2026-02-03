import express from "express";
import { createSchool } from "../controllers/school.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  allowRoles("PRINCIPAL"),
  upload.single("logo"),
  createSchool
);

import { getMySchool } from "../controllers/school.controller.js";

router.get(
  "/",
  protect,
  allowRoles("PRINCIPAL"),
  getMySchool
);


export default router;
