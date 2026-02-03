import express from "express";
import { createClass, getClasses } from "../controllers/class.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  allowRoles("principal"),
  createClass
);

router.get(
  "/",
  protect,
  allowRoles("principal"),
  getClasses
);

export default router;
