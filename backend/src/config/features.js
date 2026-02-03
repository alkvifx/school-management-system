/**
 * Feature configuration for SaaS plans.
 * This file maps logical feature keys to the minimum plan required.
 * Keep this config-driven and easy to extend.
 */

export const FEATURES = {
  AI_NOTICE: "PRO", // Notices, templates, branding
  AI_TEMPLATES: "PRO",
  AI_RESULT_ANALYSIS: "PRO",
  AI_RISK_DETECTION: "PRO",
  AI_POSTER_GENERATOR: "PRO",
  REPORTS: "FREE", // Basic reports available to FREE but advanced exports reserved for PRO
  BRANDING: "PRO",
};

// Helper to compare plans ordered by tiers
export const PLAN_TIERS = ["FREE", "PRO", "ENTERPRISE"];

export function meetsPlanRequirement(currentPlan, minimumPlan) {
  const currentIndex = PLAN_TIERS.indexOf(currentPlan || "FREE");
  const minIndex = PLAN_TIERS.indexOf(minimumPlan || "FREE");
  return currentIndex >= minIndex;
}
