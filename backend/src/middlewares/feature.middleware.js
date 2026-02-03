import { FEATURES, meetsPlanRequirement } from "../config/features.js";

export const checkFeatureAccess = (featureKey) => {
  return async (req, res, next) => {
    try {
      // Must be after validateSchoolAccess so req.school is present
      const school = req.school || (req.user && req.user.schoolId);
      if (!school && !req.school) {
        return res.status(403).json({ success: false, message: "School context required" });
      }

      // If req.school is a mongoose document, get plan directly; if ID, fetch isn't done here intentionally
      const plan = req.school?.plan || (req.school === undefined ? undefined : req.school);

      const required = FEATURES[featureKey];
      if (!required) return res.status(400).json({ success: false, message: "Unknown feature" });

      if (!meetsPlanRequirement(plan, required)) {
        return res.status(403).json({ success: false, message: "This feature is not available on your current plan" });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
