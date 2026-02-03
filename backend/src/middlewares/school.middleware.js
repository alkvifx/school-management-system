import School from "../models/school.model.js";

// Middleware to validate school access
// Ensures user can only access their assigned school's data
export const validateSchoolAccess = async (req, res, next) => {
  try {
    const user = req.user;

    // SUPER_ADMIN can access any school (but typically shouldn't access school data)
    if (user.role === "SUPER_ADMIN") {
      return next();
    }

    // All other roles must have a schoolId
    if (!user.schoolId) {
      return res.status(403).json({
        success: false,
        message: "User not assigned to any school",
      });
    }

    // Verify school exists and is active
    const school = await School.findById(user.schoolId);
    if (!school || !school.isActive) {
      return res.status(404).json({
        success: false,
        message: "School not found or inactive",
      });
    }

    // For PRINCIPAL, verify they are assigned to this school
    if (user.role === "PRINCIPAL") {
      if (school.principalId?.toString() !== user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to access this school",
        });
      }
    }

    // Attach school to request for use in controllers
    req.school = school;
    next();
  } catch (error) {
    next(error);
  }
};

// Middleware to validate schoolId in request body/params matches user's school
export const validateSchoolOwnership = async (req, res, next) => {
  try {
    const user = req.user;

    // SUPER_ADMIN bypass
    if (user.role === "SUPER_ADMIN") {
      return next();
    }

    // Get schoolId from body, params, or query
    const schoolId = req.body.schoolId || req.params.schoolId || req.query.schoolId;

    if (schoolId && schoolId.toString() !== user.schoolId?.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this school's data",
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};
