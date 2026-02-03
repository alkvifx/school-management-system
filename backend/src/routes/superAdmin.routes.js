import express from "express";
import {
  createSchool,
  createPrincipal,
  assignPrincipal,
  getAllSchools,
  getAllPrincipals,
} from "../controllers/superAdmin.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { allowRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

// All routes require SUPER_ADMIN role
router.use(protect);
router.use(allowRoles("SUPER_ADMIN"));

// @route   POST /api/super-admin/create-school
// @desc    Create a new school
// @access  SUPER_ADMIN
router.post("/create-school", createSchool);

// @route   POST /api/super-admin/create-principal
// @desc    Create a principal user
// @access  SUPER_ADMIN
router.post("/create-principal", createPrincipal);

// @route   POST /api/super-admin/assign-principal
// @desc    Assign principal to a school
// @access  SUPER_ADMIN
router.post("/assign-principal", assignPrincipal);

router.get("/schools", getAllSchools);

router.get("/principals", getAllPrincipals);

export default router;
