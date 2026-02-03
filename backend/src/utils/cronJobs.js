import cron from "node-cron";
import * as feeService from "../services/fee.service.js";

/**
 * Initialize all cron jobs
 */
export const initializeCronJobs = () => {
  // Run daily at midnight (00:00) to update overdue fees
  cron.schedule("0 0 * * *", async () => {
    try {
      console.log("🔄 Running daily overdue fee update job...");
      const updatedCount = await feeService.updateOverdueFees();
      console.log(`✅ Updated ${updatedCount} overdue fee records`);
    } catch (error) {
      console.error("❌ Error updating overdue fees:", error);
    }
  });

  // Optional: Run every hour to check for overdue fees (more frequent updates)
  // Uncomment if you want more frequent updates
  /*
  cron.schedule("0 * * * *", async () => {
    try {
      console.log("🔄 Running hourly overdue fee check...");
      const updatedCount = await feeService.updateOverdueFees();
      if (updatedCount > 0) {
        console.log(`✅ Updated ${updatedCount} overdue fee records`);
      }
    } catch (error) {
      console.error("❌ Error updating overdue fees:", error);
    }
  });
  */

  // Gamification: daily stars + leaderboards (01:00 AM)
  cron.schedule("0 1 * * *", async () => {
    try {
      console.log("🔄 Running daily stars & leaderboards job...");
      const School = (await import("../models/school.model.js")).default;
      const {
        calculateStarsForSchool,
        buildAllLeaderboardsForSchool,
      } = await import("../services/stars.service.js");
      const schools = await School.find({ isActive: true }).select("_id").lean();
      for (const s of schools) {
        try {
          const count = await calculateStarsForSchool(s._id);
          await buildAllLeaderboardsForSchool(s._id);
          console.log(`✅ Stars & leaderboards for school ${s._id}: ${count} students`);
        } catch (err) {
          console.error("❌ Error stars/leaderboards for school", s._id, err);
        }
      }
    } catch (error) {
      console.error("❌ Error in daily stars/leaderboards job:", error);
    }
  });

  // Daily risk detection job at 02:00 AM
  cron.schedule("0 2 * * *", async () => {
    try {
      console.log("🔄 Running daily student risk detection job...");
      const schools = await (await import("../models/school.model.js")).default.find({ isActive: true }).lean();
      const riskService = (await import("../services/risk.service.js")).default;
      for (const s of schools) {
        try {
          const result = await riskService.detectRisksForSchool(s._id);
          console.log(`✅ Risk detection for school ${s._id}: ${JSON.stringify(result)}`);
        } catch (err) {
          console.error("❌ Error running risk detection for school", s._id, err);
        }
      }
    } catch (error) {
      console.error("❌ Error in daily risk detection job:", error);
    }
  });

  console.log("✅ Cron jobs initialized");
};
